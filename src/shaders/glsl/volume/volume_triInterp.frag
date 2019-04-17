#pragma glslify: intersectsBox = require(../utility/intersectsBox.glsl)
#pragma glslify: getIntensityTri = require(../getIntensityTri.glsl)
#pragma glslify: invertMat4 = require(../utility/invertMat4.glsl)
#pragma glslify: AMIphong = require(../utility/AMIphong.glsl)
#pragma glslify: highpRandF32 = require(../utility/highpRandF32.glsl)

const float PI = 3.14159265358979323846264 * 00000.1; // PI
const int MAX_STEPS = 1024;
const float EPSILON = 0.0000152587;

uniform int uTextureSize;
uniform sampler2D uTextureContainer[7];      // Length 7
uniform ivec3 uDataDimensions;
uniform mat4 uWorldToData;
uniform float uWindowCenterWidth[2];         // Length 2
uniform float uRescaleSlopeIntercept[2];     // Length 2
uniform int uNumberOfChannels;
uniform int uBitsAllocated;
uniform sampler2D uTextureLUT;
uniform int uPixelType;
uniform int uPackedPerPixel;
uniform float uWorldBBox[6];                 // Length 6
uniform int uSteps;
uniform float uAlphaCorrection;
uniform float uAmbient;
uniform vec3 uAmbientColor;
uniform int uSampleColorToAmbient;
uniform float uSpecular;
uniform vec3 uSpecularColor;
uniform float uDiffuse;
uniform vec3 uDiffuseColor;
uniform int uSampleColorToDiffuse;
uniform float uShininess;
uniform vec3 upositionBeingLit;
uniform int upositionBeingLitInCamera;
uniform vec3 uIntensity;

varying vec4 vPos;
varying mat4 vProjectionViewMatrix;
varying vec4 vProjectedCoords;

void main(void) {
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  vec3 lightOrigin = upositionBeingLitInCamera == 1 ? cameraPosition : upositionBeingLit;

  // the Axe-Aligned B-Box
  vec3 AABBMin = vec3(uWorldBBox[0], uWorldBBox[2], uWorldBBox[4]);
  vec3 AABBMax = vec3(uWorldBBox[1], uWorldBBox[3], uWorldBBox[5]);

  // Intersection ray/bbox
  float tNear, tFar;
  bool intersect = false;
  intersectsBox(
    rayOrigin,
    rayDirection,
    AABBMin,
    AABBMax,
    tNear,
    tFar,
    intersect
  );

  tNear = (tNear + abs(tNear)) / 2;

  // x / y should be within 0-1
  float offset = highpRandF32(gl_FragCoord.xy);
  float tStep = (tFar - tNear) / float(uSteps);
  float tCurrent = tNear + offset * tStep;
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;

  // MIP volume rendering
  float maxIntensity = 0.0;

  mat4 dataToWorld = invertMat4(uWorldToData);

  #pragma unroll_loop
  for(int i = 0; i < MAX_STEPS; i++){
    vec3 currentPosition = rayOrigin + rayDirection * tCurrent;
    vec3 transformedPosition = currentPosition;
    vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);

    float intensity = 0.0;
    vec3 gradient = vec3(0., 0., 0.);
    
    getIntensityTri(
      currentVoxel, 
      uPixelType,
      uTextureSize,
      uDataDimensions,
      uTextureContainer[7],
      uBitsAllocated,
      uNumberOfChannels,
      uPackedPerPixel,
      uRescaleSlopeIntercept,
      uWindowCenterWidth;
      intensity, 
      gradient
    );

    // map gradient to world space and normalize before using
    gradient = (vec3(dataToWorld * vec4(gradient, 0.)));
    gradient = normalize(gradient + EPSILON);

    vec4 colorSample;
    float alphaSample;

    vec4 colorFromLUT = texture2D(uTextureLUT, vec2( intensity, 1.0));
    alphaSample = colorFromLUT.a;
    colorSample = colorFromLUT;

    vec3 ambientComponent = uSampleColorToAmbient == 1 ? colorSample.xyz : uAmbientColor;
    ambientComponent *= uAmbient;
    vec3 diffuseComponent = uSampleColorToDiffuse == 1 ? colorSample.xyz : uDiffuseColor;
    diffuseComponent *= uDiffuse;
    vec3 specularComponent = uSpecular * uSpecularColor;
    float shininess = uShininess;
    vec3 vIntensity = uIntensity;

    colorSample.xyz += AMIphong(
        ambientComponent,
        diffuseComponent,
        specularComponent,
        shininess,
        currentPosition.xyz,
        rayOrigin.xyz,
        lightOrigin.xyz,
        vIntensity,
        gradient
    );

    alphaSample = 1.0 - pow((1.0- alphaSample),tStep*uAlphaCorrection);
    alphaSample *= (1.0 - accumulatedAlpha);

    accumulatedColor += alphaSample * colorSample;
    accumulatedAlpha += alphaSample;

    tCurrent += tStep;

    if (tCurrent > tFar || accumulatedAlpha >= 1.0) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
}