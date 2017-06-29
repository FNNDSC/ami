import shadersInterpolation from './interpolation/shaders.interpolation';

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
void main(void) {

  // draw border if slice is cropped
  // float uBorderDashLength = 10.;

  if( uCanvasWidth > 0. &&
      ((gl_FragCoord.x > uBorderMargin && (gl_FragCoord.x - uBorderMargin) < uBorderWidth) ||
       (gl_FragCoord.x < (uCanvasWidth - uBorderMargin) && (gl_FragCoord.x + uBorderMargin) > (uCanvasWidth - uBorderWidth) ))){
    float valueY = mod(gl_FragCoord.y, 2. * uBorderDashLength);
    if( valueY < uBorderDashLength && gl_FragCoord.y > uBorderMargin && gl_FragCoord.y < (uCanvasHeight - uBorderMargin) ){
      gl_FragColor = vec4(uBorderColor, 1.);
      return;
    }
  }

  if( uCanvasHeight > 0. &&
      ((gl_FragCoord.y > uBorderMargin && (gl_FragCoord.y - uBorderMargin) < uBorderWidth) ||
       (gl_FragCoord.y < (uCanvasHeight - uBorderMargin) && (gl_FragCoord.y + uBorderMargin) > (uCanvasHeight - uBorderWidth) ))){
    float valueX = mod(gl_FragCoord.x, 2. * uBorderDashLength);
    if( valueX < uBorderDashLength && gl_FragCoord.x > uBorderMargin && gl_FragCoord.x < (uCanvasWidth - uBorderMargin) ){
      gl_FragColor = vec4(uBorderColor, 1.);
      return;
    }
  }

  // get texture coordinates of current pixel
  vec4 dataCoordinates = uWorldToData * vPos;
  vec3 currentVoxel = vec3(dataCoordinates.x, dataCoordinates.y, dataCoordinates.z);
  vec4 dataValue = vec4(0., 0., 0., 0.);
  vec3 gradient = vec3(0., 0., 0.);
  ${shadersInterpolation(this, 'currentVoxel', 'dataValue', 'gradient')}

  // how do we deal wil more than 1 channel?
  if(uNumberOfChannels == 1){
    float intensity = dataValue.r;

    // rescale/slope
    intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];

    float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
    float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
    intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];

    dataValue.r = dataValue.g = dataValue.b = intensity;
    dataValue.a = 1.0;
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

    // if on edge, draw line
  // float xPos = gl_FragCoord.x/512.;
  // float yPos = gl_FragCoord.y/512.;
  // if( xPos < 0.05 || xPos > .95 || yPos < 0.05 || yPos > .95){
  //   gl_FragColor = vec4(xPos, yPos, 0., 1.);//dataValue;
  //   //return;
  // }

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

// tailored functions
${this.functions()}

// main loop
${this._main}
      `;
    }

}
