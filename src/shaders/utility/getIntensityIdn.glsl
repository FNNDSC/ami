#pragma glslify: interpolationIdentity = require(./interpolationIdentity.glsl)

void getIntensityIdn(
    in vec3 dataCoordinates, 
    in int uPixelType,
    in int uTextureSize,
    in ivec3 uDataDimensions,
    in sampler2D uTextureContainer[7],
    in int uBitsAllocated,
    in int uNumberOfChannels,
    in int uPackedPerPixel,
    in float uRescaleSlopeIntercept[2],
    in float uWindowCenterWidth[2],
    out float intensity, 
){

  vec4 dataValue = vec4(0., 0., 0., 0.);

  interpolationIdentity(
    uPixelType,
    dataCoordinates,
    uTextureSize,
    uDataDimensions,
    uTextureContainer[7],
    uBitsAllocated,
    uNumberOfChannels,
    0,
    uPackedPerPixel,
    dataValue
  );

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

#pragma glslify: export(getIntensityIdn)