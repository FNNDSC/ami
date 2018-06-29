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
      const error = new Error('parsers.nifti could not parse the file');
      throw error;
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
    // http://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1.h
    // http://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1_io.c
    if (this._dataSet.qform_code > 0) {
      // METHOD 2 (used when qform_code > 0, which should be the "normal" case):
      // ---------------------------------------------------------------------
      // The (x,y,z) coordinates are given by the pixdim[] scales, a rotation
      // matrix, and a shift.  This method is intended to represent
      // "scanner-anatomical" coordinates, which are often embedded in the
      // image header (e.g., DICOM fields (0020,0032), (0020,0037), (0028,0030),
      // and (0018,0050)), and represent the nominal orientation and location of
      // the data.  This method can also be used to represent "aligned"
      // coordinates, which would typically result from some post-acquisition
      // alignment of the volume to a standard orientation (e.g., the same
      // subject on another day, or a rigid rotation to true anatomical
      // orientation from the tilted position of the subject in the scanner).
      // The formula for (x,y,z) in terms of header parameters and (i,j,k) is:

      //   [ x ]   [ R11 R12 R13 ] [        pixdim[1] * i ]   [ qoffset_x ]
      //   [ y ] = [ R21 R22 R23 ] [        pixdim[2] * j ] + [ qoffset_y ]
      //   [ z ]   [ R31 R32 R33 ] [ qfac * pixdim[3] * k ]   [ qoffset_z ]

      // The qoffset_* shifts are in the NIFTI-1 header.  Note that the center
      // of the (i,j,k)=(0,0,0) voxel (first value in the dataset array) is
      // just (x,y,z)=(qoffset_x,qoffset_y,qoffset_z).

      // The rotation matrix R is calculated from the quatern_* parameters.
      // This calculation is described below.

      // The scaling factor qfac is either 1 or -1.  The rotation matrix R
      // defined by the quaternion parameters is "proper" (has determinant 1).
      // This may not fit the needs of the data; for example, if the image
      // grid is
      //   i increases from Left-to-Right
      //   j increases from Anterior-to-Posterior
      //   k increases from Inferior-to-Superior
      // Then (i,j,k) is a left-handed triple.  In this example, if qfac=1,
      // the R matrix would have to be

      //   [  1   0   0 ]
      //   [  0  -1   0 ]  which is "improper" (determinant = -1).
      //   [  0   0   1 ]

      // If we set qfac=-1, then the R matrix would be

      //   [  1   0   0 ]
      //   [  0  -1   0 ]  which is proper.
      //   [  0   0  -1 ]

      // This R matrix is represented by quaternion [a,b,c,d] = [0,1,0,0]
      // (which encodes a 180 degree rotation about the x-axis).
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
        b *= a; c *= a; d *= a; /* normalize (b,c,d) vector */
        a = 0.0; /* a = 0 ==> 180 degree rotation */
      } else {
        a = Math.sqrt(a); /* angle = 2*arccos(a) */
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
      // METHOD 3 (used when sform_code > 0):
      // -----------------------------------
      // The (x,y,z) coordinates are given by a general affine transformation
      // of the (i,j,k) indexes:

      //   x = srow_x[0] * i + srow_x[1] * j + srow_x[2] * k + srow_x[3]
      //   y = srow_y[0] * i + srow_y[1] * j + srow_y[2] * k + srow_y[3]
      //   z = srow_z[0] * i + srow_z[1] * j + srow_z[2] * k + srow_z[3]

      // The srow_* vectors are in the NIFTI_1 header.  Note that no use is
      // made of pixdim[] in this method.
      const rowX = [
        -this._dataSet.affine[0][0],
        -this._dataSet.affine[0][1],
        this._dataSet.affine[0][2]];
        const rowY = [
          -this._dataSet.affine[1][0],
          -this._dataSet.affine[1][1],
          this._dataSet.affine[0][2]];
      return [...rowX, ...rowY];
    } else if (this._dataSet.qform_code === 0) {
      // METHOD 1 (the "old" way, used only when qform_code = 0):
      // -------------------------------------------------------
      // The coordinate mapping from (i,j,k) to (x,y,z) is the ANALYZE
      // 7.5 way.  This is a simple scaling relationship:

      //   x = pixdim[1] * i
      //   y = pixdim[2] * j
      //   z = pixdim[3] * k

      // No particular spatial orientation is attached to these (x,y,z)
      // coordinates.  (NIFTI-1 does not have the ANALYZE 7.5 orient field,
      // which is not general and is often not set properly.)  This method
      // is not recommended, and is present mainly for compatibility with
      // ANALYZE 7.5 files.
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
    return this._dataSet.scl_inter;
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
      const data = new Float32Array(buffer, frameOffset, numPixels);
      for (let i=0; i<data.length; i++) {
        if (data[i] === Infinity || data[i] === -Infinity) {
          data[i] = 0;
        }
      }
      return data;
    } else {
      window.console.warn(
        `Unknown data type: datatypeCode : ${this._dataSet.datatypeCode}`);
    }
  }

  _reorderData() {
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
