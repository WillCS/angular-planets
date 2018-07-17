export class Colour3 {
    private constructor(public readonly r: number, public readonly g: number, public readonly b: number) {

    }

    public toArray(): number[] {
        return [this.r, this.g, this.b];
    }

    public toUint8Array(): Uint8Array {
        return new Uint8Array(this.toArray());
    }

    public static normal(r: number, g: number, b: number): Colour3 {
        return new Colour3(r, g, b);
    }

    public static normalArray(n: number[]): Colour3 {
        return Colour3.normal(n[0], n[1], n[2]);
    }

    public static eightBit(r: number, g: number, b: number): Colour3 {
        return new Colour3(r / 255, g / 255, b / 255);
    }

    public static eightBitArray(n: number[]): Colour3 {
        return Colour3.eightBit(n[0], n[1], n[2]);
    }

    public static fromColour4(colour: Colour4): Colour3 {
        return Colour3.normalArray(colour.toArray());
    }
}

export class Colour4 {
    private constructor(private r: number, private g: number, private b: number, private a: number) {

    }

    public toArray(): number[] {
        return [this.r, this.g, this.b, this.a];
    }

    public toUint8Array(): Uint8Array {
        return new Uint8Array(this.toArray());
    }

    public static normal(r: number, g: number, b: number, a: number): Colour4 {
        return new Colour4(r, g, b, a);
    }

    public static normalArray(n: number[]): Colour4 {
        return Colour4.normal(n[0], n[1], n[2], n[3]);
    }

    public static eightBit(r: number, g: number, b: number, a: number): Colour4 {
        return new Colour4(r / 255, g / 255, b / 255, a / 255);
    }

    public static eightBitArray(n: number[]): Colour4 {
        return Colour4.eightBit(n[0], n[1], n[2], n[3]);
    }

    public static fromColour3(colour: Colour3): Colour4 {
        let array: number[] = colour.toArray();
        array.push(1);
        return Colour4.normalArray(array);
    }
}
