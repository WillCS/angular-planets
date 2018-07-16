attribute vec4 vertexPos;
attribute vec4 vertexColour;
attribute vec4 vertexNorm;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec4 fragColour;
varying vec4 fragNorm;

void main() {
    vec4 pos = model * vertexPos;
    gl_Position = projection * view * pos;
    fragColour = vertexColour;
    fragNorm = vertexNorm;
    fragPos = vec3(pos);
}