import ShadersBase from '../shaders.base';
import InterpolationIdentity from './shaders.interpolation.identity';

class InterpolationTrilinear extends ShadersBase {

  constructor() {
    super();
    this.name = 'interpolationTrilinear';

    // default properties names
    this._currentVoxel = 'currentVoxel';
    this._dataValue = 'dataValue';
    this._gradient = 'gradient';
  }

  api(baseFragment = this._base, currentVoxel = this._currentVoxel, dataValue = this._dataValue, gradient = this._gradient) {
    this._base = baseFragment;
    return this.compute(currentVoxel, dataValue, gradient);
  }

  compute(currentVoxel, dataValue, gradient) {
    this.computeDefinition();
    this._base._functions[this._name] = this._definition;
    return `${this._name}(${currentVoxel}, ${dataValue}, ${gradient});`;
  }

  computeDefinition() {
    this._definition = `
void ${this._name}(in vec3 currentVoxel, out vec4 dataValue, out vec3 gradient){

  // https://en.wikipedia.org/wiki/Trilinear_interpolation
  vec3 lower_bound = vec3(floor(currentVoxel.x), floor(currentVoxel.y), floor(currentVoxel.z));
  if(lower_bound.x < 0.){
    lower_bound.x = 0.;
  }
  if(lower_bound.y < 0.){
    lower_bound.y = 0.;
  }
  if(lower_bound.z < 0.){
    lower_bound.z = 0.;
  }
  
  vec3 higher_bound = lower_bound + vec3(1);

  float xd = ( currentVoxel.x - lower_bound.x ) / ( higher_bound.x - lower_bound.x );
  float yd = ( currentVoxel.y - lower_bound.y ) / ( higher_bound.y - lower_bound.y );
  float zd = ( currentVoxel.z - lower_bound.z ) / ( higher_bound.z - lower_bound.z );

  //
  // c00
  //

  //

  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c000 = vec3(lower_bound.x, lower_bound.y, lower_bound.z);
  ${InterpolationIdentity.api(this._base, 'c000', 'v000')}
  vec3 g000 = v000.r * vec3(-1., -1., -1.);

  //

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c100 = vec3(higher_bound.x, lower_bound.y, lower_bound.z);
  ${InterpolationIdentity.api(this._base, 'c100', 'v100')}
  vec3 g100 = v100.r * vec3(1., -1., -1.);

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c001 = vec3(lower_bound.x, lower_bound.y, higher_bound.z);
  ${InterpolationIdentity.api(this._base, 'c001', 'v001')}
  vec3 g001 = v001.r * vec3(-1., -1., 1.);

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c101 = vec3(higher_bound.x, lower_bound.y, higher_bound.z);
  ${InterpolationIdentity.api(this._base, 'c101', 'v101')}
  vec3 g101 = v101.r * vec3(1., -1., 1.);

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c010 = vec3(lower_bound.x, higher_bound.y, lower_bound.z);
  ${InterpolationIdentity.api(this._base, 'c010', 'v010')}
  vec3 g010 = v010.r * vec3(-1., 1., -1.);

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c110 = vec3(higher_bound.x, higher_bound.y, lower_bound.z);
  ${InterpolationIdentity.api(this._base, 'c110', 'v110')}
  vec3 g110 = v110.r * vec3(1., 1., -1.);

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c011 = vec3(lower_bound.x, higher_bound.y, higher_bound.z);
  ${InterpolationIdentity.api(this._base, 'c011', 'v011')}
  vec3 g011 = v011.r * vec3(-1., 1., 1.);

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c111 = vec3(higher_bound.x, higher_bound.y, higher_bound.z);
  ${InterpolationIdentity.api(this._base, 'c111', 'v111')}
  vec3 g111 = v111.r * vec3(1., 1., 1.);

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  dataValue = c;

  // compute gradient
  gradient = g000 + g100 + g010 + g110 + g011 + g111 + g110 + g011;
  // gradientMagnitude = length(gradient);
  // // https://en.wikipedia.org/wiki/Normal_(geometry)#Transforming_normals
  // vec3 localNormal = (-1. / gradientMagnitude) * gradient;
  // normal = normalize(normalPixelToPatient${this.id} * localNormal);
  //normal = gradient;

}
    `;
  }


}

export default new InterpolationTrilinear();
