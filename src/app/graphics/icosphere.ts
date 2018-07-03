import { Vec3 } from "../math/vec3";

export class IcosphereBuilder {
    public build(lod: number): number[] {
        let points = [];
        let index = 0;
        
        let t: number = (1 + Math.sqrt(5)) / 2;

        function addVertex(x: number, y: number, z: number): number {
            let length: number = Math.sqrt(x*x + y*y + z*z);
            points.push(x / length);
            points.push(y / length);
            points.push(z / length);
            return index++;
        }
    
        function getMiddlePoint(p1: number, p2: number): number {
            let x1 = points[p1 * 3];
            let y1 = points[p1 * 3 + 1];
            let z1 = points[p1 * 3 + 2];
    
            let x2 = points[p2 * 3];
            let y2 = points[p2 * 3 + 1];
            let z2 = points[p2 * 3 + 2];
    
            let middleX: number = (x1 + x2) / 2;
            let middleY: number = (y1 + y2) / 2;
            let middleZ: number = (z1 + z2) / 2;
    
            return addVertex(middleX, middleY, middleZ);
        }

        addVertex(-1,  t,  0);
        addVertex( 1,  t,  0);
        addVertex(-1, -t,  0);
        addVertex( 1, -t,  0);

        addVertex( 0, -1,  t);
        addVertex( 0,  1,  t);
        addVertex( 0, -1, -t);
        addVertex( 0,  1, -t);

        addVertex( t,  0, -1);
        addVertex( t,  0,  1);
        addVertex(-t,  0, -1);
        addVertex(-t,  0,  1);
        
        let tris: Triangle[] = [];
        tris.push(new Triangle(0, 11, 5));
        tris.push(new Triangle(0, 5, 1));
        tris.push(new Triangle(0, 1, 7));
        tris.push(new Triangle(0, 7, 10));
        tris.push(new Triangle(0, 10, 11));
        tris.push(new Triangle(1, 5, 9));
        tris.push(new Triangle(5, 11, 4));
        tris.push(new Triangle(11, 10, 2));
        tris.push(new Triangle(10, 7, 6));
        tris.push(new Triangle(7, 1, 8));
        tris.push(new Triangle(3, 9, 4));
        tris.push(new Triangle(3, 4, 2));
        tris.push(new Triangle(3, 2, 6));
        tris.push(new Triangle(3, 6, 8));
        tris.push(new Triangle(3, 8, 9));
        tris.push(new Triangle(4, 9, 5));
        tris.push(new Triangle(2, 4, 11));
        tris.push(new Triangle(6, 2, 10));
        tris.push(new Triangle(8, 6, 7));
        tris.push(new Triangle(9, 8, 1));

        for(let i = 0; i < lod; i++) {
            let newTris: Triangle[] = [];
            tris.forEach(tri => {
                let a: number = getMiddlePoint(tri.p1, tri.p2);
                let b: number = getMiddlePoint(tri.p2, tri.p3);
                let c: number = getMiddlePoint(tri.p1, tri.p3);

                newTris.push(new Triangle(tri.p1, a, c));
                newTris.push(new Triangle(tri.p2, b, a));
                newTris.push(new Triangle(tri.p3, c, b));
                newTris.push(new Triangle(a, b, c));
            });
            tris = newTris;
        }

        let geometry: number[] = [];
        tris.forEach(tri => {
            geometry.push(points[tri.p1 * 3]);
            geometry.push(points[tri.p1 * 3 + 1]);
            geometry.push(points[tri.p1 * 3 + 2]);
            geometry.push(points[tri.p2 * 3]);
            geometry.push(points[tri.p2 * 3 + 1]);
            geometry.push(points[tri.p2 * 3 + 2]);
            geometry.push(points[tri.p3 * 3]);
            geometry.push(points[tri.p3 * 3 + 1]);
            geometry.push(points[tri.p3 * 3 + 2]);
        });

        return geometry;
    }
}

class Triangle {
    constructor(public p1: number, public p2: number, public p3: number) {

    }
}