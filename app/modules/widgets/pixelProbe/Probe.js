'use strict';

var VJS = VJS || {};
VJS.Widgets = VJS.Widget || {};

VJS.Widgets.Probe = function() {
    this.domElement = null;
    this.rasContainer = null;
    this.ijkContainer = null;
    this.valueContainer = null;

    this.volumeCore = null;

    this.createDomElement();
};

VJS.Widgets.Probe.prototype.createDomElement = function() {

    // RAS
    this.rasContainer = document.createElement('div');
    this.rasContainer.setAttribute('id', 'VJSProbeRAS');

    // IJK
    this.ijkContainer = document.createElement('div');
    this.ijkContainer.setAttribute('id', 'VJSProbeIJK');

    // Value
    this.valueContainer = document.createElement('div');
    this.valueContainer.setAttribute('id', 'VJSProbeValue');

    this.domElement = document.createElement('div');
    this.domElement.setAttribute('id', 'VJSProbe');
    this.domElement.appendChild(this.rasContainer);
    this.domElement.appendChild(this.ijkContainer);
    this.domElement.appendChild(this.valueContainer);
};


VJS.Widgets.Probe.prototype.updateUI = function(ras) {
    // convert point to IJK
    var ijk = new THREE.Vector3().copy(ras).applyMatrix4(this.volumeCore._Transforms.ras2ijk);
    ijk.x += 0.5;
    ijk.y += 0.5;
    ijk.z += 0.5;
    // get value!
    if (ijk.x >= 0 && ijk.y >= 0 && ijk.z >= 0 &&
        ijk.x <= this.volumeCore._IJK.dimensions.x &&
        ijk.y <= this.volumeCore._IJK.dimensions.y &&
        ijk.z <= this.volumeCore._IJK.dimensions.z) {

        var value = this.volumeCore.getValue(Math.floor(ijk.x), Math.floor(ijk.y), Math.floor(ijk.z), 0, false);
        this.updateUI2(ras, ijk, value);
    }
};

VJS.Widgets.Probe.prototype.updateUI2 = function(ras, ijk, value) {
    var rasContent = ras.x.toFixed(2) + ' : ' + ras.y.toFixed(2) + ' : ' + ras.z.toFixed(2);
    this.rasContainer.innerHTML = 'RAS: ' + rasContent;

    var ijkContent = Math.floor(ijk.x) + ' : ' + Math.floor(ijk.y) + ' : ' + Math.floor(ijk.z);
    this.ijkContainer.innerHTML = 'IJK: ' + ijkContent;

    var valueContent = value;
    this.valueContainer.innerHTML = 'Value: ' + valueContent;
};

VJS.Widgets.Probe.prototype.setVolumeCore = function(object) {
    this.volumeCore = object;
};
