import { Vec3 } from '../math/vector';
import { Mat4 } from '../math/matrix';
import { Shader } from './shader';
import { Colour3 } from './colour';

export class Mesh {
    private vertexBuffer: WebGLBuffer;

    private indexBuffer: WebGLBuffer;

    private colourBuffer: WebGLBuffer;
    private hasColours: boolean = false;

    private normalBuffer: WebGLBuffer;
    private hasNormals: boolean = false;

    private drawMode: number;
    private numIndices: number;

    public constructor(private gl: WebGLRenderingContext) {
        this.drawMode = this.gl.TRIANGLE_STRIP;
    }

    public setVertices(vertices: number[]): void {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices),
                this.gl.STATIC_DRAW);
    }

    public setIndices(indices: number[]): void {
        this.numIndices = indices.length;
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
                this.gl.STATIC_DRAW);
    }

    public setNormals(normals: number[]): void {
        this.hasNormals = true;
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals),
            this.gl.STATIC_DRAW);
    }

    public setColours(colours: number[]): void {
        this.hasColours = true;
        this.colourBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours),
            this.gl.STATIC_DRAW);
    }

    public setDrawMode(drawMode: number): void {
        this.drawMode = drawMode;
    }

    public draw(shader: Shader, modelMatrix: Mat4): void {
        shader.useShader();

        const vertexSize: number = 3;
        const vertexType: number = this.gl.FLOAT;
        shader.setAttributeArray('vertexPos', this.vertexBuffer,
                vertexSize, vertexType);

        shader.setIndexArray(this.indexBuffer);

        if(shader.requiresColours) {
            const colourSize: number = 3;
            const colourType: number = this.gl.FLOAT;
            const colourNormalize: boolean = true;
            shader.setAttributeArray('vertexColour', this.colourBuffer,
                    colourSize, colourType, colourNormalize);
        } else {
            shader.disableAttributeArray('vertexColour');
        }

        if(shader.requiresNormals) {
            const normalSize: number = 3;
            const normalType: number = this.gl.FLOAT;
            shader.setAttributeArray('vertexNorm', this.normalBuffer,
                    normalSize, normalType);
        } else {
            shader.disableAttributeArray('vertexNorm');
        }

        shader.setModel(modelMatrix);

        const indexType: number = this.gl.UNSIGNED_SHORT;
        const indexOffset: number = 0;
        this.gl.drawElements(this.drawMode, this.numIndices, indexType, indexOffset);
    }

    public delete(): void {
        if(this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
        }

        if(this.colourBuffer) {
            this.gl.deleteBuffer(this.colourBuffer);
        }

        if(this.normalBuffer) {
            this.gl.deleteBuffer(this.normalBuffer);
        }

        if(this.indexBuffer) {
            this.gl.deleteBuffer(this.indexBuffer);
        }
    }
}

export module MeshBuilder {
    export function buildRing(gl: WebGLRenderingContext, lod: number,
            innerRadius: number, outerRadius: number,
            startAngle: number = 0, endAngle: number = 2 * Math.PI,
            innerColour: Colour3 = null, outerColour: Colour3 = null): Mesh {
        const geometry: number[] = [];
        const indices: number[] = [];
        const colours: number[] = [];
        const normals: number[] = [];
        const n = Math.floor(32 * lod * (endAngle - startAngle) / (2 * Math.PI));

        let index: number = 0;
        for(let i = 0; i < n + 1; i++) {
            const theta: number = startAngle + (endAngle - startAngle) * (i / n);
            const dir: Vec3 = new Vec3(Math.sin(theta), 0, Math.cos(theta));
            const innerPoint: Vec3 = dir.multiply(innerRadius);
            const outerPoint: Vec3 = dir.multiply(outerRadius);

            if(innerColour) {
                colours.push(innerColour.r, innerColour.g, innerColour.b);
            }
            geometry.push(innerPoint.x, innerPoint.y, innerPoint.z);
            normals.push(0, 1, 0);
            indices.push(index++);

            if(outerColour) {
                colours.push(outerColour.r, outerColour.g, outerColour.b);
            }
            geometry.push(outerPoint.x, outerPoint.y, outerPoint.z);
            normals.push(0, 1, 0);
            indices.push(index++);
        }

        for(let i = 0; i < n + 1; i++) {
            const theta: number = endAngle - (endAngle - startAngle) * (i / n);
            const dir: Vec3 = new Vec3(Math.sin(theta), 0, Math.cos(theta));
            const innerPoint: Vec3 = dir.multiply(innerRadius);
            const outerPoint: Vec3 = dir.multiply(outerRadius);

            if(innerColour) {
                colours.push(innerColour.r, innerColour.g, innerColour.b);
            }
            geometry.push(innerPoint.x, innerPoint.y, innerPoint.z);
            normals.push(0, -1, 0);
            indices.push(index++);

            if(outerColour) {
                colours.push(outerColour.r, outerColour.g, outerColour.b);
            }
            geometry.push(outerPoint.x, outerPoint.y, outerPoint.z);
            normals.push(0, -1, 0);
            indices.push(index++);
        }

        const mesh: Mesh = new Mesh(gl);
        mesh.setVertices(geometry);
        mesh.setIndices(indices);
        mesh.setNormals(normals);
        if(innerColour && outerColour) {
            mesh.setColours(colours);
        }

        return mesh;
    }

