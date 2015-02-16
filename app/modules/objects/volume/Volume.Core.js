var VJS = VJS || {};

//
// HOLDS DATA AND PROVIDE SOME FUNCTIONS TO ACCESS DATA EASILY
//

VJS.Volume = function(_data, _dims, _max, _min, _IJKToRAS, _rasOrigin){
  // general information
  this._Data = _data;
  this._Textures = null;
  this._Dimensions = _dims;
  this._Max = _max;
  this._Min = _min;
  this._IJKToRAS = _IJKToRAS;
  this._RASOrigin = _rasOrigin;

  // RGBA
  this._NbChannels = 4;

  this._TextureNb = 0;
  this._TextureSize = 0;

}

// Texture Number and Texture Size
// here we do not grab RBG values from Data yet...
VJS.Volume.prototype.createTexture = function(tNumber, tSize){
  //
  // 1) check if we have enough room in textures!!
  // 
  var requiredPixels = tDimensions.x * tDimensions.y * tDimensions.z * this._NbChannels;
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
VJS.Volume.prototype.getValue = function(i, j, k, t, normalized){
  var value = this._Data[i + this._Dimensions[0]*j + this._Dimensions[0]*this._Dimensions[1]*k + this._Dimensions[0]*this._Dimensions[1]*this._Dimensions[2]*t];
  if(normalized){
    return 255 * ((value - this._Min) / (this._Max - this._Min));
  }
  else{
    return value;
  }
}