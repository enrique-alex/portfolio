"use client";

import type { ProjectAdminListItem } from "@/lib/db/admin-projects";
import Link from "next/link";
import { Plus, Edit, Star } from "lucide-react";
import { DeleteProjectButton } from "./DeleteProjectButton";

interface ProjectsAdminTableProps {
  projects: ProjectAdminListItem[];
}

export function ProjectsAdminTable({ projects }: ProjectsAdminTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>
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
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.titleFr}</span>
                    {project.isFeatured && (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Mis en avant" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{project.titleEn}</div>
                </td>
                <td className="px-6 py-4">{project.year}</td>
                <td className="px-6 py-4">{project.category}</td>
                <td className="px-6 py-4">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                    {project.slug}
                  </code>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 transition-colors dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Modifier
                    </Link>
                    <DeleteProjectButton projectId={project.id} projectTitle={project.titleFr} />
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Aucun projet trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
