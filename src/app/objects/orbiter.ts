import { Mat4 } from "../math/mat4";
import { Vec3 } from "../math/vector";
import { Body } from "../objects/body"
import { Drawable } from "../graphics/drawable";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Listable } from "../listable";
import { Shader } from "../graphics/shader";

export abstract class Orbiter implements Drawable, Listable {
    public get rotationVector(): Vec3 {
        return this.rotation;
    }
    public orbitProgress: number = 0;

    constructor(public radius: number, private orbitSpeed: number, private rotation: Vec3) {

    }

    public update(): void {
        this.orbitProgress += this.orbitSpeed;
        this.orbitProgress %= Math.PI * 2;
    }

    public abstract draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void;

    public abstract initDrawing(gl: WebGLRenderingContext): void;

    public abstract getName(): string;
}

export class Orbit extends Orbiter {
    private orbit: Mesh;
    constructor(private body: Body, private parent: Body, radius: number, orbitSpeed: number, 
            rotation: Vec3) {
        super(radius, orbitSpeed, rotation);
        body.parent = parent;
        body.orbit = this;
    }
    
    public update(): void {
        super.update();
    }

    public getBody(): Body {
        return this.body;
    }

    public getParent(): Body {
        return this.parent;
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector);

        if(!shader.onlyDrawPhysical) {
            this.orbit.draw(shader, worldMatrix);
        }

        worldMatrix = worldMatrix.rotateY(this.orbitProgress);
        worldMatrix = worldMatrix.translate(this.radius, 0, 0);
        //worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector.negate());
        this.body.draw(gl, shader, worldMatrix);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.orbit = MeshBuilder.buildLoop(gl, 3, this.radius, new Vec3(100, 100, 100));
        this.body.initDrawing(gl);
    }

    public getName(): string {
        return 'Orbit';
    }
}

export class Ring extends Orbiter {
    private mesh: Mesh;
    constructor(private innerRadius: number, private outerRadius: number, 
            orbitSpeed: number, rotation: Vec3,
            private innerColour: Vec3, private outerColour: Vec3,
            private startAngle: number = 0, private endAngle: number = 2 * Math.PI) {
        super((outerRadius + innerRadius) / 2, orbitSpeed, rotation);
    }
    
    public update(): void {
        super.update();
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateY(this.orbitProgress);
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotationVector);
        this.mesh.draw(shader, worldMatrix);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildRing(gl, 3, 
                this.innerRadius, this.outerRadius, this.startAngle, this.endAngle, 
                this.innerColour, this.outerColour);
    }

    public getName(): string {
        return 'Ring';
    }
}