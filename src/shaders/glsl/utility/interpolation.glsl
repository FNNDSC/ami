#pragma glslify: interpolationIdentity = require(./interpolationIdentity.glsl)
#pragma glslify: interpolationTrilinear = require(./interpolationTrilinear.glsl)

void interpolation(
    in int uPixelType,
    in vec3 currentVoxel,
    in int uTextureSize,
    in ivec3 uDataDimensions,
    in sampler2D uTextureContainer[7],
    in int uBitsAllocated,
    in int uNumberOfChannels,
    in int uInterpolation,
    in int uPackedPerPixel,
    out vec4 dataValueAcc,
    out vec3 gradient
) {
    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ----------------------------------------------------------------------------------
    if (uInterpolation == 0) {
        interpolationIdentity(
            uPixelType,
            currentVoxel,
            uTextureSize,
            uDataDimensions,
            uTextureContainer,
            uBitsAllocated,
            uNumberOfChannels,
            uPackedPerPixel,
            dataValueAcc
        );
    }
    else {
        interpolationTrilinear(
            uPixelType,
            currentVoxel,
            uTextureSize,
            uDataDimensions,
            uTextureContainer,
            uBitsAllocated,
            uNumberOfChannels,
            uInterpolation,
            uPackedPerPixel,
            dataValueAcc,
            gradient
        );
    }
}

#pragma glslify: export(interpolation)