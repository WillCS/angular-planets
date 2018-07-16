attribute vec3 a_pos;

varying vec3 texCoords;

uniform mat4 projection;
uniform mat4 view;

void main() {
    texCoords = a_pos;
    gl_Position = (projection * mat4(mat3(view)) * (vec4(a_pos, 1.0))).xyww;
}