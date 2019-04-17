#pragma glslify: interpolation = require(./interpolation.glsl)

void getIntensity(
    in vec3 dataCoordinates, 
    out float intensity, 
    out vec3 gradient
){

  vec4 dataValue = vec4(0., 0., 0., 0.);

  interpolation(
    uPixelType,
    dataCoordinates,
    uTextureSize,
    uDataDimensions,
    uTextureContainer,
    uBitsAllocated,
    uNumberOfChannels,
    uInterpolation,
    uPackedPerPixel,
    dataValue,
    gradient
  );

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

#pragma glslify: export(getIntensity)