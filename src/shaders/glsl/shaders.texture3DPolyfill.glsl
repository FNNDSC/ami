// Support up to textureSize*textureSize*7 voxels

void texture3DPolyfill(in ivec3 dataCoordinates,
                       in ivec3 dataDimensions,
                       in int textureSize,
                       in sampler2D textureContainer0,
                       in sampler2D textureContainer1,
                       in sampler2D textureContainer2,
                       in sampler2D textureContainer3,
                       in sampler2D textureContainer4,
                       in sampler2D textureContainer5,
                       in sampler2D textureContainer6,
                       in sampler2D textureContainer[7], // not working on Moto X 2014
                       out vec4 dataValue,
                       out int offset
  ) {

  int pack = 2;

    // Model coordinate to data index
  int index = dataCoordinates.x
            + dataCoordinates.y * dataDimensions.x
            + dataCoordinates.z * dataDimensions.y * dataDimensions.x;
  int indexP = int(index/pack);

  if( 2*indexP < index){
    offset = 1;
  }
  else{
    offset = 0;
  }

  // Map data index to right sampler2D texture
  int voxelsPerTexture = textureSize*textureSize;
  int textureIndex = int(floor(float(indexP) / float(voxelsPerTexture)));
  // modulo seems incorrect sometimes...
  // int inTextureIndex = int(mod(float(index), float(textureSize*textureSize)));
  int inTextureIndex = indexP - voxelsPerTexture*textureIndex;

  // Get row and column in the texture
  int colIndex = int(mod(float(inTextureIndex), float(textureSize)));
  int rowIndex = int(floor(float(inTextureIndex)/float(textureSize)));

  // // Model coordinate to data index
  // int index = dataCoordinates.x
  //           + dataCoordinates.y * dataDimensions.x 
  //           + dataCoordinates.z * dataDimensions.y * dataDimensions.x;

  // // Map data index to right sampler2D texture
  // int voxelsPerTexture = 2 * textureSize * textureSize;
  // int textureIndex = int(floor(float(index) / float(voxelsPerTexture)));
  // // modulo seems incorrect sometimes...
  // // int inTextureIndex = int(mod(float(index), float(textureSize*textureSize)));
  // int inTextureIndex = index - voxelsPerTexture*textureIndex;

  // float modulo = 0.5 * float(inTextureIndex) / float( textureSize * textureSize);
  // dataValue = vec4(modulo, modulo, modulo, 1.0);
  // // return;

  // // float modulo = 100.0 * float( textureIndex ) / 7.0;
  // // dataValue = vec4(modulo, modulo, modulo, 1.0);

  // // return;

  // // Get row and column in the texture
  // // 0.5
  // int colIndex = int(mod(0.5*float(inTextureIndex), float( textureSize )));
  // int rowIndex = int(floor(0.5*float(inTextureIndex) / float( textureSize )));
  // float fcolIndex = 0.5 * mod(float(inTextureIndex), float( 2 * textureSize ));
  // float frowIndex = floor(0.5*float(inTextureIndex) / float( textureSize ));
  // fcolIndex = floor( 0.5 * float( inTextureIndex ) ) - frowIndex * float( textureSize );

  // dataValue = vec4(float(colIndex) / 4096., mod( float(colIndex), 2.) , 1., 1.);
  // return;

  // Map row and column to uv
  vec2 uv = vec2(0,0);
  uv.x = (0.5 + float(colIndex)) / float(textureSize);
  uv.y = 1. - (0.5 + float(rowIndex)) / float(textureSize);

  //
  if(textureIndex == 0){ dataValue = texture2D(textureContainer0, uv); }
  else if(textureIndex == 1){dataValue = texture2D(textureContainer1, uv);}
  else if(textureIndex == 2){ dataValue = texture2D(textureContainer2, uv); }
  else if(textureIndex == 3){ dataValue = texture2D(textureContainer3, uv); }
  else if(textureIndex == 4){ dataValue = texture2D(textureContainer4, uv); }
  else if(textureIndex == 5){ dataValue = texture2D(textureContainer5, uv); }
  else if(textureIndex == 6){ dataValue = texture2D(textureContainer6, uv); }
}

#pragma glslify: export(texture3DPolyfill)