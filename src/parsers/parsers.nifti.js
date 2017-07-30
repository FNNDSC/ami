/** * Imports ***/
import ParsersVolume from './parsers.volume';

let NiftiReader = require('nifti-reader-js');
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
    this._niftiHeader = null;
    this._niftiImage = null;
    this._ordered = true;
    this._orderedData = null;

    //
    this._qfac = 1.0;

    if (NiftiReader.isNIFTI(this._arrayBuffer)) {
      this._dataSet = NiftiReader.readHeader(this._arrayBuffer);
      this._niftiImage =
        NiftiReader.readImage(this._dataSet, this._arrayBuffer);
    } else {
      throw 'parsers.nifti could not parse the file';
    }
  }

  seriesInstanceUID() {
    // use filename + timestamp..?
    return this._url;
  }

  numberOfFrames() {
    return this._dataSet.dims[3];
  }

  numberOfChannels() {
    let numberOfChannels = 1;

    // can dims[0] >= 5 and not multi channels with RGB datatypecode?

    if (this._dataSet.dims[0] >= 5) {
      numberOfChannels = this._dataSet.dims[5];
      this._ordered = false;
    } else if (this._dataSet.datatypeCode === 128) {
      numberOfChannels = 3;
    } else if (this._dataSet.datatypeCode === 2304) {
      numberOfChannels = 4;
    }

    return numberOfChannels;
  }

  sopInstanceUID(frameIndex = 0) {
    return frameIndex;
  }

  rows(frameIndex = 0) {
    return this._dataSet.dims[2];
  }

  columns(frameIndex = 0) {
    return this._dataSet.dims[1];
  }

  pixelType(frameIndex = 0) {
        // papaya.volume.nifti.NIFTI_TYPE_UINT8           = 2;
    // papaya.volume.nifti.NIFTI_TYPE_INT16           = 4;
    // papaya.volume.nifti.NIFTI_TYPE_INT32           = 8;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT32        = 16;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX64      = 32;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT64        = 64;
    // papaya.volume.nifti.NIFTI_TYPE_RGB24         = 128;
    // papaya.volume.nifti.NIFTI_TYPE_INT8          = 256;
    // papaya.volume.nifti.NIFTI_TYPE_UINT16        = 512;
    // papaya.volume.nifti.NIFTI_TYPE_UINT32        = 768;
    // papaya.volume.nifti.NIFTI_TYPE_INT64        = 1024;
    // papaya.volume.nifti.NIFTI_TYPE_UINT64       = 1280;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT128     = 1536;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX128   = 1792;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX256   = 2048;

    // 0 integer, 1 float

    let pixelType = 0;
    if (this._dataSet.datatypeCode === 16 ||
      this._dataSet.datatypeCode === 64 ||
      this._dataSet.datatypeCode === 1536) {
      pixelType = 1;
    }
    return pixelType;
  }

  bitsAllocated(frameIndex = 0) {
    return this._dataSet.numBitsPerVoxel;
  }

  pixelSpacing(frameIndex = 0) {
    return [
      this._dataSet.pixDims[1],
      this._dataSet.pixDims[2],
      this._dataSet.pixDims[3],
      ];
  }

  sliceThickness() {
    // should be a string...
    return null;// this._dataSet.pixDims[3].toString();
  }

  imageOrientation(frameIndex = 0) {
    // window.console.log(this._dataSet);
    // http://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1.h
    // http://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1_io.c
    if (this._dataSet.qform_code > 0) {
      // https://github.com/Kitware/ITK/blob/master/Modules/IO/NIFTI/src/itkNiftiImageIO.cxx
      let a = 0.0;
      let b = this._dataSet.quatern_b;
      let c = this._dataSet.quatern_c;
      let d = this._dataSet.quatern_d;
      // compute a
      a = 1.0 - (b*b + c*c + d*d);
      if (a < 0.0000001) {
                   /* special case */

        a = 1.0 / Math.sqrt(b*b+c*c+d*d);
        b *= a; c *= a; d *= a;        /* normalize (b,c,d) vector */
        a = 0.0;                       /* a = 0 ==> 180 degree rotation */
      } else {
        a = Math.sqrt(a);                     /* angle = 2*arccos(a) */
      }

      if (this._dataSet.pixDims[0] < 0.0) {
        this._rightHanded = false;
      }

       return [
          -(a*a+b*b-c*c-d*d),
          -2*(b*c+a*d),
          2*(b*d-a*c),
          -2*(b*c-a*d),
          -(a*a+c*c-b*b-d*d),
          2*(c*d+a*b),
        ];
    } else if (this._dataSet.sform_code > 0) {
      console.log('sform > 0');

      let sx = this._dataSet.srow_x;
      let sy = this._dataSet.srow_y;
      let sz = this._dataSet.srow_z;
      // fill IJKToRAS
      // goog.vec.Mat4.setRowValues(IJKToRAS, 0, sx[0], sx[1], sx[2], sx[3]);
      // goog.vec.Mat4.setRowValues(IJKToRAS, 1, sy[0], sy[1], sy[2], sy[3]);
      // goog.vec.Mat4.setRowValues(IJKToRAS, 2, sz[0], sz[1], sz[2], sz[3]);
    } else if (this._dataSet.qform_code === 0) {
      console.log('qform === 0');


      // fill IJKToRAS
      // goog.vec.Mat4.setRowValues(IJKToRAS, 0, MRI.pixdim[1], 0, 0, 0);
      // goog.vec.Mat4.setRowValues(IJKToRAS, 1, 0, MRI.pixdim[2], 0, 0);
      // goog.vec.Mat4.setRowValues(IJKToRAS, 2, 0, 0, MRI.pixdim[3], 0);
    }
    return [1, 0, 0, 0, 1, 0];
  }

  imagePosition(frameIndex = 0) {
    // qoffset is RAS
    return [
      -this._dataSet.qoffset_x,
      -this._dataSet.qoffset_y,
      this._dataSet.qoffset_z,
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
    return this._dataSet.scl_slope;
  }

  rescaleIntercept(frameIndex = 0) {
    return this._dataSet.scl_intercept;
  }

  extractPixelData(frameIndex = 0) {
    return this._decompressUncompressed(frameIndex);
  }

  _decompressUncompressed(frameIndex = 0) {
    // papaya.volume.nifti.NIFTI_TYPE_UINT8           = 2;
    // papaya.volume.nifti.NIFTI_TYPE_INT16           = 4;
    // papaya.volume.nifti.NIFTI_TYPE_INT32           = 8;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT32        = 16;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX64      = 32;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT64        = 64;
    // papaya.volume.nifti.NIFTI_TYPE_RGB24         = 128;
    // papaya.volume.nifti.NIFTI_TYPE_INT8          = 256;
    // papaya.volume.nifti.NIFTI_TYPE_UINT16        = 512;
    // papaya.volume.nifti.NIFTI_TYPE_UINT32        = 768;
    // papaya.volume.nifti.NIFTI_TYPE_INT64        = 1024;
    // papaya.volume.nifti.NIFTI_TYPE_UINT64       = 1280;
    // papaya.volume.nifti.NIFTI_TYPE_FLOAT128     = 1536;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX128   = 1792;
    // papaya.volume.nifti.NIFTI_TYPE_COMPLEX256   = 2048;

    let numberOfChannels = this.numberOfChannels();
    let numPixels =
      this.rows(frameIndex) * this.columns(frameIndex) * numberOfChannels;
    // if( !this.rightHanded() ){
    //   frameIndex = this.numberOfFrames() - 1 - frameIndex;
    // }
    let frameOffset = frameIndex * numPixels;
    let buffer = this._niftiImage;

    // use bits allocated && pixel reprensentation too
    if (!this._ordered && this._orderedData === null) {
      // order then
      this._reorderData();
    }

    if (this._orderedData !== null) {
      // just a slice...
      return this._orderedData.slice(frameOffset, frameOffset + numPixels);
    } else if (this._dataSet.datatypeCode === 2) {
      // unsigned int 8 bit
      return new Uint8Array(buffer, frameOffset, numPixels);
    } else if (this._dataSet.datatypeCode === 256) {
      // signed int 8 bit
      return new Int8Array(buffer, frameOffset, numPixels);
    } else if (this._dataSet.datatypeCode === 512) {
      // unsigned int 16 bit
      frameOffset = frameOffset * 2;
      return new Uint16Array(buffer, frameOffset, numPixels);
    } else if (this._dataSet.datatypeCode === 4) {
      // signed int 16 bit
      frameOffset = frameOffset * 2;
      return new Int16Array(buffer, frameOffset, numPixels);
    } else if (this._dataSet.datatypeCode === 8) {
      // signed int 32 bit
      frameOffset = frameOffset * 4;
      return new Int32Array(buffer, frameOffset, numPixels);
    } else if (this._dataSet.datatypeCode === 16) {
      // signed float 32 bit
      frameOffset = frameOffset * 4;
      return new Float32Array(buffer, frameOffset, numPixels);
    } else {
      console.log(
        `Unknown data type: datatypeCode : ${this._dataSet.datatypeCode}`);
    }
  }

  _reorderData() {
    window.console.log('re-order');
    let numberOfChannels = this.numberOfChannels();
    let numPixels = this.rows() * this.columns() * numberOfChannels;
    let buffer = this._niftiImage;

    let totalNumPixels = numPixels * this.numberOfFrames();
    let tmp = null;
    this._orderedData = null;

    if (this._dataSet.datatypeCode === 2) {
      // unsigned 8 bit
      tmp = new Uint8Array(buffer, 0, totalNumPixels);
      this._orderedData = new Uint8Array(tmp.length);
    } else if (this._dataSet.datatypeCode === 256) {
      // signed 8 bit
      tmp = new Int8Array(buffer, 0, totalNumPixels);
      this._orderedData = new Int8Array(tmp.length);
    } else if (this._dataSet.datatypeCode === 512) {
      tmp = new Uint16Array(buffer, 0, totalNumPixels);
      this._orderedData = new Uint16Array(tmp.length);
    } else if (this._dataSet.datatypeCode === 4) {
      tmp = new Int16Array(buffer, 0, totalNumPixels);
      this._orderedData = new Int16Array(tmp.length);
    } else if (this._dataSet.datatypeCode === 16) {
      tmp = new Float32Array(buffer, 0, totalNumPixels);
      this._orderedData = new Float32Array(tmp.length);
    }

    // re-order pixels...
    let numPixels2 = tmp.length / 3;
    let rgbaIndex = 0;
    let rIndex = 0;
    let gIndex = numPixels2;
    let bIndex = numPixels2 * 2;

    for (let i = 0; i < numPixels2; i++) {
      this._orderedData[rgbaIndex++] = tmp[rIndex++]; // red
      this._orderedData[rgbaIndex++] = tmp[gIndex++]; // green
      this._orderedData[rgbaIndex++] = tmp[bIndex++]; // blue
    }

    this._ordered = true;
  }
}
