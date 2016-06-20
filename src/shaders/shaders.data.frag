uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform int       uInvert;
uniform int       uInterpolation;

// hack because can not pass arrays if too big
// best would be to pass texture but have to deal with 16bits
uniform int       uLut;
uniform sampler2D uTextureLUT;

varying vec4      vPos;

// include functions
#pragma glslify: value = require('./glsl/shaders.value.glsl')

void main(void) {

  // get texture coordinates of current pixel
  vec4 dataCoordinates = uWorldToData * vPos;
  vec3 currentVoxel = vec3(dataCoordinates.x, dataCoordinates.y, dataCoordinates.z);
  int kernelSize = 2;
  vec4 dataValue = vec4(0., 0., 0., 0.);
  value(
    currentVoxel,
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
    dataValue
  );

  // how do we deal wil more than 1 channel?
  if(uNumberOfChannels == 1){
    float intensity = dataValue.r;

    // rescale/slope
    intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];

    float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
    float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
    intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];

    dataValue.r = dataValue.g = dataValue.b = intensity;
  }

  // Apply LUT table...
  //
  if(uLut == 1){
    // should opacity be grabbed there?
    dataValue = texture2D( uTextureLUT, vec2( dataValue.r , 1.0) );
  }

  if(uInvert == 1){
    dataValue = vec4(1.) - dataValue;
    // how do we deal with that and opacity?
    dataValue.a = 1.;
  }

  gl_FragColor = dataValue;

}