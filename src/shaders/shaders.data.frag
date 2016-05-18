uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform int       uInvert;

// hack because can not pass arrays if too big
// best would be to pass texture but have to deal with 16bits
uniform int       uLut;
uniform sampler2D uTextureLUT;

varying vec4      vPos;

// include functions
#pragma glslify: unpack = require('./glsl/shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('./glsl/shaders.texture3DPolyfill.glsl')

void main(void) {

  // get texture coordinates of current pixel
  // doesn't need that in theory
  vec4 dataCoordinatesRaw = uWorldToData * vPos;
  // rounding trick
  // first center of first voxel in data space is CENTERED on (0,0,0)
  dataCoordinatesRaw += 0.5;
  ivec3 dataCoordinates = ivec3(int(floor(dataCoordinatesRaw.x)), int(floor(dataCoordinatesRaw.y)), int(floor(dataCoordinatesRaw.z)));

  // index 100
  // dataCoordinates.x = 26; //25
  // dataCoordinates.y = 1;
  // dataCoordinates.z = 0;

  // if data in range, look it up in the texture!
  if ( all(greaterThanEqual(dataCoordinates, ivec3(0))) &&
       all(lessThan(dataCoordinates, uDataDimensions))) {
    vec4 packedValue = vec4(0., 0., 0., 0.);
    texture3DPolyfill(
        dataCoordinates,
        uDataDimensions,
        uTextureSize,
        uTextureContainer[0],
        uTextureContainer[1],
        uTextureContainer[2],
        uTextureContainer[3],
        uTextureContainer[4],
        uTextureContainer[5],
        uTextureContainer[6],
        uTextureContainer,     // not working on Moto X 2014
        packedValue
        );

    vec4 dataValue = vec4(0., 0., 0., 0.);
    unpack(
      packedValue,
      uBitsAllocated,
      0,
      uNumberOfChannels,
      uPixelType,
      dataValue);

    // how do we deal wil more than 1 channel?
    if(uNumberOfChannels == 1){
      float intensity = dataValue.r;

      // rescale/slope
      intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];

      // window level
      // if(intensity < 2000.){
      //   gl_FragColor = vec4(1.0, 0., 0., 1.);
        //return;
      // }
      float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
      float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
      intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];

      dataValue.r = dataValue.g = dataValue.b = intensity;
    }

    // Apply LUT table...
    //
    if(uLut == 1){
      // should opacity be grabbed there?
      dataValue = texture2D( uTextureLUT, vec2( dataValue.r , 1.0) );
    }

    if(uInvert == 1){
      dataValue = vec4(1.) - dataValue;
      // how do we deal with that and opacity?
      dataValue.a = 1.;
    }

    gl_FragColor = dataValue;

  }
  else{
    // should be able to choose what we want to do if not in range:
    // discard or specific color
    discard;
    gl_FragColor = vec4(0.011, 0.662, 0.956, 1.0);
  }
}