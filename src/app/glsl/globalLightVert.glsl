precision mediump float;

attribute vec4 vertexPos;
attribute vec4 vertexColour;
attribute vec4 vertexNorm;
attribute vec4 vertexReflection;
attribute vec4 vertexAmbient;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 fragColour;
varying vec3 fragNorm;
varying vec3 fragPos;

varying vec3 fragAmbientColour;
varying float fragSpecularReflection;
varying float fragDiffuseReflection;
varying float fragAmbientReflection;
varying float fragShininess;

void main() {
    vec4 pos = model * vertexPos;
    gl_Position = projection * view * pos;

    fragColour = vec3(vertexColour);
    fragNorm = mat3(model) * vec3(vertexNorm);
    fragPos = vec3(pos);

    fragAmbientColour = vec3(vertexAmbient);
    fragAmbientReflection = vertexReflection.r;
    fragDiffuseReflection = vertexReflection.g;
    fragSpecularReflection = vertexReflection.b;
    fragShininess = vertexReflection.a;
}