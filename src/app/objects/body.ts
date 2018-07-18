import { Vec3, Vec4 } from "../math/vector";
import { Mat4 } from "../math/mat4";
import { Orbiter } from "./orbiter";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Shader } from "../graphics/shader";
import { LightSource } from "../graphics/lightSource";
import { Colour3 } from "../graphics/colour";
import { Orbit } from "./orbit";

export abstract class Body implements Orbiter {
    protected orbiters: Orbiter[] = [];
    protected location: Vec3;

    constructor(protected orientation: Vec3, public orbit: Orbit, public parent: Body) {
        if(parent) {
            parent.addOrbiter(this);
        }
    }

    public abstract get name(): string;

    public get orbitEulerAngles(): Vec3 {
        return this.orbit.eulerAngles;
    }

    public get orbitTransform(): Mat4 {
        return this.orbit.transform;
    }

    public get position(): Vec3 {
        if(this.hasParent()) {
            let parentPos: Vec3 = this.parent.position;
            return parentPos.add(this.orbitTransform.multiply(Vec4.one()).toVec3());
        } else {
            return this.location;
        }
    }

    public get bodyEulerAngles(): Vec3 {
        return this.orientation;
    }

    public addOrbiter(orbiter: Orbiter) {
        this.orbiters.push(orbiter);
    }

    public getOrbiters(): Orbiter[] {
        return this.orbiters;
    }

    public hasParent(): boolean {
        return !!this.parent;
    }

    public update() {
        if(this.hasParent()) {
            this.orbit.update();
        }
        this.orbiters.forEach(orbiter => {
            orbiter.update();
        });
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
        this.orbiters.forEach(orbiter => {
            orbiter.draw(gl, shader, worldMatrix.multiply(orbiter.orbitTransform));
        });
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.orbiters.forEach(orbiter => {
            orbiter.initDrawing(gl);
        })
    }
}

export class Planet extends Body {
    private mesh: Mesh;

    constructor(orientation: Vec3, private bodyRotation: number, private rotationSpeed: number,
            private radius: number, private colour: Colour3,
            orbit: Orbit, parent: Body) {
        super(orientation, orbit, parent);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public get name(): string {
        return 'Planet';
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
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

    public static withLocation(orientation: Vec3, bodyRotation: number, rotationSpeed: number, 
            radius: number, colour: Colour3, location: Vec3): Planet {
        let planet: Planet = new Planet(orientation, bodyRotation, rotationSpeed, 
                radius, colour, null, null);
        planet.location = location;
        return planet;
    }
}

export class Star extends Body implements LightSource {
    private mesh: Mesh;

    constructor(orientation: Vec3, private bodyRotation: number, private rotationSpeed: number,
            private radius: number, private colour: Colour3,
            orbit: Orbit, parent: Body) {
        super(orientation, orbit, parent);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public get name(): string {
        return 'Star';
    }
    
    public get lightSpecularColour(): Colour3 {
        return this.colour;
    }

    public get lightDiffuseColour(): Colour3 {
        return this.colour;
    }

    public get lightPosition(): Vec3 {
        return this.position;
    }

    public get lightAttenuation(): number {
        return -1;
    }

    public draw(gl: WebGLRenderingContext, shader: Shader, worldMatrix: Mat4): void {
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

    public static withLocation(orientation: Vec3, bodyRotation: number, rotationSpeed: number, 
            radius: number, colour: Colour3, location: Vec3): Star {
        let star: Star = new Star(orientation, bodyRotation, rotationSpeed, 
                radius, colour, null, null);
        star.location = location;
        return star;
    }
}
