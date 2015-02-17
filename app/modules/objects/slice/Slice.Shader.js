/**
 * @author Nicolas Rannou / https://github.com/NicolasRannou
 *
 */

VJS.Slice.Shader = {

  /* -------------------------------------------------------------------------
  //  Slice shader
  // features:
  //
   ------------------------------------------------------------------------- */

  'slice' : {

    uniforms:
      {
        // texture specific
        "uTextureSize": {type: "f", value: 0.0},
        "t00"         : {type: 't', value: null},
        "t01"         : {type: 't', value: null},
        "t02"         : {type: 't', value: null},
        "t03"         : {type: 't', value: null},

        // image specific
        "uIJKDims"    : {type: 'v3', value: new THREE.Vector3()},
        "uRASToIJK"   : {type: 'm4', value: new THREE.Matrix4()}
      },

    fragmentShader: [
      //
      // Get pixel color given IJK coordinate and texture
      //
      "vec4 getIJKValue( sampler2D tex0, sampler2D tex1, sampler2D tex2, sampler2D tex3, vec3 ijkCoordinates, vec3 ijkDimensions, float uTextureSize) {",
        // IJK coord to texture
        "highp float index = ijkCoordinates[0] + ijkCoordinates[1]*ijkDimensions[0] + ijkCoordinates[2]*ijkDimensions[0]*ijkDimensions[1];",

        // map index to right sampler2D slice
        "highp float sliceIndex = floor(index / (uTextureSize*uTextureSize));",
        "highp float inTextureIndex = mod(index, uTextureSize*uTextureSize);",

        // get row in the texture
        "highp float rowIndex = floor(inTextureIndex/uTextureSize);",
        "highp float colIndex = mod(inTextureIndex, uTextureSize);",

        // map to uv
        "vec2 sliceSize = vec2(1.0 / uTextureSize, 1.0 / uTextureSize);",
        "highp float u = colIndex*sliceSize.x + sliceSize.x/2.;",
        "highp float v = 1.0 - (rowIndex*sliceSize.y + sliceSize.y/2.);",

        "highp vec2 uv = vec2(u,v);",
        "vec4 ijkValue = vec4(0, 0, 0, 0);",
        "if(sliceIndex == float(0)){",
          "ijkValue = texture2D(tex0, uv);",
        "}",
        "else if(sliceIndex == float(1)){",
          "ijkValue = texture2D(tex1, uv);",
        "}",
        "else if(sliceIndex == float(2)){",
          "ijkValue = texture2D(tex2, uv);",
        "}",
        "else if(sliceIndex == float(3)){",
          "ijkValue = texture2D(tex3, uv);",
        "}",

        "return ijkValue;",
      "}",


      "precision highp float;",
      "precision highp sampler2D;",

      "uniform float uTextureSize;",
      "uniform sampler2D t00;",
      "uniform sampler2D t01;",
      "uniform sampler2D t02;",
      "uniform sampler2D t03;",

      "uniform vec3 uIJKDims;",
      "uniform mat4 uRASToIJK;",


      "varying vec4 vPos;",

      "void main(void) {",

        // get IJK coordinates of current element
        "vec4 ijkPos = uRASToIJK * vPos;",
        // shader rounding trick
        "ijkPos += .5;",
    
        //convert IJK coordinates to texture coordinates
        "if(int(floor(ijkPos[0])) >= 0",
          "&& int(floor(ijkPos[1])) >= 0",
          "&& int(floor(ijkPos[2])) >= 0",
          "&& int(floor(ijkPos[0])) < int(uIJKDims[0])",
          "&& int(floor(ijkPos[1])) < int(uIJKDims[1])",
          "&& int(floor(ijkPos[2])) < int(uIJKDims[2])",
        "){",

          // show whole texture in the back...
          "vec3 color = vec3(0, 0, 0);",
          // try to map IJK to value...
          "vec3 ijkCoordinates = vec3(floor(ijkPos[0]), floor(ijkPos[1]), floor(ijkPos[2]));",
          "vec4 ijkValue = getIJKValue(t00, t01, t02, t03, ijkCoordinates, uIJKDims, uTextureSize);",
          "color.rgb = ijkValue.rgb;",
          "gl_FragColor = vec4(color, 1.0);",
        "}",
        "else{",
          // "discard;",
          "gl_FragColor = vec4(.47, .564, .611, 1.0);",
        "}",

      "}"

    ].join("\n"),

    vertexShader: [

      "varying vec4 vPos;",

      //
      // main
      //
      "void main() {",

        "vPos = modelMatrix * vec4(position, 1.0 );",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );",

      "}"

    ].join("\n")

  }

};
