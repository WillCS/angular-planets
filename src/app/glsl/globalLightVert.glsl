precision mediump float;

attribute vec4 vertexPos;
attribute vec4 vertexColour;
attribute vec4 vertexNorm;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 fragColour;
varying vec3 fragNorm;
varying vec3 fragPos;

void main() {
    gl_Position = projection * view * model * vertexPos;

    fragColour = vec3(vertexColour);
    fragNorm = mat3(model) * vec3(vertexNorm);
    fragPos = vec3(model * vertexPos);
}
