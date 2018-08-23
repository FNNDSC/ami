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
  vec4 dataValue = vec4(0.);
  vec3 gradient = vec3(1.); // gradient calculations will be skipped if it is equal to vec3(1.) 
  float steps = floor(uThickness / uSpacing + 0.5);

  if (steps > 1.) {
    vec3 origin = vPos - uThickness * 0.5 * vNormal;
    vec4 dataValueAcc = vec4(0.);
    for (float step = 0.; step < 128.; step++) {
      if (step >= steps) {
        break;
      }

      vec4 dataCoordinates = uWorldToData * vec4(origin + step * uSpacing * vNormal, 1.);
      vec3 currentVoxel = dataCoordinates.xyz;
      ${shadersInterpolation(this, 'currentVoxel', 'dataValueAcc', 'gradient')};

      if (step == 0.) {
        dataValue.r = dataValueAcc.r;
        continue;
      }

      if (uThicknessMethod == 0) {
        dataValue.r = max(dataValueAcc.r, dataValue.r);
      }
      if (uThicknessMethod == 1) {
        dataValue.r += dataValueAcc.r;
      }
      if (uThicknessMethod == 2) {
        dataValue.r = min(dataValueAcc.r, dataValue.r);
      }
    }

    if (uThicknessMethod == 1) {
      dataValue.r /= steps;
    }
  } else {
    vec4 dataCoordinates = uWorldToData * vec4(vPos, 1.);
    vec3 currentVoxel = dataCoordinates.xyz;
    ${shadersInterpolation(this, 'currentVoxel', 'dataValue', 'gradient')}
  }

  if(uNumberOfChannels == 1){
    // rescale/slope
    float realIntensity = dataValue.r * uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  
    // threshold
    if (realIntensity < uLowerUpperThreshold[0] || realIntensity > uLowerUpperThreshold[1]) {
      discard;
    }
  
    // normalize
    float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
    float normalizedIntensity =
      ( realIntensity - windowMin ) / uWindowCenterWidth[1];
    dataValue.r = dataValue.g = dataValue.b = normalizedIntensity;
    dataValue.a = 1.;

    // apply LUT
    if(uLut == 1){
      // should opacity be grabbed there?
      dataValue = texture2D( uTextureLUT, vec2( normalizedIntensity , 1.0) );
    }
  
    // apply segmentation
    if(uLutSegmentation == 1){
      // should opacity be grabbed there?
      //
      float textureWidth = 256.;
      float textureHeight = 128.;
      float min = 0.;
      // start at 0!
      int adjustedIntensity = int(floor(realIntensity + 0.5));
  
      // Get row and column in the texture
      int colIndex = int(mod(float(adjustedIntensity), textureWidth));
      int rowIndex = int(floor(float(adjustedIntensity)/textureWidth));
  
      float texWidth = 1./textureWidth;
      float texHeight = 1./textureHeight;
    
      // Map row and column to uv
      vec2 uv = vec2(0,0);
      uv.x = 0.5 * texWidth + (texWidth * float(colIndex));
      uv.y = 1. - (0.5 * texHeight + float(rowIndex) * texHeight);
  
      dataValue = texture2D( uTextureLUTSegmentation, uv );
    }
  }

  if(uInvert == 1){
    dataValue.xyz = vec3(1.) - dataValue.xyz;
  }

  dataValue.a = dataValue.a*uOpacity;

  gl_FragColor = dataValue;
}
   `;
  }

  compute() {
    return `
// uniforms
${this.uniforms()}

// varying (should fetch it from vertex directly)
varying vec3 vPos;
varying vec3 vNormal;

// tailored functions
${this.functions()}

// main loop
${this._main}
      `;
    }
}
