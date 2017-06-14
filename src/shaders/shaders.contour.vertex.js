export default class ShadersVertex {

    constructor() {

    }

    compute() {
        return `
varying vec4 vPos;
varying vec4 vProjectedCoords;
varying mat4 vProjectionViewMatrix;
varying vec2 vProjectedTextCoords;

//
// main
//
void main() {

  vPos = modelMatrix * vec4(position, 1.0 );
  vProjectionViewMatrix = projectionMatrix * viewMatrix;
  vProjectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  vProjectedTextCoords = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );

}
        `;
    }

}
