/**
 * @module parsers/volume
 */
export default class ParsersVolume {

  constructor() {
    this._rightHanded = true;
  }

  pixelRepresentation() {
    return 0;
  }

  modality() {
    return 'unknown';
  }

  segmentationType() {
    return 'unknown';
  }

  segmentationSegments() {
    return [];
  }

  referencedSegmentNumber(frameIndex) {
    return -1;
  }

  rightHanded() {
    return this._rightHanded;
  }

  spacingBetweenSlices() {
    return null;
  }

  numberOfChannels() {
    return 1;
  }

  sliceThickness() {
    return null;
  }


  dimensionIndexValues(frameIndex = 0) {
    return null;
  }

  instanceNumber(frameIndex = 0) {
    return frameIndex;
  }

  windowCenter(frameIndex = 0) {
    return null;
  }

  windowWidth(frameIndex = 0) {
    return null;
  }

  rescaleSlope(frameIndex = 0) {
    return 1;
  }

  rescaleIntercept(frameIndex = 0) {
    return 0;
  }

  _decompressUncompressed() {

  }

  // http://stackoverflow.com/questions/5320439/how-do-i-swap-endian-ness-byte-order-of-a-variable-in-javascript
  _swap16(val) {
    return ((val & 0xFF) << 8)
      | ((val >> 8) & 0xFF);
  }

  _swap32(val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
  }

  invert() {
    return false;
  }
}
