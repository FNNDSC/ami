import shadersInterpolation from './interpolation/shaders.interpolation';

export default class ShadersFragment {

  // pass uniforms object
  constructor( uniforms ){

    this._uniforms = uniforms;
    this._functions = {};
    this._main = '';

  }

  functions(){

    if( this._main === ''){
      // if main is empty, functions can not have been computed
      this.main();

    }

    let content = '';
    for ( let property in this._functions ) {
    
      content  += this._functions[property] + '\n';
    
    }
    
    return content;

  }

  uniforms(){

    let content = '';
    for ( let property in this._uniforms ) {
      
      let uniform = this._uniforms[property];
      content += `uniform ${uniform.typeGLSL} ${property}`; 
      
      if( uniform && uniform.length ){
      
        content += `[${uniform.length}]`;
      
      }
      
      content += ';\n';
    
    }
    
    return content;

  }

  main(){
  
    // need to pre-call main to fill up the functions list
    this._main = `
void intersectBox(vec3 rayOrigin, vec3 rayDirection, vec3 boxMin, vec3 boxMax, out float tNear, out float tFar, out bool intersect){
  // compute intersection of ray with all six bbox planes
  vec3 invRay = vec3(1.) / rayDirection;
  vec3 tBot = invRay * (boxMin - rayOrigin);
  vec3 tTop = invRay * (boxMax - rayOrigin);
  // re-order intersections to find smallest and largest on each axis
  vec3 tMin = min(tTop, tBot);
  vec3 tMax = max(tTop, tBot);
  // find the largest tMin and the smallest tMax
  float largest_tMin = max(max(tMin.x, tMin.y), max(tMin.x, tMin.z));
  float smallest_tMax = min(min(tMax.x, tMax.y), min(tMax.x, tMax.z));
  tNear = largest_tMin;
  tFar = smallest_tMax;
  intersect = smallest_tMax > largest_tMin;
}

void getIntensity(in vec3 dataCoordinates, out float intensity, out vec3 gradient){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  ${shadersInterpolation( this, 'dataCoordinates', 'dataValue', 'gradient' )}

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

void main(void) {
  const int maxSteps = 1024;

  // the ray
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  // the Axe-Aligned B-Box
  vec3 AABBMin = vec3(uWorldBBox[0], uWorldBBox[2], uWorldBBox[4]);
  vec3 AABBMax = vec3(uWorldBBox[1], uWorldBBox[3], uWorldBBox[5]);

  // Intersection ray/bbox
  float tNear, tFar;
  bool intersect = false;
  intersectBox(rayOrigin, rayDirection, AABBMin, AABBMax, tNear, tFar, intersect);
  if (tNear < 0.0) tNear = 0.0;

  // init the ray marching
  float tCurrent = tNear;
  float tStep = (tFar - tNear) / float(uSteps);
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;

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

    if ( all(greaterThanEqual(currentVoxel, vec3(0.0))) &&
         all(lessThan(currentVoxel, vec3(float(uDataDimensions.x), float(uDataDimensions.y), float(uDataDimensions.z))))) {
    // mapped intensity, given slope/intercept and window/level
    float intensity = 0.0;
    vec3 gradient = vec3(0., 0., 0.);
    getIntensity(currentVoxel, intensity, gradient);

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

    alphaSample = alphaSample * uAlphaCorrection;
    alphaSample *= (1.0 - accumulatedAlpha);

    accumulatedColor += alphaSample * colorSample;
    accumulatedAlpha += alphaSample;

    }


    tCurrent += tStep;

    if(tCurrent > tFar || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
}
   `;

  }

  compute(){

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