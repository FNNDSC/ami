/** * Imports ***/
import ModelsBase from '../models/models.base';

import {Vector3} from 'three';

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
    this._invert = false;
    this._frameTime = null;
    this._rows = 0;
    this._columns = 0;
    this._dimensionIndexValues = [];
    this._imagePosition = null;
    this._imageOrientation = null;
    this._rightHanded = true;
    this._sliceThickness = 1;
    this._spacingBetweenSlices = null;
    this._pixelPaddingValue = null;
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
    this._numberOfChannels = 1;

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
    let cosines = [new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1)];

     if (this._imageOrientation &&
      this._imageOrientation.length === 6) {
      let xCos =
        new Vector3(
          this._imageOrientation[0],
          this._imageOrientation[1],
          this._imageOrientation[2]);
      let yCos =
        new Vector3(
          this._imageOrientation[3],
          this._imageOrientation[4],
          this._imageOrientation[5]);

      if (xCos.length() > 0 && yCos.length() > 0) {
        cosines[0] = xCos;
        cosines[1] = yCos;
        cosines[2] =
          new Vector3(0, 0, 0).
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
   * @return {*}
   */
  getPixelData(column, row) {
    if (column >= 0 && column < this._columns &&
        row >= 0 && row < this._rows) {
      return this.pixelData[column + this._columns * row];
    } else {
      return null;
    }
  }
  /**
   * Set data value
   *
   * @param {*} column
   * @param {*} row
   * @param {*} value
   * @return {*}
   */
  setPixelData(column, row, value) {
    this.pixelData[column + this._columns * row] = value;
  }

  /**
   * Get frame preview as data:URL
   *
   * @return {String}
   */
  getImageDataUrl() {
    const canvas = document.createElement('canvas');
    canvas.width = this._columns;
    canvas.height = this._rows;

    const context = canvas.getContext('2d'),
      imageData = context.createImageData(canvas.width, canvas.height);

    imageData.data.set(this._frameToCanvas());
    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  }

  /**
   * Convert frame.pixelData to canvas.context.imageData.data
   *
   * @return {Uint8Array}
   */
  _frameToCanvas() {
    const dimension = this._columns * this._rows,
      params = {
        invert: this._invert,
        min: this._minMax[0],
        padding: this._pixelPaddingValue,
      };
    let data = new Uint8Array(dimension * 4);

    if (params.padding !== null) { // recalculation of min ignoring pixelPaddingValue
      params.min = this._minMax[1];
      for (let index = 0, numPixels = this._pixelData.length; index < numPixels; index++) {
        if (this._pixelData[index] !== params.padding) {
          params.min = Math.min(params.min, this._pixelData[index]);
        }
      }
    }

    if (this._windowWidth && this._windowCenter !== null) { // applying windowCenter and windowWidth
      const intercept = this._rescaleIntercept || 0,
        slope = this._rescaleSlope || 1;

      params.min = Math.max(((this._windowCenter - this._windowWidth / 2) - intercept) / slope, params.min);
      params.max = Math.min(((this._windowCenter + this._windowWidth / 2) - intercept) / slope, this._minMax[1]);
    } else {
      params.max = this._minMax[1];
    }

    params.range = (params.max - params.min) || 255; // if max is 0 convert it to: 255 - black, 1 - white

    if (this._numberOfChannels === 1) {
      for (let i = 0; i < dimension; i++) {
        const normalized = this._pixelTo8Bit(this._pixelData[i], params);
        data[4 * i] = normalized;
        data[4 * i + 1] = normalized;
        data[4 * i + 2] = normalized;
        data[4 * i + 3] = 255; // alpha channel (fully opaque)
      }
    } else if (this._numberOfChannels === 3) {
      for (let i = 0; i < dimension; i++) {
        data[4 * i] = this._pixelTo8Bit(this._pixelData[3 * i], params);
        data[4 * i + 1] = this._pixelTo8Bit(this._pixelData[3 * i + 1], params);
        data[4 * i + 2] = this._pixelTo8Bit(this._pixelData[3 * i + 2], params);
        data[4 * i + 3] = 255; // alpha channel (fully opaque)
      }
    }

    return data;
  }

  /**
   * Convert pixel value to 8 bit (canvas.context.imageData.data: maximum 8 bit per each of RGBA value)
   *
   * @param {Number} value  Pixel value
   * @param {Object} params {invert, min, mix, padding, range}
   *
   * @return {Number}
   */
  _pixelTo8Bit(value, params) {
    // values equal to pixelPaddingValue are outside of the image and should be ignored
    let packedValue = (value <= params.min || value === params.padding) ? 0 : 255;

    if (value > params.min && value < params.max) {
      packedValue = Math.round((value - params.min) * 255 / params.range);
    }

    return Number.isNaN(packedValue) ? 0 : (params.invert ? 255 - packedValue : packedValue);
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

  get frameTime() {
    return this._frameTime;
  }

  set frameTime(frameTime) {
    this._frameTime = frameTime;
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

  get pixelPaddingValue() {
    return this._pixelPaddingValue;
  }

  set pixelPaddingValue(pixelPaddingValue) {
    this._pixelPaddingValue = pixelPaddingValue;
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

  get invert() {
    return this._invert;
  }

  set invert(invert) {
    this._invert = invert;
  }

  get numberOfChannels() {
    return this._numberOfChannels;
  }

  set numberOfChannels(numberOfChannels) {
    this._numberOfChannels = numberOfChannels;
  }
}
