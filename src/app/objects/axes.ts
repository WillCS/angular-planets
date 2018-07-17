import { Drawable } from "../graphics/drawable";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Vec3 } from "../math/vector";
import { Mat4 } from "../math/mat4";
import { Shader } from "../graphics/shader";

export class Axes implements Drawable {
    private axes: Mesh[] = [];

    constructor(private lod: number = 0) {

    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        this.axes.forEach(axe => {
            axe.draw(shader, worldMatrix);
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
            new Vec3(0, 0, 255)));
        this.axes.push(MeshBuilder.buildLines(gl, 
            [ new Vec3(0, -1000, 0), new Vec3(0, 1000, 0) ], 
            new Vec3(0, 255, 0)));
        this.axes.push(MeshBuilder.buildLines(gl, 
            [ new Vec3(-1000, 0, 0), new Vec3(1000, 0, 0) ], 
            new Vec3(255, 0, 0)));

        for(let i = 1; i < this.lod; i++) {
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(0, i * 100, -1000), new Vec3(0, i * 100, 1000) ], 
                new Vec3(0, 0, 255)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(0, i * -100, -1000), new Vec3(0, i * -100, 1000) ], 
                new Vec3(0, 0, 255)));

            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(i * 100, -1000, 0), new Vec3(i * 100, 1000, 0) ], 
                new Vec3(0, 255, 0)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(i * -100, -1000, 0), new Vec3(i * -100, 1000, 0) ], 
                new Vec3(0, 255, 0)));

            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(-1000, 0, i * 100), new Vec3(1000, 0, i * 100) ], 
                new Vec3(255, 0, 0)));
            this.axes.push(MeshBuilder.buildLines(gl, 
                [ new Vec3(-1000, 0, i * -100), new Vec3(1000, 0, i * -100) ], 
                new Vec3(255, 0, 0)));
        }
    }
}
