import { Vec3 } from "../math/vector";
import { Mat4 } from "../math/matrix";

export class Orbit {
    private semiMinorAxis: number;
    private epoch: number;
    private _transform: Mat4;
    private anomaly: number;

    constructor(private eccentricity: number, private semiMajorAxis: number,
            private inclination: number, private longOfAscendingNode: number, 
            private argOfPeriapsis: number, private trueAnomaly: (epoch: number) => number) {
        this.semiMinorAxis = this.semiMajorAxis * Math.sqrt(1 - Math.pow(this.eccentricity, 2));
        this.setEpoch(0);
    }

    public update(): void {
        this.setEpoch(this.epoch + 0.001);
    }

    public get eulerAngles(): Vec3 {
        return new Vec3(this.longOfAscendingNode, this.argOfPeriapsis, this.inclination);
    }

    public get transform(): Mat4 {
        return this._transform;
    }

    public setEpoch(value: number): void {
        this.epoch = value;
        this.anomaly = this.trueAnomaly(this.epoch);
        let major: number = this.semiMajorAxis * Math.cos(this.anomaly);
        let minor: number = this.semiMinorAxis * Math.sin(this.anomaly);
        this._transform = Mat4.fromEulerAnglesVec(this.eulerAngles);
        this._transform = this._transform.translate(major, 0, minor);
    }

    public static circular(radius: number, inclination: number, longOfAscendingNode: number,
            argOfPeriapsis: number, trueAnomaly: (epoch: number) => number): Orbit {
        return new Orbit(0, radius, inclination, longOfAscendingNode, argOfPeriapsis, trueAnomaly);
    }
}
