float PI = 3.1415926538979238;
uniform float time;
//uniform vec2pixels;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
