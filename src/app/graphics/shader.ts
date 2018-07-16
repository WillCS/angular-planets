import { Skybox } from "./skybox";
import { WebGLHelper } from "./webGLHelper";

export class Shader {
    constructor(protected gl: WebGLRenderingContext, protected shader: WebGLProgram) {
        
    }

    public useShader(): void {
        this.gl.useProgram(this.shader);
    }

    public getAttributeLocation(attribute: string): number {
        return this.gl.getAttribLocation(this.shader, attribute);
    }

    public getUniformLocation(uniform: string): WebGLUniformLocation {
        return this.gl.getUniformLocation(this.shader, uniform);
    }
}

export class SkyboxShader extends Shader {
    constructor(gl: WebGLRenderingContext) {
        super(gl, WebGLHelper.buildSkyboxShader(gl));
    }
}