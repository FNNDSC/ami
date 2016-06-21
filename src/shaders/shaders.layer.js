
/**
 * @module shaders/layer
 */
 
export default class ShadersLayer {
  static uniforms(){
    return {
      'uInvert': {
        type: 'i',
        value: 0
      },
      'uTextureBackTest0': {
        type: 't',
        value: []
      },
      'uTextureBackTest1': {
        type: 't',
        value: []
      },
      'uOpacity':{
        type: 'f',
        value: 1.0
      },
      'uOpacity0':{
        type: 'f',
        value: 1.0
      },
      'uOpacity1':{
        type: 'f',
        value: 1.0
      },
      'uType0':{
        type: 'i',
        value: 0
      },
      'uType1':{
        type: 'i',
        value: 1
      },
      'uMinMax': {
        type: 'fv1',
        value: [0.0, 0.0]
      },
      'uMix': {
        type: 'i',
        value: 0
      },
      'uTrackMouse': {
        type: 'i',
        value: 0
      },
      'uMouse':{
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
  }
}