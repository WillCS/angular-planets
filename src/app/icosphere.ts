export class IcosphereBuilder {
    private points: number[];
    private index: number;

    private addVertex(x: number, y: number, z: number): number {
        let length: number = Math.sqrt(x*x + y*y + z*z);
        this.points.push(x / length);
        this.points.push(y / length);
        this.points.push(z / length);
        return this.index++;
    }

    private getMiddlePoint(p1: number, p2: number): number {
        let x1 = this.points[p1 * 3];
        let y1 = this.points[p1 * 3 + 1];
        let z1 = this.points[p1 * 3 + 2];

        let x2 = this.points[p2 * 3];
        let y2 = this.points[p2 * 3 + 1];
        let z2 = this.points[p2 * 3 + 2];

        let middleX: number = (x1 + x2) / 2;
        let middleY: number = (y1 + y2) / 2;
        let middleZ: number = (z1 + z2) / 2;

        return this.addVertex(middleX, middleY, middleZ);
    }

    public build(lod: number): number[] {
        this.points = [];
        this.index = 0;
        
        let t: number = (1 + Math.sqrt(5)) / 2;

        this.addVertex(-1,  t,  0);
        this.addVertex( 1,  t,  0);
        this.addVertex(-1, -t,  0);
        this.addVertex( 1, -t,  0);

        this.addVertex( 0, -1,  t);
        this.addVertex( 0,  1,  t);
        this.addVertex( 0, -1, -t);
        this.addVertex( 0,  1, -t);

        this.addVertex( t,  0, -1);
        this.addVertex( t,  0,  1);
        this.addVertex(-t,  0, -1);
        this.addVertex(-t,  0,  1);
        
        let triangles: Triangle[] = [];
        triangles.push(new Triangle(0, 11, 5));
        triangles.push(new Triangle(0, 5, 1));
        triangles.push(new Triangle(0, 1, 7));
        triangles.push(new Triangle(0, 7, 10));
        triangles.push(new Triangle(0, 10, 11));
        triangles.push(new Triangle(1, 5, 9));
        triangles.push(new Triangle(5, 11, 4));
        triangles.push(new Triangle(11, 10, 2));
        triangles.push(new Triangle(10, 7, 6));
        triangles.push(new Triangle(7, 1, 8));
        triangles.push(new Triangle(3, 9, 4));
        triangles.push(new Triangle(3, 4, 2));
        triangles.push(new Triangle(3, 2, 6));
        triangles.push(new Triangle(3, 6, 8));
        triangles.push(new Triangle(3, 8, 9));
        triangles.push(new Triangle(4, 9, 5));
        triangles.push(new Triangle(2, 4, 11));
        triangles.push(new Triangle(6, 2, 10));
        triangles.push(new Triangle(8, 6, 7));
        triangles.push(new Triangle(9, 8, 1));

        for(let i = 0; i < lod; i++) {
            let newTriangles: Triangle[] = [];
            triangles.forEach(tri => {
                let a: number = this.getMiddlePoint(tri.p1, tri.p2);
                let b: number = this.getMiddlePoint(tri.p2, tri.p3);
                let c: number = this.getMiddlePoint(tri.p1, tri.p3);

                newTriangles.push(new Triangle(tri.p1, a, c));
                newTriangles.push(new Triangle(tri.p2, b, a));
                newTriangles.push(new Triangle(tri.p3, c, b));
                newTriangles.push(new Triangle(a, b, c));
            });
            triangles = newTriangles;
        }

        let geometry: number[] = [];
        triangles.forEach(tri => {
            geometry.push(this.points[tri.p1 * 3]);
            geometry.push(this.points[tri.p1 * 3 + 1]);
            geometry.push(this.points[tri.p1 * 3 + 2]);
            geometry.push(this.points[tri.p2 * 3]);
            geometry.push(this.points[tri.p2 * 3 + 1]);
            geometry.push(this.points[tri.p2 * 3 + 2]);
            geometry.push(this.points[tri.p3 * 3]);
            geometry.push(this.points[tri.p3 * 3 + 1]);
            geometry.push(this.points[tri.p3 * 3 + 2]);
        });

        return geometry;
    }
}

class Triangle {
    constructor(public p1: number, public p2: number, public p3: number) {

    }
}