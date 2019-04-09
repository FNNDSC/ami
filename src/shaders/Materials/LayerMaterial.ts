import THREE from "../../../node_modules/THREE";
import { glslify } from '../../../node_modules/glslify';

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
    private static _shaderName = 'Layer';
    public static get shaderName() {
        return LayerMaterial._shaderName;
    }

    /**
     * Singleton static for the shader material, 
     * will always return a mutable clone of the base version
     * of the contour shader
     */
    private static _shaderMaterial: THREE.ShaderMaterial;

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

    public static get shaderMaterial(): THREE.ShaderMaterial {
        if (!LayerMaterial._shaderMaterial) {
            const source = glslify({
                vertex: '../glsl/default.vert',
                fragment: '../glsl/' + this.shaderName + '.frag',
                sourceOnly: true
            })

            LayerMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: source.vertex,
                fragmentShader: source.fragment,
                transparent: true,
            });
        }

        return LayerMaterial._shaderMaterial.clone();
    }
}