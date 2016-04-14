'use strict';

var VJS = VJS || {};
VJS.widgets = VJS.widgets || {};

/**
 *
 * It is typically used to get information about an image from the mouse cursor.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#widget_squareProbe}
 *
 * @module widgets/squareProbe
 *
 */
VJS.widgets.squareProbe = function(helper, image, imageMeshes) {
    this.domElement = null;
    this.rasContainer = null;
    this.ijkContainer = null;
    this.valueContainer = null;

    this.helper = helper;
    this.imageMeshes = imageMeshes;
    this.image = image;
    this.handles = [];
    this.activeHandleId = null;

    this.volumeCore = null;

    this._worldCoordinate = null; //LPS
    this._dataCoordinate = null; //IJK
    this._dataValue = null; //
    this._labelValue = null; //
};

VJS.widgets.squareProbe.prototype.select = function(raycaster) {
    // calculate image intersecting against itself (ideally N spheres)
    var intersects = raycaster.intersectObjects(this.helper.children);
    var worldCoordinates = null;
    // Look for a handle
    for (var intersect in intersects) {
        worldCoordinates = new THREE.Vector3().copy(intersects[intersect].point);

        // if intersect a handle, select/un-select it!
        window.console.log(intersects[intersect]);
        if (intersects[intersect].object.name === 'squareProbeHandle') {
            window.console.log('intersect squareProbeHandle!');

            // select it!
            window.console.log('+++ select ', intersects[intersect].object.id);
            this.activeHandleId = intersects[intersect].object.id;

            return null;
        }
    }

    // Look for intersection against image
    window.console.log(this);
    intersects = raycaster.intersectObjects(this.imageMeshes);
    for (var intersect2 in intersects) {
        worldCoordinates = new THREE.Vector3().copy(intersects[intersect2].point);

        // might be better to re-loop
        // if we intersect an image with a ShaderMaterial
        // TODO: review that
        if (intersects[intersect2].object.material.type === 'ShaderMaterial') {
            window.console.log('intersect shader material!');
            window.console.log(intersects[intersect2]);
            if (this.handles.length < 2) {
                // create the geometry for it!
                var sphereGeometry = new THREE.SphereGeometry(1);
                var material = new THREE.MeshBasicMaterial({
                    // not selected: amber? #FFC107
                    // orange? #FF9800
                    // selected: deep orange? #FF5722
                    color: 0xFF5722
                });
                var sphere = new THREE.Mesh(sphereGeometry, material);
                sphere.applyMatrix(new THREE.Matrix4().makeTranslation(
                    worldCoordinates.x, worldCoordinates.y, worldCoordinates.z));
                sphere.name = 'squareProbeHandle';
                this.handles.push(sphere);

                // add it to the image!
                // should be a 3d object of its own...
                this.helper.add(sphere);

                return null;
            }

            return null;
        }
    }
};

VJS.widgets.squareProbe.prototype.unselect = function() {
    window.console.log('--- select ');

    this.activeHandleId = null;
};

VJS.widgets.squareProbe.prototype.computeValues = function() {
    // convert point to IJK
    if (this.image) {
        var worldToData = this.image._stack[0]._lps2IJK;

        var dataCoordinate = new THREE.Vector3().copy(this._worldCoordinate).applyMatrix4(worldToData);

        // same rounding in the shaders
        // window.console.log(dataCoordinate);
        dataCoordinate.x = Math.floor(dataCoordinate.x + 0.5);
        dataCoordinate.y = Math.floor(dataCoordinate.y + 0.5);
        dataCoordinate.z = Math.floor(dataCoordinate.z + 0.5);
        this._dataCoordinate = dataCoordinate;

        var textureSize = this.image._stack[0]._textureSize;
        var rows = this.image._stack[0]._rows;
        var columns = this.image._stack[0]._columns;

        var index = this._dataCoordinate.x + columns * this._dataCoordinate.y + rows * columns * this._dataCoordinate.z;

        var textureIndex = Math.floor(index / (textureSize * textureSize));
        var inTextureIndex = index % (textureSize * textureSize);

        this._dataValue = this.image._stack[0]._rawData[textureIndex][inTextureIndex];
    }
};

VJS.widgets.squareProbe.prototype.updateUI = function(mouse) {
    var rasContent = this._worldCoordinate.x.toFixed(2) + ' : ' + this._worldCoordinate.y.toFixed(2) + ' : ' + this._worldCoordinate.z.toFixed(2);
    this.rasContainer.innerHTML = 'LPS: ' + rasContent;

    var ijkContent = this._dataCoordinate.x + ' : ' + this._dataCoordinate.y + ' : ' + this._dataCoordinate.z;
    this.ijkContainer.innerHTML = 'IJK: ' + ijkContent;

    var valueContent = this._dataValue;
    this.valueContainer.innerHTML = 'Value: ' + valueContent;

    // position of the div...
    // need a mode to track the mouse
    document.getElementById('VJSProbe').style.display = 'block';
    document.getElementById('VJSProbe').style.top = mouse.clientY + 20;
    document.getElementById('VJSProbe').style.left = mouse.clientX + 20;

};

VJS.widgets.squareProbe.prototype.update = function(raycaster, mouse) {

    if (!this.imageMeshes) {
        return;
    }

    // calculate image intersecting the picking ray
    var intersects = raycaster.intersectObjects(this.imageMeshes);

    for (var intersect in intersects) {
        var worldCoordinates = new THREE.Vector3().copy(intersects[intersect].point);

        // if we intersect an image with a ShaderMaterial
        // TODO: review that
        if (intersects[intersect].object.material.type === 'ShaderMaterial') {
            this._worldCoordinate = worldCoordinates;
            // window.console.log(this._worldCoordinate);
            this.computeValues();
            this.updateUI(mouse);
            return;
        }
    }

    // hide UI if not intersecting the planne
    this.hideUI();
};

VJS.widgets.squareProbe.prototype.hideUI = function() {
    document.getElementById('VJSProbe').style.display = 'none';
};

/*** Exports ***/

var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports = VJS.widgets.squareProbe;
}
