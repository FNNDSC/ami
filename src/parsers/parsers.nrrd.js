// use nifti-js and just parse header.???

// Slicer way to handle images
// should follow it...
 // 897   if ( (this->IndexSeriesInstanceUIDs[k] != idxSeriesInstanceUID && this->IndexSeriesInstanceUIDs[k] >= 0 && idxSeriesInstanceUID >= 0) ||
 // 898        (this->IndexContentTime[k] != idxContentTime && this->IndexContentTime[k] >= 0 && idxContentTime >= 0) ||
 // 899        (this->IndexTriggerTime[k] != idxTriggerTime && this->IndexTriggerTime[k] >= 0 && idxTriggerTime >= 0) ||
 // 900        (this->IndexEchoNumbers[k] != idxEchoNumbers && this->IndexEchoNumbers[k] >= 0 && idxEchoNumbers >= 0) ||
 // 901        (this->IndexDiffusionGradientOrientation[k] != idxDiffusionGradientOrientation  && this->IndexDiffusionGradientOrientation[k] >= 0 && idxDiffusionGradientOrientation >= 0) ||
 // 902        (this->IndexSliceLocation[k] != idxSliceLocation && this->IndexSliceLocation[k] >= 0 && idxSliceLocation >= 0) ||
 // 903        (this->IndexImageOrientationPatient[k] != idxImageOrientationPatient && this->IndexImageOrientationPatient[k] >= 0 && idxImageOrientationPatient >= 0) )
 // 904     {
 // 905       continue;
 // 906     }

//http://brainder.org/2012/09/23/the-nifti-file-format/

/*** Imports ***/
import ParsersVolume from './parsers.volume';

let pako = require('pako');
let NrrdReader = require('nrrd-js');
/**
 * @module parsers/nifti
 */
export default class ParsersNifti extends ParsersVolume {
  constructor(data, id) {

    super();
    
    /**
      * @member
      * @type {arraybuffer}
    */
    this._id = id;
    this._arrayBuffer = data.buffer;
    this._url = data.url;
    this._dataSet = null;
    this._unpackedData = null;
    try{
      this._dataSet = NrrdReader.parse(this._arrayBuffer);
    }
    catch(error){
      window.console.log('ooops... :(');
    }

    window.console.log(this._dataSet);
  }

  seriesInstanceUID() {
    // use filename + timestamp..?
    return this._url;
  }

  numberOfFrames() {
    return this._dataSet.sizes[2];
  }

  numberOfChannels() {
    let numberOfChannels = 1;
    return numberOfChannels;
  }

  sopInstanceUID(frameIndex = 0) {
    return frameIndex;
  }

  rows(frameIndex = 0) {
    return this._dataSet.sizes[1];
  }

  columns(frameIndex = 0) {
    return this._dataSet.sizes[0];
  }

  pixelType(frameIndex = 0) {
    // 0 - int
    // 1 - float
    let pixelType = 0;
    if(this._dataSet.type === 'float'){
      pixelType = 1;
    }
    return pixelType;
  }

  bitsAllocated(frameIndex = 0) {
    let bitsAllocated = 1;

    if(this._dataSet.type === 'int8' ||
       this._dataSet.type === 'uint8' ||
       this._dataSet.type === 'char'){
      bitsAllocated = 8;
    }
    else if(this._dataSet.type === 'int16' ||
      this._dataSet.type === 'uint16' ||
      this._dataSet.type === 'short'){
      bitsAllocated = 16;
    }
    else if(this._dataSet.type === 'int32' ||
      this._dataSet.type === 'uint32' ||
      this._dataSet.type === 'float'){
      bitsAllocated = 32;
    }

    return bitsAllocated;
  }

