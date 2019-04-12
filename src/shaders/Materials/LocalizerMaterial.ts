// import vertSource from 'raw-loader!glslify-loader!../glsl/default.vert';
// import fragmentSource from 'raw-loader!glslify-loader!../glsl/localizer.frag';
const vertSource = require('raw-loader!glslify-loader!../glsl/default.vert');
const fragmentSource = require('raw-loader!glslify-loader!../glsl/localizer.frag');

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

    public static get shaderMaterial(): THREE.ShaderMaterial {
        if (!LocalizerMaterial._shaderMaterial) {           
            LocalizerMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: vertSource,
                fragmentShader: fragmentSource,
                transparent: true,
            });
        }

        return LocalizerMaterial._shaderMaterial.clone();
    }
}