import { Vec3 } from "../math/vector";
import { Body } from "../objects/body";
import { SolidBody } from "./solidBody";

export class Intersection {
    public readonly point: Vec3;
    public constructor(public body: SolidBody, public ray: Ray, public distance: number) {
        this.point = this.ray.start.add(this.ray.direction.multiply(this.distance));
    }
}

export class Ray {
    public constructor(public start: Vec3, public direction: Vec3) {

    }
}