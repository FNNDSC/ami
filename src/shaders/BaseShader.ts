import { glslify } from 'glslify';

export abstract class BaseShader {
    // Uniforms for the Fragment component of the shader
    public FragUniforms;
    // Functions for the Fragment component of the shader
    public FragFunctions;
    // Source for the Fragment component of the shader
    private _fragMain: string;
    // Uniforms for the Vertex component of the shader
    public VertUniforms;
    // Functions for the Vertex component of the shader
    public VertFunctions;
    // Source for the Vertex component of the shader
    private _vertMain: string;
    // NAme of this shader
    protected _shaderName: string;

    // tslint:disable-next-line:typedef
    constructor(VertUniforms, FragUniforms, ShaderName: string, ManualVert = false, ManualFrag = false) {
        // Load in source code at run time from GLSL shaders
        const source = glslify({
            vertex: './'+ ShaderName +'.vert',
            fragment: './' + ShaderName + '.frag',
            sourceOnly: true
        })

        this._shaderName = ShaderName;
        this.FragUniforms = FragUniforms;
        this.FragFunctions = {};
        this.VertUniforms = VertUniforms;
        this.VertFunctions = {};
        if (!ManualVert) {
            this._vertMain = source.vertex;
        }
        else {
            this._vertMain = this._ManualVertShader();
        }
        if (!ManualFrag) {
            this._fragMain = source.fragment;
        }
        else {
            this._fragMain = this._ManualFragShader();
        }
    }

    // For manual overrides of non-glslific shader calls
    // IN FINAL VERSION SHOULD NOT BE NEEDED
    protected abstract _ManualVertShader(): string;

    // For manual overrides of non-glslific shader calls
    // IN FINAL VERSION SHOULD NOT BE NEEDED
    protected abstract _ManualFragShader(): string;

    // Compute the string value of this shader's tailored fragment functions
    private _computeFragmentFunctions(): string {
        if (this._fragMain === '') {
            // if main is empty, functions can not have been computed
            this._computeFragmentFunctions();
        }

        let content = '';
        for (const property in this.FragFunctions) {
            if (property) {
                content += this.FragFunctions[property] + '\n';
            }
        }
        return content;
    }

    // Compute the string value of this shader's fragment uniforms
    private _computeFragmentUniforms(): string {
        let content = '';
        for (const property in this.FragUniforms) {
            if(property) {
                const uniform = this.FragUniforms[property];
                content += `uniform ${uniform.typeGLSL} ${property}`;
                if (uniform && uniform.length) {
                content += `[${uniform.length}]`;
                }
                content += ';\n';
            }
        }
        return content;
    }

    // Compute the string value of this shader's tailored vertex functions
    private _computeVertexFunctions(): string {
        if (this._vertMain === '') {
            // if main is empty, functions can not have been computed
            this._computeVertexFunctions();
        }

        let content = '';
        for (const property in this.VertFunctions) {
            if (property) {
                content += this.VertFunctions[property] + '\n';
            }
        }
        return content;
    }

    // Compute the string value of this shader's uniforms
    private _computeVertexUniforms(): string {
        let content = '';
        for (const property in this.VertUniforms) {
            if (property) {
                const uniform = this.VertUniforms[property];
                content += `uniform ${uniform.typeGLSL} ${property}`;
                if (uniform && uniform.length) {
                content += `[${uniform.length}]`;
                }
                content += ';\n';
            }
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
            ${this._fragMain}
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
            ${this._fragMain}
        `);
    }
}

export interface BaseShaderStatics {
    // Template method for this shader's fragment uniforms
    FragUniforms();

    // Template method for this shader's vertex uniforms
    VertUniforms();
}