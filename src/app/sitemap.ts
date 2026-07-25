import { MetadataRoute } from 'next'
import { getProjectsData } from '@/lib/data'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjectsData('fr'); // Get static projects to generate URLs
  
  const projectUrls = projects.map((project) => ({
    url: `https://enrique-alex.pages.dev/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://enrique-alex.pages.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projectUrls,
  ]
}
