import { MaterialUtils } from "./MaterialUtils";

const vertSource1 = require('raw-loader!glslify-loader!../webgl1/default.vert').default;
const fragmentSource1 = require('raw-loader!glslify-loader!../webgl1/contour.frag').default;

const vertSource2 = require('raw-loader!glslify-loader!../webgl2/default.vert').default;
const fragmentSource2 = require('raw-loader!glslify-loader!../webgl2/contour.frag').default;

const THREE = (window as any).THREE;

/**
 * Conformance interface for the Contour Shader uniforms
 */
export interface ContourUniforms {
    uCanvasWidth: {
        value: number;
    };
    uCanvasHeight: {
        value: number;
    };
    uWidth: {
        value: number;
    };
    uOpacity: {
        value: number;
    };
    uTextureFilled: {
        value: THREE.Texture;
    };
}

export class ContourMaterial {
    private static _shaderName = 'contour';
    public static get shaderName() {
        return ContourMaterial._shaderName;
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
        uCanvasWidth:   { value: 0.0 },                     // float
        uCanvasHeight:  { value: 0.0 },                     // float
        uWidth:         { value: 1.0 },                     // float
        uOpacity:       { value: 1.0 },                     // float
        uTextureFilled: { value: new THREE.Texture }        // sampler2D
    } as ContourUniforms;

    public static get defaultUniforms() {
        return ContourMaterial._defaultUniforms;
    }

    public static get shaderMaterial1(): THREE.ShaderMaterial {
        if (!ContourMaterial._shaderMaterial) {
            ContourMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource1),
                fragmentShader: MaterialUtils.processSource(fragmentSource1),
                transparent: true,
            });
        }
        return ContourMaterial._shaderMaterial.clone();
    }

    public static get shaderMaterial2(): THREE.ShaderMaterial {
        if (!ContourMaterial._shaderMaterial2) {
            ContourMaterial._shaderMaterial2 = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource2),
                fragmentShader: MaterialUtils.processSource(fragmentSource2),
                transparent: true,
            });
        }
        return ContourMaterial._shaderMaterial2.clone();
    }
}