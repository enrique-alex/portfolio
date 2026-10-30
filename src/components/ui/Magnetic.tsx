'use client';

import { useRef, ReactNode, MouseEvent, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface MagneticProps {
    children: ReactNode;
    /** Puissance de l'attraction magnétique (valeur typique : 0.2 - 0.5) */
    intensity?: number;
}

export default function Magnetic({ children, intensity = 0.3 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    }, []);

    // Initialisation des valeurs de position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Configuration stricte du ressort physique dictée par les spécifications
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current || isTouch || shouldReduceMotion) return;
        
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
        if (isTouch || shouldReduceMotion) return;
        // Retour physique à la position d'origine {0,0}
        x.set(0);
        y.set(0);
    };

    const isCoarseOrReduced = isTouch || Boolean(shouldReduceMotion);

    return (
        <motion.div
            ref={ref}
            onMouseMove={isCoarseOrReduced ? undefined : handleMouseMove}
            onMouseLeave={isCoarseOrReduced ? undefined : handleMouseLeave}
            style={isCoarseOrReduced ? undefined : { x: springX, y: springY }}
            className={`inline-flex cursor-pointer relative z-40 ${isCoarseOrReduced ? '' : 'will-change-transform'}`}
        >
            {children}
        </motion.div>
    );
}
