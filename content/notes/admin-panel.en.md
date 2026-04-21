---
title: "Admin Panel — anatomy of a multi-tab SaaS dashboard"
date: 2026-04-21
description: "The admin panel of Blindando Sueños is the biggest thing I've built. A walkthrough with a live interactive (non-functional) demo of the real UI embedded inline."
tags: [saas, react, next.js, case-study]
---

The biggest thing I've built so far lives inside **Blindando Sueños**, an insurance SaaS. The admin panel is what the internal team touches every day and it's where most of the interesting engineering decisions happened.

What you see below is the **real UI code, stripped of its backend**. Click anything — tabs, uploads, dropdowns, toggles. Nothing explodes, no data changes. It's the shell, interactive, without functionality.

<iframe
  src="/admin-panel-demo"
  width="100%"
  height="720"
  loading="lazy"
  title="Blindando Sueños admin panel — interactive demo"
  style="border: 1px solid #343a3e; border-radius: 4px; display: block; margin: 1.5rem 0;"
></iframe>

## The five tabs

### Posts

The most-used surface. Marketing writes a brief and the panel runs it through a `factory → train → reconciler` pipeline. The **factory** expands the brief into the full artifact bundle — copy in three tones, carousel slides as generated images, scheduling metadata. The **train** is the publishing queue: reviewer approves, schedules, and at the scheduled moment the train ships to Instagram + Facebook. The **reconciler** catches drift — if Facebook soft-blocks a post, if Instagram rejects an image size, it marks the record and re-queues. The Posts tab shows every item across the pipeline with its thumbnail, scheduled date, and a status chip you can click to see the full history.

### Chatbot

The chatbot lives on the website and on Instagram DMs. This tab shows every session with transcript, user metadata collected (phone, email, insurance interest, company), and a conversation timeline. Admins can jump into a live session to take over from the bot. Sessions flagged as high-intent get routed to a sales rep queue.

### Merge

A single prospect arrives from three channels: WhatsApp, Instagram DMs, the website form. They leave slightly different info each time — one channel has the phone, another the email, the third the company name. Merge surfaces likely duplicates (fuzzy-matched on phone, email, name), shows them side-by-side, and folds them into a single contact with every field combined. Before this tab existed, the team was sending the same quote three times to the same person under three different names.

### Citas

A calendar where the team marks days or specific hours as unavailable. The chatbot reads this table before offering time slots to prospects — if a rep is out sick or the office is closed for a holiday, block the day here and the bot automatically stops offering the slot. No chasing down manual schedule changes across chat scripts.

### Email

The email auto-responder. When a prospect writes to the main inbox, a RAG pipeline reads the email, pulls context from past conversations plus the product knowledge base, and drafts a reply in the company's voice. The admin sees the draft here and either sends as-is, edits, or rejects. Draft quality is high enough that most replies go out unedited, which has saved the sales team a lot of repetitive writing.

## Stack, briefly

- **Next.js** App Router — server components where possible, client where the UI needs state (every tab you see is client-side).
- **Tailwind** with a custom editorial palette (the cream/charcoal you see in the demo — very different from this portfolio's dark theme, which is why the demo lives in its own `<iframe>` escape hatch).
- **MongoDB** for contacts and chatbot sessions; **Postgres** for structured post / scheduling data.
- **n8n** orchestrates both the chatbot flows and the publish pipeline — the factory/train/reconciler are each n8n workflows.
- **Custom Node.js API** for the RAG email responder (pgvector + OpenAI embeddings).

Originally all of this ran on the VPS I talk about in the [ICARUS post-mortem](/notes/icarus-black-box). After that melted, the frontend moved to Vercel and the backend services went to a fresh VPS — this time configured properly from day zero.

The demo above is the real UI, not a Figma mock. If you want to feel what it's like end-to-end, open it full screen and poke everything.
