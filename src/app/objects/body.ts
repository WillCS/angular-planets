import { Vec3, Vec4 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { Orbiter } from './orbiter';
import { Mesh, MeshBuilder } from '../graphics/mesh';
import { LightSource } from '../graphics/lightSource';
import { Colour3 } from '../graphics/colour';
import { Orbit } from './orbit';
import { Renderer } from '../graphics/renderer';
import { Material } from '../graphics/material';
import { Ray, Intersection } from '../physics/rayTracer';
import { MathHelper } from '../math/mathHelper';

export abstract class Body implements Orbiter {
    protected orbiters: Orbiter[] = [];
    protected location: Vec3;

    constructor(protected orientation: Vec3, public orbit: Orbit, public readonly parent: Body) {
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
            const parentPos: Vec3 = this.parent.position;
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

    public draw(renderer: Renderer): void {
        this.orbiters.forEach(orbiter => {
            renderer.pushMatrix();
            renderer.modelMatrix = renderer.modelMatrix.multiply(orbiter.orbitTransform);
            orbiter.draw(renderer);
            renderer.popMatrix();
        });
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.orbiters.forEach(orbiter => {
            orbiter.initDrawing(gl);
        });
    }

    public abstract intersect(ray: Ray): Intersection;
}

export class Planet extends Body {
    private mesh: Mesh;
    private material: Material;

    constructor(orientation: Vec3, private bodyRotation: number, private rotationSpeed: number,
            readonly radius: number, readonly colour: Colour3,
            orbit: Orbit, parent: Body) {
        super(orientation, orbit, parent);
        this.material = new Material(Colour3.normal(0, 0, 0), 1, 1, 1, 32);
    }

    public update() {
        super.update();
        this.bodyRotation += this.rotationSpeed;
        this.bodyRotation %= 2 * Math.PI;
    }

    public get name(): string {
        return 'Planet';
    }

    public draw(renderer: Renderer): void {
        super.draw(renderer);

        renderer.drawReal();
        renderer.useMaterial(this.material);

        renderer.modelMatrix = renderer.modelMatrix.scale(this.radius, this.radius, this.radius);
        renderer.modelMatrix = renderer.modelMatrix.rotateY(this.bodyRotation);
        renderer.draw(this.mesh);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        super.initDrawing(gl);
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildIcosphere(gl, 3, this.colour);
    }

    public intersect(ray: Ray): Intersection {
        const difference: Vec3 = ray.start.subtract(this.location);
        const radicand: number = MathHelper.square(ray.direction.dot(difference)) -
                difference.lengthSquared + MathHelper.square(this.radius);

        if(radicand < 0) {
            return null;
        } else {
            const start: number = -(ray.direction.dot(difference));
            if(MathHelper.approxEqual(radicand, 0)) {
                return new Intersection(this, ray, start);
            } else {
                return new Intersection(this, ray, start - Math.sqrt(radicand));
            }
        }
    }

    public static withLocation(orientation: Vec3, bodyRotation: number, rotationSpeed: number,
            radius: number, colour: Colour3, location: Vec3): Planet {
        const planet: Planet = new Planet(orientation, bodyRotation, rotationSpeed,
                radius, colour, null, null);
        planet.location = location;
        return planet;
    }
}

export class Star extends Body implements LightSource {
    private mesh: Mesh;
    private material: Material;

    constructor(orientation: Vec3, private bodyRotation: number, private rotationSpeed: number,
            readonly radius: number, readonly colour: Colour3,
            orbit: Orbit, parent: Body) {
        super(orientation, orbit, parent);
        this.material = new Material(Colour3.normal(1, 1, 1), 1, 1, 1, 32);
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

    public draw(renderer: Renderer): void {
        super.draw(renderer);

        renderer.drawReal();
        renderer.useMaterial(this.material);

        renderer.modelMatrix = renderer.modelMatrix.scale(this.radius, this.radius, this.radius);
        renderer.modelMatrix = renderer.modelMatrix.rotateY(this.bodyRotation);
        renderer.draw(this.mesh);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        super.initDrawing(gl);
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildIcosphere(gl, 3, this.colour);
    }

    public intersect(ray: Ray): Intersection {
        const difference: Vec3 = ray.start.subtract(this.location);
        const radicand: number = MathHelper.square(ray.direction.dot(difference)) -
                difference.lengthSquared + MathHelper.square(this.radius);

        if(radicand < 0) {
            return null;
        } else {
            const start: number = -(ray.direction.dot(difference));
            if(MathHelper.approxEqual(radicand, 0)) {
                return new Intersection(this, ray, start);
            } else {
                return new Intersection(this, ray, start - Math.sqrt(radicand));
            }
        }
    }

    public static withLocation(orientation: Vec3, bodyRotation: number, rotationSpeed: number,
            radius: number, colour: Colour3, location: Vec3): Star {
        const star: Star = new Star(orientation, bodyRotation, rotationSpeed,
                radius, colour, null, null);
        star.location = location;
        return star;
    }
}
