attribute vec4 vertexPos;
attribute vec4 vertexColour;
 
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec4 fragColour;
 
void main() {
  gl_Position = projection * view * model * vertexPos;
 
  fragColour = vertexColour;
}