    export function buildLoop(gl: WebGLRenderingContext, lod: number,
            radius: number, colour: Colour3): Mesh {
        const mesh: Mesh = new Mesh(gl);
        const geometry: number[] = [];
        const indices: number[]  = [];
        let index: number = 0;
        const colours: number[] = [];
        const n = Math.floor(32 * lod);

        for(let i = 0; i < n + 1; i++) {
            geometry.push(radius * Math.cos(2 * Math.PI * i / n), 0, radius * Math.sin(2 * Math.PI * i / n));
            indices.push(index++);
            colours.push(colour.r, colour.g, colour.b);
        }

        mesh.setDrawMode(gl.LINE_STRIP);
        mesh.setVertices(geometry);
        mesh.setIndices(indices);
        mesh.setColours(colours);

        return mesh;
    }

    export function buildIcosphere(gl: WebGLRenderingContext, lod: number,
            colour: Colour3 = null): Mesh {
        const points: Vec3[] = [];
        let index: number = 0;
        if(!colour) {
            colour = Colour3.normal(0, 0, 0);
        }

        const t: number = (1 + Math.sqrt(5)) / 2;

        function addVertex(vec: Vec3): number {
            points.push(vec.normalize());
            return index++;
        }

        function getMiddlePoint(p1: number, p2: number): number {
            const v1: Vec3 = points[p1];
            const v2: Vec3 = points[p2];

            const middle: Vec3 = v1.add(v2).divide(2);

            return addVertex(middle);
        }

        addVertex(new Vec3(-1,  t,  0));
        addVertex(new Vec3( 1,  t,  0));
        addVertex(new Vec3(-1, -t,  0));
        addVertex(new Vec3( 1, -t,  0));

        addVertex(new Vec3( 0, -1,  t));
        addVertex(new Vec3( 0,  1,  t));
        addVertex(new Vec3( 0, -1, -t));
        addVertex(new Vec3( 0,  1, -t));

        addVertex(new Vec3( t,  0, -1));
        addVertex(new Vec3( t,  0,  1));
        addVertex(new Vec3(-t,  0, -1));
        addVertex(new Vec3(-t,  0,  1));

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
            const newTris: Triangle[] = [];
            tris.forEach(tri => {
                const a: number = getMiddlePoint(tri.p1, tri.p2);
                const b: number = getMiddlePoint(tri.p2, tri.p3);
                const c: number = getMiddlePoint(tri.p1, tri.p3);

                newTris.push(new Triangle(tri.p1, a, c));
                newTris.push(new Triangle(tri.p2, b, a));
                newTris.push(new Triangle(tri.p3, c, b));
                newTris.push(new Triangle(a, b, c));
            });
            tris = newTris;
        }

        const geometry: number[] = [];
        const geometryIndices: number[] = [];
        const colours: number[] = [];
        let geometryIndex: number = 0;
        tris.forEach(tri => {
            const p1: Vec3 = points[tri.p1];
            geometry.push(p1.x, p1.y, p1.z);
            geometryIndices.push(geometryIndex++);
            colours.push(colour.r, colour.g, colour.b);
            const p2: Vec3 = points[tri.p2];
            geometry.push(p2.x, p2.y, p2.z);
            geometryIndices.push(geometryIndex++);
            colours.push(colour.r, colour.g, colour.b);
            const p3: Vec3 = points[tri.p3];
            geometry.push(p3.x, p3.y, p3.z);
            geometryIndices.push(geometryIndex++);
            colours.push(colour.r, colour.g, colour.b);
        });

        const mesh: Mesh = new Mesh(gl);
        mesh.setDrawMode(gl.TRIANGLES);
        mesh.setVertices(geometry);
        mesh.setNormals(geometry);
        mesh.setColours(colours);
        mesh.setIndices(geometryIndices);

        return mesh;
    }

    export function buildLines(gl: WebGLRenderingContext, lines: Vec3[], colour: Colour3): Mesh {
        const mesh: Mesh = new Mesh(gl);
        const geometry: number[] = [];
        const indices: number[]  = [];
        let index: number = 0;
        const colours: number[] = [];
        lines.forEach(line => {
            geometry.push(line.x, line.y, line.z);
            indices.push(index++);
            colours.push(colour.r, colour.g, colour.b);
        });

        mesh.setDrawMode(gl.LINES);
        mesh.setVertices(geometry);
        mesh.setIndices(indices);
        mesh.setColours(colours);

        return mesh;
    }
}

class Triangle {
    constructor(public p1: number, public p2: number, public p3: number) {

    }
}
