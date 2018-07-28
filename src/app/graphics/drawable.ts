import { Mat4 } from '../math/matrix';
import { Renderer } from './renderer';

export interface Drawable {
    draw(renderer: Renderer): void;
    initDrawing(gl: WebGLRenderingContext): void;
}
