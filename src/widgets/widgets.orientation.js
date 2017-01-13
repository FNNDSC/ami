'use strict';

let VJS = VJS || {};
VJS.widgets = VJS.widgets || {};

VJS.widgets.orientation = function(parentID, targetCamera, targetControl) {
    this._ParentId = parentID;
    this._TargetCamera = targetCamera;
    this._TargetControl = targetControl;
    this._DomElement = null;
    this._Renderer = null;
    this._Scene = null;
    this._Camera = null;
    this._Axes = null;

    this._Style = {
        width: 200,
        height: 200,
    };

    this.createDomContainer();
    this.setupObject();
};

VJS.widgets.orientation.prototype.createDomContainer = function() {
    // create it
    this._DomElement = document.createElement('div');
    this._DomElement.setAttribute('id', 'VJSOrientation');

    // style it
    this._DomElement.style.width = this._Style.width + 'px';
    this._DomElement.style.height = this._Style.height + 'px';

    // attach it
    let parent = document.getElementById(this._ParentId);
    parent.appendChild(this._DomElement);
};

VJS.widgets.orientation.prototype.setupObject = function() {
    this._Renderer = new THREE.WebGLRenderer({
        alpha: true,
    });
    this._Renderer.setClearColor(0x000000, 0);
    this._Renderer.setSize(this._Style.width, this._Style.height);
    this._DomElement.appendChild(this._Renderer.domElement);

    this._Scene = new THREE.Scene();

    // camera
    this._Camera = new THREE.PerspectiveCamera(50, this._Style.width / this._Style.height, 1, 1000);
    this._Camera.up = this._TargetCamera.up; // important!

    // axes
    this._Axes = new THREE.AxisHelper(100);
    this._Scene.add(this._Axes);
};


VJS.widgets.orientation.prototype.update = function() {
    // call to render!
    this._Camera.position.copy(this._TargetCamera.position);
    this._Camera.position.sub(this._TargetControl.target); // added by @libe
    this._Camera.position.setLength(300);

    this._Camera.lookAt(this._Scene.position);

    this._Renderer.render(this._Scene, this._Camera);
};

/** * Exports ***/

let moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports = VJS.widgets.orientation;
}

// // create arrow helper scene
//     // scene
// var scene2 = new THREE.Scene();
// // camera
// var camera2 = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
// camera2.position.x = -30;
// camera2.up.set(0, 0, 1);
// camera2.lookAt(scene2.position);
// // controls
// controls2 = new THREE.OrbitControls2D(camera2, renderer.domElement);
// controls2.noZoom = true;
// controls2.noPan = true;
// // direction (normalized), origin, length, color(hex)
// var origin = new THREE.Vector3(0, 0, 0);
// var terminus = new THREE.Vector3(10, 0, 0);
// var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
// var r = new THREE.ArrowHelper(direction, origin, 5, 0xF44336);
// scene2.add(r);
// var origin = new THREE.Vector3(0, 0, 0);
// var terminus = new THREE.Vector3(0, 10, 0);
// var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
// var a = new THREE.ArrowHelper(direction, origin, 5, 0x2196F3);
// scene2.add(a);
// var origin = new THREE.Vector3(0, 0, 0);
// var terminus = new THREE.Vector3(0, 0, 10);
// var direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
// var s = new THREE.ArrowHelper(direction, origin, 5, 0x4CAF50);
// scene2.add(s);
