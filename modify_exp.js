const fs = require('fs');

let content = fs.readFileSync('src/components/sections/ExperienceSection.tsx', 'utf-8');

// 1. Interface
content = content.replace(
  '  detailedItems?: string[];\n}',
  '  detailedItems?: string[];\n  themeColor: { r: number; g: number; b: number };\n}'
);

// 2. Data
content = content.replace(
  '      detailedItems: detailedItems,\n    }',
  '      detailedItems: detailedItems,\n      themeColor: { r: 13, g: 148, b: 136 }\n    }'
);
content = content.replace(
  "      skills: ['Logistique', 'Travail en équipe', 'Gestion du stress', 'Optimisation des flux']\n    }",
  "      skills: ['Logistique', 'Travail en équipe', 'Gestion du stress', 'Optimisation des flux'],\n      themeColor: { r: 234, g: 88, b: 12 }\n    }"
);

// 3. Map loop + Header button
content = content.replace(
  '            const isActive = exp.status === \'ACTIVE\';',
  '            const isActive = exp.status === \'ACTIVE\';\n            const tc = exp.themeColor;'
);

content = content.replace(
  '                    ${isActive ? \'border-emerald-500\' : \'border-zinc-300 dark:border-zinc-700\'}\n                  `}',
  '                  `}\n                  style={{ borderLeftColor: `rgb(${tc.r},${tc.g},${tc.b})` }}'
);

// 4. Glow
content = content.replace(
  '                  {/* Subtle hover glow for the active border */}\n                  {isActive && (\n                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[1px] bg-emerald-500 opacity-0 shadow-[0_0_15px_2px_rgba(16,185,129,0.5)] transition-opacity duration-300 group-hover:opacity-100" />\n                  )}',
  '                  {/* Subtle hover glow for the active border */}\n                  <div \n                    className="pointer-events-none absolute inset-y-0 left-0 w-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"\n                    style={{ backgroundColor: `rgb(${tc.r},${tc.g},${tc.b})`, boxShadow: `0 0 15px 2px rgba(${tc.r},${tc.g},${tc.b},0.5)` }}\n                  />'
);

// 5. LED Badge
content = content.replace(
  '                      {/* LED Status Badge */}\n                      <div className={`\n                        flex items-center gap-2 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-widest\n                        ${isActive \n                            ? \'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400\' \n                            : \'border-zinc-400/30 bg-zinc-400/10 text-zinc-600 dark:text-zinc-400\'}\n                      `}>\n                        {isActive ? (\n                          <>\n                            <span className="relative flex h-2 w-2 items-center justify-center">\n                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>\n                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>\n                            </span>\n                            {t(\'experience.status.active\')}\n                          </>\n                        ) : (\n                          <>\n                            <CheckCircle2 className="h-3 w-3" />\n                            {t(\'experience.status.completed\')}\n                          </>\n                        )}\n                      </div>',
  '                      {/* LED Status Badge */}\n                      <div \n                        className="flex items-center gap-2 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-widest"\n                        style={{ borderColor: `rgba(${tc.r},${tc.g},${tc.b},0.3)`, backgroundColor: `rgba(${tc.r},${tc.g},${tc.b},0.1)`, color: `rgb(${tc.r},${tc.g},${tc.b})` }}\n                      >\n                        {isActive ? (\n                          <>\n                            <span className="relative flex h-2 w-2 items-center justify-center">\n                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: `rgb(${tc.r},${tc.g},${tc.b})` }}></span>\n                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `rgb(${tc.r},${tc.g},${tc.b})` }}></span>\n                            </span>\n                            {t(\'experience.status.active\')}\n                          </>\n                        ) : (\n                          <>\n                            <CheckCircle2 className="h-3 w-3" />\n                            {t(\'experience.status.completed\')}\n                          </>\n                        )}\n                      </div>'
);

// 6. Expanded box
content = content.replace(
  '                      <div className={`\n                        border-l-[3px] px-4 py-6 sm:px-8 sm:py-8 backdrop-blur-md\n                        ${isActive ? \'border-emerald-500/50 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]\' : \'border-zinc-300 bg-black/[0.02] dark:border-zinc-700 dark:bg-white/[0.02]\'}\n                      `}>',
  '                      <div \n                        className="border-l-[3px] px-4 py-6 sm:px-8 sm:py-8 backdrop-blur-md"\n                        style={{ borderLeftColor: `rgba(${tc.r},${tc.g},${tc.b},0.5)`, backgroundColor: `rgba(${tc.r},${tc.g},${tc.b},0.02)` }}\n                      >'
);

// 7. Bullet points
content = content.replace(
  '                                    <span className="mr-2 text-emerald-500 font-bold">›</span>',
  '                                    <span className="mr-2 font-bold" style={{ color: `rgb(${tc.r},${tc.g},${tc.b})` }}>›</span>'
);

fs.writeFileSync('src/components/sections/ExperienceSection.tsx', content, 'utf-8');
console.log('Experiences updated!');
