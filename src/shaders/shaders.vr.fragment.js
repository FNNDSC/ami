import shadersInterpolation from './interpolation/shaders.interpolation';
import shadersIntersectBox from './helpers/shaders.helpers.intersectBox';

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
void getIntensity(in vec3 dataCoordinates, out float intensity, out vec3 gradient){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  ${shadersInterpolation(this, 'dataCoordinates', 'dataValue', 'gradient')}

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

<<<<<<< HEAD
mat4 inverse(mat4 m) {
  float
      a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
      a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
      a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
      a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  return mat4(
      a11 * b11 - a12 * b10 + a13 * b09,
      a02 * b10 - a01 * b11 - a03 * b09,
      a31 * b05 - a32 * b04 + a33 * b03,
      a22 * b04 - a21 * b05 - a23 * b03,
      a12 * b08 - a10 * b11 - a13 * b07,
      a00 * b11 - a02 * b08 + a03 * b07,
      a32 * b02 - a30 * b05 - a33 * b01,
      a20 * b05 - a22 * b02 + a23 * b01,
      a10 * b10 - a11 * b08 + a13 * b06,
      a01 * b08 - a00 * b10 - a03 * b06,
      a30 * b04 - a31 * b02 + a33 * b00,
      a21 * b02 - a20 * b04 - a23 * b00,
      a11 * b07 - a10 * b09 - a12 * b06,
      a00 * b09 - a01 * b07 + a02 * b06,
      a31 * b01 - a30 * b03 - a32 * b00,
      a20 * b03 - a21 * b01 + a22 * b00) / det;
}

void phongShading(in vec3 lightOrigin, in vec3 rayOrigin, in vec3 currentPosition, in vec3 gradient, in vec4 colorSample, out vec3 litColor){
=======
void phongShading(in vec3 lightOrigin, in vec3 rayOrigin, in vec3 currentPosition, in vec3 gradient, in vec4 colorSample, out vec3 litColor){
  vec3 normal = -normalize(gradient);
>>>>>>> 3fda418a8a7d741d72237ef076a827deca2cefa9
  vec3 color  = vec3(colorSample.r,colorSample.g,colorSample.b);
  vec3 ambient_color = color;
  vec3 diffuse_color = color;

  if (uSampleColorToAmbient == 0) {
    ambient_color = uAmbientColor;
  }
  if (uSampleColorToDiffuse == 0) {
    diffuse_color = uDiffuseColor;
  }

  litColor          = uAmbient * ambient_color;
  vec3 pointToEye   = normalize(rayOrigin - currentPosition);
  vec3 pointToLight = normalize(lightOrigin - currentPosition);
<<<<<<< HEAD
  float lightDot    = dot(pointToLight, gradient);
  litColor         += uDiffuse * lightDot * diffuse_color;

  float eyeDotPos   = step(0.0,dot(pointToEye, gradient));
  float lightDotPos = step(0.0,lightDot);

  vec3 lightReflection = reflect(-pointToLight, gradient);
=======
  float lightDot    = dot(pointToLight, normal);
  litColor         += uDiffuse * lightDot * diffuse_color;

  float eyeDotPos   = step(0.0,dot(pointToEye, normal));
  float lightDotPos = step(0.0,lightDot);

  vec3 lightReflection = reflect(-pointToLight,normal);
>>>>>>> 3fda418a8a7d741d72237ef076a827deca2cefa9
  float reflectDot     = dot(lightReflection,pointToEye);
  litColor            += uSpecular * eyeDotPos * lightDotPos * pow(abs(reflectDot), uShininess) * uSpecularColor;

  litColor = clamp(litColor, 0.0, 1.0);
}

void main(void) {
  const int maxSteps = 1024;

  // the ray
  vec3 rayOrigin   = cameraPosition;
  vec3 lightOrigin = cameraPosition;

  if (uLightPositionInCamera == 0){
    lightOrigin = uLightPosition;
  }

  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  // the Axe-Aligned B-Box
  vec3 AABBMin = vec3(uWorldBBox[0], uWorldBBox[2], uWorldBBox[4]);
  vec3 AABBMax = vec3(uWorldBBox[1], uWorldBBox[3], uWorldBBox[5]);

  // Intersection ray/bbox
  float tNear, tFar;
  bool intersect = false;
  ${shadersIntersectBox.api(this, 'rayOrigin', 'rayDirection', 'AABBMin', 'AABBMax', 'tNear', 'tFar', 'intersect')}
  if (tNear < 0.0) tNear = 0.0;

  // init the ray marching
  float tCurrent = tNear;
  float tStep = (tFar - tNear) / float(uSteps);
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;
  mat4 dataToWorld = inverse(uWorldToData);

  for(int rayStep = 0; rayStep < maxSteps; rayStep++){
    vec3 currentPosition = rayOrigin + rayDirection * tCurrent;
    // some non-linear FUN
    // some occlusion issue to be fixed
    vec3 transformedPosition = currentPosition; //transformPoint(currentPosition, uAmplitude, uFrequence);
    // world to data coordinates
    // rounding trick
    // first center of first voxel in data space is CENTERED on (0,0,0)
    vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);
    float intensity = 0.0;
    vec3 gradient = vec3(0., 0., 0.);
    getIntensity(currentVoxel, intensity, gradient);
    // map gradient to world space and normalize before using
    // we avoid to call "normalize" as it may be undefined if vector length == 0.
    gradient = (vec3(dataToWorld * vec4(gradient, 0.)));
    if (length(gradient) > 0.0) {
      gradient = normalize(gradient);
    }

    vec4 colorSample;
    float alphaSample;
    if(uLut == 1){
      vec4 colorFromLUT = texture2D( uTextureLUT, vec2( intensity, 1.0) );
      // 256 colors
      colorSample = colorFromLUT;
      alphaSample = colorFromLUT.a;
    }
    else{
      alphaSample = intensity;
      colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
    }

    if (uShading == 1) {
      vec3 litColor = vec3(0., 0., 0.);
      phongShading(lightOrigin, rayOrigin, currentPosition, gradient, colorSample, litColor);
      float alpha = colorSample.a;
      colorSample = vec4(litColor, alpha);
    }

    alphaSample = 1.0 - pow((1.0- alphaSample),tStep*uAlphaCorrection);
    alphaSample *= (1.0 - accumulatedAlpha);

    accumulatedColor += alphaSample * colorSample;
    accumulatedAlpha += alphaSample;

    tCurrent += tStep;

    if(tCurrent > tFar || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
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
