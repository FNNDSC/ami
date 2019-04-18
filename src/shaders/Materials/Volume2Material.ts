import { MaterialUtils } from "./MaterialUtils";

const vertSource = require('raw-loader!glslify-loader!../webgl/volume2/volume2.vert').default;
const fragmentSource = require ('raw-loader!glslify-loader!../webgl/volume2/volume2.frag').default;

const THREE = (window as any).THREE;

export interface Volume2Uniforms {
    uSize: { value: THREE.Vector3 },              // ivec3
    uRenderstyle: { value: number },              // int
    uIsoRenderThreshold: { value: number },       // float
    uClim: { value: THREE.Vector2 },              // ivec2
    uData: { value: THREE.DataTexture3D },        // sampler3D
    uLutTexture: { value: THREE.Texture }         // sampler2D
}

export class Volume2Material {
    private static _shaderName = 'volume2';
    public static get shaderName() {
        return Volume2Material._shaderName;
    }

    /**
     * Singleton static for the shader material, 
     * will always return a mutable clone of the base version
     * of the shader
     */
    private static _material: THREE.ShaderMaterial;

    /**
     * Default Uniform values
     */
    private static _defaultUniforms = {
        uSize: { value: new THREE.Vector3( 1, 1, 1 ) },     // ivec3
        uRenderstyle: { value: 0 },                         // int
        uIsoRenderThreshold: { value: 0.5 },                // float
        uClim: { value: new THREE.Vector2( 1, 1 ) },        // ivec2
        uData: { value: new THREE.DataTexture3D() },        // sampler3D
        uLutTexture: { value: new THREE.Texture() }         // sampler2D
    } as Volume2Uniforms;

    public static get defaultUniforms() {
        return Volume2Material._defaultUniforms;
    }

    public static get material(): THREE.ShaderMaterial {
        if (!Volume2Material._material) {
            Volume2Material._material = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                uniforms: this.defaultUniforms,
                vertexShader: MaterialUtils.processSource(vertSource),
                fragmentShader: MaterialUtils.processSource(fragmentSource),
            });
        }
        return Volume2Material._material.clone();
    }
}