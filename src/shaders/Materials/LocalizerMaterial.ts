import { MaterialUtils } from "./MaterialUtils";

const vertSource1 = require('raw-loader!glslify-loader!../webgl1/default.vert').default;
const fragmentSource1 = require('raw-loader!glslify-loader!../webgl1/localizer.frag').default;

const vertSource2 = require('raw-loader!glslify-loader!../webgl2/default.vert').default;
const fragmentSource2 = require('raw-loader!glslify-loader!../webgl2/localizer.frag').default;

const THREE = (window as any).THREE;

/**
 * Conformance interface for the Localizer Shader uniforms
 */
export interface LocalizerUniforms {
    uCanvasWidth: { value: number },         // float
    uCanvasHeight: { value: number },        // float
    uSlice: { value: THREE.Vector4 },        // vec4
    uPlane1: { value: THREE.Vector4 },       // vec4
    uPlaneColor1: { value: THREE.Vector3 },  // vec3
    uPlane2: { value: THREE.Vector4 },       // vec4
    uPlaneColor2: { value: THREE.Vector3 },  // vec3
    uPlane3: { value: THREE.Vector4 },       // vec4
    uPlaneColor3: { value: THREE.Vector3 },  // vec3
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
    private static _shaderMaterial2: THREE.ShaderMaterial;

    /**
     * Default Uniform values
     */
    private static _defaultUniforms = {
          uCanvasWidth: { value: 0 },                                // float
          uCanvasHeight: { value: 0 },                               // float
          uSlice: { value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0) },  // vec4
          uPlane1: { value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0) }, // vec4
          uPlaneColor1: { value: new THREE.Vector3(1.0, 1.0, 0.0) }, // vec3
          uPlane2: { value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0) }, // vec4
          uPlaneColor2: { value: new THREE.Vector3(1.0, 1.0, 0.0) }, // vec3
          uPlane3: { value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0) }, // vec4
          uPlaneColor3: { value: new THREE.Vector3(1.0, 1.0, 0.0) }, // vec3
    } as LocalizerUniforms;

    public static get defaultUniforms() {
        return LocalizerMaterial._defaultUniforms;
    }

    public static get shaderMaterial1(): THREE.ShaderMaterial {
        if (!LocalizerMaterial._shaderMaterial) {           
            LocalizerMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource1),
                fragmentShader: MaterialUtils.processSource(fragmentSource1),
                transparent: true,
            });
        }
        return LocalizerMaterial._shaderMaterial.clone();
    }

    public static get shaderMaterial2(): THREE.ShaderMaterial {
        if (!LocalizerMaterial._shaderMaterial2) {           
            LocalizerMaterial._shaderMaterial2 = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource2),
                fragmentShader: MaterialUtils.processSource(fragmentSource2),
                transparent: true,
            });
        }
        return LocalizerMaterial._shaderMaterial2.clone();
    }
}