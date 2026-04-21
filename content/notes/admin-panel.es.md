---
title: "Admin Panel — anatomía de un dashboard SaaS multi-tab"
date: 2026-04-21
description: "El admin panel de Blindando Sueños es lo más grande que he construido. Walkthrough con un demo interactivo (no funcional) del UI real embebido inline."
tags: [saas, react, next.js, case-study]
---

Lo más grande que he construido hasta ahora vive dentro de **Blindando Sueños**, un SaaS de aseguradora. El admin panel es lo que el equipo interno toca todos los días y es donde pasaron las decisiones de ingeniería más interesantes.

Lo que ves abajo es el **código real del UI, sin backend**. Clickeen lo que quieran — tabs, uploads, dropdowns, toggles. Nada explota, no cambia ningún dato. Es el shell, interactivo, sin funcionalidad.

<iframe
  src="/admin-panel-demo"
  width="100%"
  height="720"
  loading="lazy"
  title="Admin panel de Blindando Sueños — demo interactivo"
  style="border: 1px solid #343a3e; border-radius: 4px; display: block; margin: 1.5rem 0;"
></iframe>

## Los cinco tabs

### Posts

La superficie más usada. Marketing escribe un brief y el panel lo mete por un pipeline `factory → train → reconciler`. La **fábrica** expande el brief al paquete completo — copy en tres tonos, slides del carrusel como imágenes generadas, metadata de scheduling. El **tren** es la cola de publicación: el revisor aprueba, agenda, y a la hora el tren embarca el post a Instagram + Facebook. El **reconciliador** atrapa el drift — si Facebook hace soft-block a un post, si Instagram rechaza el tamaño de una imagen, marca el registro y lo re-encola. El tab Posts muestra cada ítem a lo largo del pipeline con su thumbnail, fecha agendada, y un chip de estado clickeable para ver el historial completo.

### Chatbot

El chatbot vive en la web y en DMs de Instagram. Este tab muestra cada sesión con transcripción, metadata capturada del usuario (teléfono, email, interés en seguros, empresa) y un timeline de la conversación. Los admins pueden saltar a una sesión en vivo para relevar al bot. Las sesiones marcadas como high-intent se rutean a una cola de ventas.

### Merge

Un mismo prospecto entra por tres canales: WhatsApp, DMs de Instagram, formulario del sitio. Deja información ligeramente distinta en cada lado — en un canal el teléfono, en otro el email, en otro el nombre de la empresa. Merge surfacea los probables duplicados (fuzzy-matched por teléfono, email, nombre), los muestra lado a lado y los colapsa en un solo contacto con todos los campos unidos. Antes de que existiera este tab, el equipo estaba mandando la misma cotización tres veces a la misma persona bajo tres nombres distintos.

### Citas

Un calendario donde el equipo marca días u horas específicas como no disponibles. El chatbot lee esta tabla antes de ofrecer slots a los prospectos — si un asesor está incapacitado o la oficina cierra por día festivo, bloquean el día aquí y el bot automáticamente deja de ofrecerlo. Sin andar cazando cambios de agenda en scripts de chat.

### Email

El auto-responder de correo. Cuando un prospecto escribe al inbox principal, un pipeline RAG lee el email, jala contexto de conversaciones pasadas más la base de conocimiento del producto, y redacta una respuesta en la voz de la empresa. El admin ve el draft aquí y decide: manda tal cual, edita o rechaza. La calidad del draft es lo suficientemente alta como para que la mayoría se manden sin edición, lo que le ha ahorrado al equipo de ventas un montón de escritura repetitiva.

## Stack, en breve

- **Next.js** App Router — server components donde se pueda, client donde el UI necesita estado (cada tab que ves es client-side).
- **Tailwind** con paleta editorial custom (el crema/carbón del demo — muy distinto al dark de este portfolio, que es la razón por la que el demo vive en su propio `<iframe>` de escape).
- **MongoDB** para contactos y sesiones de chatbot; **Postgres** para datos estructurados de posts / scheduling.
- **n8n** orquesta tanto los flujos del chatbot como el pipeline de publicación — la fábrica / tren / reconciliador son cada uno workflows de n8n.
- **API custom de Node.js** para el RAG del email responder (pgvector + embeddings de OpenAI).

Originalmente todo esto corría en el VPS del que hablo en el [post-mortem de ICARUS](/notes/icarus-black-box). Después de que ese se fundió, el frontend se mudó a Vercel y los servicios de backend se fueron a un VPS fresco — esta vez configurado bien desde el día cero.

El demo de arriba es el UI real, no un mock de Figma. Si quieren sentirlo end-to-end, abran en pantalla completa y cliqueen todo.
