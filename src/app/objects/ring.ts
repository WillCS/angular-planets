import { Orbiter } from './orbiter';
import { Mesh, MeshBuilder } from '../graphics/mesh';
import { Drawable } from '../graphics/drawable';
import { Listable } from '../listable';
import { Colour3 } from '../graphics/colour';
import { Vec3, Vec4 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { Renderer } from '../graphics/renderer';
import { Material } from '../graphics/material';
import { Ray, Intersection } from '../physics/rayTracer';
import { Body } from './body';
import { MathHelper } from '../math/mathHelper';

export class Ring implements Orbiter, Drawable, Listable {
    private mesh: Mesh;
    readonly material: Material;
    readonly normal: Vec3;
    readonly anglesTransform: Mat4;
    public rotation: number;

    constructor(public readonly parent: Body,
            readonly innerRadius: number, readonly outerRadius: number,
            readonly angles: Vec3, readonly rotationSpeed: number,
            readonly innerColour: Colour3, readonly outerColour: Colour3,
            readonly startAngle: number = 0, readonly endAngle: number = 2 * Math.PI) {
        this.rotation = 0;
        this.material = new Material(Colour3.normal(0, 0, 0), 1, 1, 1, 32);
        this.anglesTransform = Mat4.fromEulerAnglesVec(this.orbitEulerAngles);
        this.normal = this.anglesTransform.multiply(new Vec4(0, 1, 0, 0)).toVec3().normalize();
        this.parent.addOrbiter(this);
    }

    public update(): void {
        this.rotation += this.rotationSpeed;
        this.rotation %= Math.PI * 2;
    }

    public get name(): string {
        return 'Ring';
    }

    public get orbitEulerAngles(): Vec3 {
        return this.angles;
    }

    public get orbitTransform(): Mat4 {
        let matrix: Mat4 = Mat4.yRotationMatrix(this.rotation);
        matrix = matrix.multiply(this.anglesTransform);
        return matrix;
    }

    public get position(): Vec3 {
        return this.parent.position;
    }

    public draw(renderer: Renderer): void {
        renderer.drawReal();
        renderer.useMaterial(this.material);
        renderer.draw(this.mesh);
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        if(this.mesh) {
            this.mesh.delete();
        }

        this.mesh = MeshBuilder.buildRing(gl, 3,
                this.innerRadius, this.outerRadius, this.startAngle, this.endAngle,
                this.innerColour, this.outerColour);
    }

    public intersect(ray: Ray): Intersection {
        const denominator: number = ray.direction.dot(this.normal);

        if(!MathHelper.approxEqual(denominator, 0)) {
            const numerator: number = (this.position.subtract(ray.start)).dot(this.normal);
            const d: number = numerator / denominator;

            const intersection: Intersection = new Intersection(this, ray, d);

            const loc: Vec3 = intersection.point;
            const relativePos: Vec3 = this.position.subtract(loc);

            const distSquared: number = relativePos.lengthSquared;
            const innerRadiusSquared: number = this.innerRadius * this.innerRadius;
            const outerRadiusSquared: number = this.outerRadius * this.outerRadius;

            if(MathHelper.between(distSquared, innerRadiusSquared, outerRadiusSquared)) {
                if(MathHelper.approxEqual(this.endAngle - this.startAngle, MathHelper.TWO_PI)) {
                    return intersection;
                } else {
                    const hitAngle: number = Math.atan2(loc.z, loc.x);
                    if(MathHelper.between(hitAngle, this.startAngle, this.endAngle)) {
                        return intersection;
                    }
                }
            }
        }

        return undefined;
    }
}
