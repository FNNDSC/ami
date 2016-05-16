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

varying vec4      vPos;
varying vec4      vProjectedCoords;

// include functions
#pragma glslify: unpack = require('./glsl/shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('./glsl/shaders.texture3DPolyfill.glsl')
#pragma glslify: transformPoint = require('CommonGL/transforms/transformPoint.glsl');

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
    // rounding trick
    // first center of first voxel in data space is CENTERED on (0,0,0)
    dataCoordinatesRaw += 0.5;
    ivec3 dataCoordinates = ivec3(int(floor(dataCoordinatesRaw.x)), int(floor(dataCoordinatesRaw.y)), int(floor(dataCoordinatesRaw.z)));

    if ( all(greaterThanEqual(dataCoordinates, ivec3(0))) &&
         all(lessThan(dataCoordinates, uDataDimensions))) {
      float intensity = 0.0;
      getIntensity(dataCoordinates, intensity);

      // compute gradient
      // // vec4 sP00lps = currentPos4 + vec4(gradientLPS, 0, 0, 0);
      // // vec4 sP00ijkRaw = uWorldToData * sP00lps;
      // // sP00ijkRaw += 0.5;
      // // ivec3 sP00ijk = ivec3(int(floor(sP00ijkRaw.x)), int(floor(sP00ijkRaw.y)), int(floor(sP00ijkRaw.z)));
      // ivec3 sP00ijk = dataCoordinates + ivec3(gradientLPS, 0, 0);
      // float sP00 = getIntensity(sP00ijk);

      // // vec4 sN00lps = currentPos4 - vec4(gradientLPS, 0, 0, 0);
      // // vec4 sN00ijkRaw = uWorldToData * sN00lps;
      // // sN00ijkRaw += 0.5;
      // // ivec3 sN00ijk = ivec3(int(floor(sN00ijkRaw.x)), int(floor(sN00ijkRaw.y)), int(floor(sN00ijkRaw.z)));
      // ivec3 sN00ijk = dataCoordinates - ivec3(gradientLPS, 0, 0);
      // float sN00 = getIntensity(sN00ijk);

      // // vec4 s0P0lps = currentPos4 + vec4(0, gradientLPS, 0, 0);
      // // vec4 s0P0ijkRaw = uWorldToData * s0P0lps;
      // // s0P0ijkRaw += 0.5;
      // // ivec3 s0P0ijk = ivec3(int(floor(s0P0ijkRaw.x)), int(floor(s0P0ijkRaw.y)), int(floor(s0P0ijkRaw.z)));
      // ivec3 s0P0ijk = dataCoordinates + ivec3(0, gradientLPS, 0);
      // float s0P0 = getIntensity(s0P0ijk);

      // // vec4 s0N0lps = currentPos4 - vec4(0, gradientLPS, 0, 0);
      // // vec4 s0N0ijkRaw = uWorldToData * s0N0lps;
      // // s0N0ijkRaw += 0.5;
      // // ivec3 s0N0ijk = ivec3(int(floor(s0N0ijkRaw.x)), int(floor(s0N0ijkRaw.y)), int(floor(s0N0ijkRaw.z)));
      // ivec3 s0N0ijk = dataCoordinates - ivec3(0, gradientLPS, 0);
      // float s0N0 = getIntensity(s0N0ijk);

      // // vec4 s00Plps = currentPos4 + vec4(0, 0, gradientLPS, 0);
      // // vec4 s00PijkRaw = uWorldToData * s00Plps;
      // // s00PijkRaw += 0.5;
      // // ivec3 s00Pijk = ivec3(int(floor(s00PijkRaw.x)), int(floor(s00PijkRaw.y)), int(floor(s00PijkRaw.z)));
      // ivec3 s00Pijk  = dataCoordinates + ivec3(0, 0, gradientLPS);
      // float s00P = getIntensity(s00Pijk);

      // // vec4 s00Nlps = currentPos4 - vec4(0, 0, gradientLPS, 0);
      // // vec4 s00NijkRaw = uWorldToData * s00Nlps;
      // // s00NijkRaw += 0.5;
      // // ivec3 s00Nijk = ivec3(int(floor(s00NijkRaw.x)), int(floor(s00NijkRaw.y)), int(floor(s00NijkRaw.z)));
      // ivec3 s00Nijk  = dataCoordinates - ivec3(0, 0, gradientLPS);
      // float s00N = getIntensity(s00Nijk);

      // // gradient in IJK space
      // vec3 gradient = vec3( (sP00-sN00), (s0P0-s0N0), (s00P-s00N));
      // float gradientMagnitude = length(gradient);
      // // back to LPS


      // vec3 normal = -1. * normalize(gradient);

      // float dotP = dot(deltaDirection, gradient);

      // float sN00 = textureSampleDenormalized(volumeSampler, stpPoint - vec3(gradientSize,0,0));
      // float s0P0 = textureSampleDenormalized(volumeSampler, stpPoint + vec3(0,gradientSize,0));
      // float s0N0 = textureSampleDenormalized(volumeSampler, stpPoint - vec3(0,gradientSize,0));
      // float s00P = textureSampleDenormalized(volumeSampler, stpPoint + vec3(0,0,gradientSize));
      // float s00N = textureSampleDenormalized(volumeSampler, stpPoint - vec3(0,0,gradientSize));

      if(uLut == 1){
        vec4 test = texture2D( uTextureLUT, vec2( intensity, 1.0) );
        // 256 colors
        colorSample.r = test.r;//test.a;
        colorSample.g = test.g;//test.a;
        colorSample.b = test.b;///test.a;
        alphaSample = test.a;

//         if(abs(intensity - test.a) > .5){
// colorSample.r = 1.;
//         colorSample.g = 0.;
//         colorSample.b = 0.;
//         }
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

//       if(accumulatedColor.y > .2){
// accumulatedColor.y = accumulatedColor.z = 0.;
//       }
      // accumulatedColor = vec4((currentPosition.x - uWorldBBox[0])/(uWorldBBox[1] - uWorldBBox[0]),
      //                (currentPosition.y - uWorldBBox[2])/(uWorldBBox[3] - uWorldBBox[2]),
      //                (currentPosition.z - uWorldBBox[4])/(uWorldBBox[5] - uWorldBBox[4]),
      //                1.0);
      //Store the alpha accumulated so far.
      accumulatedAlpha += alphaSample;
      // accumulatedAlpha += 1.0;

    }

    //Advance the ray.
    currentPosition += deltaDirection;
    accumulatedLength += deltaDirectionLength;

    if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 ) break;
  }

  // debugging stuff...
  // gl_FragColor = accumulatedColor;
  // vec4 fn = vec4((frontPos.x - uWorldBBox[0])/(uWorldBBox[1] - uWorldBBox[0]),
  //                     (frontPos.y - uWorldBBox[2])/(uWorldBBox[3] - uWorldBBox[2]),
  //                     (frontPos.z - uWorldBBox[4])/(uWorldBBox[5] - uWorldBBox[4]),
  //                     0.0);
  // gl_FragColor = fn;

  // vec4 bn = vec4((backPos.x - uWorldBBox[0])/(uWorldBBox[1] - uWorldBBox[0]),
  //                     (backPos.y - uWorldBBox[2])/(uWorldBBox[3] - uWorldBBox[2]),
  //                     (backPos.z - uWorldBBox[4])/(uWorldBBox[5] - uWorldBBox[4]),
  //                     1.0);
  // gl_FragColor = bn;

  // gl_FragColor = bn - fn;
  // gl_FragColor = vec4(dirN, 1.);
  // gl_FragColor = vec4(currentPosition.x, currentPosition.y, 1., 1.);
  // gl_FragColor = vec4(1. - dirN, 1.0);
  // gl_FragColor = vec4((currentPosition.x - uWorldBBox[0])/(uWorldBBox[1] - uWorldBBox[0]),
  //                     (currentPosition.y - uWorldBBox[2])/(uWorldBBox[3] - uWorldBBox[2]),
  //                     (currentPosition.z - uWorldBBox[4])/(uWorldBBox[5] - uWorldBBox[4]),
  //                     1.0);

  // if(accumulatedAlpha < 0.1){
  //   discard;
  // }
  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
}