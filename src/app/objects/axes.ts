import { Drawable } from "../graphics/drawable";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Mat4 } from "../math/mat4";
import { Shader } from "../graphics/shader";
import { Colour3 } from "../graphics/colour";
import { Vec3 } from "../math/vector";
import { Renderer } from "../graphics/renderer";

export class Axes implements Drawable {
    private axes: Mesh[] = [];

    constructor(private lod: number = 0) {

    }

    public draw(renderer: Renderer): void {
        renderer.drawImaginary();
        this.axes.forEach(axe => {
            renderer.draw(axe);
        });
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        if(this.axes) {
            this.axes.forEach(axis => {
                axis.delete();
            });
        }
        this.axes.push(MeshBuilder.buildLines(gl, 
            [ new Vec3(0, 0, -1000), new Vec3(0, 0, 1000) ], 
            Colour3.eightBit(0, 0, 255)));
        this.axes.push(MeshBuilder.buildLines(gl, 
            [ new Vec3(0, -1000, 0), new Vec3(0, 1000, 0) ], 
            Colour3.eightBit(0, 255, 0)));
        this.axes.push(MeshBuilder.buildLines(gl, 
            [ new Vec3(-1000, 0, 0), new Vec3(1000, 0, 0) ], 
            Colour3.eightBit(255, 0, 0)));

        for(let i = 1; i < this.lod; i++) {
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(0, i * 100, -1000), new Vec3(0, i * 100, 1000) ], 
                Colour3.eightBit(0, 0, 255)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(0, i * -100, -1000), new Vec3(0, i * -100, 1000) ], 
                Colour3.eightBit(0, 0, 255)));

            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(i * 100, -1000, 0), new Vec3(i * 100, 1000, 0) ], 
                Colour3.eightBit(0, 255, 0)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(i * -100, -1000, 0), new Vec3(i * -100, 1000, 0) ], 
                Colour3.eightBit(0, 255, 0)));

            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(-1000, 0, i * 100),new Vec3(1000, 0, i * 100) ], 
                Colour3.eightBit(255, 0, 0)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(-1000, 0, i * -100), new Vec3(1000, 0, i * -100) ], 
                Colour3.eightBit(255, 0, 0)));
        }
    }
}
