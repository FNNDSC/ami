'use strict';

var VJS = VJS || {};
VJS.Volume = VJS.Volume || {};

//
// HOLDS DATA AND PROVIDE SOME FUNCTIONS TO ACCESS DATA EASILY
//

VJS.Volume.View = function(volumeCore){
  // general information
  this._volumeCore = volumeCore;
};

VJS.Volume.View.prototype.RASBBox = function(material){
  // create the Box (centered on 0?)
  var cubeGeometry = new THREE.BoxGeometry(this._volumeCore._RAS.dimensions.x, this._volumeCore._RAS.dimensions.y, this._volumeCore._RAS.dimensions.z);
  var cube = new THREE.Mesh(cubeGeometry, material);
  // move box center to RAS Center
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(this._volumeCore._RAS.center.x, this._volumeCore._RAS.center.y, this._volumeCore._RAS.center.z) );
  return cube;
};

VJS.Volume.View.prototype.IJKBBoxOriented = function(material){
  // Draw BBox and orientend BBox  var cubeGeometry = new THREE.BoxGeometry(ijkDims[0], ijkDims[1], ijkDims[2]);
  var cubeGeometry = new THREE.BoxGeometry(this._volumeCore._IJK.dimensions.x, this._volumeCore._IJK.dimensions.y, this._volumeCore._IJK.dimensions.z);
  var cube = new THREE.Mesh(cubeGeometry, material);
  // center geometry on (0, 0, 0)
  // .5 offset is strange...
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(this._volumeCore._IJK.dimensions.x/2 - 0.5 , this._volumeCore._IJK.dimensions.y/2 - 0.5, this._volumeCore._IJK.dimensions.z/2 - 0.5) );
  // move to RAS space
  cube.applyMatrix( this._volumeCore._Transforms.ijk2ras );
  return cube;
};