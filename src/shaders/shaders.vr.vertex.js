export default class ShadersVertex {

    constructor() {

    }

    compute() {
        return `
varying vec4 vPos;

//
// main
//
void main() {

  vPos = modelMatrix * vec4(position, 1.0 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );

}
        `;
    }

}
