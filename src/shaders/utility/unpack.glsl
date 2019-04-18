#pragma glslify: unpack8 = require(./unpack8.glsl)
#pragma glslify: unpack16 = require(./unpack16.glsl)
#pragma glslify: unpack32 = require(./unpack32.glsl)
#pragma glslify: unpackIdentity = require(./unpackIdentity.glsl)

void unpack(
    in int uPixelType,
    in int uBitsAllocated,
    in int uNumberOfChannels,
    in vec4 packedData,
    in int offset,
    out vec4 unpackedData
) {
    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ---------------------------------------------------------------------------
    if (uNumberOfChannels == 1) {
        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
        if (uBitsAllocated == 8) {
            unpack8(    
                packedData, 
                offset, 
                unpackedData
            );
            return;
        }
        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
        if (uBitsAllocated == 16) {
            unpack16(    
                packedData, 
                offset, 
                unpackedData
            );
            return;
        }
        // DOES NOT NEED REMOVAL
        // Statically uniform branching condition - cannot cause wavefront divergance
        // ---------------------------------------------------------------------------
        if (uBitsAllocated == 32) {
            unpack32(    
                packedData, 
                offset, 
                uPixelType,
                unpackedData
            );
            return;
        }
    } 

    unpackIdentity(
        packedData, 
        offset, 
        unpackedData
    );
}

#pragma glslify: export(unpack)