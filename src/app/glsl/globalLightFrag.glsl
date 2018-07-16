precision mediump float;

varying vec3 fragColour;
varying vec3 fragNorm;
varying vec3 fragPos;

varying float specularReflection;
varying float diffuseReflection;
varying float ambientReflection;
varying float shininess;

uniform vec3 ambientColour;

struct lightSource {
    vec3 specularColour;
    vec3 diffuseColour;
    vec3 position;
}

uniform lightSource[] lights;
uniform int numLights;

uniform vec3 cameraPos;

void main() {
    vec3 lightColour = ambientReflection * ambientColour;
    for(int i = 0; i < numLights; i++) {
        lightSource light = lights[i];

        vec3 lightDir = normalize(light.position - fragPos);

        float diffuseDot = dot(lightDir, fragNorm);

        if(diffuseDot > 0) {
            lightColour += diffuseReflection * diffuseDot * light.diffuseColour;

            vec3 viewDir = normalize(cameraPos - fragPos);
            vec3 halfwayDir = normalize(lightDir + viewDir);
            float specularDot = dot(fragNorm, halfwayDir);

            if(specularDot > 0) {
                lightColour += specularReflection * pow(diffuseDot, shininess) * light.specularColour;
            }
        }
    }

    gl_FragColor = fragColour * lightColour;
}