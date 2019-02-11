import { BaseShader, BaseShaderStatics } from "../BaseShader";

export class ContourShader extends BaseShader implements BaseShaderStatics {
  protected _manualVertShader(): string {
    throw new Error("Method not implemented.");
  }
  protected _manualFragShader(): string {
    throw new Error("Method not implemented.");
  }

  constructor(vert_uniforms, frag_uniforms) {
      super(vert_uniforms, frag_uniforms, 'localizer');
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
          uSlice: {
            type: 'v4',
            value: [0.0, 0.0, 0.0, 0.0],
            typeGLSL: 'vec4',
          },
          uPlane1: {
            type: 'v4',
            value: [0.0, 0.0, 0.0, 0.0],
            typeGLSL: 'vec4',
          },
          uPlaneColor1: {
            type: 'v3',
            value: [1.0, 1.0, 0.0],
            typeGLSL: 'vec3',
          },
          uPlane2: {
            type: 'v4',
            value: [0.0, 0.0, 0.0, 0.0],
            typeGLSL: 'vec4',
          },
          uPlaneColor2: {
            type: 'v3',
            value: [1.0, 1.0, 0.0],
            typeGLSL: 'vec3',
          },
          uPlane3: {
            type: 'v4',
            value: [0.0, 0.0, 0.0, 0.0],
            typeGLSL: 'vec4',
          },
          uPlaneColor3: {
            type: 'v3',
            value: [1.0, 1.0, 0.0],
            typeGLSL: 'vec3',
          },
      };
  }  
}
