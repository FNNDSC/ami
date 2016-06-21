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
uniform sampler2D uTextureBackTest0;
uniform float     uOpacity0;
uniform int       uType0;
uniform sampler2D uTextureBackTest1;
uniform float     uOpacity1;
uniform int       uType1;
uniform float     uOpacity;
uniform int       uInterpolation;

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
#pragma glslify: value = require('./glsl/shaders.value.glsl')

void main(void) {

// vec4 dataCoordinatesRawDummy = uWorldToData * vPos;
  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  // merge all images

  // mix in all the

  //The back position is the world space position stored in the texture.
  vec4 baseColor0 = texture2D(uTextureBackTest0, texc);
  vec4 baseColor1 = texture2D(uTextureBackTest1, texc);

  // if( baseColor1.a <= 0.0 ){

  //   gl_FragColor = baseColor0;
  //   return;

  // }

  vec4 pixelColor = baseColor0;//vec4(0.0, 0.0, 0.0, 0.0);

  vec4 dataCoordinates2 = uWorldToData * vPos;
  //gl_FragColor = uOpacity0 * baseColor0 + uOpacity1 * baseColor1;//mix(vec4(baseColor0.r, baseColor0.g, baseColor0.b, baseColor0.a), vec4(baseColor1.r, baseColor1.g, baseColor1.b, baseColor1.a), uOpacity);
  
  if( uType1 == 0){

    //merge an inmage into
    pixelColor = mix( pixelColor, baseColor1, uOpacity1 );

  }
  else{

    // merge a label into
    // if( baseColor1.a > 0.5 ){

       float opacity = baseColor1.a;
       pixelColor = mix(pixelColor, baseColor1, opacity * uOpacity1 );

    // }

  }

  gl_FragColor = pixelColor;

  return;

  // if(dataValue.r <= uMinMax[0] && uMix == 1){
  //   gl_FragColor = baseColor;
  //   return;
  // }
  
  // if(uLut == 1){
  //   dataValue = texture2D( uTextureLUT, vec2( dataValue.r , 1.0) );
  // }


  // if(uTrackMouse == 1){
  //   if(vProjectedCoords.x < uMouse.x){
  //     gl_FragColor = baseColor;
  //   }
  //   else if(uMix == 1){
  //     gl_FragColor = mix(baseColor, vec4(dataValue.xyz, 1.0), uOpacity * dataValue.a );
  //   }
  //   else{
  //     gl_FragColor = dataValue;
  //   }
  // }
  // else{
  //   if(uMix == 1){
  //     gl_FragColor = mix(baseColor, vec4(dataValue.xyz, 1.0), uOpacity * dataValue.a );
  //   }
  //   else{
  //     gl_FragColor = dataValue;
  //   }
  // }

}