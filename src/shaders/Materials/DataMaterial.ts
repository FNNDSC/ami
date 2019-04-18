import { MaterialUtils } from "./MaterialUtils";

const vertSource = require('raw-loader!glslify-loader!../webgl/data/data.vert').default;
const fragmentSourceIdn = require('raw-loader!glslify-loader!../webgl/data/data_idnInterp.frag').default;
const fragmentSourceTri = require('raw-loader!glslify-loader!../webgl/data/data_triInterp.frag').default;

const THREE = (window as any).THREE;

/**
 * Conformance interface for the Data Shader uniforms
 */
export interface DataUniforms {
    uTextureSize: { value: number },                     // int
    uTextureContainer: { value: THREE.Texture[]},        // sampler2D[]
    uDataDimensions: { value: THREE.Vector3 },           // ivec3
    uWorldToData: { value: THREE.Matrix4 },              // mat4
    uWindowCenterWidth: { value: number[] },             // float[2]
    uLowerUpperThreshold: { value: number[] },           // float[2]
    uRescaleSlopeIntercept: { value: number[] },         // float[2]
    uNumberOfChannels: { value: number },                // int
    uBitsAllocated: { value: number },                   // int
    uInvert: { value: number },                          // int
    uLut: { value: number },                             // int
    uTextureLUT: { value: THREE.Texture },               // sampler2D
    uLutSegmentation: { value: number },                 // int
    uTextureLUTSegmentation: { value: THREE.Texture },   // sampler2D
    uPixelType: { value: number },                       // int
    uPackedPerPixel: { value: number },                  // int
    // uInterpolation: { value: number },                   // int
    uCanvasWidth: { value: number },                     // float
    uCanvasHeight: { value: number },                    // float
    uBorderColor: { value: THREE.Vector3 },              // vec3
    uBorderWidth: { value: number },                     // float
    uBorderMargin: { value: number },                    // float
    uBorderDashLength: { value: number },                // float
    uOpacity: { value: number },                         // float
    uSpacing: { value: number },                         // float
    uThickness: { value: number },                       // float
    uThicknessMethod: { value: number },                 // int
}
export class DataMaterial {
    private static _shaderName = 'data';
    public static get shaderName() {
        return DataMaterial._shaderName;
    }

    /**
     * Singleton static for the shader material, 
     * will always return a mutable clone of the base version
     * of the contour shader
     */
    private static _idnMaterial: THREE.ShaderMaterial;
    private static _triMaterial: THREE.ShaderMaterial;

    /**
     * Default Uniform values
     */
    private static _defaultUniforms = {
        uTextureSize: { value: 0 },                                 // int
        uTextureContainer: { value: [
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture()
        ]},                                                         // sampler2D[]
        uDataDimensions: { value: new THREE.Vector3(0, 0 ,0) },     // ivec3
        uWorldToData: { value: new THREE.Matrix4() },               // mat4
        uWindowCenterWidth: { value: [0.0, 0.0] },                  // float[2]
        uLowerUpperThreshold: { value: [0.0, 0.0] },                // float[2]
        uRescaleSlopeIntercept: { value: [0.0, 0.0] },              // float[2]
        uNumberOfChannels: { value: 1 },                            // int
        uBitsAllocated: { value: 8 },                               // int
        uInvert: { value: 0 },                                      // int
        uLut: { value: 0 },                                         // int
        uTextureLUT: { value: new THREE.Texture() },                // sampler2D
        uLutSegmentation: { value: 0 },                             // int
        uTextureLUTSegmentation: { value: new THREE.Texture() },    // sampler2D
        uPixelType: { value: 0 },                                   // int
        uPackedPerPixel: { value: 1 },                              // int
        // uInterpolation: { value: 1 },                               // int
        uCanvasWidth: { value: 0.0 },                               // float
        uCanvasHeight: { value: 0.0 },                              // float
        uBorderColor: { value: new THREE.Vector3() },               // vec3
        uBorderWidth: { value: 2.0 },                               // float
        uBorderMargin: { value: 2.0 },                              // float
        uBorderDashLength: { value: 10.0 },                         // float
        uOpacity: { value: 1.0 },                                   // float
        uSpacing: { value: 0.0 },                                   // float
        uThickness: { value: 0.0 },                                 // float
        uThicknessMethod: { value: 0 },                             // int
    } as DataUniforms;

    public static get defaultUniforms() {
        return DataMaterial._defaultUniforms;
    }

    public static get idnMaterial(): THREE.ShaderMaterial {
        if (!DataMaterial._idnMaterial) {
            DataMaterial._idnMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource),
                fragmentShader: MaterialUtils.processSource(fragmentSourceIdn),
                transparent: true,
            });
        }
        return DataMaterial._idnMaterial.clone();
    }

    public static get triMaterial(): THREE.ShaderMaterial {
        if (!DataMaterial._triMaterial) {
            DataMaterial._triMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource),
                fragmentShader: MaterialUtils.processSource(fragmentSourceTri),
                transparent: true,
            });
        }
        return DataMaterial._triMaterial.clone();
    }
}