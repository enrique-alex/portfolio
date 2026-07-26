export interface Project {
    id: string;
    title: string;
    slug: string;
    year: number;
    category: string;
    shortDescription: string;
    detailedDescription: string;
    technicalChallenges: string;
    impact: string;
    technologies: string[];
    isFeatured: boolean;
    themeColor: { r: number; g: number; b: number };
    githubUrl?: string;
    coverImage?: string;
    gallery?: string[];
}

