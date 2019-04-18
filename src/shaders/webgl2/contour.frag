#version 300 es

#pragma glslify: luma = require(../utility/luma.glsl)

const float T = 0.04;
const float M = 1.0;
const float L = 0.002;

uniform float uCanvasWidth;
uniform float uCanvasHeight;
uniform float uWidth;
uniform float uOpacity;
uniform sampler2D uTextureFilled;

in vec4 vPos;
in mat4 vProjectionViewMatrix;
in vec4 vProjectedCoords;

out vec4 fragColour;

void main(void) {

  vec2 texCoord = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  float borderWidth = uWidth; // in px
  float step_u = borderWidth * 1.0 / uCanvasWidth;
  float step_v = borderWidth * 1.0 / uCanvasHeight;
  vec4 centerPixel = texture(uTextureFilled, texCoord);

  vec4 rightPixel  = texture(uTextureFilled, texCoord + vec2(step_u, 0.0));
  vec4 bottomPixel = texture(uTextureFilled, texCoord + vec2(0.0, step_v));

  // now manually compute the derivatives
  float _dFdX = length(rightPixel - centerPixel) / step_u;
  float _dFdY = length(bottomPixel - centerPixel) / step_v;

  fragColour.r = max(max(centerPixel.r, rightPixel.r), bottomPixel.r);
  fragColour.g = max(max(centerPixel.g, rightPixel.g), bottomPixel.g);
  fragColour.b = max(max(centerPixel.b, rightPixel.b), bottomPixel.b);
  float maxDerivative = max(_dFdX, _dFdY);
  float clampedDerivative = clamp(maxDerivative, 0., 1.);
  fragColour.a = uOpacity * clampedDerivative;

  return;
}