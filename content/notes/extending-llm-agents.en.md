---
title: "Extending LLM agents: skills vs. MCP servers"
date: 2026-04-21
description: "Two mechanisms to extend modern LLM agents (Claude Code, OpenClaw) — and when to reach for each. Covers the four I've shipped: eww-skills, sway-skills, mcp-etebase, mcp-firefly."
tags: [llm, claude, mcp, skills, automation]
---

Modern LLM agents — Claude Code, OpenClaw — expose two distinct extension mechanisms. In casual talk both get called "skills," but they work very differently and solve different problems.

## The two kinds

**Claude Code skills** are Markdown files with YAML frontmatter. They sit in `.claude/skills/` (or bundled in a plugin) and get loaded into the agent's context when a trigger fires. Pure knowledge. No runtime. The LLM reads the skill as expert guidance and applies it.

**MCP servers** are standalone processes that speak the Model Context Protocol — a JSON-RPC-ish protocol that exposes *tools* (callable functions) and *resources* (readable data). The LLM calls the tools the server advertises. Runtime, stateful, with real side effects.

Rule of thumb:

- Need the agent to **know something better**? → skill
- Need the agent to **do something** against an external system? → MCP

## My four, as examples

### [eww-skills](https://github.com/milojarow/eww-skills)

Knowledge skills I wrote for configuring my eww widgets under sway. The bundle ships six specialized skills:

- `eww-widgets` — how to pick and configure box / centerbox / overlay / scroll / stack
- `eww-yuck` — core config syntax, defwindow / defwidget / defvar patterns
- `eww-styling` — GTK CSS / SCSS rules, the required `* { all: unset; }` reset
- `eww-expressions` — `${}` syntax, operators, function calls
- `eww-patterns` — real-world layouts (status bars, power menus, dashboards)
- `eww-troubleshooting` — common failure modes

I structured it like a marketplace — six specialized skills instead of one monolithic file — so the LLM only pulls the slice it needs. When I'm tweaking a style rule, `eww-styling` fires alone and the agent doesn't waste tokens on yuck syntax it won't touch.

### [sway-skills](https://github.com/milojarow/sway-skills)

Same shape. Ten skills covering every sway surface: `sway-config`, `sway-keybindings`, `sway-ipc`, `sway-outputs`, `sway-inputs`, `sway-bar`, `swaylock`, `swayidle`, `swaybg`, `swayimg`, `swayr`.

Why split by surface? The sway docs themselves do it — there's a man page per component — and the split lets the LLM deliver precise advice without dragging every related gotcha into context.

### [mcp-etebase](https://github.com/milojarow/mcp-etebase)

An MCP server that talks to an Etebase instance (encrypted CalDAV / CardDAV). Exposes tools to list collections, read / write calendar events and contacts, and sync state. My agent can now plan my week by reading and writing real calendar data, not just talking about it.

### [mcp-firefly](https://github.com/milojarow/mcp-firefly)

The "finanzas" project. Firefly III handles the books; this MCP server wraps its REST API so I can say "I spent 140 pesos on gas yesterday, from the Banorte card" and the agent records the transaction, detects the habit, and keeps the debt-avalanche plan up to date. All in natural language.

## Why build both

Skills and MCPs compose. When I'm debugging a sway keybinding, the `sway-keybindings` skill tells the agent what's syntactically valid — no MCP needed because nothing has to happen against a running system. When I'm recording a financial transaction, no amount of "knowledge" helps — the data lives in Firefly III, period, and I need a tool call.

The pattern I've converged on:

1. For any domain where the agent needs to give **better advice** → skill (in-context knowledge).
2. For any domain where the agent needs to **take action** against an external system → MCP server.
3. When both apply (rare), build both.

If you're on Claude Code, try splitting a monolithic skill file into a "marketplace" of smaller, trigger-scoped ones. The context efficiency gain is bigger than it looks.
