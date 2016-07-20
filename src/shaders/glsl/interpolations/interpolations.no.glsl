#pragma glslify: unpack = require('../shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('../shaders.texture3DPolyfill.glsl')

void no(in vec3 currentVoxel,
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
  vec3 rCurrentVoxel = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));
  ivec3 voxel = ivec3(int(rCurrentVoxel.x), int(rCurrentVoxel.y), int(rCurrentVoxel.z));

  vec4 tmp = vec4(0., 0., 0., 0.);
  int offset = 0;

  texture3DPolyfill(
    voxel,
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
    tmp,
    offset
    );

  // float modulo = floor(0.5 + mod( floor(inTextureIndex), 2.0));
  // int offset = 1;

  // // int yoyoyo = (index & 1);


  // if( modulo > .5 ){

  //   offset = 1;
  //   intensity = vec4(1000., 1000., 1000., 1000.);
  //   return;

  // }





      // return;



  // if( voxel.x == 190 && voxel.y == 80 && offset == 0){


  //   intensity = vec4(tmp.r * 256. + tmp.g * 65536., 0., 0., 1.);
  // return;

  // }

  // if( voxel.x == 189 && voxel.y == 80 && offset == 1){


  // intensity = vec4(tmp.b * 256. + tmp.a * 65536., 0., 0., 1.);
  // return;
  // }

  // if( voxel.x == 188 && voxel.y == 80&& offset == 0){


  // intensity = vec4(tmp.r * 256. + tmp.g * 65536., 0., 0., 1.);

  // return;
  // }


  // if( voxel.x == 187 && voxel.y == 80 && offset == 1){


  // intensity = vec4(tmp.b * 256. + tmp.a * 65536., 0., 0., 1.);

  // return;
  // }


  // if( voxel.x == 186 && voxel.y == 80 && offset == 0){


  // intensity = vec4(tmp.r * 256. + tmp.g * 65536., 0., 0., 1.);

  // return;
  // }

  //   if( voxel.x == 185 && voxel.y == 80 && offset == 1){


  // intensity = vec4(tmp.b * 256. + tmp.a * 65536., 0., 0., 1.);

  // return;
  // }

    unpack(
    tmp,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    offset,
    intensity);

}

#pragma glslify: export(no)