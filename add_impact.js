const fs = require('fs');

let content = fs.readFileSync('src/lib/data.ts', 'utf-8');

// Add to interface
content = content.replace(
    '    technicalChallenges: string;\n',
    '    technicalChallenges: string;\n    impact: string;\n'
);

const impacts = {
    "controle-hydraulique": {
        "fr": '        impact: "Temps de réponse divisé par 4 en boucle fermée, erreur statique annulée et robustesse de régulation validée sur banc d\'essai matériel.",',
        "en": '            impact: "Closed-loop response time divided by 4, with zero steady-state error and validated robustness against perturbations on hardware target.",'
    },
    "filtre-tchebychev": {
        "fr": '        impact: "Prototype matériel entièrement fonctionnel, respectant strictement la fréquence de coupure à 4,5 kHz avec une atténuation effective de 35dB mesurée à l\'oscilloscope.",',
        "en": '            impact: "Prototype circuit board validated via instruments, meeting the required cutoff frequency and attenuation with sub-threshold ripple.",'
    },
    "lyngk": {
        "fr": '        impact: "Moteur de jeu complet sans aucune fuite mémoire, permettant une résolution d\'état asymétrique continue avec une complexité opérationnelle minimale.",',
        "en": '            impact: "Complete game engine with zero memory leaks, enabling continuous asymmetric state resolution with minimal operational complexity.",'
    },
    "microprocesseurs": {
        "fr": '        impact: "Trois systèmes critiques (supervision, mesure de température embarquée, capteurs temps réel) développés avec une efficience mémoire native et une stabilité absolue des interruptions.",',
        "en": '            impact: "Three critical systems (supervision, embedded temperature measurement, real-time sensors) functionally implemented with memory efficiency and absolute interrupt stability.",'
    },
    "robotino": {
        "fr": '        impact: "Système de vision et de tir fiabilisé en conditions réelles de match, avec un suivi de palet robuste malgré les variations lumineuses et un tir déclenché sans dépassement de cible.",',
        "en": '            impact: "Vision and shooting system made reliable under real match conditions, with robust puck tracking despite lighting changes and shots triggered without target overshoot.",'
    },
    "awale": {
        "fr": '        impact: "Moteur de jeu s\'exécutant dans un espace mémoire strictement borné, sans dépassement ni fuite, validé sur l\'ensemble des scénarios de partie cyclique.",',
        "en": '            impact: "Game engine running within a strictly bounded memory space, without overflow or leaks, validated across all cyclic game scenarios.",'
    },
    "pygroove": {
        "fr": '        impact: "Application stable en usage prolongé : lecture audio, reconnaissance vocale et interface graphique tournent simultanément sans blocage ni conflit d\'accès matériel.",',
        "en": '            impact: "Stable application under extended use: audio playback, voice recognition, and the GUI all run simultaneously without freezing or hardware access conflicts.",'
    },
    "terminal-c": {
        "fr": '        impact: "Shell capable d\'exécuter des chaînes de commandes complexes (pipes, redirections) de façon stable, sans fuite de processus ni instabilité liée aux signaux système.",',
        "en": '            impact: "Shell able to execute complex command chains (pipes, redirections) reliably, without process leaks or signal-related instability.",'
    },
    "ferme-poo": {
        "fr": '        impact: "Architecture 100% exempte de fuite mémoire malgré une topologie d\'objets fortement circulaire, grâce à une gestion du cycle de vie par pointeurs intelligents.",',
        "en": '            impact: "Fully leak-free architecture despite a strongly circular object topology, thanks to lifecycle management via smart pointers.",'
    },
    "snake": {
        "fr": '        impact: "Boucle de jeu maintenant une fréquence stable et une détection de collision fiable, indépendamment de la puissance du processeur cible.",',
        "en": '            impact: "Game loop maintaining a stable frame rate and reliable collision detection, independent of the target processor\'s power.",'
    },
    "budget": {
        "fr": '        impact: "Temps de traitement des cohortes de données mensuelles réduit significativement grâce à la vectorisation, avec restitution graphique quasi instantanée.",',
        "en": '            impact: "Processing time for monthly data cohorts significantly reduced through vectorization, with near-instant chart rendering.",'
    },
    "voiture-bluetooth": {
        "fr": '        impact: "Robot livré et fonctionnel en conditions réelles, avec chaîne motrice stabilisée contre les micro-coupures de tension et liaison Bluetooth bidirectionnelle fiable.",',
        "en": '            impact: "Robot delivered and functional under real conditions, with a motor chain stabilized against voltage brownouts and a reliable bidirectional Bluetooth link.",'
    }
};

const projects = ["controle-hydraulique", "filtre-tchebychev", "lyngk", "microprocesseurs", "robotino", "awale", "pygroove", "terminal-c", "ferme-poo", "snake", "budget", "voiture-bluetooth"];

const lines = content.split('\n');
const new_lines = [];
let fr_index = 0;
let en_index = 0;
let in_en_block = false;

for (let line of lines) {
    new_lines.push(line);
    if (line.includes('getProjectsData(locale')) {
        in_en_block = true;
    }
        
    if (line.includes('technicalChallenges: "')) {
        if (!in_en_block) {
            const proj_id = projects[fr_index];
            new_lines.push(impacts[proj_id]['fr']);
            fr_index++;
        } else {
            const proj_id = projects[en_index];
            new_lines.push(impacts[proj_id]['en']);
            en_index++;
        }
    }
}

fs.writeFileSync('src/lib/data.ts', new_lines.join('\n'), 'utf-8');
console.log('Done!');
