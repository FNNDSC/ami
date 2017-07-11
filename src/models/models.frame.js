/** * Imports ***/
import ModelsBase from '../models/models.base';

/**
 * Frame object.
 *
 * @module models/frame
 */
export default class ModelsFrame extends ModelsBase {

  /**
   * Constructor
   */
  constructor() {
    super();

    this._sopInstanceUID = null;
    this._url = null;
    this._stackID = -1;
    this._rows = 0;
    this._columns = 0;
    this._dimensionIndexValues = [];
    this._imagePosition = null;
    this._imageOrientation = null;
    this._rightHanded = true;
    this._sliceThickness = 1;
    this._spacingBetweenSlices = null;
    this._pixelRepresentation = 0;
    this._pixelType = 0;
    this._pixelSpacing = null;
    this._pixelAspectRatio = null;
    this._pixelData = null;

    this._instanceNumber = null;
    this._windowCenter = null;
    this._windowWidth = null;
    this._rescaleSlope = null;
    this._rescaleIntercept = null;

    this._bitsAllocated = 8;

    this._minMax = null;
    this._dist = null;

    this._index = -1;

    this._referencedSegmentNumber = -1;
  }

  /**
   * Validate the frame.
   *
   * @param {*} model
   *
   * @return {*}
   */
  validate(model) {
    if (!(super.validate(model) &&
      typeof model.cosines === 'function' &&
      typeof model.spacingXY === 'function' &&
      model.hasOwnProperty('_sopInstanceUID') &&
      model.hasOwnProperty('_dimensionIndexValues') &&
      model.hasOwnProperty('_imageOrientation') &&
      model.hasOwnProperty('_imagePosition'))) {
      return false;
    }

    return true;
  }

  /**
   * Merge current frame with provided frame.
   *
   * Frames can be merged (i.e. are identical) if following are equals:
   *  - dimensionIndexValues
   *  - imageOrientation
   *  - imagePosition
   *  - instanceNumber
   *  - sopInstanceUID
   *
   * @param {*} frame
   *
   * @return {boolean} True if frames could be merge. False if not.
   */
  merge(frame) {
    if (!this.validate(frame)) {
      return false;
    }

    if (this._compareArrays(
          this._dimensionIndexValues, frame.dimensionIndexValues) &&
        this._compareArrays(
          this._imageOrientation, frame.imageOrientation) &&
        this._compareArrays(
          this._imagePosition, frame.imagePosition) &&
        this._instanceNumber === frame.instanceNumber &&
        this._sopInstanceUID === frame.sopInstanceUID) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Generate X, y and Z cosines from image orientation
   * Returns default orientation if _imageOrientation was invalid.
   *
   * @returns {array} Array[3] containing cosinesX, Y and Z.
   */
  cosines() {
    let cosines = [new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1)];

     if (this._imageOrientation &&
      this._imageOrientation.length === 6) {
      let xCos =
        new THREE.Vector3(
          this._imageOrientation[0],
          this._imageOrientation[1],
          this._imageOrientation[2]);
      let yCos =
        new THREE.Vector3(
          this._imageOrientation[3],
          this._imageOrientation[4],
          this._imageOrientation[5]);

      if (xCos.length() > 0 && yCos.length() > 0) {
        cosines[0] = xCos;
        cosines[1] = yCos;
        cosines[2] =
          new THREE.Vector3(0, 0, 0).
          crossVectors(cosines[0], cosines[1]).
          normalize();
      }
    } else {
      window.console.log('No valid image orientation for frame');
      window.console.log(this);
      window.console.log('Returning default orientation.');
    }

    if (!this._rightHanded) {
      cosines[2].negate();
    }

    return cosines;
  }

  /**
   * Get x/y spacing of a frame.
   *
   * @return {*}
   */
  spacingXY() {
    let spacingXY = [1.0, 1.0];

    if (this.pixelSpacing) {
      spacingXY[0] = this.pixelSpacing[0];

      spacingXY[1] = this.pixelSpacing[1];
    } else if (this.pixelAspectRatio) {
      spacingXY[0] = 1.0;
      spacingXY[1] = 1.0 * this.pixelAspectRatio[1] / this.pixelAspectRatio[0];
    }

    return spacingXY;
  }

  /**
   * Get data value
   *
   * @param {*} column
   * @param {*} row
   *
   * @return {*}
   */
  value(column, row) {
    return this.pixelData[column + this._columns * row];
  }

