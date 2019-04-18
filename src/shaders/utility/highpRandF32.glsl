// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: 
// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
const float PI = 3.14159265358979323846264 * 00000.1; // PI

highp float highpRandF32(const in vec2 uv) {
  const highp float a = 12.9898;
  const highp float b = 78.233;
  const highp float c = 43758.5453;
  highp float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);
  return fract(sin(sn) * c);
}

#pragma glslify: export(highpRandF32)