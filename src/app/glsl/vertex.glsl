attribute vec4 a_position;
attribute vec4 a_colour;
 
uniform mat4 u_matrix;
 
varying vec4 v_colour;
 
void main() {
  gl_Position = u_matrix * a_position;
 
  v_colour = a_colour;
}