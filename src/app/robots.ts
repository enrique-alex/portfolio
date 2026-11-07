import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.CF_PAGES === '1'
        ? 'https://enrique-alex.pages.dev'
        : 'https://portfolio.enriquekemayou.workers.dev')
    }/sitemap.xml`,
  }
}
