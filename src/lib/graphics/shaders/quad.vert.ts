/**
 * quad.vert.ts - Vertex shader minimal pour quad plein écran
 *
 * Projette un quad plein écran (2 triangles, 6 sommets) directement en clip space
 * sans aucun calcul de matrice MVP superflu.
 * Exporte les versions WebGL 2.0 (GLSL ES 3.00) et WebGL 1.0 (GLSL ES 1.00).
 */

export const quadVertexShaderWebGL2 = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const quadVertexShaderWebGL1 = `
precision highp float;

attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export function getQuadVertexShader(isWebGL2 = true): string {
  return isWebGL2 ? quadVertexShaderWebGL2 : quadVertexShaderWebGL1;
}

export const quadVertexShader = quadVertexShaderWebGL2;
export default quadVertexShader;
