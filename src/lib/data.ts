import { useLanguage } from '@/components/theme/LanguageProvider';

export interface Project {
    id: string;
    title: string;
    slug: string;
    year: number;
    category: string;
    shortDescription: string;
    detailedDescription: string;
    technicalChallenges: string;
    technologies: string[];
    themeColor: { r: number; g: number; b: number };
    githubUrl?: string;
}

export const projectsDataFallback: Project[] = [
    {
        id: "robotino",
        title: "Robotino – Hockey Autonome",
        slug: "robotino-hockey-autonome-2026",
        year: 2026,
        category: "Systèmes Embarqués",
        shortDescription: "Programmation d'un robot mobile omnidirectionnel pour un match de hockey entièrement autonome : vision, navigation et tir.",
        detailedDescription: "Conception complète du système de contrôle d'un Robotino 2 pour un match de hockey robotisé. Le robot devait repérer un palet par vision embarquée, naviguer vers le but en évitant les robots adverses, détecter la ligne de but métallique par capteur inductif et déclencher un tir précis. L'architecture de contrôle repose sur un Grafcet hiérarchique orchestrant navigation, évitement d'obstacles temps réel et séquence de tir.",
        technicalChallenges: "La détection colorimétrique initiale en espace RGB générait des pertes de cible face aux variations lumineuses. Le basculement vers l'espace HSV a isolé la teinte de la luminosité pour un suivi robuste. La portée très courte du capteur inductif (4 mm) entraînait des dépassements de cible à cause de l'inertie. Une anticipation de freinage via odométrie (2000 impulsions/tour) et vision a résolu le problème. La zone fiable des infrarouges (15-45 cm) a été modélisée pour éviter les faux positifs au-delà de 50 cm.",
        technologies: ["Robotino 2", "Grafcet", "Vision par Ordinateur", "Capteurs Industriels", "Robotino View", "Automatique"],
        themeColor: { r: 0, g: 122, b: 255 }
    },
    {
        id: "awale",
        title: "Awale - Stratégie en C",
        slug: "awale-jeu-c-2026",
        year: 2026,
        category: "Algorithmie",
        shortDescription: "Développement du jeu de société traditionnel en langage C axé sur l'efficacité des structures.",
        detailedDescription: "Conception architecturale et implémentation en langage formel C de la mécanique combinatoire du jeu de société Awale. Ce projet focalise principalement sur la performance algorithmique pure, la gestion déterministe de la mémoire et la logique d'état asymétrique continue.",
        technicalChallenges: "La difficulté majeure résidait dans la modélisation mathématique d'un plateau de jeu strictement cyclique sans causer de débordement dynamique en mémoire vive. L'approche d'ingénierie a consisté à encapsuler le plateau dans des structures de données contiguës, manipulées perpétuellement via l'arithmétique modulaire et des pointeurs de fonctions robustes.",
        technologies: ["C", "Logique de Jeu", "Pointeurs C", "Arithmétique Modulaire"],
        themeColor: { r: 192, g: 57, b: 43 }
    },
    {
        id: "pygroove",
        title: "PyGroove - Assistant Musical",
        slug: "pygroove-assistant-audio-2025",
        year: 2025,
        category: "Développement Logiciel",
        shortDescription: "Lecteur musical intelligent en Python doté de reconnaissance vocale et de rendu audio synchrone.",
        detailedDescription: "Création d'un environnement de lecture multimédia intelligent programmé entièrement en Python. Le système orchestre une interface vectorielle complexe sous Tkinter, délègue le rendu bas niveau au moteur Pygame, intègre le protocole de reconnaissance vocale Speech-Recognition, et procède au parsing de métadonnées audio via les algorithmes Pydub et Mutagen.",
        technicalChallenges: "Gérer la concurrence critique d'accès matériels simultanés entre la boucle d'événements visuels, le thread d'écoute réseau asynchrone et le buffer DMA matériel de la carte son. La solution logicielle a impliqué une séparation d'E/S (Entrées/Sorties) au sein d'une architecture multi-threadée stricte pour isoler les instructions temps réel du wrapper asynchrone.",
        technologies: ["Python", "Tkinter", "Pygame", "Speech-Recognition", "Pydub", "Mutagen"],
        themeColor: { r: 41, g: 128, b: 185 }
    },
    {
        id: "terminal-c",
        title: "Shell Unix - Interpréteur C",
        slug: "interpreteur-commandes-unix-2025",
        year: 2025,
        category: "Systèmes Embarqués",
        shortDescription: "Développement natif complet d'un émulateur de terminal en langage C s'adossant aux appels Unix/Linux.",
        detailedDescription: "Ingénierie inverse d'un shell applicatif standard par la manipulation intime des appels système au niveau de l'espace noyau (Kernel Space). Ce projet requiert une compréhension profonde de la mémoire paginée (Heap), la duplication de processus système ainsi que l'interfaçage des descripteurs de fichiers.",
        technicalChallenges: "La communication asynchrone et imprévisible inter-processus a provoqué des instabilités dans les flux d'entrées/sorties lors de la propagation du signal matériel. L'exécution sécurisée fut garantie par le déploiement d'un gestionnaire de signaux déterministes et la gestion méthodique des pipelines en mémoire vive (fork, execvp et dup2).",
        technologies: ["C", "Processus Posix", "Linux Kernel", "Signaux ASync", "Mémoire"],
        themeColor: { r: 52, g: 73, b: 94 }
    },
    {
        id: "ferme-poo",
        title: "Simulateur Agricole C++",
        slug: "simulateur-agricole-poo-2024",
        year: 2024,
        category: "Développement Logiciel",
        shortDescription: "Application modélisée en C++ démontrant la rigueur des patrons de conception majeurs (POO).",
        detailedDescription: "Modélisation en C++ d'un environnement systémique simulé. Le paradigme Orienté Objet est exploité de fond en comble pour assurer un isolement strict des responsabilités par l'héritage d'interfaces, le polymorphisme applicatif et la compartimentation spatiale des objets d'activité.",
        technicalChallenges: "L'instabilité inhérente aux pointeurs orphelins (Dangling Pointers) au sein d'une topologie circulaire forte a compromis initialement la destruction des entités par le processus courant. L'ingénierie moderne en C++ a remédié au conflit en déployant un écosystème de pointeurs intelligents gérant structurellement le cycle de vie mémoire via le comptage de références.",
        technologies: ["C++", "POO", "Polymorphisme", "Héritage ISO", "Smart Pointers"],
        themeColor: { r: 22, g: 160, b: 133 }
    },
    {
        id: "snake",
        title: "Snake - Moteur Arcade C++",
        slug: "moteur-jeu-snake-cpp-2024",
        year: 2024,
        category: "Algorithmie",
        shortDescription: "Conception architecturale en C++ encadrant la complexité d'une boucle vidéo temps réel.",
        detailedDescription: "Développement fonctionnel d'un moteur d'arcade limitant la surcharge du microprocesseur selon des principes stricts de la POO. Implémentation isolée de la game loop principale, abstraction du module des entrées matérielles, et raffinement algorithmique pour la vérification collisionnelle 2D.",
        technicalChallenges: "La chute du taux de rafraîchissement (frame rate drops) occasionnait des erreurs silencieuses dans le registre de vérifications d'intersections vectorielles à haute vélocité. Le correctif a dicté l'adoption d'un diviseur d'échelle temporel interpolé (Delta-time scaling) garantissant une cohérence arithmétique mathématiquement indépendante de la bande passante du processeur local.",
        technologies: ["C++", "Architecture Objet", "Algorithmique Matérielle", "Game Loop"],
        themeColor: { r: 142, g: 68, b: 173 }
    },
    {
        id: "budget",
        title: "Analyse Financière Python",
        slug: "script-analyse-financiere-2024",
        year: 2024,
        category: "Développement Logiciel",
        shortDescription: "Script algorithmique automatisant le traitement systématique de vastes cohortes de données statistiques mensuelles.",
        detailedDescription: "Conception et écriture d'une tuyauterie de données (data pipeline) robuste en Python. Ce module opère au travers de bibliothèques d'analyse complexes pour extraire, uniformiser, et générer mathématiquement des tracés graphiques interactifs en vue de synthèses prédictives.",
        technicalChallenges: "La lenteur systémique de compilation générée par la traversée bouclée d'enregistrements historiques massifs limitait l'utilisation instantanée de la vue interface. La restructuration informatique a introduit une vectorisation matricielle stricte de toutes les manipulations, combinée à une sauvegarde délocalisée du tracé en tampons SVG/Canvas pré-rendus.",
        technologies: ["Python", "Analytique Data", "Scripts", "Vectorisation", "Graphes ML"],
        themeColor: { r: 211, g: 84, b: 0 }
    },
    {
        id: "voiture-bluetooth",
        title: "Robot Mobile Bluetooth",
        slug: "vehicule-embarque-bluetooth-2023",
        year: 2023,
        category: "Systèmes Embarqués",
        shortDescription: "Déploiement en tant que Chef de Projet d'un système matériel piloté via Arduino (C/C++).",
        detailedDescription: "Ingénierie complète intégrée, couvrant l'analyse CAO et modélisation via CATIA V5, en tandem formel avec l'impression 3D paramétrique du bâti asymétrique de mobilité. Développement microcontrôlé en C/C++ (Arduino) de la chaîne de régulation motrice ainsi que de l'antenne logique de communication Bluetooth RX/TX bidirectionnelle.",
        technicalChallenges: "Une sollicitation d'intensité hors normes au démarrage des unités moteurs provoquait d'importants creux de tension capacitifs perturbant directement les calculs logiques embarqués (brownouts hardware). L'architecture a été solidifiée grâce à un isolement galvanique partiel par optocoupleur et l'optimisation mathématique du routage de puissance via les signaux de commande en PWM (Pulse Width Modulation).",
        technologies: ["C/C++", "Arduino µC", "CATIA V5", "Bluetooth RF", "Mécanique 3D"],
        themeColor: { r: 39, g: 174, b: 96 }
    }
];

