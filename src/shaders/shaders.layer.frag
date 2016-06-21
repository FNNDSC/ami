uniform sampler2D uTextureBackTest0;
uniform float     uOpacity0;
uniform int       uType0;
uniform sampler2D uTextureBackTest1;
uniform float     uOpacity1;
uniform int       uType1;
uniform float     uOpacity;
uniform int       uInterpolation;

uniform float     uMinMax[2];
uniform int       uMix;
uniform int       uTrackMouse;
uniform vec2      uMouse;

varying vec4      vPos;
varying vec4      vProjectedCoords;

// include functions
#pragma glslify: value = require('./glsl/shaders.value.glsl')

void main(void) {

  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  // just silence warning for
  vec4 dummy = vPos;


  //The back position is the world space position stored in the texture.
  vec4 baseColor0 = texture2D(uTextureBackTest0, texc);
  vec4 baseColor1 = texture2D(uTextureBackTest1, texc);

  vec4 pixelColor = baseColor0;

  if( uType1 == 0 ){

    //merge an inmage into
    pixelColor = mix( pixelColor, baseColor1, uOpacity1 );

  }
  else{

    float opacity = baseColor1.a;
    pixelColor = mix(pixelColor, baseColor1, opacity * uOpacity1 );

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