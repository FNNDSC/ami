
/**
 * @module shaders/data
 */
export default class ShadersData {
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
      'uLut': {
        type: 'i',
        value: 0
      },
      'uTextureLUT':{
        type: 't',
        value: []
      },
      'uPixelType': {
        type: 'i',
        value: 0
      },
      'uPackedPerPixel': {
        type: 'i',
        value: 1
      },
      'uInterpolation': {
        type: 'i',
        value: 1
      }
    };
  }
}