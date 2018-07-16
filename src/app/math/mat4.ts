import { Vec3, Vec4 } from './vector';

export class Mat4 {
    private matrix: number[];

    constructor(matrix: number[]) {
        this.matrix = matrix;
    }

    public get(x: number, y: number): number {
        return this.matrix[y * 4 + x];
    }

    public set(x: number, y: number, value: number): number {
        return this.matrix[y * 4 + x] = value;
    }

    public getRow(n: number): Vec4 {
        return new Vec4(this.get(0, n), this.get(1, n), this.get(2, n), this.get(3, n));
    }

    public getColumn(n: number): Vec4 {
        return new Vec4(this.get(n, 0), this.get(n, 1), this.get(n, 2), this.get(n, 3));
    }

    public transpose(): Mat4 {
        let row1: Vec4 = this.getRow(0);
        let row2: Vec4 = this.getRow(1);
        let row3: Vec4 = this.getRow(2);
        let row4: Vec4 = this.getRow(3);
        return Mat4.fromColumnVectors(row1, row2, row3, row4);
    }

    public add(m: Mat4): Mat4 {
        let newMatrix: Mat4 = this.copy();
        for(let x = 0; x < 4; x++) {
            for(let y = 0; y < 4; y++) {
                newMatrix.set(x, y, this.get(x, y) + m.get(x, y));
            }
        }
        return newMatrix;
    }

    public subtract(m: Mat4): Mat4 {
        let newMatrix: Mat4 = this.copy();
        for(let x = 0; x < 4; x++) {
            for(let y = 0; y < 4; y++) {
                newMatrix.set(x, y, this.get(x, y) - m.get(x, y));
            }
        }
        return newMatrix;
    }

    public multiply(n: number): Mat4;
    public multiply(n: Mat4): Mat4;
    public multiply(n: Vec4): Vec4;
    public multiply(n: number | Mat4 | Vec4): Mat4 | Vec4 {
        if(typeof n === 'number') {
            let newMatrix: number[] = this.matrix;
            for(let i = 0; i < 16; i++) {
                newMatrix[i] *= n;
            }

            return new Mat4(newMatrix);
        } else if(n instanceof Vec4) {
            let v = n as Vec4;
            return new Vec4(
                    this.getRow(0).dot(v), 
                    this.getRow(1).dot(v), 
                    this.getRow(2).dot(v), 
                    this.getRow(3).dot(v));
        } else {
            let m = n as Mat4;
            let newMatrix: Mat4 = Mat4.zero();
            for(let x = 0; x < 4; x++) {
                for(let y = 0; y < 4; y++) {
                    newMatrix.set(x, y, this.getRow(y).dot(m.getColumn(x)));
                }
            }
            return newMatrix;
        }
    }

    public divide(n: number): Mat4 {
        let newMatrix: number[] = Object.assign([], this.matrix);
        for(let i = 0; i < 16; i++) {
            newMatrix[i] /= n;
        }
        return new Mat4(newMatrix);
    }

    public toMat3(): Mat4 {
        let row0: Vec4 = this.getRow(0).toVec3().toVec4();
        let row1: Vec4 = this.getRow(1).toVec3().toVec4();
        let row2: Vec4 = this.getRow(2).toVec3().toVec4();
        return Mat4.fromRowVectors(row0, row1, row2, Vec4.zero());
    }

    public toArray(): number[] {
        return this.matrix;
    }

    public forGL(): Float32Array {
        return new Float32Array(this.transpose().toArray());
    }

    public static fromRows(row1: number[], row2: number[], row3: number[], row4: number[]): Mat4 {
        let matrix: number[] = row1.concat(row2).concat(row3).concat(row4);
        return new Mat4(matrix);
    }

    public static fromRowVectors(row1: Vec4, row2: Vec4, row3: Vec4, row4: Vec4) {
        return this.fromRows(row1.toArray(), row1.toArray(), row3.toArray(), row4.toArray());
    }

    public static fromColumns(col1: number[], col2: number[], col3: number[], col4: number[]): Mat4 {
        let matrix: number[] = [];
        for(let i = 0; i < 4; i++) {
            matrix.push(col1[i]);
            matrix.push(col2[i]);
            matrix.push(col3[i]);
            matrix.push(col4[i]);
        }

        return new Mat4(matrix);
    }

