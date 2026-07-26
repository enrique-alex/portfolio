import { MetadataRoute } from 'next'
import { getProjects } from '@/lib/db/projects'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects('fr');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://enrique-alex.pages.dev';

  const projectUrls = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projectUrls,
  ]
}
