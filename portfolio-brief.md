# Portfolio Brief — rolandoahuja.com

Paste everything below into Claude Designer. English, because Designer reads it better and the portfolio audience is likely international. Adapt to bilingual (EN/ES) if you want — copy mentions it.

---

<context>
You are designing **rolandoahuja.com**, the personal portfolio of **Rolando Ahuja Martínez**.

**Who he is:**
- Mechatronics engineer by degree (Instituto Tecnológico de Nuevo Laredo, Professional License 11716565)
- Self-taught full-stack developer who built and ships production systems for real clients
- Based in Nuevo Laredo, Tamaulipas, Mexico
- Bilingual (Spanish native, English conversational)
- Unusual path: radiator fixtures at Modine (John Deere, Caterpillar, Tesla Model X) → B1 truck driving → full-stack engineer shipping AI-powered SaaS. Don't hide the path — it's part of the story.

**The objective of the site:**
Two-fold, and the design should respect both:
1. **Portfolio** — land work. Visitors will be prospective clients, recruiters, and collaborators. It needs to prove — not claim — that he can build serious systems end-to-end: Linux networking, databases, auth, AI integration, admin tooling, UI/UX, infra.
2. **Knowledge garden** — share what he learns. Technical deep-dives, architectural notes, lessons extracted from real projects. Not decided yet whether this becomes a full blog or stays as a small collection of writeups, so the design should **accommodate long-form content gracefully** without committing to a heavy blog engine up front. Think: a "Notes" or "Writings" section that can grow from 3 posts to 50 without a redesign.

**Tone:**
- Direct and confident, not salesy
- Engineer-first: let the systems do the talking
- No "passionate about code" filler
- Spanish voice is warm and human when Spanish is used
- Distinctive — not a generic dev-portfolio template
</context>

<featured_projects>

## 1. Blindando Sueños — blindandosuenos.com
**Category:** Full-stack SaaS for an insurance company (production, real clients)

The most ambitious project. A Next.js 15 / React 19 site with a **stateless architecture**: zero DB calls from Next.js. Every mutation, query, email, and business step goes through **n8n webhooks** that fan out to MongoDB, Postgres, Redis, and a vector Postgres (PGVector).

**What to highlight visually:**
- **The Admin Panel** (obfuscated route, role-gated): multi-tab UI where the client manages Posts, Chatbot sessions, Contact deduplication, Calendar blocking, and an Email auto-responder — each tab its own self-contained feature.
- **Social media posting pipeline**: an automated Facebook + Instagram publisher that generates drafts via Claude CLI + DALL-E, schedules them, publishes through `upload-post`, and reconciles async results. Internally described as *factory → ticket clerk → train → reconciler → trash truck* — five n8n workflows coordinating via Postgres. Worth a dedicated section with a diagram.
- **Instagram + website chatbot**: website chatbot is a stateless proxy to an n8n agent with RAG retrieval. The IG chatbot lives fully inside n8n with admin pause/resume per-session.
- **Email auto-responder with RAG**: IMAP trigger → normalize → dedupe/rate-limit/kill-switch → OpenAI gpt-4o-mini classifier → responder agent with PGVector retrieve-as-tool → gpt-4o validator (whitelist + citation rules) → branded HTML template → SMTP. Eleven failure/gate branches land in a human-review queue.
- **OG image generation on the fly**: `@vercel/og` (Satori) turns JSX into 1080×1080 / 1080×1350 PNGs with custom fonts (Clash Display, Satoshi), served cached on the CDN.
- **Luna CDN**: a custom media host (luna.solutions45.com) he runs himself for uploads, deletes, and delivery.
- **Auth system**: passwordless magic link + password login, JWT via `jose` (HS256), httpOnly cookies, bcrypt password hashing, `tokenVersion` as a kill-switch for session invalidation, Edge middleware gating admin routes.

