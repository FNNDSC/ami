#version 300 es

#pragma glslify: intersectionProjection = require(../utility/intersectionProjection.glsl)

uniform float uCanvasWidth;
uniform float uCanvasHeight;
uniform vec4 uSlice;
uniform vec4 uPlane1;
uniform vec3 uPlaneColor1;
uniform vec4 uPlane2;
uniform vec3 uPlaneColor2;
uniform vec4 uPlane3;
uniform vec3 uPlaneColor3;

in vec4 vPos;
in mat4 vProjectionViewMatrix;
in vec4 vProjectedCoords;

out vec4 fragColour;

void main(void) {
  vec4 c1 = vec4(0., 0., 0., 0.);
  vec4 c2 = vec4(0., 0., 0., 0.);
  vec4 c3 = vec4(0., 0., 0., 0.);

  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  // localizer #1
  // must be normalized!
  if(length(uPlane1.xyz) > 0.5) {
    vec3 projection1 = vec3(1.);
    intersectionProjection(
      uPlane1,
      uSlice,
      projection1
    );

    vec4 projInter1 = (vProjectionViewMatrix * vec4(projection1, 1.));
    vec3 ndc1 = projInter1.xyz / projInter1.w;
    vec2 screenSpace1 = (ndc1.xy * .5 + .5) * vec2(uCanvasWidth, uCanvasHeight);

    float d1 = distance(gl_FragCoord.xy, screenSpace1.xy);
    c1 = vec4(uPlaneColor1, 1. - smoothstep(.5, .7, d1));
  }

  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  // localizer #2
  if(length(uPlane2.xyz) > 0.5) {
    vec3 projection2 = vec3(1.);
    intersectionProjection(
      uPlane2,
      uSlice,
      projection2
    );

    vec4 projInter2 = (vProjectionViewMatrix * vec4(projection2, 1.));
    vec3 ndc2 = projInter2.xyz / projInter2.w;
    vec2 screenSpace2 = (ndc2.xy * .5 + .5) * vec2(uCanvasWidth, uCanvasHeight);

    float d2 = distance(gl_FragCoord.xy, screenSpace2.xy);
    c2 = vec4(uPlaneColor2, 1. - smoothstep(.5, .7, d2));
  }

  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  // localizer #3
  if(length(uPlane3.xyz) > 0.5) {
    vec3 projection3 = vec3(1.);
    intersectionProjection(
      uPlane3,
      uSlice,
      projection3
    );

    vec4 projInter3 = (vProjectionViewMatrix * vec4(projection3, 1.));
    vec3 ndc3 = projInter3.xyz / projInter3.w;
    vec2 screenSpace3 = (ndc3.xy * .5 + .5) * vec2(uCanvasWidth, uCanvasHeight);

    float d3 = distance(gl_FragCoord.xy, screenSpace3.xy);
    c3 = vec4(uPlaneColor3, 1. - smoothstep(.5, .7, d3));
  }

  vec3 colorMix = c1.xyz*c1.w + c2.xyz*c2.w + c3.xyz*c3.w;
  fragColour; = vec4(colorMix, max(max(c1.w, c2.w),c3.w)*0.5);
  return;
}