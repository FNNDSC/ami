 
import { glslify } from 'glslify';

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

    public static get shaderMaterial(): THREE.ShaderMaterial {
        if (!ContourMaterial._shaderMaterial) {
            const source = glslify({
                vertex: '../glsl/default.vert',
                fragment: '../glsl/' + this.shaderName + '.frag',
                sourceOnly: true
            })

            ContourMaterial._shaderMaterial = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                uniforms: this.defaultUniforms,
                vertexShader: source.vertex,
                fragmentShader: source.fragment,
                transparent: true,
            });
        }

        return ContourMaterial._shaderMaterial.clone();
    }
}