**Stack:** Next.js 15 App Router, React 19, Tailwind v4, DaisyUI, jose, bcryptjs, zod, Lucide, n8n, Postgres, MongoDB, PGVector, Redis, OpenAI (gpt-4o/gpt-4o-mini), Claude CLI, DALL-E, Vercel, custom VPS + k8s backend.

## 2. Postea Casa — posteacasa.com
**Category:** AI-powered real estate marketing generator

A 7-step wizard where a realtor describes a property and the system produces a full marketing pack: **professional PDF (2-page, React-PDF)**, **HTML email (inline-styled)**, **styled cover image**, **social media copy**. Content generation is AI-driven with a per-scene narration system and rewrite controls.

**What to highlight:**
- **Wizard UX**: 7 steps with 2-second debounced auto-save. Each step persists to a JSONB column in Postgres via n8n. Drag-and-drop to reorder property photos (`@hello-pangea/dnd`).
- **Mapbox autocomplete** on the address field.
- **Magic-link auth** + JWT sessions.
- **Editorial design system**: custom "copper/warm" palette, Cormorant Garamond for headings + Plus Jakarta Sans for body. Felt, not loud.
- **Same stateless pattern** as Blindando: n8n owns the backend.

**Stack:** Next.js 16, React 19, Tailwind v4, DaisyUI 5, @react-pdf/renderer, Mapbox, jose, Sharp, n8n, Postgres, Luna CDN.

## 3. S45 Panel
**Category:** Linux sysadmin tooling — network namespaces + WireGuard + browser isolation

A local web panel (FastAPI + HTMX + Jinja2) for managing isolated VPN-tunneled browser sessions on Linux. Each client gets its own **Linux network namespace**, a **WireGuard interface moved into the namespace**, and an isolated Firefox whose traffic routes entirely through that tunnel. Profiles persist per-client.

**What to highlight:**
- **Real systems programming**: creating the WG interface on the host so the UDP socket can reach the endpoint, then moving it into the namespace via `ip netns`. DNS written per-namespace. Slugs validated against the 15-char Linux interface-name limit.
- **HTMX-native architecture**: no JSON APIs — every dynamic update is a server-rendered HTML fragment swapped into the DOM. Proves he understands server-side rendering at a level most "React developers" skip.
- **Status derivation from system state** (not stored): namespace + interface handshake timestamp → Active / Starting / Error / Stopped.
- **systemd user-level service**, auto-port-scanning between 8000–8020.
- Source: github.com/milojarow/s45-panel (MIT).

**Stack:** Python 3, FastAPI, Uvicorn, HTMX, Jinja2, TailwindCSS, systemd, WireGuard, Linux network namespaces, Firefox, sudo/`ip netns exec`.

</featured_projects>

<secondary_projects>
Include as a compact "also built" grid — don't over-detail.

- **Finanzas** — personal AI financial assistant. MCP-driven agent connecting to a self-hosted **Firefly III** instance (firefly.rolandoahuja.com) with persistent session memory, automatic habit detection (≥3 transactions / 30 days → habit file), multi-currency (MXN/USD), and avalanche-method debt tracking. Classic example of using MCP servers to extend Claude with 150+ domain tools.
- **CV Online** — bilingual interactive CV (the existing rolandoahuja.com current version). Next.js 14, DaisyUI, Lucide. Typewriter animations, two view modes. Consider folding this into the new portfolio or keeping as /cv.
- **Barrera Lara** — Next.js 16 site with i18n (multi-language routing + messages).
- **El Camioncito**, **Tacos Manantial**, **Arreglos Florales**, **Centro Cristiano Gosen** — small-business client sites (Next.js / React / Vite, design-forward, real deployments).
- **Gocha** — Bun + Biome project (modern JS toolchain).
</secondary_projects>

<capabilities>
Don't present these as a bullet-list skill soup — weave them into section copy. But these are real and provable from the projects above:

**Full-stack web:** Next.js 15/16 App Router, React 19, Server Components, Server Actions, Tailwind v4, DaisyUI, JavaScript + TypeScript, Vercel deployment.

