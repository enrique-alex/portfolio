'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Project } from '@/lib/data';
import { useLanguage } from '@/components/theme/LanguageProvider';
import { Locale } from '@/lib/i18n';

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cache en mémoire pour éviter de refetch une langue déjà chargée
  const cache = useRef<Partial<Record<Locale, Project[]>>>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      // Si la langue est déjà en cache, on l'utilise immédiatement
      if (cache.current[locale]) {
        setProjects(cache.current[locale]!);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects?locale=${locale}`);
        if (!response.ok) {
          throw new Error(`Erreur réseau: ${response.status}`);
        }
        
        const data: Project[] = await response.json();
        
        if (isMounted) {
          cache.current[locale] = data;
          setProjects(data);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des projets :', err);
        if (isMounted) {
          setError('Impossible de charger les projets. Veuillez réessayer plus tard.');
          setIsLoading(false);
          // On garde les projets actuels en état (au lieu de vider le tableau) 
          // pour éviter de faire disparaître l'écran si un fetch échoue
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, error }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsData(): ProjectsContextType {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsData must be used within a ProjectsProvider');
  }
  return context;
}
