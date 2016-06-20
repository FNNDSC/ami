
/**
 * @module shaders/raycasting
 */

export default class ShadersRaycating {
  static singlePassUniforms(){
    return {
      'uWorldBBox': {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      },
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
      'uLut': {
        type: 'i',
        value: 0
      },
      'uTextureLUT':{
        type: 't',
        value: []
      },
      'uSteps': {
        type: 'i',
        value: 256
      },
      'uAlphaCorrection':{
        type: 'f',
        value: 0.5
      },
      'uFrequence':{
        type: 'f',
        value: 0.0
      },
      'uAmplitude':{
        type: 'f',
        value: 0.0
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

  static firstPassUniforms() {
    return {
      'uWorldBBox': {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      }
    };
  }

  static secondPassUniforms() {
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
      'uTextureBack': {
        type: 't',
        value: null
      },
      'uWorldBBox': {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      },
      'uSteps': {
        type: 'i',
        value: 128
      },
      'uLut': {
        type: 'i',
        value: 0
      },
      'uTextureLUT':{
        type: 't',
        value: []
      },
      'uAlphaCorrection':{
        type: 'f',
        value: 1.0
      },
      'uFrequence':{
        type: 'f',
        value: 0.0
      },
      'uAmplitude':{
        type: 'f',
        value: 0.0
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
