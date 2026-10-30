/**
 * kinetic-fluid.frag.ts - Fragment shader fluide réactif à l'énergie cinétique
 *
 * Uniforms requis :
 * - u_time : temps continu (secondes)
 * - u_energy : énergie cinétique normalisée [0.0, 1.0] injectée par KineticEnergy
 * - u_mouse : coordonnées normalisées du curseur [0.0, 1.0]
 * - u_resolution : dimensions effectives du viewport (pixels)
 *
 * Modulations :
 * - Vitesse de déformation, turbulence et luminescence modulées directement par u_energy.
 * - À u_energy = 0, ondulation minimale, sobre et quasi statique.
 */

const shaderBody = `
uniform float u_time;
uniform float u_energy;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main() {
  // Coordonnées normalisées avec conservation du ratio d'aspect
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0);
  vec2 mouse = (u_mouse - 0.5) * vec2(aspect, 1.0);

  // Interaction curseur : zone d'influence et ondes de sillage
  float distMouse = length(p - mouse);
  float mouseRadius = 0.35 + u_energy * 0.45;
  float mouseFalloff = smoothstep(mouseRadius, 0.0, distMouse);
  float mouseWave = sin(distMouse * (18.0 + u_energy * 10.0) - u_time * (3.0 + u_energy * 5.0)) * exp(-distMouse * 3.5) * u_energy;

  // Vitesse de déformation continue : très lente et sobre au repos (0.12), vive sous énergie (jusqu'à 1.12)
  float speed = 0.12 + u_energy * 1.0;
  float t = u_time * speed;

  // Turbulence cinétique : ondulations larges au repos, tourbillons denses sous énergie
  float turbulence = 0.25 + u_energy * 0.85;

  // Déformation de domaine (Domain Warping)
  vec2 flow = vec2(
    sin(p.y * 1.8 + t * 0.4),
    cos(p.x * 1.8 + t * 0.35)
  );

  vec2 warp = vec2(
    sin(p.x * 2.5 + flow.x * (1.2 + turbulence) + t * 0.5 + mouseFalloff * 2.0 + mouseWave),
    cos(p.y * 2.5 + flow.y * (1.2 + turbulence) - t * 0.45 - mouseFalloff * 2.0 - mouseWave)
  );

  // Champ scalaire fluide
  float f = 0.5 + 0.5 * sin(dot(p + warp * turbulence, vec2(1.8, 1.4)) + t * 0.6 + mouseWave * 2.0);
  f = smoothstep(0.15, 0.85, f);

  // Palette chromatique inspirée de l'identité visuelle (Bleu brand #4285F4, Rouge brand #EA4335, Cyan électrique)
  vec3 colBase = vec3(0.02, 0.04, 0.09);
  vec3 colBlue = vec3(0.258, 0.521, 0.957);
  vec3 colCyan = vec3(0.12, 0.72, 0.95);
  vec3 colRed = vec3(0.917, 0.262, 0.208);

  // Mélange progressif des teintes
  vec3 col = mix(colBase, colBlue, f * (0.45 + u_energy * 0.55));
  col = mix(col, colCyan, (warp.x * 0.5 + 0.5) * (0.2 + u_energy * 0.8));

  // Crêtes dynamiques teintées d'accent rouge sur les fortes variations
  float crest = pow(max(0.0, dot(warp, vec2(0.707, 0.707))), 3.5);
  col = mix(col, colRed, crest * u_energy * 0.7);

  // Halo lumineux autour du curseur
  col += colCyan * (mouseFalloff * (0.35 + u_energy * 0.65));

  // Luminescence globale modulée par l'énergie
  // Au repos : luminescence sobre et discrète (0.12)
  // En mouvement : luminescence rehaussée (jusqu'à ~0.7)
  float lum = 0.12 + u_energy * 0.55 + mouseFalloff * u_energy * 0.35;
  float alpha = clamp(lum * (0.4 + f * 0.6), 0.0, 1.0);

  // Rendu avec alpha prémultiplié pour composition WebGL fluide
  OUTPUT_COLOR = vec4(col * alpha, alpha);
}
`;

export const kineticFluidFragmentShaderWebGL2 = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

${shaderBody.replace('OUTPUT_COLOR', 'fragColor')}
`;

export const kineticFluidFragmentShaderWebGL1 = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 v_uv;

${shaderBody.replace('OUTPUT_COLOR', 'gl_FragColor')}
`;

export function getKineticFluidFragmentShader(isWebGL2 = true): string {
  return isWebGL2 ? kineticFluidFragmentShaderWebGL2 : kineticFluidFragmentShaderWebGL1;
}

export const kineticFluidFragmentShader = kineticFluidFragmentShaderWebGL2;
export default kineticFluidFragmentShader;
