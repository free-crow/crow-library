import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ACCOUNT_TABLE, CODE_TABLE, serverDb } from "./db";

/**
 * 账号与验证码存储（服务端）。
 * - 优先存 Supabase 表 crow_accounts / crow_codes（Vercel、云托管等无盘环境必须用这个）；
 * - 没配 Supabase 时存本地 .data/*.json（本地开发够用）；
 * - 两者都不可用时退到进程内存（临时可用，重启即失）。
 * 账号：邮箱唯一，密码 scrypt 加盐哈希，不存明文。验证码：6 位，10 分钟有效，60 秒内只能发一次。
 */

export interface Account {
  email: string;
  nick: string;
  salt: string;
  hash: string;
  createdAt: number;
}

interface CodeRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
}

const DIR = process.env.CROW_DATA_DIR || path.join(process.cwd(), ".data");
const ACCOUNTS_FILE = path.join(DIR, "accounts.json");
const CODES_FILE = path.join(DIR, "codes.json");

/* 进程内兜底（无盘环境、且 Supabase 未建表时） */
const memAccounts = new Map<string, Account>();
const memCodes = new Map<string, CodeRecord>();

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/* ===== 账号 ===== */

export async function findAccount(email: string): Promise<Account | null> {
  const key = normalizeEmail(email);
  const db = serverDb();
  if (db) {
    try {
      const { data, error } = await db.from(ACCOUNT_TABLE).select("email,nick,salt,hash,created_at").eq("email", key).maybeSingle();
      if (!error && data) {
        return { email: data.email, nick: data.nick, salt: data.salt, hash: data.hash, createdAt: new Date(data.created_at).getTime() };
      }
      if (!error) return null;
    } catch {
      /* 落到本地存储 */
    }
  }
  if (memAccounts.has(key)) return memAccounts.get(key)!;
  const all = await readJson<Record<string, Account>>(ACCOUNTS_FILE, {});
  return all[key] ?? null;
}

export async function createAccount(email: string, password: string, nick?: string): Promise<Account> {
  const key = normalizeEmail(email);
  if (await findAccount(key)) throw new Error("EMAIL_TAKEN");
  const salt = crypto.randomBytes(16).toString("hex");
  const account: Account = {
    email: key,
    nick: nick?.trim() || key.split("@")[0] || "乌鸦读者",
    salt,
    hash: hashPassword(password, salt),
    createdAt: Date.now(),
  };

  const db = serverDb();
  if (db) {
    const { error } = await db.from(ACCOUNT_TABLE).insert({
      email: account.email, nick: account.nick, salt: account.salt, hash: account.hash,
    });
    if (!error) return account;
    if (error.code === "23505") throw new Error("EMAIL_TAKEN");
    /* 表不存在/权限不足 → 继续尝试本地存储 */
  }

  try {
    const all = await readJson<Record<string, Account>>(ACCOUNTS_FILE, {});
    if (all[key]) throw new Error("EMAIL_TAKEN");
    all[key] = account;
    await writeJson(ACCOUNTS_FILE, all);
    return account;
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") throw e;
    memAccounts.set(key, account);
    return account;
  }
}

export async function verifyPassword(email: string, password: string): Promise<Account | null> {
  const account = await findAccount(email);
  if (!account) return null;
  const hash = hashPassword(password, account.salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(account.hash, "hex");
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? account : null;
}

/* ===== 验证码 ===== */

async function readCode(email: string): Promise<CodeRecord | null> {
  const key = normalizeEmail(email);
  const db = serverDb();
  if (db) {
    try {
      const { data, error } = await db.from(CODE_TABLE).select("code,expires_at,last_sent_at").eq("email", key).maybeSingle();
      if (!error && data) {
        return { code: data.code, expiresAt: new Date(data.expires_at).getTime(), lastSentAt: new Date(data.last_sent_at).getTime() };
      }
      if (!error) return null;
    } catch { /* 忽略 */ }
  }
  if (memCodes.has(key)) return memCodes.get(key)!;
  const all = await readJson<Record<string, CodeRecord>>(CODES_FILE, {});
  return all[key] ?? null;
}

async function saveCode(email: string, rec: CodeRecord) {
  const key = normalizeEmail(email);
  const db = serverDb();
  if (db) {
    const { error } = await db.from(CODE_TABLE).upsert({
      email: key, code: rec.code, expires_at: new Date(rec.expiresAt).toISOString(), last_sent_at: new Date(rec.lastSentAt).toISOString(),
    });
    if (!error) return;
  }
  memCodes.set(key, rec);
  try {
    const all = await readJson<Record<string, CodeRecord>>(CODES_FILE, {});
    all[key] = rec;
    await writeJson(CODES_FILE, all);
  } catch { /* 无盘环境只用内存 */ }
}

async function deleteCode(email: string) {
  const key = normalizeEmail(email);
  const db = serverDb();
  if (db) await db.from(CODE_TABLE).delete().eq("email", key).then(() => {}, () => {});
  memCodes.delete(key);
  try {
    const all = await readJson<Record<string, CodeRecord>>(CODES_FILE, {});
    delete all[key];
    await writeJson(CODES_FILE, all);
  } catch { /* 忽略 */ }
}

export async function issueCode(email: string): Promise<{ code: string; retryAfter?: number }> {
  const now = Date.now();
  const prev = await readCode(email);
  if (prev && now - prev.lastSentAt < 60_000) {
    return { code: "", retryAfter: Math.ceil((60_000 - (now - prev.lastSentAt)) / 1000) };
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await saveCode(email, { code, expiresAt: now + 10 * 60_000, lastSentAt: now });
  return { code };
}

export async function consumeCode(email: string, code: string): Promise<boolean> {
  const rec = await readCode(email);
  if (!rec || rec.expiresAt < Date.now() || rec.code !== code.trim()) return false;
  await deleteCode(email);
  return true;
}
