float PI = 3.1415926538979238;
uniform float time;
uniform float progress;
uniform sampler2D chars;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vScale;

void main() {
  float size = 66.;
  vec2 newUV = vUv;
  newUV.x = vUv.x / size + floor(vScale * size) / size;
  vec4 charsMap = texture2D(chars, newUV);
  gl_FragColor = vec4(vUv, 0.0, 1.0);
  gl_FragColor = charsMap;
}
