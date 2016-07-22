uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform float     uWorldBBox[6];
uniform sampler2D uTextureBack;
uniform int       uSteps;
uniform int       uLut;
uniform sampler2D uTextureLUT;
uniform float     uAlphaCorrection;
uniform float     uFrequence;
uniform float     uAmplitude;
uniform int       uInterpolation;
uniform int       uPackedPerPixel;

varying vec4      vPos;
varying vec4      vProjectedCoords;

// include functions
#pragma glslify: value = require('./glsl/shaders.value.glsl')
#pragma glslify: transformPoint = require('CommonGL/transforms/transformPoint.glsl');

void getIntensity(in vec3 dataCoordinates, out float intensity){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  int kernelSize = 2;
  value(
    dataCoordinates,
    kernelSize,
    uInterpolation,
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
    uBitsAllocated,
    uNumberOfChannels,
    uPixelType,
    uPackedPerPixel,
    dataValue
  );
  
  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  // float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

void main(void) {
  const int maxSteps = 1024;

  //
  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );
  //The back position is the world space position stored in the texture.
  vec3 backPosNormalized = texture2D(uTextureBack, texc).xyz;
  //
  vec3 backPos = vec3(backPosNormalized.x * (uWorldBBox[1] - uWorldBBox[0]) + uWorldBBox[0],
                     backPosNormalized.y * (uWorldBBox[3] - uWorldBBox[2]) + uWorldBBox[2],
                     backPosNormalized.z * (uWorldBBox[5] - uWorldBBox[4]) + uWorldBBox[4]);
  vec3 frontPos = vec3(vPos.x, vPos.y, vPos.z);

  // init the ray
  vec3 rayDir = backPos - frontPos;
  float rayLength = length(rayDir);

  // init the delta
  float delta = 1.0 / float(uSteps);
  vec3  deltaDirection = rayDir * delta;
  float deltaDirectionLength = length(deltaDirection);

  // init the ray marching
  vec3 currentPosition = frontPos;
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;
  float accumulatedLength = 0.0;

  // color and alpha at intersection
  vec4 colorSample;
  float alphaSample;
  float gradientLPS = 1.;
  for(int rayStep = 0; rayStep < maxSteps; rayStep++){

    // get data value at given location
    // need a function/polyfill to hide it

    // get texture coordinates of current pixel
    // doesn't need that in theory
    vec3 currentPosition2 = transformPoint(currentPosition, uAmplitude, uFrequence);
    vec4 currentPos4 = vec4(currentPosition2, 1.0);

    vec4 dataCoordinatesRaw = uWorldToData * currentPos4;
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);

    if ( all(greaterThanEqual(currentVoxel, vec3(0.0))) &&
         all(lessThan(currentVoxel, vec3(float(uDataDimensions.x), float(uDataDimensions.y), float(uDataDimensions.z))))) {
      
      float intensity = 0.0;
      getIntensity(currentVoxel, intensity);

      if(uLut == 1){
        vec4 test = texture2D( uTextureLUT, vec2( intensity, 1.0) );
        // 256 colors
        colorSample.r = test.r;//test.a;
        colorSample.g = test.g;//test.a;
        colorSample.b = test.b;///test.a;
        alphaSample = test.a;

      }
      else{
        alphaSample = intensity;
        colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
      }

      alphaSample = alphaSample * uAlphaCorrection;
      alphaSample *= (1.0 - accumulatedAlpha);

      // we have the intensity now
      // colorSample.x = colorSample.y = colorSample.z = intensity;
      // use a dummy alpha for now
      // alphaSample = intensity;
      // if(alphaSample < 0.15){
      //   alphaSample = 0.;
      // }

      //Perform the composition.
      // (1.0 - accumulatedAlpha) *
      accumulatedColor += alphaSample * colorSample;// * alphaSample;

      //Store the alpha accumulated so far.
      accumulatedAlpha += alphaSample;
      // accumulatedAlpha += 1.0;

    }

    //Advance the ray.
    currentPosition += deltaDirection;
    accumulatedLength += deltaDirectionLength;

    if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
}