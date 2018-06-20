/** * Imports ***/
import ParsersVolume from './parsers.volume';
import {Vector3} from 'three';

/**
 * @module parsers/mhd
 */
export default class ParsersMHD extends ParsersVolume {
  constructor(data, id) {
    super();

    /**
      * @member
      * @type {arraybuffer}
    */
    this._id = id;
    this._url = data.url;
    this._header = {};
    this._buffer = null;

    try {
      // parse header (mhd) data
      let lines = new TextDecoder().decode(data.mhdBuffer).split('\n');
      lines.forEach((line) => {
          let keyvalue = line.split('=');
          if (keyvalue.length === 2) {
            this._header[keyvalue[0].trim()] = keyvalue[1].trim();
          }
      });

      this._header.DimSize = this._header.DimSize.split(' ');
      this._header.ElementSpacing = this._header.ElementSpacing.split(' ');
      this._header.TransformMatrix = this._header.TransformMatrix.split(' ');
      this._header.Offset = this._header.Offset.split(' ');
      //
      this._buffer = data.rawBuffer;
    } catch (error) {
      window.console.log('ooops... :(');
    }
  }

  rightHanded() {
    let anatomicalOrientation = this._header.AnatomicalOrientation;
    if (anatomicalOrientation === 'RAS' ||
        anatomicalOrientation === 'RPI' ||
        anatomicalOrientation === 'LPS' ||
        anatomicalOrientation === 'LAI') {
      this._rightHanded = true;
    } else {
      this._rightHanded = false;
    }

    return this._rightHanded;
  }

  seriesInstanceUID() {
    // use filename + timestamp..?
    return this._url;
  }

  numberOfFrames() {
    return parseInt(this._header.DimSize[2], 10);
  }

  sopInstanceUID(frameIndex = 0) {
    return frameIndex;
  }

  rows(frameIndex = 0) {
    return parseInt(this._header.DimSize[1], 10);
  }

  columns(frameIndex = 0) {
    return parseInt(this._header.DimSize[0], 10);
  }

  pixelType(frameIndex = 0) {
    // 0 - int
    // 1 - float
    let type = 0;
    if (this._header.ElementType === 'MET_UFLOAT' ||
        this._header.ElementType === 'MET_FLOAT') {
      type = 1;
    }
    return type;
  }

  bitsAllocated(frameIndex = 0) {
    let bitsAllocated = 1;

    if (this._header.ElementType === 'MET_UCHAR' ||
        this._header.ElementType === 'MET_CHAR') {
      bitsAllocated = 8;
    } else if (
        this._header.ElementType === 'MET_USHORT' ||
        this._header.ElementType === 'MET_SHORT') {
      bitsAllocated = 16;
    } else if (
        this._header.ElementType === 'MET_UINT' ||
        this._header.ElementType === 'MET_INT' ||
        this._header.ElementType === 'MET_UFLOAT' ||
        this._header.ElementType === 'MET_FLOAT') {
      bitsAllocated = 32;
    }

    return bitsAllocated;
  }

  /**
   * https://itk.org/Wiki/ITK/MetaIO/Documentation
   * ElementSpacing[0] spacing between elements along X axis (i.e. column spacing)
   * ElementSpacing[1] spacing between elements along Y axis (i.e. row spacing)
   *
   * @param {*} frameIndex
   */
  pixelSpacing(frameIndex = 0) {
    let x = parseFloat(this._header.ElementSpacing[1], 10);
    let y = parseFloat(this._header.ElementSpacing[0], 10);
    let z = parseFloat(this._header.ElementSpacing[2], 10);
    return [x, y, z];
  }

  imageOrientation(frameIndex = 0) {
    let invertX = this._header.AnatomicalOrientation.match(/L/) ? -1 : 1;
    let invertY = this._header.AnatomicalOrientation.match(/P/) ? -1 : 1;

    let x = new Vector3(
      parseFloat(this._header.TransformMatrix[0]) * invertX,
      parseFloat(this._header.TransformMatrix[1]) * invertY,
      parseFloat(this._header.TransformMatrix[2]));
    x.normalize();

    let y = new Vector3(
      parseFloat(this._header.TransformMatrix[3]) * invertX,
      parseFloat(this._header.TransformMatrix[4]) * invertY,
      parseFloat(this._header.TransformMatrix[5]));
    y.normalize();

    return [
      x.x, x.y, x.z,
      y.x, y.y, y.z,
      ];
  }

  imagePosition(frameIndex = 0) {
    return [
      parseFloat(this._header.Offset[0]),
      parseFloat(this._header.Offset[1]),
      parseFloat(this._header.Offset[2]),
    ];
  }

  extractPixelData(frameIndex = 0) {
    return this._decompressUncompressed(frameIndex);
  }

  _decompressUncompressed(frameIndex = 0) {
    let buffer = this._buffer;
    let numberOfChannels = this.numberOfChannels();
    let numPixels =
      this.rows(frameIndex) * this.columns(frameIndex) * numberOfChannels;
    if (!this.rightHanded()) {
      frameIndex = this.numberOfFrames() - 1 - frameIndex;
    }
    let frameOffset = frameIndex * numPixels;

    if (this._header.ElementType === 'MET_CHAR') {
      return new Int8Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_UCHAR') {
      return new Uint8Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_SHORT') {
      frameOffset = frameOffset * 2;
      return new Int16Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_USHORT') {
      frameOffset = frameOffset * 2;
      return new Uint16Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_INT') {
      frameOffset = frameOffset * 4;
      return new Int32Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_UINT') {
      frameOffset = frameOffset * 4;
      return new Uint32Array(buffer, frameOffset, numPixels);
    } else if (this._header.ElementType === 'MET_FLOAT') {
      frameOffset = frameOffset * 4;
      return new Float32Array(buffer, frameOffset, numPixels);
    }
  }
}
