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
uniform sampler2D uTextureBackTest;
uniform float     uOpacity;

// hack because can not pass arrays if too big
// best would be to pass texture but have to deal with 16bits
uniform int       uLut;
uniform sampler2D uTextureLUT;

uniform float     uMinMax[2];
uniform int       uMix;
uniform int       uTrackMouse;
uniform vec2      uMouse;

varying vec4      vPos;
varying vec4      vProjectedCoords;

// include functions
#pragma glslify: unpack = require('./glsl/shaders.unpack.glsl')
#pragma glslify: texture3DPolyfill = require('./glsl/shaders.texture3DPolyfill.glsl')

void main(void) {

// vec4 dataCoordinatesRawDummy = uWorldToData * vPos;
  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  //The back position is the world space position stored in the texture.
  vec4 baseColor = texture2D(uTextureBackTest, texc);

  // get texture coordinates of current pixel
  // doesn't need that in theory
  vec4 dataCoordinatesRaw = uWorldToData * vPos;
  // rounding trick
  // first center of first voxel in data space is CENTERED on (0,0,0)
  dataCoordinatesRaw += 0.5;
  ivec3 dataCoordinates = ivec3(int(floor(dataCoordinatesRaw.x)), int(floor(dataCoordinatesRaw.y)), int(floor(dataCoordinatesRaw.z)));

  // if data in range, look it up in the texture!
  if ( all(greaterThanEqual(dataCoordinates, ivec3(0))) &&
       all(lessThan(dataCoordinates, uDataDimensions))) {
    vec4 packedValue = texture3DPolyfill(
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
        uTextureContainer     // not working on Moto X 2014
        );

    vec4 dataValue = unpack(
      packedValue,
      uBitsAllocated,
      0,
      uNumberOfChannels,
      uPixelType);

    // should commpare against minium value
    // not working if minimum is different than 0...
    // OK-ish for labelmaps but not fine if comapring 2 images
    // 0.5 should be minimum of layer 1
    // if(dataValue.r < 0.5 && uMix == 1){
    //   gl_FragColor = baseColor;
    // }
    // else{
      // APPLY LUT after normalization...
      float intensity = dataValue.r;

      // rescale/slope
      intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];

      // window level
      float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
      float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
      intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];

      dataValue.r = dataValue.g = dataValue.b = intensity;

      if(dataValue.r <= uMinMax[0] && uMix == 1){
        gl_FragColor = baseColor;
        return;
      }
      
      if(uLut == 1){
        dataValue = texture2D( uTextureLUT, vec2( dataValue.r , 1.0) );
      }


      if(uTrackMouse == 1){
        if(vProjectedCoords.x < uMouse.x){
          gl_FragColor = baseColor;
        }
        else if(uMix == 1){
          gl_FragColor = mix(baseColor, vec4(dataValue.xyz, 1.0), uOpacity);
        }
        else{
          gl_FragColor = dataValue;
        }
      }
      else{
        if(uMix == 1){
          gl_FragColor = mix(baseColor, vec4(dataValue.xyz, 1.0), uOpacity);
        }
        else{
          gl_FragColor = dataValue;
        }
      }
    // }

  }
  else{
    // should be able to choose what we want to do if not in range:
    // discard or specific color
    // discard;
    gl_FragColor = vec4(0.011, 0.662, 0.956, 1.0);
  }
}