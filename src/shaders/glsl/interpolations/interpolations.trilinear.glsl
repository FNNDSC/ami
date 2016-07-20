#pragma glslify: no = require('./interpolations.no.glsl')
// https://en.wikipedia.org/wiki/Trilinear_interpolation

void trilinear(in vec3 currentVoxel,
               in int kernelSize,
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

  //

  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c000 = vec3(lc.x, lc.y, lc.z);

  no(c000,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v000
  );

  //

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c100 = vec3(hc.x, lc.y, lc.z);

  no(c100,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v100
  );

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c001 = vec3(lc.x, lc.y, hc.z);

  no(c001,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v001
  );

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c101 = vec3(hc.x, lc.y, hc.z);

  no(c101,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v101
  );

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c010 = vec3(lc.x, hc.y, lc.z);

  no(c010,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v010
  );

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c110 = vec3(hc.x, hc.y, lc.z);

  no(c110,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v110
  );

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c011 = vec3(lc.x, hc.y, hc.z);

  no(c011,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v011
  );

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c111 = vec3(hc.x, hc.y, hc.z);

  no(c111,
    kernelSize,
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
    bitsAllocated, 
    numberOfChannels, 
    pixelType,
    v111
  );

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  intensity = c;


}

#pragma glslify: export(trilinear)