float PI = 3.1415926538979238;
uniform float time;
uniform vec2 pixels;
varying vec2 vUv;
varying vec3 vPosition;
attribute float instanceScale;
varying float vScale;

void main() {
  vUv = uv;
  vScale = instanceScale;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