    public static fromColumnVectors(col1: Vec4, col2: Vec4, col3: Vec4, col4: Vec4) {
        return this.fromColumns(col1.toArray(), col2.toArray(), col3.toArray(), col4.toArray());
    }

    public static identity(): Mat4 {
        let newMat: Mat4 = Mat4.zero();
        for(let i = 0; i < 4; i++) {
            newMat.set(i, i, 1);
        }
        return newMat;
    }

    public static zero(): Mat4 {
        let newMat: number[] = [];
        for(let i = 0; i < 16; i++) {
            newMat[i] = 0;
        }
        return new Mat4(newMat);
    }

    public static translationMatrix(x: number, y: number, z: number): Mat4 {
        return new Mat4([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ]);
    }

    public translate(x: number, y: number, z: number): Mat4 {
        return this.multiply(Mat4.translationMatrix(x, y, z));
    }

    public static scalingMatrix(x: number, y: number, z: number): Mat4 {
        return new Mat4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }

    public scale(x: number, y: number, z: number): Mat4 {
        return this.multiply(Mat4.scalingMatrix(x, y, z));
    }

    public static xRotationMatrix(theta: number): Mat4 {
        let c: number = Math.cos(theta);
        let s: number = Math.sin(theta);
        return new Mat4([
            1, 0,  0, 0,
            0, c, -s, 0,
            0, s,  c, 0,
            0, 0,  0, 1
        ]);
    }
    
    public rotateX(theta: number): Mat4 {
        return this.multiply(Mat4.xRotationMatrix(theta));
    }

    public static yRotationMatrix(theta: number) {
        let c: number = Math.cos(theta);
        let s: number = Math.sin(theta);
        return new Mat4([
             c, 0, s, 0,
             0, 1, 0, 0,
            -s, 0, c, 0,
             0, 0, 0, 1
        ]);
    }
    
    public rotateY(theta: number): Mat4 {
        return this.multiply(Mat4.yRotationMatrix(theta));
    }

    public static zRotationMatrix(theta: number): Mat4 {
        let c: number = Math.cos(theta);
        let s: number = Math.sin(theta);
        return new Mat4([
            c, -s, 0, 0,
            s,  c, 0, 0,
            0,  0, 1, 0,
            0,  0, 0, 1
        ]);
    }
    
    public rotateZ(theta: number): Mat4 {
        return this.multiply(Mat4.zRotationMatrix(theta));
    }

    public rotateYawPitchRoll(yaw: number, pitch: number, roll: number): Mat4 {
        return this.rotateY(yaw).rotateZ(pitch).rotateX(roll);
    }

    public rotateByRotationVector(rotationVector: Vec3): Mat4 {
        return this.rotateYawPitchRoll(rotationVector.y, rotationVector.z, rotationVector.x);
    }

    public static perspectiveProjection(fov: number, aspect: number, 
            near: number, far: number): Mat4 {
        let f: number = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        let range: number = 1 / (near - far);

        let a = f / aspect;
        let b = f;
        let c = (near + far) * range;
        let d = near * far * range * 2;
        return new Mat4([
            a, 0,  0, 0,
            0, b,  0, 0,
            0, 0,  c, d,
            0, 0, -1, 0
        ]);
    }

    public static orthographicProjection(width: number, height: number,
            near: number, far: number): Mat4 {
        let a: number = (2 * near) / width;
        let b: number = (2 * near) / height;
        let c: number = -2 / (far - near);
        let d: number = -(far + near) / (far - near);
        return new Mat4([
            a, 0, 0, 0,
            0, b, 0, 0,
            0, 0, c, d,
            0, 0, 0, 1
        ]);
    }

    public copy(): Mat4 {
        return new Mat4(Object.assign([], this.matrix));
    }

    public debugPrint(): void {
        console.log("Matrix:");
        console.log(`[${this.matrix[0]} ${this.matrix[1]} ${this.matrix[2]} ${this.matrix[3]}]`);
        console.log(`[${this.matrix[4]} ${this.matrix[5]} ${this.matrix[6]} ${this.matrix[7]}]`);
        console.log(`[${this.matrix[8]} ${this.matrix[9]} ${this.matrix[10]} ${this.matrix[11]}]`);
        console.log(`[${this.matrix[12]} ${this.matrix[13]} ${this.matrix[14]} ${this.matrix[15]}]`);
    }
}