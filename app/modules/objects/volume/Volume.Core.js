'use strict';

var VJS = VJS || {};
VJS.volume = VJS.volume || {};

/**
 * Core of volume module. Holds all information related to the volume.
 * Provides core volume-related functionnalities.
 * Doesn't deal with the visualization of the volume.
 *
 * @constructor
 * @param {Array} data - Raw data that represents the volume
 * @param {Number} max - Maximum intensity in the volume. Used for data
 *     normalization. (should probably by rgb array...)
 * @param {Number} min - Minimum intensity in the volume. Used for data
 *     normalization. (should probably by rgb array...)
 * @param {Object} transforms - All volume related transforms, such as ijk to ras.
 * @param {Object} ijk - All ijk related information, such as dimensions, origin, etc.
 * @param {Object} ras - All ras related information, such as dimensions, origin, etc.
 * @param {Number} nbTexture - Number of textures to be generated from the raw data.
 * @param {Number} maxTextureSize - Size of each texture to be generated from the raw data.
 */
VJS.volume.core = function(data, max, min, transforms, ijk, ras, nbTexture, maxTextureSize) {
    // general information
    this._data = data;
    this._textures = null;
    this._max = max;
    this._min = min;
    this._transforms = transforms;
    this._ijk = ijk;
    this._ras = ras;
    this._orientation = null;
    this._halfDimensions = null;

    // http://dicomiseasy.blogspot.com.es/2012/08/chapter-12-pixel-data.html
    // SamplesPerPixel
    // PhotometricInterpretation
    // PlanarConfiguration
    // NumberOfFrames

    // how do we go from IJK TO RAS easily?

    // RGBA
    this._nbChannels = 4;

    // Number or textures for this volume
    this._textureNb = nbTexture;
    this._textureSize = maxTextureSize;

    this.computeConvenienceVars();

};

/**
 * Convenience method to generate extra information about the volume.
 */
VJS.volume.core.prototype.computeConvenienceVars = function() {
    this._halfDimensions = new THREE.Vector3(
        this._ijk.dimensions.x / 2, this._ijk.dimensions.y / 2, this._ijk.dimensions.z / 2);

    var baseX = new THREE.Vector3(1, 0, 0);
    var baseY = new THREE.Vector3(0, 1, 0);
    var baseZ = new THREE.Vector3(0, 0, 1);
    this._orientation = new THREE.Vector3(baseX, baseY, baseZ);
};

/**
 * Generate textures from the raw data. Number of textures and size of each
 * texture depends on what was provided to the contructor.
 */
VJS.volume.core.prototype.createTexture = function() {
    //
    // 1) check if we have enough room in textures!!
    // 
    var requiredPixels = this._ijk.dimensions.x * this._ijk.dimensions.y * this._ijk.dimensions.z * this._nbChannels;
    if (requiredPixels > this._textureSize * this._textureSize * this._nbChannels * this._textureNb) {
        window.console.log('== WARNING ==');
        window.console.log('Too many pixels to fit in shader, go for canvas 2D...');
    }

    // parse _data
    var rawData = [];
    for (var i = 0; i < this._textureNb; i++) {
        rawData.push(new Uint8Array(this._textureSize * this._textureSize * this._nbChannels));
    }

    // Can not just use subarray because we have to normalize the values (Uint* 0<x<255)
    for (var j = 0; j < this._textureSize * this._textureSize * this._textureNb; j++) {

        var textureIndex = Math.floor(j / (this._textureSize * this._textureSize));
        var inTextureIndex = j % (this._textureSize * this._textureSize);

        // normalize value
        var normalizedValue = 255 * ((this._data[j] - this._min) / (this._max - this._min));

        // RGB
        rawData[textureIndex][4 * inTextureIndex] = normalizedValue;
        rawData[textureIndex][4 * inTextureIndex + 1] = normalizedValue;
        rawData[textureIndex][4 * inTextureIndex + 2] = normalizedValue;
        // ALPHA
        rawData[textureIndex][4 * inTextureIndex + 3] = 255;

        if (inTextureIndex >= requiredPixels) {
            break;
        }
    }

    // create threeJS textures
    this._textures = [];
    for (var k = 0; k < this._textureNb; k++) {
        var tex = new THREE.DataTexture(rawData[k], this._textureSize, this._textureSize, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
        tex.needsUpdate = true;
        this._textures.push(tex);
    }
};

/**
 * Return value of voxel.
 * Should return RBG array probably...
 *
 * @param {Number} i - I index of the voxel (i.e. in plane Column index).
 * @param {Number} j - J index of the voxel (i.e. in plane Row index).
 * @param {Number} k - K index of the voxel (i.e. Slice index).
 * @param {Number} t - T index of the voxel (i.e. Time index).
 * @param {Boolean} normalized - If true, the returned value is normalized
 *     between 0-255.
 *
 * @returns {Number}
 */
VJS.volume.core.prototype.getValue = function(i, j, k, t, normalized) {
    var value = this._data[i + this._ijk.dimensions.x * j + this._ijk.dimensions.x * this._ijk.dimensions.y * k + this._ijk.dimensions.x * this._ijk.dimensions.y * this._ijk.dimensions.z * t];
    if (normalized) {
        return 255 * ((value - this._min) / (this._max - this._min));
    } else {
        return value;
    }
};
