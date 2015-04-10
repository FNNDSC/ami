'use strict';

var VJS = VJS || {};
VJS.slice = VJS.slice || {};

VJS.slice.view = function(sliceCore) {
    this._sliceCore = sliceCore;
};

VJS.slice.view.prototype.RASSlice = function() {
    //
    // create material from target Volume
    // setup uniforms
    var shaderSlice = VJS.slice.shader;
    var uniforms = shaderSlice.slice.uniforms;
    uniforms.uTextureSize.value = this._sliceCore._volumeCore._textureSize;
    var textures = this._sliceCore._volumeCore._textures;
    // 4 textures...
    uniforms.t00.value = textures[0];
    uniforms.t01.value = textures[1];
    uniforms.t02.value = textures[2];
    uniforms.t03.value = textures[3];
    uniforms.uIJKDims.value = this._sliceCore._volumeCore._ijk.dimensions;
    uniforms.uRASToIJK.value = this._sliceCore._volumeCore._transforms.ras2ijk;

    var mat = new THREE.ShaderMaterial({
        // 'wireframe': true,
        'side': THREE.DoubleSide,
        'transparency': true,
        'uniforms': uniforms,
        'vertexShader': shaderSlice.slice.vertexShader,
        'fragmentShader': shaderSlice.slice.fragmentShader,
    });

    // create geometry
    var vGeometry = this.sliceGeometry();
    // ... and mesh
    var plane = new THREE.Mesh(vGeometry, mat);

    // should it be separate...?
    // create the border!
    var material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    var geometry = new THREE.Geometry();
    for (var i = 0; i < this._sliceCore._intersections.length; i++) {
        geometry.vertices.push(this._sliceCore._intersections[i]);
    }
    geometry.vertices.push(this._sliceCore._intersections);
    var line = new THREE.Line(geometry, material);


    var group = new THREE.Object3D();
    group.add(plane);
    group.add(line);

    return group;
};

VJS.slice.view.prototype.updateRASSlice = function(plane) {
    // Should get all information from there or from the Core...!
    plane.geometry = this.sliceGeometry();
};

VJS.slice.view.prototype.sliceGeometry = function() {

    var sliceGeom = null;

    var sliceShape = new THREE.Shape();
    // move to first point!
    sliceShape.moveTo(this._sliceCore._intersectionsXY[0].x, this._sliceCore._intersectionsXY[0].y);


    // loop through all points!
    for (var i = 1; i < this._sliceCore._intersectionsXY.length; i++) {
        // project each on plane!
        sliceShape.lineTo(this._sliceCore._intersectionsXY[i].x, this._sliceCore._intersectionsXY[i].y);
    }

    // close the shape!
    sliceShape.lineTo(this._sliceCore._intersectionsXY[0].x, this._sliceCore._intersectionsXY[0].y);

    // Generate Geomotry. (all we care about is triangulation!)
    sliceGeom = new THREE.ShapeGeometry(sliceShape);

    // update real position of each vertex!
    sliceGeom.vertices = this._sliceCore._intersections;
    sliceGeom.verticesNeedUpdate = true;

    return sliceGeom;
};

// COM
// CORNERS
// BORDER?
