#pragma glslify: toUInt16 = require(./toUInt16.glsl)

void unpack16(
    in vec4 packedData, 
    in int offset, 
    out vec4 unpackedData
){
    unpackedData = packedData;
    float floatedOffset = float(offset);

    toUInt16(
        packedData.r * (1. - floatedOffset) + packedData.b * floatedOffset,
        packedData.g * (1. - floatedOffset) + packedData.a * floatedOffset,
        unpackedData.x
    );
    
}

#pragma glslify: export(unpack16)