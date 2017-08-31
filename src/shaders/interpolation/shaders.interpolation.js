import InterpolationIdentity from './shaders.interpolation.identity';
import InterpolationTrilinear from './shaders.interpolation.trilinear';

function shadersInterpolation(baseFragment, currentVoxel, dataValue, gradient) {
  switch (baseFragment._uniforms.uInterpolation.value) {
    case 0:
      // no interpolation
      return InterpolationIdentity.api(baseFragment, currentVoxel, dataValue);

    case 1:
      // trilinear interpolation
      return InterpolationTrilinear.api(baseFragment, currentVoxel, dataValue, gradient);

    default:
      return InterpolationIdentity.api(baseFragment, currentVoxel, dataValue);
  }
}

export default shadersInterpolation;
