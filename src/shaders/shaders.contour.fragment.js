export default class ShadersFragment {
  // pass uniforms object
  constructor(uniforms) {
    this._uniforms = uniforms;
    this._functions = {};
    this._main = '';
  }

  functions() {
    if (this._main === '') {
      // if main is empty, functions can not have been computed
      this.main();
    }

    let content = '';
    for (let property in this._functions) {
      content += this._functions[property] + '\n';
    }

    return content;
  }

  uniforms() {
    let content = '';
    for (let property in this._uniforms) {
      let uniform = this._uniforms[property];
      content += `uniform ${uniform.typeGLSL} ${property}`;

      if (uniform && uniform.length) {
        content += `[${uniform.length}]`;
      }

      content += ';\n';
    }

    return content;
  }

  main() {
    // need to pre-call main to fill up the functions list
    this._main = `

float luma (vec3 rgb) {
  return (rgb.r + rgb.g + rgb.b)/3.0;
}

const float T = 0.04;
const float M = 1.0;
const float L = 0.002;

void main(void) {

  vec2 texCoord = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );

  float borderWidth = uWidth; // in px
  float step_u = borderWidth * 1.0 / uCanvasWidth;
  float step_v = borderWidth * 1.0 / uCanvasHeight;
  vec4 centerPixel = texture2D(uTextureFilled, texCoord);

  vec4 rightPixel  = texture2D(uTextureFilled, texCoord + vec2(step_u, 0.0));
  vec4 bottomPixel = texture2D(uTextureFilled, texCoord + vec2(0.0, step_v));

  // now manually compute the derivatives
  float _dFdX = length(rightPixel - centerPixel) / step_u;
  float _dFdY = length(bottomPixel - centerPixel) / step_v;

  // gl_FragColor.r = _dFdX;
  // gl_FragColor.g = _dFdY;
  gl_FragColor.r = max(max(centerPixel.r, rightPixel.r), bottomPixel.r);
  gl_FragColor.g = max(max(centerPixel.g, rightPixel.g), bottomPixel.g);
  gl_FragColor.b = max(max(centerPixel.b, rightPixel.b), bottomPixel.b);
  float maxDerivative = max(_dFdX, _dFdY);
  float clampedDerivative = clamp(maxDerivative, 0., 1.);
  gl_FragColor.a = uOpacity * clampedDerivative;

  return;
  // float h = 1./uCanvasHeight;
  // float w = 1./uCanvasWidth;
  // vec4 n[9];
  // n[0] = texture2D(uTextureFilled, vProjectedTextCoords + vec2( -w, -h));
  // n[1] = texture2D(uTextureFilled, vProjectedTextCoords + vec2(0.0, -h));
  // n[2] = texture2D(uTextureFilled, vProjectedTextCoords + vec2(  w, -h));
  // n[3] = texture2D(uTextureFilled, vProjectedTextCoords + vec2( -w, 0.0));
  // n[4] = texture2D(uTextureFilled, vProjectedTextCoords);
  // n[5] = texture2D(uTextureFilled, texCoord + vec2(  w, 0.0));
  // n[6] = texture2D(uTextureFilled, texCoord + vec2( -w, h));
  // n[7] = texture2D(uTextureFilled, texCoord + vec2(0.0, h));
  // n[8] = texture2D(uTextureFilled, texCoord + vec2(  w, h));
  // vec4 sobel_horizEdge = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  // vec4 sobel_vertEdge  = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
  // vec3 sobel = sqrt((sobel_horizEdge.rgb * sobel_horizEdge.rgb) + (sobel_vertEdge.rgb * sobel_vertEdge.rgb));
  // gl_FragColor = vec4( sobel, max(max(sobel.r, sobel.g), sobel.b) );

  // return;
}
   `;
  }

  compute() {
    let shaderInterpolation = '';
    // shaderInterpolation.inline(args) //true/false
    // shaderInterpolation.functions(args)

    return `
// uniforms
${this.uniforms()}

// varying (should fetch it from vertex directly)
varying vec4      vProjectedCoords;

// tailored functions
${this.functions()}

// main loop
${this._main}
      `;
    }
}
