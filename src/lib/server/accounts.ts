import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * 账号与验证码存储（服务端）。
 * - 账号：邮箱唯一，一个邮箱只能注册一次；密码用 scrypt 加盐哈希保存，不存明文。
 * - 验证码：6 位数字，10 分钟有效，同一邮箱 60 秒内只能发一次。
 * 数据目录默认 <项目>/.data（已加入 .gitignore），可用 CROW_DATA_DIR 覆盖。
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

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
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

export async function listAccounts(): Promise<Record<string, Account>> {
  return readJson<Record<string, Account>>(ACCOUNTS_FILE, {});
}

export async function findAccount(email: string): Promise<Account | null> {
  const all = await listAccounts();
  return all[normalizeEmail(email)] ?? null;
}

export async function createAccount(email: string, password: string, nick?: string): Promise<Account> {
  const all = await listAccounts();
  const key = normalizeEmail(email);
  if (all[key]) throw new Error("EMAIL_TAKEN");
  const salt = crypto.randomBytes(16).toString("hex");
  const account: Account = {
    email: key,
    nick: nick?.trim() || key.split("@")[0] || "乌鸦读者",
    salt,
    hash: hashPassword(password, salt),
    createdAt: Date.now(),
  };
  all[key] = account;
  await writeJson(ACCOUNTS_FILE, all);
  return account;
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

export async function issueCode(email: string): Promise<{ code: string; retryAfter?: number }> {
  const key = normalizeEmail(email);
  const all = await readJson<Record<string, CodeRecord>>(CODES_FILE, {});
  const now = Date.now();
  const prev = all[key];
  if (prev && now - prev.lastSentAt < 60_000) {
    return { code: "", retryAfter: Math.ceil((60_000 - (now - prev.lastSentAt)) / 1000) };
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  all[key] = { code, expiresAt: now + 10 * 60_000, lastSentAt: now };
  /* 顺手清理过期记录 */
  for (const [k, v] of Object.entries(all)) if (v.expiresAt < now) delete all[k];
  await writeJson(CODES_FILE, all);
  return { code };
}

export async function consumeCode(email: string, code: string): Promise<boolean> {
  const key = normalizeEmail(email);
  const all = await readJson<Record<string, CodeRecord>>(CODES_FILE, {});
  const rec = all[key];
  if (!rec || rec.expiresAt < Date.now() || rec.code !== code.trim()) return false;
  delete all[key];
  await writeJson(CODES_FILE, all);
  return true;
}
