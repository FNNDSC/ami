'use strict';

var VJS = VJS || {};
VJS.Cameras = VJS.Cameras || {};

VJS.Cameras.Camera2D = function(left, right, top, bottom, near, far, position) {
    this._Camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    this._Camera.position.x = position.x;
    this._Camera.position.y = position.y;
    this._Camera.position.z = position.z;

};

VJS.Cameras.Camera2D.prototype.Orientation = function(orientation) {
    switch (orientation) {
        case 'SAGITTAL':
            this._Camera.position.x = -400;
            this._Camera.position.y = 0;
            this._Camera.position.z = 0;
            this._Camera.up.set(0, 0, 1);
            break;

        case 'CORONAL':
            break;

        case 'AXIAL':
            this._Camera.position.x = 0;
            this._Camera.position.y = 0;
            this._Camera.position.z = -400;
            this._Camera.up.set(0, 1, 0);
            break;

        default:
            break;

    }

    // update lookat!

};

VJS.Cameras.Camera2D.prototype.GetCamera = function() {
    return this._Camera;
};