**Backend & data:** n8n workflow orchestration (factory/pipeline architectures, 20+ workflows in production), PostgreSQL (JSONB, partial indexes, migrations), MongoDB, Redis, PGVector for RAG.

**Auth & security:** JWT (jose), bcrypt, magic-link flows, httpOnly cookies, Edge middleware, role-based access, tokenVersion kill-switches, rate limiting, input validation (zod), CSRF-safe patterns, content security policy.

**AI integration:** Claude (API + CLI), OpenAI (gpt-4o, gpt-4o-mini for classification & validation), DALL-E, RAG pipelines (PGVector + langchain retrieve-as-tool), Whisper, MCP servers (Firefly III, n8n, GitHub, custom).

**Systems / infra:** Linux network namespaces, WireGuard (wg-quick + native configs), systemd unit files (user & system), custom CDN (Luna), DNS / SSL / CORS / SPF / DKIM, k8s on a VPS, containers (Podman, pinned tags — never `:latest`), inotifywait / D-Bus / event-driven patterns over polling.

**Design sense — applied color theory:** not a trained designer, but deliberately uses color theory in every UI. Works with **OKLCH** color space for perceptually uniform palettes, **triadic** and **complementary** harmonies, per-theme accent lifting (OKLCH relative color + CSS variables so the same accent reads correctly in both light and dark), custom theme systems in DaisyUI with themes disabled so colors aren't contaminated. Every project ships both a light theme and a dark theme with intention — not "invert everything."

**Dev craft:** docs-as-code CLAUDE.md files per project, mental-model naming (the factory / train / reconciler / trash truck), historical-warning callouts baked into docs to prevent regressions, atomic commits, no local builds on Vercel projects, no push without approval.

**Mechatronics / engineering foundation:** Solid Edge 3D + GD&T, PFMEA, Flow Chart, Control Plan, 8D / Ishikawa / 5-Whys problem solving. Process engineer at Modine Heat Transfer designing fixtures for John Deere, Caterpillar, and Tesla Model X radiators. The analytical mindset from manufacturing carries into how he architects systems.
</capabilities>

<background>
**Professional trajectory** (present → past, show the arc):
- 2024–present — Independent full-stack developer. Shipping production SaaS (Blindando, Postea Casa, internal tooling).
- 2021–2024 — B1 Driver at PAM Transport. Cross-border logistics, Nuevo Laredo ↔ US.
- 2019–2020 — Logistics Operator, Integra Solution.
- 2018 — Operational Supervisor at INE (Mexican federal election process, logistics and team training).
- 2015–2018 — **Process Engineer, Modine Heat Transfer**. Documentation, flow charts, FMEA, control plans for radiator lines (John Deere, Caterpillar, Tesla Model X). Safety + ergonomics + fixture design in Solid Edge.
- 2013–2014 — Load Monitoring Agent, Inter Global Solutions Group.
- 2010–2013 — Customer Service Agent, Telecable (internet/cable troubleshooting).

**Education:**
- Mechatronics Engineering — Instituto Tecnológico de Nuevo Laredo. Professional License 11716565.

**Languages:** Spanish (native), English (conversational + full technical fluency in reading/writing).
</background>

<design_direction>
**What to avoid:**
- Generic "dev portfolio" templates (dark hero, neon gradients, "Hi, I'm X")
- Floating glassmorphism blobs, parallax-everything, scroll-hijacking
- AI-generic aesthetics — no "Unicorn SaaS" landing clichés

