import { Mat4 } from "../math/mat4";
import { Vec3 } from "../math/vec3";
import { Body } from "../objects/body"
import { Drawable } from "../graphics/drawable";
import { Mesh, MeshBuilder } from "../graphics/mesh";

export abstract class Orbiter implements Drawable {
    public get rotationVector(): Vec3 {
        return this.rotation;
    }
    protected progress: number = 0;

    constructor(protected radius: number, private orbitSpeed: number, private rotation: Vec3) {

    }

    public update(): void {
        this.progress += this.orbitSpeed;
        this.progress %= Math.PI * 2;
    }

    public draw(gl: WebGLRenderingContext, shader: WebGLProgram, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateY(this.progress);
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector);
    }

    public abstract initDrawing(gl: WebGLRenderingContext): void;
}

export class Orbit extends Orbiter {
    constructor(private body: Body, radius: number, orbitSpeed: number, rotation: Vec3) {
        super(radius, orbitSpeed, rotation);
    }
    
    public update(): void {
        super.update();
    }

    public getBody(): Body {
        return this.body;
    }

    public draw(gl: WebGLRenderingContext, shader: WebGLProgram, worldMatrix: Mat4): void {
        super.draw(gl, shader, worldMatrix);
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector);
        worldMatrix = worldMatrix.rotateY(this.progress);
        worldMatrix = worldMatrix.translate(this.radius, 0, 0);
        this.body.draw(gl, shader, worldMatrix);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.body.initDrawing(gl);
    }
}

export class Ring extends Orbiter {
    private mesh: Mesh;
    constructor(private innerRadius: number, private outerRadius: number, 
            orbitSpeed: number, rotation: Vec3,
            private startAngle: number = 0, private endAngle: number = 2 * Math.PI) {
        super((outerRadius + innerRadius) / 2, orbitSpeed, rotation);
    }
    
    public update(): void {
        super.update();
    }

    public draw(gl: WebGLRenderingContext, shader: WebGLProgram, worldMatrix: Mat4): void {
        super.draw(gl, shader, worldMatrix);
        worldMatrix = worldMatrix.rotateY(this.progress);
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector);
        this.mesh.draw(shader, worldMatrix);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildRing(gl, 2, 
                this.innerRadius, this.outerRadius, this.startAngle, this.endAngle, 
                new Vec3(255, 0, 0), new Vec3(0, 255, 0));
    }
}