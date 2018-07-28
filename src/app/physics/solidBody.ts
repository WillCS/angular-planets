import { Ray, Intersection } from "./rayTracer";

export interface SolidBody {
    intersect(ray: Ray): Intersection;
}