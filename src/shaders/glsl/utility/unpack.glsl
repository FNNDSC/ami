#pragma glslify: unpack8 = require(./unpack8.glsl)
#pragma glslify: unpack16 = require(./unpack16.glsl)
#pragma glslify: unpack32 = require(./unpack32.glsl)
#pragma glslify: unpackIdentity = require(./unpackIdentity.glsl)

void unpack(
    in int uBitsAllocated,
    in int uNumberOfChannels,
    in vec4 packedData,
    in int offset,
    out vec4 unpackedData
) {
    if (base.uniforms.uNumberOfChannels.value === 1) {
        switch (uBitsAllocated) {
            case 8:
                upack8(    
                    packedData, 
                    offset, 
                    unpackedData
                );
                break;

            case 16:
                upack16(
                    packedData, 
                    offset, 
                    unpackedData
                );
                break;

            case 32:
                upack32(
                    packedData, 
                    offset, 
                    unpackedData
                );
                break;

            default:
                upackIdentity(
                    packedData, 
                    offset, 
                    unpackedData
                );
                break;
        }
    } else {
        upackIdentity(
            packedData, 
            offset, 
            unpackedData
        );
    }
}

#pragma glslify: export(unpack)