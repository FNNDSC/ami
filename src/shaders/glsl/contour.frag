#pragma glslify: luma = require(./utility/luma.glsl)

const float T = 0.04;
const float M = 1.0;
const float L = 0.002;

uniform float uCanvasWidth;
uniform float uCanvasHeight;
uniform float uWidth;
uniform float uOpacity;
uniform sampler2D uTextureFilled;

varying vec4 vPos;
varying mat4 vProjectionViewMatrix;
varying vec4 vProjectedCoords;

void main(void) {

  vec2 texCoord = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  float borderWidth = uWidth; // in px
  float step_u = borderWidth * 1.0 / uCanvasWidth;
  float step_v = borderWidth * 1.0 / uCanvasHeight;
  vec4 centerPixel = texture2D(uTextureFilled, texCoord);

  vec4 rightPixel  = texture2D(uTextureFilled, texCoord + vec2(step_u, 0.0));
  vec4 bottomPixel = texture2D(uTextureFilled, texCoord + vec2(0.0, step_v));

  // now manually compute the derivatives
  float _dFdX = length(rightPixel - centerPixel) / step_u;
  float _dFdY = length(bottomPixel - centerPixel) / step_v;

  gl_FragColor.r = max(max(centerPixel.r, rightPixel.r), bottomPixel.r);
  gl_FragColor.g = max(max(centerPixel.g, rightPixel.g), bottomPixel.g);
  gl_FragColor.b = max(max(centerPixel.b, rightPixel.b), bottomPixel.b);
  float maxDerivative = max(_dFdX, _dFdY);
  float clampedDerivative = clamp(maxDerivative, 0., 1.);
  gl_FragColor.a = uOpacity * clampedDerivative;

  return;
}