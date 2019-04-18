import { MaterialUtils } from "./MaterialUtils";

const vertSource1 = require('raw-loader!glslify-loader!../webgl1/default.vert').default;
const fragmentSourceIdn1 = require ('raw-loader!glslify-loader!../webgl1/volume/volume_idnInterp.frag').default;
const fragmentSourceTri1 = require ('raw-loader!glslify-loader!../webgl1/volume/volume_triInterp.frag').default;

const vertSource2 = require('raw-loader!glslify-loader!../webgl2/default.vert').default;
const fragmentSourceIdn2 = require ('raw-loader!glslify-loader!../webgl2/volume/volume_idnInterp.frag').default;
const fragmentSourceTri2 = require ('raw-loader!glslify-loader!../webgl2/volume/volume_triInterp.frag').default;

const THREE = (window as any).THREE;

export interface VolumeUniforms {
    uTextureSize: { value: 0 },                 // int
    uTextureContainer: {                        // [ sampler2D ], length 7
        value: [
            THREE.Texture,
            THREE.Texture,
            THREE.Texture,
            THREE.Texture,
            THREE.Texture,
            THREE.Texture,
            THREE.Texture
        ]
    },
    uDataDimensions: { value: THREE.Vector3},   // ivec3
    uWorldToData: { value: THREE.Matrix4 },     // mat4
    uWindowCenterWidth: { value: number[] },    // [ float ], length 2
    uRescaleSlopeIntercept: { value: number[] },// [ float ], length 2
    uNumberOfChannels: { value: number },       // int
    uBitsAllocated: { value: number },          // int
    // uInvert: { value: number },                 // int
    // uLut: { value: number },                    // int
    uTextureLUT: { value: THREE.Texture },      // sampler2D
    uPixelType: { value: number },              // int
    uPackedPerPixel: { value: number },         // int
    // uInterpolation: { value: number },          // int
    uWorldBBox: { value: number[] },            // [ float ], length 6     
    uSteps: { value: number },                  // int
    uAlphaCorrection: { value: number },        // float
    // uFrequence: { value: number },              // float
    // uAmplitude: { value: number },              // float
    // uShading: { value: number },                // int
    uAmbient: { value: number },                // float
    uAmbientColor: { value: THREE.Vector3 },    // vec3(1)
    uSampleColorToAmbient: { value: number },   // int
    uSpecular: { value: number },               // float
    uSpecularColor: { value: THREE.Vector3 },   // vec3(1)
    uDiffuse: { value: number },                // float
    uDiffuseColor: { value:THREE.Vector3 },     // vec3(1)
    uSampleColorToDiffuse: { value: number },   // int
    uShininess: { value: number },              // float
    uLightPosition: { value: THREE.Vector3 },   // vec3(0)
    uLightPositionInCamera: { value: number },  // int
    uIntensity: { value: THREE.Vector3 },       // vec3(0)
    // uAlgorithm: { value: number },              // int
    // uStepsPerFrame: { value: number },          // int
    // uStepsSinceChange: { value: number }        // int
}

export class VolumeMaterial {
    private static _shaderName = 'volume';
    public static get shaderName() {
        return VolumeMaterial._shaderName;
    }

    /**
     * Singleton static for the shader material, 
     * will always return a mutable clone of the base version
     * of the shader
     */
    private static _idnMaterial1: THREE.ShaderMaterial;
    private static _triMaterial1: THREE.ShaderMaterial;

    private static _idnMaterial2: THREE.ShaderMaterial;
    private static _triMaterial2: THREE.ShaderMaterial;

