attribute vec4 vertexPos;
attribute vec4 vertexColour;
attribute vec4 vertexNorm;
 
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 fragColour;
varying vec4 fragNorm;
 
void main() {
  gl_Position = projection * view * model * vertexPos;
 
  fragColour = vertexColour;
  fragNorm = vertexNorm;
}