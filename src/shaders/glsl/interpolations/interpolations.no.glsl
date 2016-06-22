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
    intensity
    );

  unpack(
    intensity,
    bitsAllocated,
    0,
    numberOfChannels,
    pixelType,
    intensity);

}

#pragma glslify: export(no)