#pragma glslify: toUInt8 = require(./toUInt8.glsl)

void unpack8(
    in vec4 packedData, 
    in int offset, 
    out vec4 unpackedData
){
    float floatedOffset = float(offset);
    float floatedOffsetSquared = floatedOffset * floatedOffset;

    toUInt8(
        step( floatedOffsetSquared , 0.0 ) * packedData.r +
        step( floatedOffsetSquared - 2. * floatedOffset + 1., 0.0 ) * packedData.g +
        step( floatedOffsetSquared - 2. * 2. *  floatedOffset + 4., 0.0 ) * packedData.b +
        step( floatedOffsetSquared - 2. * 3. *  floatedOffset + 9., 0.0 ) * packedData.a,
        unpackedData.x
    );
}

#pragma glslify: export(unpack8)