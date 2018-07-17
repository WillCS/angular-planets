import { Colour3 } from "./colour";
import { Vec3 } from "../math/vector";

export interface LightSource {
    getSpecularColour(): Colour3;
    getDiffuseColour(): Colour3;
    getLightPosition(): Vec3;
    getLightAttenuation(): number;
}
