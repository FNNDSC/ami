#pragma glslify: interpolationTrilinear = require(../utility/interpolationTrilinear.glsl)

void getIntensityTri(
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
    out vec3 gradient
){

  vec4 dataValue = vec4(0., 0., 0., 0.);

  interpolationTrilinear(
    uPixelType,
    dataCoordinates,
    uTextureSize,
    uDataDimensions,
    uTextureContainer,
    uBitsAllocated,
    uNumberOfChannels,
    1,
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

#pragma glslify: export(getIntensityTri)