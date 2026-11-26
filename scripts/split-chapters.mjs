import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const books = new URL("../public/books/", import.meta.url);
for (const file of await readdir(new URL("text/", books))) {
  if (!file.endsWith(".json")) continue;
  const { chapters } = JSON.parse(await readFile(new URL("text/" + file, books), "utf8"));
  const dir = new URL("chapters/" + file.slice(0, -5) + "/", books);
  await mkdir(dir, { recursive: true });
  await Promise.all(chapters.map((chapter, index) =>
    writeFile(new URL(index + ".json", dir), JSON.stringify(chapter))
  ));
}
