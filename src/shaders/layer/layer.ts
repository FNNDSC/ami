import { Vector2 } from 'three/src/math/Vector2';
import { BaseShader, BaseShaderStatics } from "../BaseShader";

export class LayerShader extends BaseShader implements BaseShaderStatics {
  protected _ManualVertShader(): string {
    throw new Error("Method not implemented.");
  }
  protected _ManualFragShader(): string {
    throw new Error("Method not implemented.");
  }
  
  // tslint:disable-next-line:typedef
  constructor() {
      super('layer');
  }

  public static Uniforms() {
      return {
        uTextureBackTest0: {
          type: 't',
          value: [],
          typeGLSL: 'sampler2D',
        },
        uTextureBackTest1: {
          type: 't',
          value: [],
          typeGLSL: 'sampler2D',
        },
        uOpacity0: {
          type: 'f',
          value: 1.0,
          typeGLSL: 'float',
        },
        uOpacity1: {
          type: 'f',
          value: 1.0,
          typeGLSL: 'float',
        },
        uType0: {
          type: 'i',
          value: 0,
          typeGLSL: 'int',
        },
        uType1: {
          type: 'i',
          value: 1,
          typeGLSL: 'int',
        },
        uTrackMouse: {
          type: 'i',
          value: 0,
          typeGLSL: 'int',
        },
        uMouse: {
          type: 'v2',
          value: new Vector2(),
          typeGLSL: 'vec2',
        },
      };
  }  
}
