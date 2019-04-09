#version 100

uniform vec2 viewResolution;

void main() {
    vec2 screenPos = (gl_Vertex.xy / viewResolution) * 2.0 - vec2(1.0, 1.0);
    gl_Position = vec4(screenPos, 0.0, 1.0);
}