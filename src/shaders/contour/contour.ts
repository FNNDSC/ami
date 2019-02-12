import { BaseShader, BaseShaderStatics } from "../BaseShader";

export class ContourShader extends BaseShader implements BaseShaderStatics {
  protected _ManualVertShader(): string {
    throw new Error("Method not implemented.");
  }
  protected _ManualFragShader(): string {
    throw new Error("Method not implemented.");
  }

  // tslint:disable-next-line:typedef
  constructor() {
      super('contour');
  }

  public static VertUniforms() {
    return null;
  }

  public static FragUniforms() {
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