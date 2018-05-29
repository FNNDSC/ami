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

/**
 * Adapted from original sources
 * 
 * Original code: 
 * http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/
 * https://www.shadertoy.com/view/lt33z7
 * 
 * The vec3 returned is the RGB color of the light's contribution.
 *
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 * lightPos: the position of the light
 * lightIntensity: color/intensity of the light
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongShading(vec3 k_a, vec3 k_d, vec3 k_s, float shininess, vec3 p, vec3 eye,
  vec3 lightPos, vec3 lightIntensity, vec3 normal) {
  vec3 N = normal;
  vec3 L = lightPos - p;
  if (length(L) > 0.) {
    L = L / length(L);
  }
  vec3 V = eye - p;
  if (length(V) > 0.) {
    V = V / length(V);
  }
  vec3 R = reflect(-L, N);
  if (length(R) > 0.) {
    R = R / length(R);
  }

  // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model
  vec3 h = L + V;
  vec3 H = h;
  if (length(h) > 0.) {
    H = H / length(h);
  }

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.) {
    // Light not visible from this point on the surface
    return k_a;
  } 

  if (dotRV < 0.) {
    // Light reflection in opposite direction as viewer, apply only diffuse
    // component
    return k_a + lightIntensity * (k_d * dotLN);
  }

  float specAngle = max(dot(H, normal), 0.0);
  float specular = pow(dotRV, shininess); //pow(specAngle, shininess); // 
  return k_a + lightIntensity * (k_d * dotLN  + k_s * specular);
}


float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   
float PI  = 3.14159265358979323846264 * 00000.1; // PI
float SRT = 1.41421356237309504880169 * 10000.0; // Square Root of Two

// Gold Noise function ?  Should use a texture
//
float gold_noise(in vec2 coordinate, in float seed)
{
    return fract(sin(dot(coordinate*seed, vec2(PHI, PI)))*SRT);
}

void main(void) {
  const int maxSteps = 1024;

  // the ray
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  vec3 lightOrigin = uLightPositionInCamera == 1 ? cameraPosition : uLightPosition;

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

  // MIP volume rendering
  float maxIntensity = 0.0;

  mat4 dataToWorld = inverse(uWorldToData);

  // rayOrigin -= rayDirection * 0.1; // gold_noise(vPos.xz, vPos.y) / 100.;  

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
      colorSample.r = colorSample.g = colorSample.b = intensity;
    }

    // ray marching algorithm
    // shading on
    // interpolation on
    if (uAlgorithm == 0 && uShading == 1 && uInterpolation != 0) {
      //  && alphaSample > .3
      vec3 ambientComponent = uSampleColorToAmbient == 1 ? colorSample.xyz : uAmbientColor;
      ambientComponent *= uAmbient;
      vec3 diffuseComponent = uSampleColorToDiffuse == 1 ? colorSample.xyz : uDiffuseColor;
      diffuseComponent *= uDiffuse;
      vec3 specularComponent = uSpecular * uSpecularColor;
      float shininess = uShininess;
      vec3 vIntensity = uIntensity;

      colorSample.xyz += phongShading(
        ambientComponent,
        diffuseComponent,
        specularComponent,
        shininess,
        currentPosition.xyz,
        rayOrigin.xyz,
        lightOrigin.xyz,
        vIntensity,
        gradient);
    }

    alphaSample = 1.0 - pow((1.0- alphaSample),tStep*uAlphaCorrection);
    alphaSample *= (1.0 - accumulatedAlpha);

    accumulatedColor += alphaSample * colorSample;
    accumulatedAlpha += alphaSample;

    tCurrent += tStep;

    if (tCurrent > tFar || (uAlgorithm == 0 && accumulatedAlpha >= 1.0)) break;

    if (uAlgorithm == 1 && (intensity >= maxIntensity)) {
      maxIntensity = intensity;
      accumulatedColor = colorSample;
      accumulatedAlpha = 1.;
    }
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
