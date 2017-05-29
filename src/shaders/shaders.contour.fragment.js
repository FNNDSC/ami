export default class ShadersFragment {

  // pass uniforms object
  constructor(uniforms) {
    this._uniforms = uniforms;
    this._functions = {};
    this._main = '';
  }

  functions() {
    if(this._main === '') {
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

      if(uniform && uniform.length) {
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
  gl_FragColor.a = max(_dFdX, _dFdY);

  return;
  float h = 1./uCanvasHeight;
  float w = 1./uCanvasWidth;
  vec4 n[9];
  n[0] = texture2D(uTextureFilled, vProjectedTextCoords + vec2( -w, -h));
  n[1] = texture2D(uTextureFilled, vProjectedTextCoords + vec2(0.0, -h));
  n[2] = texture2D(uTextureFilled, vProjectedTextCoords + vec2(  w, -h));
  n[3] = texture2D(uTextureFilled, vProjectedTextCoords + vec2( -w, 0.0));
  n[4] = texture2D(uTextureFilled, vProjectedTextCoords);
  n[5] = texture2D(uTextureFilled, texCoord + vec2(  w, 0.0));
  n[6] = texture2D(uTextureFilled, texCoord + vec2( -w, h));
  n[7] = texture2D(uTextureFilled, texCoord + vec2(0.0, h));
  n[8] = texture2D(uTextureFilled, texCoord + vec2(  w, h));
  vec4 sobel_horizEdge = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  vec4 sobel_vertEdge  = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
  vec3 sobel = sqrt((sobel_horizEdge.rgb * sobel_horizEdge.rgb) + (sobel_vertEdge.rgb * sobel_vertEdge.rgb));
  gl_FragColor = vec4( sobel, max(max(sobel.r, sobel.g), sobel.b) );


  return;

  gl_FragColor.r = (texCoord + vec2(0.0, step_v)).r;
  gl_FragColor.g = (texCoord + vec2(step_u, 0.0)).g;
  gl_FragColor = centerPixel;
  gl_FragColor.r = texCoord.x;
  // gl_FragColor.g = (texCoord + vec2(0.0, step_v)).x;
  gl_FragColor.b = (texCoord + vec2(step_u, 0.0)).x;
  gl_FragColor.rg = (texCoord + vec2(0.0, step_v));
  gl_FragColor.b = 0.;
  return;
  vec2 texCoordSlope = fwidth(texCoord);
  vec4 color2 = texture2D(uTextureFilled, vProjectedTextCoords);
  // dfdx that vProjectedTextCoords
  float l = luma (color2.rgb) ;
    float luminance = dot(color2.rgb,vec3(0.2126, 0.7152, 0.0722));

  	float q0 = fwidth (luminance);
    if(q0 > 0.01){
      q0 = 1.0;
    }
	float q1 = abs (dFdx (l)); 
	float q2 = abs (dFdy (l));

  	vec4 ct = vec4 (1.0, 1.0, 1.0, 0.0);
	vec4 c0 = mix (ct, vec4 (1.0, 0.0, 0.0, 1.0), 
		smoothstep (T * (1.0 - M), T * (1.0 + M), q0));

gl_FragColor.r = fwidth(color2.r);//abs(dFdx(color2.b));//texCoord;//color2.rgb;
gl_FragColor.g = fwidth(color2.g);
gl_FragColor.b = fwidth(color2.b);
gl_FragColor.a = 1.;
// gl_FragColor.a = q0;
// gl_FragColor = color2;
//return;


  //The back position is the world space position stored in the texture.
  vec4 color = texture2D(uTextureFilled, texCoord);
  float lColor = length(color.rgb);
  float maxColor = length(color.rgb);//max(max(color.r, color.g), color.b);
  // if(maxColor > 0.1){
  //   maxColor = 1.0;
  // }



  // gl_FragColor = color;//vec4(color.r, color.g, color.b, 1);
  // return;
  // float tmpxx  = abs(dFdx(lColor));
  // float tmpxy  = abs(dFdy(lColor));
  // float tmpx = max(tmpxx,tmpxy);

  // float tmpyx  = abs(dFdx(color.y));
  // float tmpyy  = abs(dFdy(color.y));
  // float tmpy = max(tmpyx,tmpyy);

  // float tmpzx  = abs(dFdx(color.z));
  // float tmpzy  = abs(dFdy(color.z));
  // float tmpz = max(tmpzx,tmpzy);

  // float tmpmax = max(max(tmpx, tmpy), tmpz);
  // if(tmpmax > 0.01){
  //   tmpmax = 1.0;
  // }
  // gl_FragColor.r = tmpx;//smoothstep(tmpx-5., tmpx+5., lColor);
  // gl_FragColor.g = tmpx;
  // gl_FragColor.b = tmpx;

  // vec4 color2 = texture2D(uTextureFilled, vec2(texcX, texcY));

  // gl_FragColor.r = color.r - texcX;
  // gl_FragColor.g = color.g - texcY;
  // gl_FragColor.b = color.b - color2.b;
  // gl_FragColor.a = 1.;

  // float threshold = 0.7;
  // float afwidth = length(vec2(dFdx(maxColor), dFdy(maxColor)));
  // gl_FragColor.a = afwidth;
  // float opacity =
  //   smoothstep(afwidth - threshold, afwidth + threshold, maxColor);

  // gl_FragColor.a = maxColor;

// float aaf = fwidth(maxColor);
// float alpha = smoothstep(.01, .8, aaf);
// gl_FragColor = vec4(color.rgb, alpha);

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
  // gl_FragColor = vec4( n[1].rgb, 1.0 );
  // gl_FragColor.r = 1.0;

  return;
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
varying vec4      vPos;
varying vec4      vProjectedCoords;
varying vec2      vProjectedTextCoords;
varying mat4      vProjectionViewMatrix;

// tailored functions
${this.functions()}

// main loop
${this._main}
      `;
    }

}
