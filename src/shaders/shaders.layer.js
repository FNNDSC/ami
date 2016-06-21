
/**
 * @module shaders/layer
 */
 
export default class ShadersLayer {
  static uniforms(){
    return {
      'uTextureSize': {
        type: 'i',
        value: 0
      },
      'uTextureContainer': {
        type: 'tv',
        value: []
      },
      'uDataDimensions': {
        type: 'iv',
        value: [0, 0, 0]
      },
      'uWorldToData': {
        type: 'm4',
        value: new THREE.Matrix4()
      },
      'uWindowCenterWidth': {
        type: 'fv1',
        value: [0.0, 0.0]
      },
      'uRescaleSlopeIntercept': {
        type: 'fv1',
        value: [0.0, 0.0]
      },
      'uNumberOfChannels': {
        type: 'i',
        value: 1
      },
      'uBitsAllocated': {
        type: 'i',
        value: 8
      },
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
        type: '1',
        value: 1
      },
      'uLut': {
        type: 'i',
        value: 0
      },
      'uTextureLUT':{
        type: 't',
        value: []
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
      },
      'uPixelType': {
        type: 'i',
        value: 0
      },
      'uInterpolation': {
        type: 'i',
        value: 0
      }
    };
  }
}