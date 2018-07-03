import { Ring } from '../objects/orbiter';
import { Mat4 } from '../math/mat4';
import { Mesh, MeshBuilder } from './mesh';

export interface Drawable {
    draw(gl: WebGLRenderingContext, shader: WebGLProgram, worldMatrix: Mat4): void;
    initDrawing(gl: WebGLRenderingContext): void;
}