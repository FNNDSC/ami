void unpackIdentity(
    in vec4 packedData, 
    in int offset, 
    out vec4 unpackedData
){
    unpackedData = packedData;
}

#pragma glslify: export(unpackIdentity)