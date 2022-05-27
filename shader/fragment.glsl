float PI = 3.1415926538979238;
uniform float time;
uniform float progress;
uniform sampler2D tex;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  gl_FragColor = vec4(vUv, 0.0, 1.0);
}
