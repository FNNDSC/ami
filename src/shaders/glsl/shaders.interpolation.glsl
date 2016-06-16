#pragma glslify: unpack = require('./shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('./shaders.texture3DPolyfill.glsl')

// Support up to textureSize*textureSize*7 voxels

void interpolation(in vec4 dataCoordinates,
                   in int kernelSize,
                   in int interpolationMethod,
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
                   in int bitsAllocated, 
                   in int numberOfChannels, 
                   in int pixelType,
                   out vec4 intensity
  ) {

  
  //
  // no interpolation for now...
  //

  vec3 currentVoxel = vec3(dataCoordinates.x, dataCoordinates.y, dataCoordinates.z);

  // rounding trick
  // lower bound
  vec3 lb = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));

  vec3 direction = currentVoxel - lb;

  // higher bound
  vec3 hb = lb + 1.0;

  if( direction.x < 0.0){

    hb.x -= 2.0;

  }

  if( direction.y < 0.0){

    hb.y -= 2.0;

  }

  if( direction.z < 0.0){

    hb.z -= 2.0;

  }

  vec3 lc = vec3(0.0, 0.0, 0.0);
  vec3 hc = vec3(0.0, 0.0, 0.0);

  if(lb.x < hb.x){

    lc.x = lb.x;
    hc.x = hb.x;

  }
  else{

    lc.x = hb.x;
    hc.x = lb.x;

  }

  if(lb.y < hb.y){

    lc.y = lb.y;
    hc.y = hb.y;

  }
  else{

    lc.y = hb.y;
    hc.y = lb.y;

  }

  if(lb.z < hb.z){

    lc.z = lb.z;
    hc.z = hb.z;

  }
  else{

    lc.z = hb.z;
    hc.z = lb.z;

  }

  float xd = ( currentVoxel.x - lc.x ) / ( hc.x - lc.x );
  float yd = ( currentVoxel.y - lc.y ) / ( hc.y - lc.y );
  float zd = ( currentVoxel.z - lc.z ) / ( hc.z - lc.z );

  //
  // c00
  //
  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c000 = ivec3(int(lc.x), int(lc.y), int(lc.z));

  texture3DPolyfill(
    c000,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v000
    );

  unpack(
    v000,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v000);

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c100 = ivec3(int(hc.x), int(lc.y), int(lc.z));

  texture3DPolyfill(
    c100,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v100
    );

  unpack(
    v100,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v100);

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c001 = ivec3(int(lc.x), int(lc.y), int(hc.z));

  texture3DPolyfill(
    c001,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v001
    );

  unpack(
    v001,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v001);

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c101 = ivec3(int(hc.x), int(lc.y), int(hc.z));

  texture3DPolyfill(
    c101,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v101
    );

  unpack(
    v101,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v101);

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c010 = ivec3(int(lc.x), int(hc.y), int(lc.z));

  texture3DPolyfill(
    c010,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v010
    );

  unpack(
    v010,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v010);

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c110 = ivec3(int(hc.x), int(hc.y), int(lc.z));

  texture3DPolyfill(
    c110,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v110
    );

  unpack(
    v110,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v110);

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c011 = ivec3(int(lc.x), int(hc.y), int(hc.z));

  texture3DPolyfill(
    c011,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v011
    );

  unpack(
    v011,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v011);

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c111 = ivec3(int(hc.x), int(hc.y), int(hc.z));

  texture3DPolyfill(
    c111,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v111
    );

  unpack(
    v111,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    v111);

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  intensity = c;


}

#pragma glslify: export(interpolation)