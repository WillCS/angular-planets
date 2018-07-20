import { Shader } from "./shader";
import { Mesh } from "./mesh";
import { Mat4 } from "../math/mat4";
import { Material } from "./material";

export class Renderer {
    private currentShader: Shader;
    private matrixStack: Mat4[] = [];
    public constructor(private webGL: WebGLRenderingContext,
            private real: Shader, private imaginary: Shader) {
        this.drawReal();
        this.pushMatrix(Mat4.identity());
    }

    public get gl(): WebGLRenderingContext {
        return this.webGL;
    }

    public get shader(): Shader {
        return this.currentShader;
    }

    public get modelMatrix(): Mat4 {
        return this.matrixStack[this.matrixStack.length - 1];
    }

    public set modelMatrix(value: Mat4) {
        this.matrixStack[this.matrixStack.length - 1] = value;
    }

    public pushMatrix(matrix: Mat4 = null): void {
        if(!matrix) {
            matrix = this.modelMatrix.copy();
        }
        
        this.matrixStack.push(matrix);
    }

    public popMatrix(): Mat4 {
        return this.matrixStack.pop();
    }

    public useMaterial(material: Material): void {
        this.shader.useShader();
        this.shader.setFloat3('ambientColour', material.ambientColour);
        this.shader.setFloat('specularReflection', material.specularReflection);
        this.shader.setFloat('ambientReflection', material.ambientReflection);
        this.shader.setFloat('diffuseReflection', material.diffuseReflection);
        this.shader.setFloat('shininess', material.shininess);
    }

    public drawReal(): void {
        this.currentShader = this.real;
        if(this.currentShader) {
            this.currentShader.useShader();
        }
    }

    /** Not a good name */
    public drawImaginary(): void {
        this.currentShader = this.imaginary;
        if(this.currentShader) {
            this.currentShader.useShader();
        }
    }

    public draw(mesh: Mesh): void {
        if(this.currentShader) {
            this.currentShader.useShader();
            mesh.draw(this.currentShader, this.modelMatrix);
        }
    }
}