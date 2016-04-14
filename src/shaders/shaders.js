/*** Imports ***/
let glslify =  require('glslify');

import DataUniforms from './shaders.data.js';
let DataVertex   = glslify('./shaders.data.vert');
let DataFragment = glslify('./shaders.data.frag');

import RaycastingUniforms from './shaders.raycasting.js';
let RaycastingFirstpassFragment  = glslify('./shaders.raycasting.firstPass.frag');
let RaycastingSecondpassVertex   = glslify('./shaders.raycasting.secondPass.vert');
let RaycastingSecondpassFragment = glslify('./shaders.raycasting.secondPass.frag');
let RaycastingSinglepassVertex   = glslify('./shaders.raycasting.singlePass.vert');
let RaycastingSinglepassFragment = glslify('./shaders.raycasting.singlePass.frag');

/**
 * @module shaders
 */

export default {
  
  DataUniforms,
  DataVertex,
  DataFragment,

  RaycastingUniforms,
  RaycastingFirstpassFragment,
  RaycastingSecondpassVertex,
  RaycastingSecondpassFragment
};
