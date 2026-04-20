/**
 * Locale-neutral catalog of projects. Human-readable title/summary live in
 * `messages/{en,es}.json` under `work.projects.<slug>`.
 */

export const categories = ["saas", "internal", "client", "experiments"];

export const projects = [
  { slug: "blindando", category: "saas", featured: true },
  { slug: "posteacasa", category: "saas", featured: true },
  { slug: "s45-panel", category: "internal", featured: true },
  { slug: "finanzas", category: "internal" },
  { slug: "luna", category: "internal" },
  { slug: "barrera-lara", category: "client" },
  { slug: "gosen", category: "client" },
  { slug: "camioncito", category: "client" },
  { slug: "tacos-manantial", category: "client" },
  { slug: "arreglos-florales", category: "client" },
  { slug: "gocha", category: "experiments" },
  { slug: "claude-monitor", category: "experiments" },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function groupByCategory() {
  return categories.reduce((acc, category) => {
    acc[category] = projects.filter((p) => p.category === category);
    return acc;
  }, {});
}
