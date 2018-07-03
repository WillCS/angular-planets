import { Vec3 } from "../math/vec3";
import { Mat4 } from "../math/mat4";
import { Drawable } from "../graphics/drawable";
import { Orbiter } from "./orbiter";
import { Mesh, MeshBuilder } from "../graphics/mesh";

export abstract class Body implements Drawable {
    protected orbiters: Orbiter[] = [];

    constructor(protected posVector: Vec3, protected rotVector: Vec3) {

    }

    public get position(): Vec3 {
        return this.posVector;
    }

    public get rotation(): Vec3 {
        return this.rotVector;
    }

    public addOrbiter(orbiter: Orbiter) {
        this.orbiters.push(orbiter);
    }

    public update() {
        this.orbiters.forEach(orbiter => {
            orbiter.update();
        });
    }

    public draw(gl: WebGLRenderingContext, shader: WebGLShader, worldMatrix: Mat4): void {
        this.orbiters.forEach(orbiter => {
            orbiter.draw(gl, shader, worldMatrix.copy());
        });
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.orbiters.forEach(orbiter => {
            orbiter.initDrawing(gl);
        })
    }
}

export class Star extends Body {
    private mesh: Mesh;
    constructor(rotationVector: Vec3, private bodyRotation: number, private rotationSpeed: number,
            private radius: number, private colour: Vec3) {
        super(Vec3.zero(), rotationVector);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public draw(gl: WebGLRenderingContext, shader: WebGLShader, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotation);

        super.draw(gl, shader, worldMatrix);
        
        let scaledMatrix = worldMatrix.scale(this.radius, this.radius, this.radius);
        scaledMatrix = scaledMatrix.rotateY(this.bodyRotation);
        this.mesh.draw(shader, scaledMatrix);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        super.initDrawing(gl);
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildIcosphere(gl, 3, this.colour);
    }
}