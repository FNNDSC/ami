import {Vector2} from 'three';

/**
 * @module shaders/data
 */
export default class ShadersUniform {
  static uniforms() {
    return {
    'uTextureBackTest0': {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
      'uTextureBackTest1': {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
      'uOpacity0': {
        type: 'f',
        value: 1.0,
        typeGLSL: 'float',
      },
      'uOpacity1': {
        type: 'f',
        value: 1.0,
        typeGLSL: 'float',
      },
      'uType0': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uType1': {
        type: 'i',
        value: 1,
        typeGLSL: 'int',
      },
      'uTrackMouse': {
        type: 'i',
        value: 0,
        typeGLSL: 'int',
      },
      'uMouse': {
        type: 'v2',
        value: new Vector2(),
        typeGLSL: 'vec2',
      },
    };
  }
}
