// THREEJS Provided uniforms
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vPos;
varying vec3 vNormal;

void main() {
  vNormal = normal;
  vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}