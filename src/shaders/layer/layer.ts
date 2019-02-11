import { BaseShader, BaseShaderStatics } from "../BaseShader";
import { Vector2 } from 'three/src/math/Vector2';


export class LayerShader extends BaseShader implements BaseShaderStatics {
  protected _manualVertShader(): string {
    throw new Error("Method not implemented.");
  }
  protected _manualFragShader(): string {
    throw new Error("Method not implemented.");
  }
  
  constructor(vert_uniforms, frag_uniforms) {
      super(vert_uniforms, frag_uniforms, 'layer');
  }

  static FragUniforms() {
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
