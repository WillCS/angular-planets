import { Colour3 } from "./colour";
import { Vec3 } from "../math/vector";

export interface LightSource {
    readonly lightSpecularColour: Colour3;
    readonly lightDiffuseColour: Colour3;
    readonly lightPosition: Vec3;
    readonly lightAttenuation: number;
}
