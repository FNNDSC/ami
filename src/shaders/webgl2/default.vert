#version 300 es

// THREEJS Provided uniforms
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// attribute vec3 position;

out vec4 vPos;
out mat4 vProjectionViewMatrix;
out vec4 vProjectedCoords;

void main() {
    vPos = modelMatrix * vec4(position, 1.0 );
    vProjectionViewMatrix = projectionMatrix * viewMatrix;
    vProjectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}