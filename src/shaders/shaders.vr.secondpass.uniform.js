import {Matrix4} from 'three';

/**
 * @module shaders/data
 */
export default class ShadersUniform {
  static uniforms() {
    return {
      'uTextureSize': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uTextureContainer': {
        type: 'tv',
        value: [],
        typeGLSL: 'sampler2D',
        length: 7,
      },
      'uDataDimensions': {
        type: 'iv',
        value: [0, 0, 0],
        typeGLSL: 'ivec3',
      },
      'uWorldToData': {
        type: 'm4',
        value: new Matrix4(),
        typeGLSL: 'mat4',
      },
      'uWindowCenterWidth': {
        type: 'fv1',
        value: [0.0, 0.0],
        typeGLSL: 'float',
        length: 2,
      },
      'uRescaleSlopeIntercept': {
        type: 'fv1',
        value: [0.0, 0.0],
        typeGLSL: 'float',
        length: 2,
      },
      'uNumberOfChannels': {
        type: 'i',
        value: 1,
        typeGLSL: 'int',
      },
      'uBitsAllocated': {
        type: 'i',
        value: 8,
        typeGLSL: 'int',
      },
      'uInvert': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uLut': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uTextureLUT': {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
      'uPixelType': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uPackedPerPixel': {
        type: 'i',
        value: 1,
        typeGLSL: 'int',
      },
      'uInterpolation': {
        type: 'i',
        value: 1,
        typeGLSL: 'int',
      },
      'uWorldBBox': {
        type: 'fv1',
        value: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        typeGLSL: 'float',
        length: 6,
      },
      'uSteps': {
        type: 'i',
        value: 256,
        typeGLSL: 'int',
      },
      'uAlphaCorrection': {
        type: 'f',
        value: 0.5,
        typeGLSL: 'float',
      },
      'uFrequence': {
        type: 'f',
        value: 0.0,
        typeGLSL: 'float',
      },
      'uAmplitude': {
        type: 'f',
        value: 0.0,
        typeGLSL: 'float',
      },
      'uTextureBack': {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
    };
  }
}
