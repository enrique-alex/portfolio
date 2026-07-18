import { getProjectsData } from '@/lib/data';

export async function generateStaticParams() {
  const projects = getProjectsData('fr'); // les slugs sont identiques quelle que soit la langue
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
