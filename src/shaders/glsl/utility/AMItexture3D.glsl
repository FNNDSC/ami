void AMItexture3D(
    in ivec3 dataCoordinates, 
    in int uTextureSize,
    in ivec3 uDataDimensions,
    in sampler2D uTextureContainer[7],
    in int uPackedPerPixel,
    out vec4 dataValue, 
    out int offset
){
    float textureSizeF = float(uTextureSize);
    int voxelsPerTexture = uTextureSize*uTextureSize;

    int index = dataCoordinates.x + dataCoordinates.y * uDataDimensions.x + dataCoordinates.z * uDataDimensions.y * uDataDimensions.x;

    // dividing an integer by an integer will give you an integer result, rounded down can not get float numbers to work :(
    int packedIndex = index/uPackedPerPixel;
    offset = index - uPackedPerPixel*packedIndex;

    // Map data index to right sampler2D texture
    int textureIndex = packedIndex/voxelsPerTexture;
    int inTextureIndex = packedIndex - voxelsPerTexture*textureIndex;

    // Get row and column in the texture
    int rowIndex = inTextureIndex/uTextureSize;
    float rowIndexF = float(rowIndex);
    float colIndex = float(inTextureIndex - uTextureSize * rowIndex);

    // Map row and column to uv
    vec2 uv = vec2(0,0);
    uv.x = (0.5 + colIndex) / textureSizeF;
    uv.y = 1. - (0.5 + rowIndexF) / textureSizeF;

    float textureIndexF = float(textureIndex);
    vec4 addition = vec4(0.);

    for (float stepC = 0.0; stepC < 7.0; stepC++ ) {
        addition += step( abs( textureIndexF - stepC ), 0.0 ) * texture2D(uTextureContainer[int(stepC)], uv);
    }
    dataValue = addition;
}

#pragma glslify: export(AMItexture3D)