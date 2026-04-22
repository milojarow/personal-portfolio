/**
 * Locale-neutral catalog of projects. Human-readable title/summary live in
 * `messages/{en,es}.json` under `work.projects.<slug>`.
 */

export const categories = ["saas", "internal", "client"];

export const projects = [
  { slug: "blindando", category: "saas", featured: true },
  { slug: "posteacasa", category: "saas", featured: true },
  { slug: "pessoa", category: "internal", featured: true },
  { slug: "luna", category: "internal" },
  { slug: "solutions45", category: "internal" },
  { slug: "barrera-lara", category: "client" },
  { slug: "camioncito", category: "client" },
  { slug: "tacos-manantial", category: "client" },
  { slug: "gocha", category: "client" },
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
