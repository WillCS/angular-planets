import { Mat4 } from '../math/mat4';
import { Shader } from './shader';

export interface Drawable {
    draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void;
    initDrawing(gl: WebGLRenderingContext): void;
}