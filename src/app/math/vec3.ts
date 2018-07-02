import { Vec4 } from './vec4';

export class Vec3 {
    private _x: number;
    private _y: number;
    private _z: number;

    private lastLength: number;
    private lengthChanged: boolean;

    public set x(value: number) {
        this.lengthChanged = true;
        this._x = value;
    }

    public get x(): number {
        return this._x;
    }
    
    public set y(value: number) {
        this.lengthChanged = true;
        this._y = value;
    }

    public get y(): number {
        return this._y;
    }
    
    public set z(value: number) {
        this.lengthChanged = true;
        this._z = value;
    }

    public get z(): number {
        return this._z;
    }

    public constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public multiply(n: number): Vec3 {
        return new Vec3(this.x * n, this.y * n, this.z * n);
    }

    public divide(n : number): Vec3 {
        return new Vec3(this.x / n, this.y / n, this.z / n);
    }

    public add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    public subtract(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    public dot(v: Vec3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    public cross(v: Vec3): Vec3 {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.x * v.z - this.z - v.x,
            this.x * v.y - this.y - v.z
        );
    }

    public triple(v1: Vec3, v2: Vec3): Vec3 {
        return this.cross(v1.cross(v2));
    }

    public get lengthSquared(): number {
        return this.dot(this);
    }

    public get length(): number {
        if(this.lengthChanged) {
            this.lastLength = Math.sqrt(this.lengthSquared);
            this.lengthChanged = false;
        } 
        
        return this.lastLength;
    }

    public normalize(): Vec3 {
        return this.divide(this.length);
    }

    public toArray(): number[] {
        return [this.x, this.y, this.z];
    }

    public static fromArray(vec: number[]): Vec3 {
        return new Vec3(vec[0], vec[1], vec[2]);
    }

    public toVec4(): Vec4 {
        return new Vec4(this.x, this.y, this.z, 0);
    }

    public static one(): Vec3 {
        return new Vec3(1, 1, 1);
    }

    public static zero(): Vec3 {
        return new Vec3(0, 0, 0);
    }
}