export function useProjectsData(): Project[] {
    const { locale } = useLanguage();

    if (locale === 'fr') {
        return projectsDataFallback;
    }

    return [
        {
            ...projectsDataFallback[0],
            title: "Robotino – Autonomous Hockey",
            category: "Embedded Systems",
            shortDescription: "Programming an omnidirectional mobile robot for a fully autonomous hockey match: vision, navigation, and shooting.",
            detailedDescription: "Complete design of the control system of a Robotino 2 for a robotic hockey match. The robot had to locate a puck via embedded vision, navigate to the goal while avoiding opponents, detect the metallic goal line via inductive sensor, and trigger an accurate shot. The control architecture relies on a hierarchical Grafcet orchestrating navigation, real-time obstacle avoidance, and shooting sequence.",
            technicalChallenges: "Initial colorimetric detection in RGB space generated target losses opposite to light variations. Switching to the HSV space isolated the hue from the brightness for robust tracking. The very short range of the inductive sensor (4 mm) led to target overshoots due to inertia. Braking anticipation via odometry and vision solved the problem. The reliable infrared zone (15-45 cm) was modeled to avoid false positives at a distance."
        },
        {
            ...projectsDataFallback[1],
            title: "Awale - C Strategy",
            category: "Algorithms",
            shortDescription: "Development of the traditional board game in C language focused on data structure efficiency.",
            detailedDescription: "Architectural design and formal implementation in C language of the combinatorial mechanics of the Awale board game. This project focuses on pure algorithmic performance, deterministic memory management, and continuous asymmetric state logic.",
            technicalChallenges: "The major difficulty lay in the mathematical modeling of a strictly cyclic game board without causing dynamic memory overflows in RAM. The engineering approach consisted of encapsulating the board in contiguous data structures continuously manipulated via modular arithmetic and robust function pointers."
        },
        {
            ...projectsDataFallback[2],
            title: "PyGroove - Music Assistant",
            category: "Software Engineering",
            shortDescription: "Intelligent Python music player with voice recognition and synchronous audio rendering.",
            detailedDescription: "Creation of an intelligent multimedia playback environment programmed entirely in Python. The system orchestrates a complex vector interface under Tkinter, delegates low-level rendering to the Pygame engine, integrates the Speech-Recognition protocol, and parses audio metadata via the Pydub and Mutagen algorithms.",
            technicalChallenges: "Managing the critical concurrency of simultaneous hardware accesses between the visual event loop, the asynchronous network listening thread, and the sound card's hardware DMA buffer. The software solution involved an I/O separation within a strict multi-threaded architecture to isolate real-time instructions from the asynchronous wrapper."
        },
        {
            ...projectsDataFallback[3],
            title: "Unix Shell - C Interpreter",
            category: "Embedded Systems",
            shortDescription: "Full native development of a terminal emulator in C relying on Unix/Linux calls.",
            detailedDescription: "Reverse engineering of a standard application shell by intimately manipulating system calls at the Kernel Space level. This project requires a deep understanding of paged memory (Heap), system process duplication, and file descriptor interfacing.",
            technicalChallenges: "Asynchronous and unpredictable inter-process communication caused instabilities in I/O streams during hardware signal propagation. Secure execution was ensured by deploying a deterministic signal handler and methodical management of RAM pipelines (fork, execvp, and dup2)."
        },
        {
            ...projectsDataFallback[4],
            title: "C++ Farm Simulator",
            category: "Software Engineering",
            shortDescription: "C++ modeled application demonstrating the rigor of major OOP design patterns.",
            detailedDescription: "C++ modeling of a simulated systemic environment. The Object-Oriented paradigm is exploited thoroughly to ensure strict separation of responsibilities through interface inheritance, application polymorphism, and spatial compartmentalization of activity objects.",
            technicalChallenges: "The instability inherent to dangling pointers within a strong circular topology initially compromised the destruction of entities by the current process. Modern C++ engineering remedied the conflict by deploying an ecosystem of smart pointers structurally managing the memory lifecycle via reference counting."
        },
        {
            ...projectsDataFallback[5],
            title: "Snake - C++ Arcade Engine",
            category: "Algorithms",
            shortDescription: "C++ architectural design framing the complexity of a real-time video loop.",
            detailedDescription: "Functional development of an arcade engine limiting microprocessor overload according to strict OOP principles. Isolated implementation of the main game loop, abstraction of the hardware input module, and algorithmic refinement for 2D collision verification.",
            technicalChallenges: "Frame rate drops caused silent errors in the register of high-velocity vector intersection checks. The fix dictated the adoption of an interpolated Delta-time scaling guaranteeing arithmetic consistency mathematically independent of the local processor bandwidth."
        },
        {
            ...projectsDataFallback[6],
            title: "Python Finance Analytics",
            category: "Software Engineering",
            shortDescription: "Algorithmic script automating the systematic processing of vast cohorts of monthly statistical data.",
            detailedDescription: "Design and writing of a robust data pipeline in Python. This module operates through complex analysis libraries to extract, standardize, and mathematically generate interactive graphic plots for predictive syntheses.",
            technicalChallenges: "The systemic compilation slowness generated by the looped traversal of massive historical records limited the instantaneous use of the interface view. The IT restructuring introduced a strict matrix vectorization of all manipulations, combined with off-site saving of the plot in pre-rendered SVG/Canvas buffers."
        },
        {
            ...projectsDataFallback[7],
            title: "Bluetooth Mobile Robot",
            category: "Embedded Systems",
            shortDescription: "Deployed as Project Manager of a hardware system controlled via Arduino (C/C++).",
            detailedDescription: "Complete integrated engineering, covering CAD analysis and modeling via CATIA V5, in formal tandem with parametric 3D printing of the asymmetric mobility frame. Microcontrolled development in C/C++ (Arduino) of the motor regulation chain as well as the logical bidirectional Bluetooth RX/TX communication antenna.",
            technicalChallenges: "An extraordinary intensity solicitation upon starting the motor units caused significant capacitive voltage sags directly disrupting embedded logic calculations (hardware brownouts). The architecture was solidified through partial galvanic isolation by optocoupler and the mathematical optimization of power routing via PWM (Pulse Width Modulation) control signals."
        }
    ];
}
