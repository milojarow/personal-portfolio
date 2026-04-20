import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const NOTES_DIR = path.join(process.cwd(), "content/notes");

function readingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function ensureDir() {
  return fs.existsSync(NOTES_DIR);
}

export function getAllNotes(locale) {
  if (!ensureDir()) return [];
  const files = fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(`.${locale}.md`));

  return files
    .map((file) => {
      const full = fs.readFileSync(path.join(NOTES_DIR, file), "utf8");
      const { data, content } = matter(full);
      const slug = file.replace(`.${locale}.md`, "");
      return {
        slug,
        title: data.title,
        date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
        description: data.description ?? "",
        tags: data.tags ?? [],
        readingTime: readingTime(content),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getNoteBySlug(slug, locale) {
  if (!ensureDir()) return null;

  const localePath = path.join(NOTES_DIR, `${slug}.${locale}.md`);
  const fallbackPath = path.join(NOTES_DIR, `${slug}.en.md`);

  let filePath;
  let isFallback = false;

  if (fs.existsSync(localePath)) {
    filePath = localePath;
  } else if (fs.existsSync(fallbackPath)) {
    filePath = fallbackPath;
    isFallback = locale !== "en";
  } else {
    return null;
  }

  const full = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(full);

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return {
    slug,
    title: data.title,
    date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
    description: data.description ?? "",
    tags: data.tags ?? [],
    html: String(processed),
    readingTime: readingTime(content),
    isFallback,
  };
}

export function getAllSlugs() {
  if (!ensureDir()) return [];
  const files = fs.readdirSync(NOTES_DIR);
  const slugs = new Set();
  files.forEach((file) => {
    const match = file.match(/^(.+)\.(en|es)\.md$/);
    if (match) slugs.add(match[1]);
  });
  return Array.from(slugs);
}
