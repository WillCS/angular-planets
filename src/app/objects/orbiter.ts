import { Vec3 } from "../math/vector";
import { Mat4 } from "../math/matrix";
import { Tickable } from "./tickable";
import { Drawable } from "../graphics/drawable";
import { Listable } from "../listable";
import { SolidBody } from "../physics/solidBody";

export interface Orbiter extends Tickable, Drawable, Listable, SolidBody {
    readonly orbitEulerAngles: Vec3;
    readonly orbitTransform: Mat4;
}
