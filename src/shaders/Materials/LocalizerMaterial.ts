import THREE from "three";
import { glslify } from 'glslify';

/**
 * Conformance interface for the Localizer Shader uniforms
 */
export interface LocalizerUniforms {
    uCanvasWidth: { value: number },    // float
    uCanvasHeight: { value: number },   // float
    uSlice: { value: number[] },        // vec4
    uPlane1: { value: number[] },       // vec4
    uPlaneColor1: { value: number[] },  // vec3
    uPlane2: { value: number[] },       // vec4
    uPlaneColor2: { value: number[] },  // vec3
    uPlane3: { value: number[] },       // vec4
    uPlaneColor3: { value: number[] },  // vec3
}

export class LocalizerMaterial {
    private static _shaderName = 'localizer';
    public static get shaderName() {
        return LocalizerMaterial._shaderName;
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
          uCanvasWidth: { value: 0 },               // float
          uCanvasHeight: { value: 0 },              // float
          uSlice: { value: [0.0, 0.0, 0.0, 0.0] },  // vec4
          uPlane1: { value: [0.0, 0.0, 0.0, 0.0] }, // vec4
          uPlaneColor1: { value: [1.0, 1.0, 0.0] }, // vec3
          uPlane2: { value: [0.0, 0.0, 0.0, 0.0] }, // vec4
          uPlaneColor2: { value: [1.0, 1.0, 0.0] }, // vec3
          uPlane3: { value: [0.0, 0.0, 0.0, 0.0] }, // vec4
          uPlaneColor3: { value: [1.0, 1.0, 0.0] }, // vec3
    } as LocalizerUniforms;

    public static get defaultUniforms() {
        return LocalizerMaterial._defaultUniforms;
    }

    public static get shaderMaterial(): THREE.ShaderMaterial {
        if (!LocalizerMaterial._shaderMaterial) {
            const source = glslify({
                vertex: '../glsl/default.vert',
                fragment: '../glsl/' + this.shaderName + '.frag',
                sourceOnly: true
            })

            LocalizerMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: source.vertex,
                fragmentShader: source.fragment,
                transparent: true,
            });
        }

        return LocalizerMaterial._shaderMaterial.clone();
    }
}