  pixelSpacing(frameIndex = 0) {
    let x = new THREE.Vector3(
      this._dataSet.spaceDirections[0][0],
      this._dataSet.spaceDirections[0][1],
      this._dataSet.spaceDirections[0][2]);

    let y = new THREE.Vector3(
      this._dataSet.spaceDirections[1][0],
      this._dataSet.spaceDirections[1][1],
      this._dataSet.spaceDirections[1][2]);

    let z = new THREE.Vector3(
      this._dataSet.spaceDirections[2][0],
      this._dataSet.spaceDirections[2][1],
      this._dataSet.spaceDirections[2][2]);

    return [x.length(), y.length(), z.length()];
  }

  sliceThickness() {
    // should be a string...
    return null;//this._dataSet.pixDims[3].toString();
  }

  imageOrientation(frameIndex = 0) {
    let x = new THREE.Vector3(
      this._dataSet.spaceDirections[0][0],
      this._dataSet.spaceDirections[0][1],
      this._dataSet.spaceDirections[0][2]);
    x.normalize();

    let y = new THREE.Vector3(
      this._dataSet.spaceDirections[1][0],
      this._dataSet.spaceDirections[1][1],
      this._dataSet.spaceDirections[1][2]);
    y.normalize();

    return [
      x.x, x.y, x.z,
      y.x, y.y, y.z
      ];
  }

  imagePosition(frameIndex = 0) {
    return [
      this._dataSet.spaceOrigin[0],
      this._dataSet.spaceOrigin[1],
      this._dataSet.spaceOrigin[2]
    ];
  }

  dimensionIndexValues(frameIndex = 0) {
    return null;
  }

  instanceNumber(frameIndex = 0) {
    return frameIndex;
  }

  windowCenter(frameIndex = 0) {
    // calc min and calc max
    return null;
  }

  windowWidth(frameIndex = 0) {
    // calc min and calc max
    return null;
  }

  rescaleSlope(frameIndex = 0) {
    return 1;//this._dataSet.scl_slope;
  }

  rescaleIntercept(frameIndex = 0) {
    return 0;//this._dataSet.scl_intercept;
  }

  minMaxPixelData(pixelData = []) {
    let minMax = [65535, -32768];
    let numPixels = pixelData.length;
    for (let index = 0; index < numPixels; index++) {
      let spv = pixelData[index];
      minMax[0] = Math.min(minMax[0], spv);
      minMax[1] = Math.max(minMax[1], spv);
    }

    return minMax;
  }

  extractPixelData(frameIndex = 0) {
    return this._decompressUncompressed(frameIndex);
  }

  _decompressUncompressed(frameIndex = 0) {
    let buffer = this._dataSet.buffer;
    let numberOfChannels = this.numberOfChannels();
    let numPixels = this.rows(frameIndex) * this.columns(frameIndex) * numberOfChannels;
    let frameOffset = frameIndex * numPixels;

    // unpack data if needed
    if (this._unpackedData === null &&
      this._dataSet.encoding === 'gzip') {
      let unpackedData = pako.inflate(this._dataSet.buffer);
      this._unpackedData = unpackedData.buffer;
      buffer = this._unpackedData;
    }
    else if(this._dataSet.encoding === 'gzip'){
      buffer = this._unpackedData;
    }

    if(this._dataSet.type === 'int8' ||
       this._dataSet.type === 'char'){
      frameOffset = frameOffset;
      return new Int8Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'uint8'){
      frameOffset = frameOffset;
      return new Uint8Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'int16' ||
       this._dataSet.type === 'short'){
      frameOffset = frameOffset * 2;
      return new Int16Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'uint16'){
      frameOffset = frameOffset * 2;
      return new Uint16Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'int32'){
      frameOffset = frameOffset * 4;
      return new Int32Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'uint32' ){
      frameOffset = frameOffset * 4;
      return new Uint32Array(buffer, frameOffset, numPixels);
    }
    else if(this._dataSet.type === 'float'){
      frameOffset = frameOffset * 4;
      return new Float32Array(buffer, frameOffset, numPixels);
    }

  }
}
