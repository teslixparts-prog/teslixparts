import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.teslixparts.com.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/selection`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/request`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/delivery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/payment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/guarantee`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const modelSlugs = ["model-3", "model-y", "model-x", "model-s", "cybertruck"];
  const modelRoutes: MetadataRoute.Sitemap = modelSlugs.map((slug) => ({
    url: `${base}/model/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...modelRoutes];
}
