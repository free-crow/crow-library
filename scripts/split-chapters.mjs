import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const books = new URL("../public/books/", import.meta.url);
await mkdir(new URL("toc/", books), { recursive: true });
let count = 0;
for (const file of (await readdir(new URL("text/", books))).sort()) {
  if (!file.endsWith(".json")) continue;
  const id = file.slice(0, -5);
  const { chapters } = JSON.parse(await readFile(new URL("text/" + file, books), "utf8"));
  if (!Array.isArray(chapters) || !chapters.length || chapters.some((chapter) =>
    typeof chapter.title !== "string" || !chapter.title.trim() ||
    !Array.isArray(chapter.paras) || !chapter.paras.length ||
    chapter.paras.some((paragraph) => typeof paragraph !== "string")
  )) throw new Error(`Invalid chapters in ${file}`);
  const titles = chapters.map((chapter) => chapter.title);
  const tocFile = new URL(`toc/${id}.json`, books);
  try {
    const toc = JSON.parse(await readFile(tocFile, "utf8"));
    if (JSON.stringify(toc.titles) !== JSON.stringify(titles)) {
      throw new Error(`TOC differs from original text in ${file}; review it before building`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(tocFile, JSON.stringify({ id, titles }));
  }
  const dir = new URL(`chapters/${id}/`, books);
  await mkdir(dir, { recursive: true });
  // Bound concurrent writes for large books on Windows and CI.
  for (let start = 0; start < chapters.length; start += 32) {
    await Promise.all(chapters.slice(start, start + 32).map((chapter, offset) =>
      writeFile(new URL(`${start + offset}.json`, dir), JSON.stringify(chapter))
    ));
  }
  count += chapters.length;
}
console.log(`Prepared ${count} chapter files and checked their TOCs.`);
