#pragma glslify: toUInt32 = require(./toUInt32.glsl)
#pragma glslify: toUFloat32 = require(./toUFloat32.glsl)

void unpack32(
    in vec4 packedData, 
    in int offset, 
    in int uPixelType,
    out vec4 unpackedData
){
    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ----------------------------------------------------------------------------------
    if (uPixelType == 1) {
        toUInt32(
            packedData.r,
            packedData.g,
            packedData.b,
            packedData.a,
            unpackedData.x
        );
    }
    else {
        toUFloat32(
            packedData.r,
            packedData.g,
            packedData.b,
            packedData.a,
            unpackedData.x
        );
    }
}

#pragma glslify: export(unpack32)