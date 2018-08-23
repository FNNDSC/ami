export default class ShadersVertex {
  compute() {
    return `
varying vec3 vPos;
varying vec3 vNormal;

void main() {
  vNormal = normal;
  vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );

}
        `;
    }
}
