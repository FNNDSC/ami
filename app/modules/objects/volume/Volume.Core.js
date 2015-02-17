var VJS = VJS || {};
VJS.Volume = VJS.Volume || {};

//
// HOLDS DATA AND PROVIDE SOME FUNCTIONS TO ACCESS DATA EASILY
//

VJS.Volume.Core = function(_data, _max, _min, _transforms, _ijk, _ras){
  // general information
  this._Data = _data;
  this._Textures = null;
  this._Max = _max;
  this._Min = _min;
  this._Transforms = _transforms;
  this._IJK = _ijk;
  this._RAS = _ras;

  // RGBA
  this._NbChannels = 4;

  // Number or textures for this volume
  this._TextureNb = 0;
  this._TextureSize = 0;

}

// Texture Number and Texture Size
// here we do not grab RBG values from Data yet...
VJS.Volume.Core.prototype.createTexture = function(tNumber, tSize){
  //
  // 1) check if we have enough room in textures!!
  // 
  var requiredPixels = this._IJK.dimensions.x * this._IJK.dimensions.y * this._IJK.dimensions.z * this._NbChannels;
  if(requiredPixels > tSize*tSize*this._NbChannels*tNumber){
    window.console.log("== WARNING ==");
    window.console.log("Too many pixels to fit in shader, go for canvas 2D...");
  }

  // parse _data
  var rawData = [];
  for(var i=0; i<tNumber; i++){
    rawData.push(new Uint8Array(tSize * tSize * this._NbChannels));
  }

  // Can not just use subarray because we have to normalize the values (Uint* 0<x<255)
  for (var i = 0; i< tSize * tSize * tNumber; i++) {

    var textureIndex = Math.floor(i/ (tSize * tSize) );
    var inTextureIndex = i % (tSize * tSize);

    // normalize value
    var normalizedValue = 255 * ((this._Data[i] - this._Min) / (this._Max - this._Min));

    // RGB
    rawData[textureIndex][4*inTextureIndex] = normalizedValue;
    rawData[textureIndex][4*inTextureIndex + 1] = normalizedValue;
    rawData[textureIndex][4*inTextureIndex + 2] = normalizedValue;
    // ALPHA
    rawData[textureIndex][4*inTextureIndex + 3] = 255;
  }

  // create threeJS textures
  this._Textures = [];
  for(var i=0; i<tNumber; i++){
    var tex = new THREE.DataTexture( rawData[i], tSize, tSize, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter );
    tex.needsUpdate = true;
    this._Textures.push(tex);
  }
}

// t
VJS.Volume.Core.prototype.getValue = function(i, j, k, t, normalized){
  var value = this._Data[i + this._IJK.dimensions.x*j + this._IJK.dimensions.x*this._IJK.dimensions.y*k + this._IJK.dimensions.x*this._IJK.dimensions.y*this._IJK.dimensions.z*t];
  if(normalized){
    return 255 * ((value - this._Min) / (this._Max - this._Min));
  }
  else{
    return value;
  }
}