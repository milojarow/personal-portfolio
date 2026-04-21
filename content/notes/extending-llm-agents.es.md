---
title: "Extender agentes LLM: skills vs. MCP servers"
date: 2026-04-21
description: "Dos mecanismos para extender agentes LLM modernos (Claude Code, OpenClaw) — y cuándo usar cada uno. Cubre los cuatro que he shipeado: eww-skills, sway-skills, mcp-etebase, mcp-firefly."
tags: [llm, claude, mcp, skills, automation]
---

Los agentes LLM modernos — Claude Code, OpenClaw — exponen dos mecanismos distintos para extenderlos. En lenguaje casual a los dos se les llama "skills", pero funcionan muy diferente y resuelven problemas distintos.

## Los dos tipos

**Claude Code skills** son archivos Markdown con frontmatter YAML. Viven en `.claude/skills/` (o empacados en un plugin) y se cargan al contexto del agente cuando un trigger dispara. Conocimiento puro. Sin runtime. El LLM lee la skill como guía experta y la aplica.

**MCP servers** son procesos independientes que hablan el Model Context Protocol — un protocolo tipo JSON-RPC que expone *tools* (funciones invocables) y *resources* (datos leíbles). El LLM llama a los tools que el server anuncia. Runtime, stateful, con side effects reales.

Regla de oro:

- ¿Necesitas que el agente **sepa algo mejor**? → skill
- ¿Necesitas que el agente **haga algo** contra un sistema externo? → MCP

## Mis cuatro, como ejemplo

### [eww-skills](https://github.com/milojarow/eww-skills)

Skills de conocimiento que escribí para configurar mis widgets de eww bajo sway. El bundle trae seis skills especializadas:

- `eww-widgets` — cómo escoger y configurar box / centerbox / overlay / scroll / stack
- `eww-yuck` — sintaxis core de config, patrones de defwindow / defwidget / defvar
- `eww-styling` — reglas GTK CSS / SCSS, el reset `* { all: unset; }` obligatorio
- `eww-expressions` — la sintaxis `${}`, operadores y llamadas a funciones
- `eww-patterns` — layouts reales (barras de estado, power menus, dashboards)
- `eww-troubleshooting` — fallas comunes

Lo estructuré tipo marketplace — seis skills especializadas en lugar de un archivo monolítico — para que el LLM jale solo la rebanada que necesita. Cuando ajusto una regla de estilo, solo dispara `eww-styling` y el agente no gasta tokens en sintaxis de yuck que ni va a tocar.

### [sway-skills](https://github.com/milojarow/sway-skills)

Misma forma. Diez skills cubriendo cada superficie de sway: `sway-config`, `sway-keybindings`, `sway-ipc`, `sway-outputs`, `sway-inputs`, `sway-bar`, `swaylock`, `swayidle`, `swaybg`, `swayimg`, `swayr`.

¿Por qué partir por superficie? Los docs de sway lo hacen — hay un man page por componente — y partir así le permite al LLM dar consejos precisos sin arrastrar cada gotcha relacionado al contexto.

### [mcp-etebase](https://github.com/milojarow/mcp-etebase)

Un MCP server que habla con una instancia de Etebase (CalDAV / CardDAV cifrado). Expone tools para listar colecciones, leer / escribir eventos de calendario y contactos, y sincronizar estado. Mi agente ya puede planear mi semana leyendo y escribiendo datos reales de calendario, no solo hablando sobre ellos.

### [mcp-firefly](https://github.com/milojarow/mcp-firefly)

El proyecto "finanzas". Firefly III maneja los libros; este MCP server envuelve su REST API para que pueda decir "gasté 140 pesos en gas ayer, con la Banorte" y el agente registre la transacción, detecte el hábito y mantenga al día el plan de avalancha de deuda. Todo en lenguaje natural.

## Por qué construir ambos

Skills y MCPs se componen. Cuando debugeo un keybinding de sway, la skill `sway-keybindings` le dice al agente qué es sintácticamente válido — no hace falta MCP porque no hay que hacer nada contra un sistema corriendo. Cuando registro una transacción financiera, ningún "conocimiento" sirve — el dato vive en Firefly III, punto, y necesito un tool call.

El patrón al que llegué:

1. Para cualquier dominio donde el agente necesita dar **mejor consejo** → skill (conocimiento en contexto).
2. Para cualquier dominio donde el agente necesita **tomar acción** contra un sistema externo → MCP server.
3. Cuando aplican los dos (raro), haz los dos.

Si estás en Claude Code, prueba partir un archivo monolítico de skill en un "marketplace" de varias más pequeñas, cada una con su trigger. La ganancia de eficiencia en contexto es mayor de lo que parece.