  /**
   * Compare 2 arrays.
   *
   * 2 null arrays return true.
   * Do no perform strict type checking.
   *
   * @param {*} reference
   * @param {*} target
   *
   * @return {boolean} True if arrays are identicals. False if not.
   */
  _compareArrays(reference, target) {
    // could both be null
    if (reference === target) {
      return true;
    }

    // if not null....
    if (reference &&
        target &&
        reference.join() === target.join()) {
      return true;
    }

    return false;
  }

  get rows() {
    return this._rows;
  }

  set rows(rows) {
    this._rows = rows;
  }

  get columns() {
    return this._columns;
  }

  set columns(columns) {
    this._columns = columns;
  }

  get spacingBetweenSlices() {
    return this._spacingBetweenSlices;
  }

  set spacingBetweenSlices(spacingBetweenSlices) {
    this._spacingBetweenSlices = spacingBetweenSlices;
  }

  get sliceThickness() {
    return this._sliceThickness;
  }

  set sliceThickness(sliceThickness) {
    this._sliceThickness = sliceThickness;
  }

  get imagePosition() {
    return this._imagePosition;
  }

  set imagePosition(imagePosition) {
    this._imagePosition = imagePosition;
  }

  get imageOrientation() {
    return this._imageOrientation;
  }

  set imageOrientation(imageOrientation) {
    this._imageOrientation = imageOrientation;
  }

  get windowWidth() {
    return this._windowWidth;
  }

  set windowWidth(windowWidth) {
    this._windowWidth = windowWidth;
  }

  get windowCenter() {
    return this._windowCenter;
  }

  set windowCenter(windowCenter) {
    this._windowCenter = windowCenter;
  }

  get rescaleSlope() {
    return this._rescaleSlope;
  }

  set rescaleSlope(rescaleSlope) {
    this._rescaleSlope = rescaleSlope;
  }

  get rescaleIntercept() {
    return this._rescaleIntercept;
  }

  set rescaleIntercept(rescaleIntercept) {
    this._rescaleIntercept = rescaleIntercept;
  }

  get bitsAllocated() {
    return this._bitsAllocated;
  }

  set bitsAllocated(bitsAllocated) {
    this._bitsAllocated = bitsAllocated;
  }

  get dist() {
    return this._dist;
  }

  set dist(dist) {
    this._dist = dist;
  }

  get pixelSpacing() {
    return this._pixelSpacing;
  }

  set pixelSpacing(pixelSpacing) {
    this._pixelSpacing = pixelSpacing;
  }

  get pixelAspectRatio() {
    return this._pixelAspectRatio;
  }

  set pixelAspectRatio(pixelAspectRatio) {
    this._pixelAspectRatio = pixelAspectRatio;
  }

  get minMax() {
    return this._minMax;
  }

  set minMax(minMax) {
    this._minMax = minMax;
  }

  get dimensionIndexValues() {
    return this._dimensionIndexValues;
  }

  set dimensionIndexValues(dimensionIndexValues) {
    this._dimensionIndexValues = dimensionIndexValues;
  }

  get instanceNumber() {
    return this._instanceNumber;
  }

  set instanceNumber(instanceNumber) {
    this._instanceNumber = instanceNumber;
  }

  get pixelData() {
    return this._pixelData;
  }

  set pixelData(pixelData) {
    this._pixelData = pixelData;
  }

  set sopInstanceUID(sopInstanceUID) {
    this._sopInstanceUID = sopInstanceUID;
  }

  get sopInstanceUID() {
    return this._sopInstanceUID;
  }

  get pixelRepresentation() {
    return this._pixelRepresentation;
  }

  set pixelRepresentation(pixelRepresentation) {
    this._pixelRepresentation = pixelRepresentation;
  }

  get pixelType() {
    return this._pixelType;
  }

  set pixelType(pixelType) {
    this._pixelType = pixelType;
  }

  get url() {
    return this._url;
  }

  set url(url) {
    this._url = url;
  }

  get referencedSegmentNumber() {
    return this._referencedSegmentNumber;
  }

  set referencedSegmentNumber(referencedSegmentNumber) {
    this._referencedSegmentNumber = referencedSegmentNumber;
  }

  get rightHanded() {
    return this._rightHanded;
  }

  set rightHanded(rightHanded) {
    this._rightHanded = rightHanded;
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
  }
}
