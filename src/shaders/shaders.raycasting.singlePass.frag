// UNIFORMS
uniform float     uWorldBBox[6];
uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform int       uLut;
uniform sampler2D uTextureLUT;
uniform int       uSteps;
uniform float     uAlphaCorrection;
uniform float     uFrequence;
uniform float     uAmplitude;

// VARYING
varying vec4 vPos;

#pragma glslify: unpack = require('./glsl/shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('./glsl/shaders.texture3DPolyfill.glsl')
#pragma glslify: transformPoint = require('CommonGL/transforms/transformPoint.glsl');
#pragma glslify: intersectBox = require('./glsl/shaders.intersectBox.glsl')


/**
 * Get voxel value given IJK coordinates.
 * Also apply:
 *  - rescale slope/intercept
 *  - window center/width
 */
void getIntensity(in ivec3 dataCoordinates, out float intensity){

  vec4 packedValue = vec4(0., 0., 0., 0.);
  texture3DPolyfill(
    dataCoordinates,
    uDataDimensions,
    uTextureSize,
    uTextureContainer[0],
    uTextureContainer[1],
    uTextureContainer[2],
    uTextureContainer[3],
    uTextureContainer[4],
    uTextureContainer[5],
    uTextureContainer[6],
    uTextureContainer,     // not working on Moto X 2014
    packedValue
    );

  vec4 dataValue = vec4(0., 0., 0., 0.);
  unpack(
    packedValue,
    uBitsAllocated,
    0,
    uNumberOfChannels,
    uPixelType,
    dataValue);

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

void main(void) {
  const int maxSteps = 1024;

  // the ray
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  // the Axe-Aligned B-Box
  vec3 AABBMin = vec3(uWorldBBox[0], uWorldBBox[2], uWorldBBox[4]);
  vec3 AABBMax = vec3(uWorldBBox[1], uWorldBBox[3], uWorldBBox[5]);

  // Intersection ray/bbox
  float tNear, tFar;
  bool intersect = false;
  intersectBox(rayOrigin, rayDirection, AABBMin, AABBMax, tNear, tFar, intersect);
  if (tNear < 0.0) tNear = 0.0;

  // init the ray marching
  float tCurrent = tNear;
  float tStep = (tFar - tNear) / float(uSteps);
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;

  for(int rayStep = 0; rayStep < maxSteps; rayStep++){
    vec3 currentPosition = rayOrigin + rayDirection * tCurrent;
    // some non-linear FUN
    // some occlusion issue to be fixed
    vec3 transformedPosition = transformPoint(currentPosition, uAmplitude, uFrequence);
    // world to data coordinates
    // rounding trick
    // first center of first voxel in data space is CENTERED on (0,0,0)
    vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
    dataCoordinatesRaw += 0.5;
    ivec3 dataCoordinates = ivec3(
      int(floor(dataCoordinatesRaw.x)),
      int(floor(dataCoordinatesRaw.y)),
      int(floor(dataCoordinatesRaw.z)));
    if ( all(greaterThanEqual(dataCoordinates, ivec3(0))) &&
         all(lessThan(dataCoordinates, uDataDimensions))) {
      // mapped intensity, given slope/intercept and window/level
      float intensity = 0.0;
      getIntensity(dataCoordinates, intensity);
      vec4 colorSample;
      float alphaSample;
      if(uLut == 1){
        vec4 colorFromLUT = texture2D( uTextureLUT, vec2( intensity, 1.0) );
        // 256 colors
        colorSample.r = colorFromLUT.r;
        colorSample.g = colorFromLUT.g;
        colorSample.b = colorFromLUT.b;
        alphaSample = colorFromLUT.a;
      }
      else{
        alphaSample = intensity;
        colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
      }

      alphaSample = alphaSample * uAlphaCorrection;
      alphaSample *= (1.0 - accumulatedAlpha);

      accumulatedColor += alphaSample * colorSample;
      accumulatedAlpha += alphaSample;
    }

    tCurrent += tStep;

    if(tCurrent > tFar || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
  return;
}
