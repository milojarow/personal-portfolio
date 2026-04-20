---
title: "How I built AI chatbots with n8n before Claude Code / OpenClaw"
date: 2026-04-20
description: "Notes on the workflow architecture that kept shipping AI assistants in production while everyone else was waiting for agent runtimes to mature."
tags: [n8n, ai, architecture]
---

Before Claude Code landed and OpenClaw gave me a durable flat-file agent workspace, I was already shipping AI chatbots in production for real clients. The catch: every piece of what a modern agent runtime does for you — routing, memory, tool-calling, validation — I had to orchestrate as explicit graphs of nodes in n8n.

This note is a record of how that looked, what it taught me, and why the discipline still shows up in the work I do today.

## The pieces that were manual

A modern agent runtime gives you, out of the box:

- Tool selection and the tool-calling loop
- Session memory, short-term and long-term
- Streaming and partial responses
- Guardrails and validation
- Retry and fallback logic

Before those existed at the quality they do now, building a "chatbot with tools" meant designing each of those yourself. In n8n that translates to a workflow graph where each node is one decision, one external call, one branch. No magic, no implicit state — every edge is a contract you wrote.

## Why n8n specifically

n8n gave me three things that mattered:

1. **A debugger for the whole flow.** Every execution is replayable. When the chatbot said something weird, I could open the last run and see exactly which node produced it, with the input and output frozen in place.
2. **A webhook surface.** My Next.js front-end was a dumb proxy to `/webhook/chat`. No backend code on my side beyond a fetch.
3. **A persistence layer without ORMs.** Postgres + MongoDB nodes let me read and write session state without writing a single line of data-access code.

*(This is a stub. The full article — with workflow diagrams, the factory/train/reconciler metaphor applied to chatbots, and what broke the hardest — is in progress.)*