**What to lean into:**
- **Editorial and distinctive.** Think craft portfolio, not bootcamp graduation site.
- **Typography does heavy lifting.** Consider a serif/display pairing (he's already used Cormorant Garamond + Plus Jakarta Sans on Postea Casa; Clash Display + Satoshi on Blindando). Pick a pairing that feels confident and non-generic.
- **Real color system, not just a hex palette.** Derive from OKLCH with explicit triadic or complementary harmony. Ship a light theme AND a dark theme; they should feel like the same voice in two moods, not one inverted into the other. Demonstrate the color work — he actually cares.
- **Screenshots of real product UI over abstract illustrations.** The Blindando admin panel, the Postea Casa wizard, the S45 Panel dashboard — mockup-style but grounded in what actually exists.
- **Diagrams for the pipeline work.** The factory/train/reconciler metaphor deserves a visual — an architecture poster that doubles as proof of systems thinking.
- **Density without noise.** He builds real systems; the site should feel dense with substance, not padded with whitespace ceremony.

**Animation:**
- Subtle, purposeful. Nothing that hijacks scroll. No typewriters on the hero.
- Micro-interactions on cards and buttons. Consider GSAP (already in his toolkit) for one or two tasteful reveals, not a light show.

**Accessibility:**
- Real contrast ratios, keyboard nav, reduced-motion media query respected, semantic HTML. He cares about this — don't let the design force compromises.
</design_direction>

<sections>
Suggested structure — reorder/rename as the design dictates.

1. **Hero** — name, one-sentence positioning (e.g., "Full-stack engineer building production systems from Linux kernel namespaces to AI-powered admin panels"), city, availability signal. Minimal, confident. Theme toggle visible from the start — it's part of the proof.

2. **Selected work** — three featured case studies, each a dedicated detail view or expandable card:
   - Blindando Sueños (admin panel + chatbot + social pipeline)
   - Postea Casa (wizard + PDF/email generation)
   - S45 Panel (Linux networking + WireGuard)
   Each case study should include: problem, stack, a visual (UI screenshot or architecture diagram), and 2–3 specific technical highlights.

3. **Architecture spotlight** — one deep-dive panel. Pick the Blindando social pipeline (factory → train → reconciler) or the email auto-responder pipeline. Render as an annotated diagram. This is the "prove you can think in systems" section.

4. **Stack** — categorized (web / backend / AI / infra / design / engineering) but presented as connected capabilities, not a tag cloud.

5. **Background & trajectory** — the mechatronics → trucking → developer arc, told as a short narrative plus a compact timeline. Don't hide the B1 driver and process-engineer chapters; they're the differentiator.

6. **Side projects / experiments** — compact grid linking to smaller builds (Finanzas, client sites, gocha, CV).

7. **Notes / Writings** — a dedicated section for long-form technical content. Ship with a small seed of 2–4 posts drafted from existing project material (for example: the factory/train/reconciler pipeline architecture, the OKLCH per-theme color-lift technique, the stateless-Next.js + n8n pattern, the Linux namespace + WireGuard setup). Design this section so it **reads well with three posts and still reads well with thirty**:
   - Clean index list with title, date, reading time, optional tag
   - Article view with generous typography, code blocks, diagrams, captioned images
   - RSS feed from day one
   - Slug-based routing (`/notes/[slug]` or `/writings/[slug]`) — no dates in URL so titles can be revised without breaking links
   - Content authored in MDX or plain Markdown (file-system based), not a CMS — keep the blog engine as light as the portfolio
   - No comments, no reactions, no "subscribe" popups. A quiet place to read.

8. **Contact** — email, WhatsApp (+52 867 181 2166), Telegram (@milojarow), GitHub (github.com/milojarow). Direct, no form unless it adds something.

9. **Footer** — colophon: fonts used, color system (name the OKLCH harmony), stack this portfolio is built with. Treat it like a museum wall label. Small but intentional.
</sections>

<content_language>
Default to English, with Spanish available on a language toggle (mirrors his existing CV site). The voice in Spanish is warmer and more direct ("Hola, soy Rolando" rather than "¡Hola! 👋 Soy Rolando"). If only one language is shipped first, ship English.
</content_language>

<explicit_dont>
- Don't call him "passionate."
- Don't write "junior" — the project list rules that out.
- Don't write "senior" — let the work imply it.
- Don't invent metrics ("500+ users", "$1M in revenue"). If numbers matter, he'll add them later.
- Don't put a dev emoji palette 🚀 💻 ⚡ on anything.
- Don't design around a fake avatar. His real photo (headshot, black blazer, white background) lives in his current CV.
</explicit_dont>