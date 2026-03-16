export interface Project {
    id: string;
    title: string;
    slug: string;
    year: number;
    category: 'Systèmes Embarqués' | 'Développement Logiciel' | 'Algorithmie';
    shortDescription: string;
    detailedDescription: string;
    technicalChallenges: string;
    technologies: string[];
    themeColor: { r: number; g: number; b: number };
    githubUrl?: string;
}

export const projectsData: Project[] = [
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
