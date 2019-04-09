uniform sampler2D uTextureBackTest0;
uniform sampler2D uTextureBackTest1; 
uniform float uOpacity0;
uniform float uOpacity1;
uniform int uType0;
uniform int uType1;
uniform int uTrackMouse;
uniform ivec2 uMouse;

void main(void) {

  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  // just silence warning for
  // vec4 dummy = vPos;

  //The back position is the world space position stored in the texture.
  vec4 baseColor0 = texture2D(uTextureBackTest0, texc);
  vec4 baseColor1 = texture2D(uTextureBackTest1, texc);

  if( uTrackMouse == 1 ){

      if( vProjectedCoords.x < uMouse.x ){

        gl_FragColor = baseColor0;

      }
      else{

        gl_FragColor = mix( baseColor0, baseColor1, uOpacity1 );

      }

  }
  else{

    if( uType1 == 0 ){

      //merge an image into
      gl_FragColor = mix( baseColor0, baseColor1, uOpacity1 );

    }
    else{

      float opacity = baseColor1.a;
      gl_FragColor = mix( baseColor0, baseColor1, opacity * uOpacity1 );

    }

  }

  return;
}