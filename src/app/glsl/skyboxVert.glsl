attribute vec3 vertexPos;

varying vec3 texCoords;

uniform mat4 projection;
uniform mat4 view;

void main() {
    texCoords = vertexPos;
    gl_Position = (projection * mat4(mat3(view)) * (vec4(vertexPos, 1.0))).xyww;
}