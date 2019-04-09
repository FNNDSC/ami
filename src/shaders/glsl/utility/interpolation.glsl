#pragma glslify: interpolationIdentity = require(./interpolationIdentity.glsl)
#pragma glslify: interpolationTrilinear = require(./interpolationTrilinear.glsl)

void interpolation(
    in vec3 currentVoxel,
    in int uTextureSize,
    in ivec3 uDataDimensions,
    in int uDataDimensions,
    in sampler2D[] uTextureContainer,
    in int uBitsAllocated,
    in int uNumberOfChannels,
    in int uInterpolation,
    out vec4 dataValueAcc,
    out vec3 gradient
) {
    if (uInterpolation == 0) {
        interpolationIdentity(
            currentVoxel,
            uTextureSize,
            uDataDimensions,
            uDataDimensions,
            uTextureContainer,
            uBitsAllocated,
            uNumberOfChannels,
            dataValueAcc
        );
    }
    else {
        interpolationTrilinear(
            currentVoxel,
            uTextureSize,
            uDataDimensions,
            uDataDimensions,
            uTextureContainer,
            uBitsAllocated,
            uNumberOfChannels,
            dataValueAcc,
            gradient
        );
    }
}

#pragma glslify: export(interpolation)