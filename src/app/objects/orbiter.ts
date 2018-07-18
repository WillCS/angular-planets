import { Vec3 } from "../math/vector";
import { Mat4 } from "../math/mat4";
import { Tickable } from "./tickable";
import { Drawable } from "../graphics/drawable";
import { Listable } from "../listable";

export interface Orbiter extends Tickable, Drawable, Listable {
    readonly orbitEulerAngles: Vec3;
    readonly orbitTransform: Mat4;
}
