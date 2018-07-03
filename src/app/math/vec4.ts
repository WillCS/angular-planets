export class Vec4 {
    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;
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
    
    public set w(value: number) {
        this._w = value;
        this.lengthChanged = true;
    }

    public get w(): number {
        return this._w;
    }

    public constructor(x: number, y: number, z: number, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public multiply(n: number): Vec4 {
        return new Vec4(this.x * n, this.y * n, this.z * n, this.w * n);
    }

    public divide(n : number): Vec4 {
        return new Vec4(this.x / n, this.y / n, this.z / n, this.w / n);
    }

    public add(v: Vec4): Vec4 {
        return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    public subtract(v: Vec4): Vec4 {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    public dot(v: Vec4): number {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
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

    public normalize(): Vec4 {
        return this.divide(this.length);
    }
    
    public negate(): Vec4 {
        return this.multiply(-1);
    }

    public toArray(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    public static fromArray(vec: number[]): Vec4 {
        return new Vec4(vec[0], vec[1], vec[2], vec[3]);
    }
}