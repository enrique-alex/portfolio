'use client';

import { useRef, ReactNode, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticProps {
    children: ReactNode;
    /** Puissance de l'attraction magnétique (valeur typique : 0.2 - 0.5) */
    intensity?: number;
}

export default function Magnetic({ children, intensity = 0.3 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Initialisation des valeurs de position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Configuration stricte du ressort physique dictée par les spécifications
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        
        // Extraction des limites géométriques du composant
        const rect = ref.current.getBoundingClientRect();
        
        // Calcul du vecteur centre
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Vecteurs de distance
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        
        // Application de l'attraction (multipliée par l'intensité)
        x.set(distanceX * intensity);
        y.set(distanceY * intensity);
    };

    const handleMouseLeave = () => {
        // Retour physique à la position d'origine {0,0}
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className="inline-flex cursor-pointer relative z-40" // Z-index géré pour ne pas bloquer le WebGL Fluid
        >
            {children}
        </motion.div>
    );
}
