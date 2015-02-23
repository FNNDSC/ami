'use strict';

var VJS = VJS || {};

VJS.Probe = function() {
    this.domElement = null;
    this.rasContainer = null;
    this.ijkContainer = null;
    this.valueContainer = null;

    this.createDomElement();
};

VJS.Probe.prototype.createDomElement = function() {

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

VJS.Probe.prototype.update = function(ras, ijk, value) {
    var rasContent = ras.x.toFixed(2) + ' : ' + ras.y.toFixed(2) + ' : ' + ras.z.toFixed(2);
    this.rasContainer.innerHTML = 'RAS: ' + rasContent;

    var ijkContent = Math.floor(ijk.x) + ' : ' + Math.floor(ijk.y) + ' : ' + Math.floor(ijk.z);
    this.ijkContainer.innerHTML = 'IJK: ' + ijkContent;

    var valueContent = value;
    this.valueContainer.innerHTML = 'Value: ' + valueContent;
};