    /**
     * Default Uniform values
     */
    private static _defaultUniforms = {
        uTextureSize: { value: 0 },                     // int
        uTextureContainer: {                            // [ sampler2D ], length 7
            value: [
                new THREE.Texture(),
                new THREE.Texture(),
                new THREE.Texture(),
                new THREE.Texture(),
                new THREE.Texture(),
                new THREE.Texture(),
                new THREE.Texture()
            ]
        },
        uDataDimensions: { value: new THREE.Vector3()}, // ivec3
        uWorldToData: { value: new THREE.Matrix4() },   // mat4
        uWindowCenterWidth: { value: [0.0, 0.0] },      // [ float ], length 2
        uRescaleSlopeIntercept: { value: [0.0, 0.0] },  // [ float ], length 2
        uNumberOfChannels: { value: 1 },                // int
        uBitsAllocated: { value: 8 },                   // int
        // uInvert: { value: 0 },                          // int
        // uLut: { value: 0 },                             // int
        uTextureLUT: { value: new THREE.Texture()},     // sampler2D
        uPixelType: { value: 0 },                       // int
        uPackedPerPixel: { value: 1 },                  // int
        // uInterpolation: { value: 1 },                   // int
        uWorldBBox: { value: [0.0, 0.0, 0.0,            // [ float ], length 6
            0.0, 0.0, 0.0] 
        },              
        uSteps: { value: 16 },                          // int
        uAlphaCorrection: { value: 0.5 },               // float
        // uFrequence: { value: 0.0 },                     // float
        // uAmplitude: { value: 0.0 },                     // float
        // uShading: { value: 1 },                         // int
        uAmbient: { value: 0.1 },                       // float
        uAmbientColor: { value:                         // vec3(1)
            new THREE.Vector3(1.0, 1.0, 1.0)
        },
        uSampleColorToAmbient: { value: 1 },            // int
        uSpecular: { value: 1.0 },                      // float
        uSpecularColor: { value:                        // vec3(1)
            new THREE.Vector3(1.0, 1.0, 1.0)
        },
        uDiffuse: { value: 0.3 },                       // float
        uDiffuseColor: { value:                         // vec3(1)
            new THREE.Vector3(1.0, 1.0, 1.0)
        },
        uSampleColorToDiffuse: { value: 1 },            // int
        uShininess: { value: 5.0 },                     // float
        uLightPosition: { value:                        // vec3(0)
            new THREE.Vector3(0.0, 0.0, 0.0)
        },
        uLightPositionInCamera: { value: 1 },           // int
        uIntensity: { value:                            // vec3(0)
            new THREE.Vector3(0.8, 0.8, 0.8)
        },
        // uAlgorithm: { value: 0 },                       // int
        // uStepsPerFrame: { value: 4 },                   // int
        // uStepsSinceChange: { value: 0 }                 // int
    } as VolumeUniforms;

    public static get defaultUniforms() {
        return VolumeMaterial._defaultUniforms;
    }

    public static get idnMaterial1(): THREE.ShaderMaterial {
        if (!VolumeMaterial._idnMaterial1) {
            VolumeMaterial._idnMaterial1 = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource1),
                fragmentShader: MaterialUtils.processSource(fragmentSourceIdn1),
            });
        }
        return VolumeMaterial._idnMaterial1.clone();
    }

    public static get triMaterial1(): THREE.ShaderMaterial {
        if (!VolumeMaterial._triMaterial1) {
            VolumeMaterial._triMaterial1 = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource1),
                fragmentShader: MaterialUtils.processSource(fragmentSourceTri1),
            });
        }
        return VolumeMaterial._triMaterial1.clone();
    }

    public static get idnMaterial2(): THREE.ShaderMaterial {
        if (!VolumeMaterial._idnMaterial2) {
            VolumeMaterial._idnMaterial2 = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource2),
                fragmentShader: MaterialUtils.processSource(fragmentSourceIdn2),
            });
        }
        return VolumeMaterial._idnMaterial2.clone();
    }

    public static get triMaterial2(): THREE.ShaderMaterial {
        if (!VolumeMaterial._triMaterial2) {
            VolumeMaterial._triMaterial2 = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource2),
                fragmentShader: MaterialUtils.processSource(fragmentSourceTri2),
            });
        }
        return VolumeMaterial._triMaterial2.clone();
    }
}