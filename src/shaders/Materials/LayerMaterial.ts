import { MaterialUtils } from "./MaterialUtils";

const vertSource1 = require('raw-loader!glslify-loader!../webgl1/default.vert').default;
const fragmentSource1 = require('raw-loader!glslify-loader!../webgl1/layer.frag').default;

const vertSource2 = require('raw-loader!glslify-loader!../webgl2/default.vert').default;
const fragmentSource2 = require('raw-loader!glslify-loader!../webgl2/layer.frag').default;

const THREE = (window as any).THREE;

/**
 * Conformance interface for the Layer Shader uniforms
 */
export interface LayerUniforms {
    uTextureBackTest0: { value: THREE.Texture },  // sampler2D
    uTextureBackTest1: { value: THREE.Texture },  // sampler2D
    uOpacity0: { value: number },                   // float
    uOpacity1: { value: number },                   // float
    uType0: { value: number },                      // int
    uType1: { value: number },                      // int
    uTrackMouse: { value: number },                 // int
    uMouse: { value: THREE.Vector2 }                // vec2
}

export class LayerMaterial {
    private static _shaderName = 'layer';
    public static get shaderName() {
        return LayerMaterial._shaderName;
    }

    /**
     * Singleton static for the shader material, 
     * will always return a mutable clone of the base version
     * of the contour shader
     */
    private static _shaderMaterial: THREE.ShaderMaterial;
    private static _shaderMaterial2: THREE.ShaderMaterial;

    /**
     * Default Uniform values
     */
    private static _defaultUniforms = {
        uTextureBackTest0: { value: new THREE.Texture },  // sampler2D
        uTextureBackTest1: { value: new THREE.Texture },  // sampler2D
        uOpacity0: { value: 1.0 },                          // float
        uOpacity1: { value: 1.0 },                          // float
        uType0: { value: 0 },                               // int
        uType1: { value: 1 },                               // int
        uTrackMouse: { value: 0 },                          // int
        uMouse: { value: new THREE.Vector2 }                // vec2
    } as LayerUniforms;

    public static get defaultUniforms() {
        return LayerMaterial._defaultUniforms;
    }

    public static get shaderMaterial1(): THREE.ShaderMaterial {
        if (!LayerMaterial._shaderMaterial) {
            LayerMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource1),
                fragmentShader: MaterialUtils.processSource(fragmentSource1),
                transparent: true,
            });
        }
        return LayerMaterial._shaderMaterial.clone();
    }

    public static get shaderMaterial2(): THREE.ShaderMaterial {
        if (!LayerMaterial._shaderMaterial2) {
            LayerMaterial._shaderMaterial2 = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource2),
                fragmentShader: MaterialUtils.processSource(fragmentSource2),
                transparent: true,
            });
        }
        return LayerMaterial._shaderMaterial2.clone();
    }
}