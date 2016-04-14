// Support up to textureSize*textureSize*7 voxels

vec4 texture3DPolyfill(ivec3 dataCoordinates,
                       ivec3 dataDimensions,
                       int textureSize,
                       sampler2D textureContainer0,
                       sampler2D textureContainer1,
                       sampler2D textureContainer2,
                       sampler2D textureContainer3,
                       sampler2D textureContainer4,
                       sampler2D textureContainer5,
                       sampler2D textureContainer6,
                       sampler2D textureContainer[7] // not working on Moto X 2014
  ) {

  // Model coordinate to data index
  int index = dataCoordinates.x
            + dataCoordinates.y * dataDimensions.x
            + dataCoordinates.z * dataDimensions.y * dataDimensions.x;

  // Map data index to right sampler2D texture
  int voxelsPerTexture = textureSize*textureSize;
  int textureIndex = int(floor(float(index) / float(voxelsPerTexture)));
  // modulo seems incorrect sometimes...
  // int inTextureIndex = int(mod(float(index), float(textureSize*textureSize)));
  int inTextureIndex = index - voxelsPerTexture*textureIndex;

  // Get row and column in the texture
  int colIndex = int(mod(float(inTextureIndex), float(textureSize)));
  int rowIndex = int(floor(float(inTextureIndex)/float(textureSize)));

  // Map row and column to uv
  vec2 uv = vec2(0,0);
  uv.x = (0.5 + float(colIndex)) / float(textureSize);
  uv.y = 1. - (0.5 + float(rowIndex)) / float(textureSize);

  //
  vec4 dataValue = vec4(0., 0., 0., 0.);
  if(textureIndex == 0){ dataValue = texture2D(textureContainer0, uv); }
  else if(textureIndex == 1){dataValue = texture2D(textureContainer1, uv);}
  else if(textureIndex == 2){ dataValue = texture2D(textureContainer2, uv); }
  else if(textureIndex == 3){ dataValue = texture2D(textureContainer3, uv); }
  else if(textureIndex == 4){ dataValue = texture2D(textureContainer4, uv); }
  else if(textureIndex == 5){ dataValue = texture2D(textureContainer5, uv); }
  else if(textureIndex == 6){ dataValue = texture2D(textureContainer6, uv); }

  return dataValue;
}

#pragma glslify: export(texture3DPolyfill)