import ShadersBase           from '../shaders.base';
import InterpolationIdentity from './shaders.interpolation.identity';

class InterpolationTrilinear extends ShadersBase {
  
  constructor(){

    super();
    this.name = 'interpolationTrilinear';

    // default properties names
    this._currentVoxel = 'currentVoxel';
    this._dataValue = 'dataValue';

  }

  api( baseFragment = this._base, currentVoxel = this._currentVoxel, dataValue = this._dataValue){

    this._base = baseFragment;
    return this.compute(currentVoxel, dataValue);

  }

  compute( currentVoxel, dataValue ){

    this.computeDefinition();
    this._base._functions[this._name] = this._definition;
    return `${this._name}(${currentVoxel}, ${dataValue});`;

  }

  computeDefinition(){

    this._definition = `
void ${this._name}(in vec3 currentVoxel, out vec4 dataValue){

  // https://en.wikipedia.org/wiki/Trilinear_interpolation
  vec3 lower_bound = vec3(floor(currentVoxel.x), floor(currentVoxel.y), floor(currentVoxel.z));
  vec3 higher_bound = vec3(ceil(currentVoxel.x), ceil(currentVoxel.y), ceil(currentVoxel.z));

  float xd = ( currentVoxel.x - lower_bound.x ) / ( higher_bound.x - lower_bound.x );
  float yd = ( currentVoxel.y - lower_bound.y ) / ( higher_bound.y - lower_bound.y );
  float zd = ( currentVoxel.z - lower_bound.z ) / ( higher_bound.z - lower_bound.z );

  //
  // c00
  //

  //

  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c000 = vec3(lower_bound.x, lower_bound.y, lower_bound.z);
  ${InterpolationIdentity.api( this._base, 'c000', 'v000')}

  //

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c100 = vec3(higher_bound.x, lower_bound.y, lower_bound.z);
  ${InterpolationIdentity.api( this._base, 'c100', 'v100')}

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c001 = vec3(lower_bound.x, lower_bound.y, higher_bound.z);
  ${InterpolationIdentity.api( this._base, 'c001', 'v001')}

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c101 = vec3(higher_bound.x, lower_bound.y, higher_bound.z);
  ${InterpolationIdentity.api( this._base, 'c101', 'v101')}

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c010 = vec3(lower_bound.x, higher_bound.y, lower_bound.z);
  ${InterpolationIdentity.api( this._base, 'c010', 'v010')}

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c110 = vec3(higher_bound.x, higher_bound.y, lower_bound.z);
  ${InterpolationIdentity.api( this._base, 'c110', 'v110')}

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c011 = vec3(lower_bound.x, higher_bound.y, higher_bound.z);
  ${InterpolationIdentity.api( this._base, 'c011', 'v011')}

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c111 = vec3(higher_bound.x, higher_bound.y, higher_bound.z);
  ${InterpolationIdentity.api( this._base, 'c111', 'v111')}

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  dataValue = c;

}
    `;


  }


}

export default new InterpolationTrilinear();
