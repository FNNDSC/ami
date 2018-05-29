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

  pixelPaddingValue(frameIndex = 0) {
    return null;
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

  frameTime(frameIndex = 0) {
    return null;
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

  /**
   * Get the transfer syntax UID.
   * @return {*}
   */
  transferSyntaxUID() {
    return 'no value provided';
  }

  /**
   * Get the study date.
   * @return {*}
   */
  studyDate() {
    return 'no value provided';
  }

  /**
   * Get the study desciption.
   * @return {*}
   */
  studyDescription() {
    return 'no value provided';
  }

  /**
   * Get the series date.
   * @return {*}
   */
  seriesDate() {
    return 'no value provided';
  }

  /**
   * Get the series desciption.
   * @return {*}
   */
  seriesDescription() {
    return 'no value provided';
  }

  /**
   * Get the patient ID.
   * @return {*}
   */
  patientID() {
    return 'no value provided';
  }

  /**
   * Get the patient name.
   * @return {*}
   */
  patientName() {
    return 'no value provided';
  }

  /**
   * Get the patient age.
   * @return {*}
   */
  patientAge() {
    return 'no value provided';
  }

  /**
   * Get the patient birthdate.
   * @return {*}
   */
  patientBirthdate() {
    return 'no value provided';
  }

  /**
   * Get the patient sex.
   * @return {*}
   */
  patientSex() {
    return 'no value provided';
  }

  /**
   * Get min/max values in array
   *
   * @param {*} pixelData
   *
   * @return {*}
   */
  minMaxPixelData(pixelData = []) {
    let minMax = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let numPixels = pixelData.length;
    for (let index = 0; index < numPixels; index++) {
      let spv = pixelData[index];
      minMax[0] = Math.min(minMax[0], spv);
      minMax[1] = Math.max(minMax[1], spv);
    }

    return minMax;
  }
}
