import ShadersBase from '../shaders.base';
import Unpack from '../helpers/shaders.helpers.unpack';
import Texture3d from '../helpers/shaders.helpers.texture3d';


class InterpolationIdentity extends ShadersBase {
  constructor() {
    super();
    this.name = 'interpolationIdentity';

    // default properties names
    this._currentVoxel = 'currentVoxel';
    this._dataValue = 'dataValue';
  }

    api(baseFragment = this._base, currentVoxel = this._currentVoxel, dataValue = this._dataValue) {
    this._base = baseFragment;
    return this.compute(currentVoxel, dataValue);
  }

  compute(currentVoxel, dataValue) {
    this.computeDefinition();
    this._base._functions[this._name] = this._definition;
    return `${this._name}(${currentVoxel}, ${dataValue});`;
  }


  computeDefinition() {
    this._definition = `
void ${this._name}(in vec3 currentVoxel, out vec4 dataValue){
  // lower bound
  vec3 rcurrentVoxel = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));
  ivec3 voxel = ivec3(int(rcurrentVoxel.x), int(rcurrentVoxel.y), int(rcurrentVoxel.z));

  vec4 tmp = vec4(0., 0., 0., 0.);
  int offset = 0;

  ${Texture3d.api(this._base, 'voxel', 'tmp', 'offset')}
  ${Unpack.api(this._base, 'tmp', 'offset', 'dataValue')}
}
    `;
  }
}

export default new InterpolationIdentity();
