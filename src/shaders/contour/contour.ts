import { BaseShader, BaseShaderStatics } from "../BaseShader";

export class ContourShader extends BaseShader implements BaseShaderStatics {
  protected _manualVertShader(): string {
    throw new Error("Method not implemented.");
  }
  protected _manualFragShader(): string {
    throw new Error("Method not implemented.");
  }
  
  constructor(vert_uniforms, frag_uniforms) {
      super(vert_uniforms, frag_uniforms, 'contour');
  }

  static FragUniforms() {
      return {
        uCanvasWidth: {
          type: 'f',
          value: 0,
          typeGLSL: 'float',
        },
        uCanvasHeight: {
          type: 'f',
          value: 0,
          typeGLSL: 'float',
        },
        uWidth: {
          type: 'f',
          value: 1,
          typeGLSL: 'float',
        },
        uOpacity: {
          type: 'f',
          value: 1,
          typeGLSL: 'float',
        },
        uTextureFilled: {
          type: 't',
          value: [],
          typeGLSL: 'sampler2D',
        },
      };
  }
}