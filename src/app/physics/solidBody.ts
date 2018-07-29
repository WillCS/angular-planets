import { Ray, Intersection } from "./rayTracer";
import { Vec3 } from "../math/vector";

export interface SolidBody {
    readonly position: Vec3;
    intersect(ray: Ray): Intersection;
}