import { Colour3 } from "./colour";

export class Material {
    public constructor(public ambientColour: Colour3, public ambientReflection: number, 
            public specularReflection: number, public diffuseReflection: number,
            public shininess: number) {

    }
}