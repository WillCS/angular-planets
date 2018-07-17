import { Vec3, Vec4 } from "../math/vector";
import { Mat4 } from "../math/mat4";
import { Drawable } from "../graphics/drawable";
import { Orbiter, Orbit } from "./orbiter";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Listable } from "../listable";
import { Shader } from "../graphics/shader";
import { LightSource } from "../graphics/lightSource";
import { Colour3 } from "../graphics/colour";

export abstract class Body implements Drawable, Listable {
    protected orbiters: Orbiter[] = [];
    public orbit: Orbit;
    public parent: Body;

    constructor(protected posVector: Vec3, protected rotVector: Vec3) {

    }

    public getLocalTransform(): Mat4 {
        if(this.parent) {
            return Mat4.identity()
                    .rotateByRotationVector(this.orbit.rotationVector)
                    .rotateY(this.orbit.orbitProgress)
                    .translate(this.orbit.radius, 0, 0);
        } else {
            return Mat4.translationMatrix(this.posVector.x, this.posVector.y, this.posVector.z);
        }
    }

    public getTransform(): Mat4 {
        if(this.parent) {
            return this.parent.getTransform().multiply(this.getLocalTransform());
        } else {
            return this.getLocalTransform();
        }
    }

    public get position(): Vec3 {
        if(this.parent) {
            return this.getTransform().multiply(new Vec4(1, 1, 1, 1)).toVec3();
        } else {
            return this.localPosition;
        }
    }

    protected get localPosition(): Vec3 {
        if(this.parent) {
            return new Vec3(
                this.orbit.radius * Math.sin(this.orbit.orbitProgress), 
                0, 
                this.orbit.radius * Math.cos(this.orbit.orbitProgress));
        } else {
            return this.posVector;
        }
    }

    private get cumulativeTilt(): Mat4 {
        if(this.parent) {
            return Mat4.identity().rotateYawPitchRoll(0, this.rotation.y, 0);
        } else {
            return this.parent.cumulativeTilt.rotateByRotationVector(this.rotation);
        }
    }

    public get rotation(): Vec3 {
        return this.rotVector;
    }

    public addOrbiter(orbiter: Orbiter) {
        this.orbiters.push(orbiter);
    }

    public getOrbiters(): Orbiter[] {
        return this.orbiters;
    }

    public update() {
        this.orbiters.forEach(orbiter => {
            orbiter.update();
        });
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        this.orbiters.forEach(orbiter => {
            orbiter.draw(gl, shader, worldMatrix.copy());
        });
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.orbiters.forEach(orbiter => {
            orbiter.initDrawing(gl);
        })
    }

    public abstract getName(): string;
}

export class Planet extends Body {
    private mesh: Mesh;
    constructor(rotationVector: Vec3, private bodyRotation: number, private rotationSpeed: number,
            private radius: number, private colour: Colour3) {
        super(Vec3.zero(), rotationVector);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotation);

        super.draw(gl, shader, worldMatrix);
        
        shader.useShader();
        shader.setFloat3('ambientColour', Colour3.normal(0, 0, 0));
        shader.setFloat('specularReflection', 1);
        shader.setFloat('ambientReflection', 1);
        shader.setFloat('diffuseReflection', 1);
        shader.setFloat('shininess', 32);
        
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

    public getName(): string {
        return 'Star';
    }
}

export class Star extends Body implements LightSource {
    private mesh: Mesh;
    constructor(rotationVector: Vec3, private bodyRotation: number, private rotationSpeed: number,
            private radius: number, private colour: Colour3) {
        super(Vec3.zero(), rotationVector);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        worldMatrix = worldMatrix.rotateByRotationVector(this.rotation);

        super.draw(gl, shader, worldMatrix);
        
        shader.useShader();
        shader.setFloat3('ambientColour', this.colour);
        shader.setFloat('specularReflection', 1);
        shader.setFloat('ambientReflection', 1);
        shader.setFloat('diffuseReflection', 1);
        shader.setFloat('shininess', 32);
        
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

    public getName(): string {
        return 'Star';
    }
    
    getSpecularColour(): Colour3 {
        return this.colour;
    }

    getDiffuseColour(): Colour3 {
        return this.colour;
    }

    getLightPosition(): Vec3 {
        return this.position;
    }

    getLightAttenuation(): number {
        return -1;
    }
}
