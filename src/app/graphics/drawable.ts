import { Mat4 } from '../math/mat4';
import { Renderer } from './renderer';

export interface Drawable {
    draw(renderer: Renderer): void;
    initDrawing(gl: WebGLRenderingContext): void;
}
