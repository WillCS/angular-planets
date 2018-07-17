import { Drawable } from "../graphics/drawable";
import { Shader } from "../graphics/shader";
import { Mat4 } from "../math/mat4";

export class Universe implements Drawable {

    public initDrawing(gl: WebGLRenderingContext): void {
        throw new Error("Method not implemented.");
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        
    }
}
