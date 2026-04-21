---
title: "Cómo construí chatbots con IA en n8n antes de Claude Code / OpenClaw"
date: 2026-04-20
description: "Notas sobre la arquitectura de workflows que me mantuvo shipeando asistentes IA en producción mientras todos esperaban a que los runtimes de agentes maduraran."
tags: [n8n, ia, arquitectura]
---

Antes de que llegara Claude Code y OpenClaw me diera un workspace de agente flat-file durable, yo ya estaba shipeando chatbots con IA en producción para clientes reales. El detalle: cada pieza de lo que un runtime de agente moderno hace por ti — routing, memoria, tool-calling, validación — la tenía que orquestar como grafos explícitos de nodos en n8n.

Esta nota es un registro de cómo se veía eso, qué me enseñó, y por qué esa disciplina sigue apareciendo en el trabajo que hago hoy.

## Las piezas que eran manuales

Un runtime de agente moderno te da, de entrada:

- Selección de tools y el loop de tool-calling
- Memoria de sesión, corta y larga
- Streaming y respuestas parciales
- Guardrails y validación
- Lógica de reintentos y fallback

Antes de que existieran con la calidad que tienen hoy, construir un "chatbot con tools" significaba diseñar cada una de esas cosas tú mismo. En n8n eso se traduce a un grafo de workflow donde cada nodo es una decisión, una llamada externa, una rama. Sin magia, sin estado implícito — cada edge es un contrato que tú escribiste.

## Por qué n8n específicamente

n8n me daba tres cosas que importaban:

1. **Un debugger para todo el flujo.** Cada ejecución es reproducible. Cuando el chatbot decía algo raro, podía abrir la última corrida y ver exactamente qué nodo lo produjo, con el input y output congelados.
2. **Una superficie de webhooks.** Mi front-end en Next.js era un proxy bobo a `/webhook/chat`. Cero backend de mi lado más allá de un fetch.
3. **Una capa de persistencia sin ORMs.** Los nodos de Postgres y MongoDB me dejaban leer y escribir estado de sesión sin escribir una sola línea de data-access.
