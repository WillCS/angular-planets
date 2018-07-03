attribute vec4 a_position;
attribute vec4 a_colour;
attribute vec4 a_normal;
 
uniform mat4 u_matrix;
 
varying vec4 v_colour;
varying vec4 v_normal;
 
void main() {
  gl_Position = u_matrix * a_position;
 
  v_colour = a_colour;
  v_normal = a_normal;
}