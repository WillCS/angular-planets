precision mediump float;

#define MAX_LIGHTS 8

varying vec3 fragColour;
varying vec3 fragNorm;
varying vec3 fragPos;

uniform vec3 ambientColour;
uniform float specularReflection;
uniform float diffuseReflection;
uniform float ambientReflection;
uniform float shininess;

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
    return ambientColour;
}

/** Normal map */
vec3 getFragNormal() {
    return fragNorm;
}

/** Texture map */
vec3 getFragColour() {
    return fragColour;
}

/** Reflection map */
float getSpecularReflection() {
    return specularReflection;
}

float getDiffuseReflection() {
    return diffuseReflection;
}

float getAmbientReflection() {
    return ambientReflection;
}

float getShininess() {
    return shininess;
}

void main() {
    vec3 lightColour = getAmbientColour() + getAmbientReflection() * globalAmbient;

    for(int i = 0; i < MAX_LIGHTS; i++) {
        lightSource light = lights[i];

        vec3 normal = normalize(getFragNormal());
        vec3 lightDir = light.position - fragPos;
        float dist = length(lightDir);
        lightDir = normalize(lightDir);

        // DIFFUSE
        float diffusePower = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = getDiffuseReflection() * diffusePower * light.diffuseColour;

        vec3 viewDir = normalize(cameraPos - fragPos);
        vec3 halfwayDir = normalize(lightDir + viewDir);

        // SPECULAR
        float specularPower = pow(max(dot(normal, halfwayDir), 0.0), getShininess());
        vec3 specular = getSpecularReflection() * specularPower * light.specularColour;

        // ATTENUATION
        float attenuation = 1.0;
        if(light.attenuation > 0.0) {
            attenuation = light.attenuation / (dist * dist);
        }
        
        lightColour += (diffuse + specular) * attenuation;
    }

    gl_FragColor = vec4(getFragColour() * lightColour, 1);
}
