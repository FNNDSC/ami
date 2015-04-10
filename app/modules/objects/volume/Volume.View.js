'use strict';

var VJS = VJS || {};
VJS.volume = VJS.volume || {};

//
// HOLDS DATA AND PROVIDE SOME FUNCTIONS TO ACCESS DATA EASILY
//

VJS.volume.view = function(volumeCore) {
    // general information
    this._volumeCore = volumeCore;
};

VJS.volume.view.prototype.RASBBox = function(material) {
    // create the Box (centered on 0?)
    var cubeGeometry = new THREE.BoxGeometry(this._volumeCore._ras.dimensions.x, this._volumeCore._ras.dimensions.y, this._volumeCore._ras.dimensions.z);
    var cube = new THREE.Mesh(cubeGeometry, material);
    // move box center to RAS Center
    cube.applyMatrix(new THREE.Matrix4().makeTranslation(this._volumeCore._ras.center.x, this._volumeCore._ras.center.y, this._volumeCore._ras.center.z));
    return cube;
};

VJS.volume.view.prototype.IJKBBoxOriented = function(material) {
    // Draw BBox and orientend BBox  var cubeGeometry = new THREE.BoxGeometry(ijkDims[0], ijkDims[1], ijkDims[2]);
    var cubeGeometry = new THREE.BoxGeometry(this._volumeCore._ijk.dimensions.x, this._volumeCore._ijk.dimensions.y, this._volumeCore._ijk.dimensions.z);
    var cube = new THREE.Mesh(cubeGeometry, material);
    // center geometry on (0, 0, 0)
    // .5 offset is strange...
    cube.applyMatrix(new THREE.Matrix4().makeTranslation(this._volumeCore._ijk.dimensions.x / 2 - 0.5, this._volumeCore._ijk.dimensions.y / 2 - 0.5, this._volumeCore._ijk.dimensions.z / 2 - 0.5));
    // move to RAS space
    cube.applyMatrix(this._volumeCore._transforms.ijk2ras);
    return cube;
};
