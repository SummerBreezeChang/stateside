import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: "https://stateside-student-housing.summerchang.chatgpt.site/",
    lastModified: new Date("2026-07-21T12:00:00-07:00"),
    changeFrequency: "weekly",
    priority: 1,
  }];
}
