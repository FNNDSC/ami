
/**
 * @module shaders/data
 */
export default class ShadersUniform {
  static uniforms() {
    return {
      'uCanvasWidth': {
        type: 'f',
        value: 0.,
        typeGLSL: 'float',
      },
      'uCanvasHeight': {
        type: 'f',
        value: 0.,
        typeGLSL: 'float',
      },
      'uWidth': {
        type: 'f',
        value: 1.,
        typeGLSL: 'float',
      },
      'uOpacity': {
        type: 'f',
        value: 1.,
        typeGLSL: 'float',
      },
      'uTextureFilled': {
        type: 't',
        value: [],
        typeGLSL: 'sampler2D',
      },
    };
  }
}
