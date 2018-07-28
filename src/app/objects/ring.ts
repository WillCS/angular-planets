import { Orbiter } from "./orbiter";
import { Mesh, MeshBuilder } from "../graphics/mesh";
import { Drawable } from "../graphics/drawable";
import { Listable } from "../listable";
import { Colour3 } from "../graphics/colour";
import { Vec3 } from "../math/vector";
import { Mat4 } from "../math/matrix";
import { Renderer } from "../graphics/renderer";
import { Material } from "../graphics/material";
import { Ray, Intersection } from "../physics/rayTracer";

export class Ring implements Orbiter, Drawable, Listable {
    private mesh: Mesh;
    private material: Material;
    public rotation: number;
    
    constructor(private innerRadius: number, private outerRadius: number, 
            private angles: Vec3, private rotationSpeed: number,
            private innerColour: Colour3, private outerColour: Colour3,
            private startAngle: number = 0, private endAngle: number = 2 * Math.PI) {
        this.rotation = 0;
        this.material = new Material(Colour3.normal(0, 0, 0), 1, 1, 1, 32);
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
        matrix = matrix.rotateByEulerAnglesVec(this.orbitEulerAngles);
        return matrix;
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
        return undefined;
    }
}
