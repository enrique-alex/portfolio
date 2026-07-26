"use client";

import type { ProjectAdminListItem } from "@/lib/db/admin-projects";

interface ProjectsAdminTableProps {
  projects: ProjectAdminListItem[];
}

export function ProjectsAdminTable({ projects }: ProjectsAdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
      <table
        className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400"
        aria-label="Liste des projets du portfolio"
      >
        <thead className="border-b border-zinc-200/50 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
          <tr>
            <th scope="col" className="px-6 py-4">Ordre</th>
            <th scope="col" className="px-6 py-4">Titre (FR / EN)</th>
            <th scope="col" className="px-6 py-4">Année</th>
            <th scope="col" className="px-6 py-4">Catégorie</th>
            <th scope="col" className="px-6 py-4">Slug</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/25 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                {project.sortOrder}
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{project.titleFr}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{project.titleEn}</div>
              </td>
              <td className="px-6 py-4">{project.year}</td>
              <td className="px-6 py-4">{project.category}</td>
              <td className="px-6 py-4">
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                  {project.slug}
                </code>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                Aucun projet trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
