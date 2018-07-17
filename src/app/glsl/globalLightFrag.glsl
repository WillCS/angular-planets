precision mediump float;

#define MAX_LIGHTS 8

varying vec3 fragColour;
varying vec3 fragNorm;
varying vec3 fragPos;

varying vec3 fragAmbientColour;
varying float fragSpecularReflection;
varying float fragDiffuseReflection;
varying float fragAmbientReflection;
varying float fragShininess;

uniform vec3 cameraPos;

uniform vec3 globalAmbient;

struct lightSource {
    vec3 specularColour;
    vec3 diffuseColour;
    vec3 position;
    float attenuation;
};

uniform lightSource lights[MAX_LIGHTS];

/** Ambient map */
vec3 getAmbientColour() {
    return fragAmbientColour;
}

/** Reflection map */
float getSpecularReflection() {
    return fragSpecularReflection;
}

float getDiffuseReflection() {
    return fragDiffuseReflection;
}

float getAmbientReflection() {
    return fragAmbientReflection;
}

float getShininess() {
    return fragShininess;
}

void main() {
    vec3 lightColour = getAmbientColour() + getAmbientReflection() * globalAmbient
;
    for(int i = 0; i < MAX_LIGHTS; i++) {
        lightSource light = lights[i];

        vec3 lightDir = normalize(light.position - fragPos);

        float diffuseDot = dot(lightDir, fragNorm);

        if(diffuseDot > 0.0) {
            lightColour += getDiffuseReflection() * diffuseDot * light.diffuseColour;

            vec3 viewDir = normalize(cameraPos - fragPos);
            vec3 halfwayDir = normalize(lightDir + viewDir);
            float specularDot = dot(fragNorm, halfwayDir);

            if(specularDot > 0.0) {
                lightColour += getSpecularReflection() * pow(diffuseDot, getShininess()) * light.specularColour;
            }
        }
    }

    gl_FragColor = vec4(fragColour * lightColour, 1);
}