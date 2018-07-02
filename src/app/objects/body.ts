import { Vec3 } from "../math/vec3";

export class Body {
    private pos: Vec3;
    public get x(): number {
        return this.pos.x;
    }
    
    public get y(): number {
        return this.pos.y;
    }
    
    public get z(): number {
        return this.pos.z;
    }

    public get position(): Vec3 {
        return this.pos;
    }
}