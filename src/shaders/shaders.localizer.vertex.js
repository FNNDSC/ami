/**
 *
 */
export default class {
    /**
     *
     */
    compute() {
        return `
varying vec4 vPos;
varying mat4 vProjectionViewMatrix;

//
// main
//
void main() {

  vPos = modelMatrix * vec4(position, 1.0 );
  vProjectionViewMatrix = projectionMatrix * viewMatrix;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );

}
        `;
    }
}
