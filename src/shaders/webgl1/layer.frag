const float EPSILON = 0.0000152587;

uniform sampler2D uTextureBackTest0;
uniform sampler2D uTextureBackTest1; 
uniform float uOpacity0;
uniform float uOpacity1;
uniform int uType0;
uniform int uType1;
uniform int uTrackMouse;
uniform ivec2 uMouse;

varying vec4 vPos;
varying mat4 vProjectionViewMatrix;
varying vec4 vProjectedCoords;

void main(void) {

  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  //The back position is the world space position stored in the texture.
  vec4 baseColor0 = texture2D(uTextureBackTest0, texc);
  vec4 baseColor1 = texture2D(uTextureBackTest1, texc);

  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  if( uTrackMouse == 1 ){
      // DOES NEED REMOVAL
      // Dynamic branching condition - will cause wavefront divergance
      // ---------------------------------------------------------------
      // if( vProjectedCoords.x < uMouse.x ){
      //   gl_FragColor = baseColor0;
      // }
      // else{
      //   gl_FragColor = mix( baseColor0, baseColor1, uOpacity1 );
      // }

      // if (vProjectedCoords.x < uMouse.x) enable == 0
      // -R | +R
      float enable = (vProjectedCoords.x - uMouse.x);
      // 0 | +R   if enable is negative, then the abs() of it is itself, exactly, but positive
      enable += abs(enable);
      // 0 | 1    exploits that (0 / R) is still 0
      enable = ceil(enable / (enable + EPSILON));
      gl_FragColor = (baseColor0 * (1 - enable)) + (mix(baseColor0, baseColor1, uOpacity1) * enable);
  }
  else{
    // DOES NOT NEED REMOVAL
    // Statically uniform branching condition - cannot cause wavefront divergance
    // ---------------------------------------------------------------------------
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