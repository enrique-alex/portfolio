'use client';

import { motion, Variants } from 'framer-motion';
import MagneticProjectCard from './MagneticProjectCard';
import { useProjectsData, Project } from '@/lib/data';
import { useRouter } from 'next/navigation';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15, // Effet d'apparition en cascade
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

export default function ProjectsGrid() {
    const router = useRouter();
    const projectsData = useProjectsData();

    const handleProjectClick = (project: Project) => {
        // Redirection vers la page détaillée pour le Shared Layout (Morphing Spatial)
        router.push(`/projects/${project.slug}`);
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-100px" }}
            className="grid w-full auto-rows-[380px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:auto-rows-[420px]"
        >
            {projectsData.map((project) => {
                let spanClasses = "col-span-1 row-span-1";
                
                // Pattern Bento Asymétrique pour 8 éléments sur 3 colonnes
                // Layout visé :
                // Ligne 1 : [2 cols] [1 col]
                // Ligne 2 : [1 col] [1 col]
                // Ligne 3 : [1 col] [2 cols]
                // Ligne 4 : [1 col] [1 col] [1 col]
                
                const index = projectsData.indexOf(project);
                if (index === 0 || index === 4) {
                    spanClasses = "md:col-span-2 md:row-span-1"; // Rectangle large
                } else {
                    spanClasses = "md:col-span-1 md:row-span-1"; // Carré normal
                }

                return (
                    <motion.div 
                        key={project.id} 
                        variants={itemVariants} 
                        className={spanClasses}
                    >
                        <MagneticProjectCard 
                            project={project} 
                            isFeatured={index === 0 || index === 4} 
                            sequenceNumber={index === 0 ? '01' : index === 4 ? '02' : undefined}
                            onClick={handleProjectClick} 
                        />
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
