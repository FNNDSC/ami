import { glslify } from 'glslify';

export abstract class BaseShader {
    // Uniforms for the Fragment component of the shader
    public FragUniforms;
    // Functions for the Fragment component of the shader
    public FragFunctions;
    // Source for the Fragment component of the shader
    private _frag_main: string;
    // Uniforms for the Vertex component of the shader
    public VertUniforms;
    // Functions for the Vertex component of the shader
    public VertFunctions;
    // Source for the Vertex component of the shader
    private _vert_main: string;
    // NAme of this shader
    protected _shader_name: string;

    constructor(vert_uniforms, frag_uniforms, shader_name: string, manualVert = false, manualFrag = false) {
        // Load in source code at run time from GLSL shaders
        var source = glslify({
            vertex: './'+ shader_name +'.vert',
            fragment: './' + shader_name + '.frag',
            sourceOnly: true
        })

        this._shader_name = shader_name;
        this.FragUniforms = frag_uniforms;
        this.FragFunctions = {};
        this.VertUniforms = vert_uniforms;
        this.VertFunctions = {};
        if (!manualVert) {
            this._vert_main = source.vertex;
        }
        else {
            this._vert_main = this._manualVertShader();
        }
        if (!manualFrag) {
            this._frag_main = source.fragment;
        }
        else {
            this._frag_main = this._manualFragShader();
        }
    }

    // For manual overrides of non-glslific shader calls
    // IN FINAL VERSION SHOULD NOT BE NEEDED
    protected abstract _manualVertShader(): string;

    // For manual overrides of non-glslific shader calls
    // IN FINAL VERSION SHOULD NOT BE NEEDED
    protected abstract _manualFragShader(): string;

    // Compute the string value of this shader's tailored fragment functions
    private _computeFragmentFunctions(): string {
        if (this._frag_main === '') {
            // if main is empty, functions can not have been computed
            this._computeFragmentFunctions();
        }

        let content = '';
        for (let property in this.FragFunctions) {
            content += this.FragFunctions[property] + '\n';
        }
        return content;
    }

    // Compute the string value of this shader's fragment uniforms
    private _computeFragmentUniforms(): string {
        let content = '';
        for (let property in this.FragUniforms) {
            let uniform = this.FragUniforms[property];
            content += `uniform ${uniform.typeGLSL} ${property}`;

            if (uniform && uniform.length) {
            content += `[${uniform.length}]`;
            }

            content += ';\n';
        }

        return content;
    }

    // Compute the string value of this shader's tailored vertex functions
    private _computeVertexFunctions(): string {
        if (this._vert_main === '') {
            // if main is empty, functions can not have been computed
            this._computeVertexFunctions();
        }

        let content = '';
        for (let property in this.VertFunctions) {
            content += this.VertFunctions[property] + '\n';
        }
        return content;
    }

    // Compute the string value of this shader's uniforms
    private _computeVertexUniforms(): string {
        let content = '';
        for (let property in this.VertUniforms) {
            let uniform = this.VertUniforms[property];
            content += `uniform ${uniform.typeGLSL} ${property}`;

            if (uniform && uniform.length) {
            content += `[${uniform.length}]`;
            }

            content += ';\n';
        }

        return content;
    }

    // Compute & return the vertex shader
    public computeVertShader(): string {
        return (`
            // uniforms
            ${this._computeVertexUniforms()}

            // tailored functions
            ${this._computeVertexFunctions()}

            // main loop
            ${this._frag_main}
        `);
    }
    
    // Compute & return the fragment shader
    public computeFragmentShader(): string {
        return (`
            // uniforms
            ${this._computeFragmentUniforms()}
    
            // varying (should fetch it from vertex directly)
            varying vec4      vProjectedCoords;
            varying vec4      vPos;
            varying mat4      vProjectionViewMatrix;
    
            // tailored functions
            ${this._computeFragmentFunctions()}
    
            // main loop
            ${this._frag_main}
        `);
    }
}

export interface BaseShaderStatics {
    // Template method for this shader's fragment uniforms
    FragUniforms();

    // Template method for this shader's vertex uniforms
    VertUniforms();
}