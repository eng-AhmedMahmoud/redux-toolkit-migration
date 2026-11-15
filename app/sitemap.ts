import type { MetadataRoute } from 'next';
import { PageRoutes } from '@/lib/pageroutes';
import { Settings } from '@/lib/meta'; 

export default function sitemap(): MetadataRoute.Sitemap {
  return PageRoutes.map((page) => ({
    url: new URL(`/docs${page.href}`, Settings.metadataBase).toString(),
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
}
