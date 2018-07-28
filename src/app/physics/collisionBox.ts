import { Ray, Intersection } from "./rayTracer";

export abstract class CollisionBox {
    public abstract intersect(ray: Ray): Intersection[];

    public closest(ray: Ray): Intersection {
        let closest: Intersection;
        this.intersect(ray).forEach(intersection => {
            if(closest) {
                closest = intersection.distance < closest.distance ? intersection : closest;
            } else {
                closest = intersection;
            }
        });

        return closest;
    }
}

export class SphereCollisionBox extends CollisionBox {
    public intersect(ray: Ray): Intersection[] {
        let hits: Intersection[] = [];

        

        return hits;
    }
}