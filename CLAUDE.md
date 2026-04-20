# CLAUDE.md

Guidance for Claude Code working on this repo.

## Project

**rolandoahuja.com** — personal portfolio + knowledge garden for Rolando Ahuja Martínez. Bilingual EN/ES. Minimalist editorial-technical voice.

## Stack

- Next.js 16 App Router, React 19, **JavaScript only** (.jsx / .js, never TypeScript)
- Tailwind CSS 4 + DaisyUI 5 via `@tailwindcss/postcss`
- Theming: `@theme inline` + two custom themes `rolando-light` / `rolando-dark` using OKLCH triadic harmony
- i18n: `next-intl` v4, default locale `en`, `localePrefix: 'as-needed'`
- Fonts: Cormorant Garamond (display) + Plus Jakarta Sans (body) via `next/font/google`
- Markdown: gray-matter + remark + remark-html + remark-gfm (file-system in `content/notes/`)

## Dev commands

```bash
npm run dev     # localhost:3000
npm run lint
```

**Never run `npm run build` locally** — Vercel builds on push. Use `vercel inspect` for build logs.

## Key conventions

- Path alias: `@/*` → project root (see `jsconfig.json`)
- **Never push without explicit approval** — only on "push", "acp", "súbelo" or similar
- Kebab-case dirs, camelCase vars/functions, PascalCase components
- Component files prefixed by type (`WorkTable.jsx`, `NotesTable.jsx`)
- Pure functions: `function` keyword
- Server-first — minimize `'use client'`, only for Web API access in small components
- JSX text nodes: write real chars (á, é, í, ó, ú, ñ) — `\uXXXX` escapes render literally
- Tailwind utility classes, no CSS modules
- **Next.js 16 renamed `middleware` to `proxy`** — file is `proxy.js` at root, export function `proxy()`

## Directory map

```
app/[locale]/
  layout.jsx              # fonts + NextIntlClientProvider + Nav + Footer
  globals.css             # Tailwind + DaisyUI + two OKLCH themes
  page.jsx                # Home + About embedded (#about anchor)
  work/page.jsx           # Full project index grouped by category
  notes/
    page.jsx              # Notes index
    [slug]/page.jsx       # Article view (remark-html)
  cv/page.jsx             # Migrated CardCV from ~/projects/cv/
i18n/
  routing.js              # locales ['en','es'], default 'en'
  request.js              # getRequestConfig → messages/{locale}.json
  navigation.js           # createNavigation(routing)
messages/
  en.json
  es.json
content/notes/
  <slug>.<locale>.md      # frontmatter: title, date, description, tags
lib/
  notes.js                # getAllNotes, getNoteBySlug, readingTime
  work.js                 # project catalog by category
components/
  layout/{Nav,Footer}.jsx
  ui/{ThemeToggle,LangToggle,Avatar}.jsx
  content/{WorkTable,NotesTable,CardCV}.jsx
proxy.js                  # next-intl createMiddleware (Next.js 16: proxy, not middleware)
```

## Content rules

- English is primary, Spanish follows the same structure
- ES voice is warmer and more direct, no emojis, no "passionate"
- Project metadata (titles, summaries) lives in `messages/{en,es}.json`; technical stack data (locale-neutral) lives in `lib/work.js`
- Notes are Markdown with frontmatter: `title`, `date`, `description`, `tags`
- Fallback: if `<slug>.<locale>.md` doesn't exist, fall back to `.en.md` with a banner

## Color system

Triadic OKLCH harmony, named explicitly in the footer colophon. Two themes:
- `rolando-light`: paper base (97% L), graphite text (18% L)
- `rolando-dark`: inverted lightness

Three accents at 120° on the hue circle, accent lifted ~14% in dark for perceptual match.

## Reference

- `portfolio-brief.md` — content brief and design direction (source of truth for copy/tone)
- `/home/milo/.claude/plans/procede-con-el-plan-snazzy-cupcake.md` — implementation plan
