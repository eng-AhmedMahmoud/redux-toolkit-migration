import type { MetadataRoute } from 'next';
import { Settings } from '@/lib/meta';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: new URL("/sitemap.xml", Settings.metadataBase).toString(),
  };
}
