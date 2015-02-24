'use strict';

var VJS = VJS || {};
VJS.Slice = VJS.Slice || {};

VJS.Slice.View = function(sliceCore) {
    this._SliceCore = sliceCore;
    this._Convention = '';
    this._Orientation = '';
    this._toRASTransform = null;
};

VJS.Slice.View.prototype.RASSlice = function(tSize, tNumber) {
    //
    // create material from target Volume
    // setup uniforms

    window.console.log(tNumber);
    var magicM = this.GetMagicTransform();
    var magicMInverse = new THREE.Matrix4().getInverse(magicM);

    var shaderSlice = VJS.Slice.Shader;
    var uniforms = shaderSlice.slice.uniforms;
    uniforms.uTextureSize.value = tSize;
    var textures = this._SliceCore._VolumeCore._Textures;
    uniforms.t00.value = textures[0];
    uniforms.t01.value = textures[1];
    uniforms.t02.value = textures[2];
    uniforms.t03.value = textures[3];
    uniforms.uIJKDims.value = this._SliceCore._VolumeCore._IJK.dimensions;
    uniforms.uRASToIJK.value = this._SliceCore._VolumeCore._Transforms.ras2ijk.multiply(magicMInverse);

    var mat = new THREE.ShaderMaterial({
        'side': THREE.DoubleSide,
        'transparency': true,
        'uniforms': uniforms,
        'vertexShader': shaderSlice.slice.vertexShader,
        'fragmentShader': shaderSlice.slice.fragmentShader,
    });

    // create geometry
    var geometry = new THREE.PlaneGeometry(this._SliceCore._Width, this._SliceCore._Height);
    geometry.verticesNeedUpdate = true;

    var plane = new THREE.Mesh(geometry, mat);
    // move to RAS Space
    plane.applyMatrix(this._SliceCore._Transforms.xy2ras);
    plane.applyMatrix(new THREE.Matrix4().makeTranslation(this._SliceCore._Origin.x, this._SliceCore._Origin.y, this._SliceCore._Origin.z));
    plane.applyMatrix(magicM);

    return plane;
};

VJS.Slice.View.prototype.updateRASSlice = function(plane) {

    var magicM = this.GetMagicTransform();
    // Should get all information from there or from the Core...!
    // update plane geometry
    var geometry = new THREE.PlaneGeometry(this._SliceCore._Width, this._SliceCore._Height);
    geometry.verticesNeedUpdate = true;
    plane.geometry = geometry;

    // update transform matrix
    plane.matrix = this._SliceCore._Transforms.xy2ras;
    plane.applyMatrix(new THREE.Matrix4().makeTranslation(this._SliceCore._Origin.x, this._SliceCore._Origin.y, this._SliceCore._Origin.z));
    plane.applyMatrix(magicM);

};

VJS.Slice.View.prototype.SliceRASBBoxIntersection = function(material) {
    var spheres = [];
    var solutions = this._SliceCore._IntersectionRASBBoxPlane[0];
    for (var i = 0; i < solutions.length; i++) {
        var sphereGeometry = new THREE.SphereGeometry(1);
        var sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(solutions[i].x, solutions[i].y, solutions[i].z));
        spheres.push(sphere);
    }

    return spheres;
};

VJS.Slice.View.prototype.GetMagicTransform = function() {
    var magicTransform = new THREE.Matrix4();

    if (this._Convention === 'NEURO') {
        if (this._Orientation === 'SAG') {


        } else if (this._Orientation === 'COR') {

        } else if (this._Orientation === 'AX') {

        }
    } else if (this._Convention === 'RADIOLOGY') {
        if (this._Orientation === 'SAGITTAL') {
            // center slice on RAS (0,0,0)
            var translate = new THREE.Matrix4().makeTranslation(-this._SliceCore._Origin.x, -this._SliceCore._Origin.y, -this._SliceCore._Origin.z);

            // rotate around X by 90 degrees
            var beta = Math.PI / 2; //-Math.PI / 2;
            var rotate = new THREE.Matrix4().makeRotationX(beta);

            // rotate around X by 0 degrees? Have to figure out ortho camera bug
            // http://stackoverflow.com/questions/28698173/rotations-between-orthographic-and-persepective-camera
            var gamma = 0; //-Math.PI;
            var rotate2 = new THREE.Matrix4().makeRotationY(gamma);

            // center slice on its origin
            var translate2 = new THREE.Matrix4().makeTranslation(this._SliceCore._Origin.x, this._SliceCore._Origin.y, this._SliceCore._Origin.z);

            // apply transforms
            magicTransform.multiply(translate2).multiply(rotate2).multiply(rotate).multiply(translate);

        } else if (this._Orientation === 'COR') {

        } else if (this._Orientation === 'AX') {

        }
    }
    return magicTransform;
};
