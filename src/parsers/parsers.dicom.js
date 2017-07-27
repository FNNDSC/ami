// ftp://medical.nema.org/MEDICAL/Dicom/2014c/output/chtml/part05/sect_6.2.html/

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

/** * Imports ***/
import ParsersVolume from './parsers.volume';

let DicomParser = require('dicom-parser');
let Jpeg = require('jpeg-lossless-decoder-js');
let JpegBaseline = require('../../external/scripts/jpeg');
let Jpx = require('../../external/scripts/jpx');

/**
 * Dicom parser is a combination of utilities to get a VJS image from dicom files.
 *scripts
 * Relies on dcmjs, jquery, HTML5 fetch API, HTML5 promise API.
 *
 * @module parsers/dicom
 *
 * @param arrayBuffer {arraybuffer} - List of files to be parsed. It is urls from which
 * VJS.parsers.dicom can pull the data from.
 */
export default class ParsersDicom extends ParsersVolume {

  constructor(data, id) {
    super();

    this._id = id;

    this._arrayBuffer = data.buffer;

    let byteArray = new Uint8Array(this._arrayBuffer);

    // catch error
    // throw error if any!
    this._dataSet = null;

    try {
      this._dataSet = DicomParser.parseDicom(byteArray);
    } catch (e) {
      window.console.log(e);
      throw 'parsers.dicom could not parse the file';
    }
  }

  /**
   * Series instance UID (0020,000e)
   *
   * @return {String}
   */
  seriesInstanceUID() {
    return this._dataSet.string('x0020000e');
  }

  /**
   * Study instance UID (0020,000d)
   *
   * @return {String}
   */
  studyInstanceUID() {
    return this._dataSet.string('x0020000d');
  }

  /**
   * Get modality (0008,0060)
   *
   * @return {String}
   */
  modality() {
    return this._dataSet.string('x00080060');
  }

  /**
   * Segmentation type (0062,0001)
   *
   * @return {String}
   */
  segmentationType() {
    return this._dataSet.string('x00620001');
  }

  /**
   * Segmentation segments
   * -> Sequence of segments (0062,0002)
   *   -> Recommended Display CIELab
   *   -> Segmentation Code
   *   -> Segment Number (0062,0004)
   *   -> Segment Label (0062,0005)
   *   -> Algorithm Type (0062,0008)
   *
   * @return {*}
   */
  segmentationSegments() {
    let segmentationSegments = [];
    let segmentSequence = this._dataSet.elements.x00620002;

    if (!segmentSequence) {
      return segmentationSegments;
    }

    for (let i = 0; i< segmentSequence.items.length; i++) {
      let recommendedDisplayCIELab =
        this._recommendedDisplayCIELab(segmentSequence.items[i]);
      let segmentationCode = this._segmentationCode(segmentSequence.items[i]);
      let segmentNumber = segmentSequence.items[i].dataSet.uint16('x00620004');
      let segmentLabel = segmentSequence.items[i].dataSet.string('x00620005');
      let segmentAlgorithmType =
        segmentSequence.items[i].dataSet.string('x00620008');

      segmentationSegments.push({
        recommendedDisplayCIELab,
        segmentationCodeDesignator:
          segmentationCode['segmentationCodeDesignator'],
        segmentationCodeValue: segmentationCode['segmentationCodeValue'],
        segmentationCodeMeaning: segmentationCode['segmentationCodeMeaning'],
        segmentNumber,
        segmentLabel,
        segmentAlgorithmType,
      });
    }

    return segmentationSegments;
  }

  /**
   * Segmentation code
   * -> Code designator (0008,0102)
   * -> Code value (0008,0200)
   * -> Code Meaning Type (0008,0104)
   *
   * @param {*} segment
   *
   * @return {*}
   */
  _segmentationCode(segment) {
    let segmentationCodeDesignator = 'unknown';
    let segmentationCodeValue = 'unknown';
    let segmentationCodeMeaning = 'unknown';
    let element = segment.dataSet.elements.x00082218;

    if (element && element.items && element.items.length > 0) {
      segmentationCodeDesignator = element.items[0].dataSet.string('x00080102');
      segmentationCodeValue = element.items[0].dataSet.string('x00080100');
      segmentationCodeMeaning = element.items[0].dataSet.string('x00080104');
    }

    return {
      segmentationCodeDesignator,
      segmentationCodeValue,
      segmentationCodeMeaning,
    };
  }

  /**
   * Recommended display CIELab
   *
   * @param {*} segment
   *
   * @return {*}
   */
  _recommendedDisplayCIELab(segment) {
    if (!segment.dataSet.elements.x0062000d) {
      return null;
    }

    let offset = segment.dataSet.elements.x0062000d.dataOffset;
    let length = segment.dataSet.elements.x0062000d.length;
    let byteArray = segment.dataSet.byteArray.slice(offset, offset+ length);

    // https://www.dabsoft.ch/dicom/3/C.10.7.1.1/
    let CIELabScaled = new Uint16Array(length/2);
    for (let i = 0; i<length/2; i++) {
      CIELabScaled[i] = (byteArray[2*i + 1] << 8) + byteArray[2*i];
    }

    let CIELabNormalized = [
      CIELabScaled[0] / 65535 * 100,
      CIELabScaled[1] / 65535 * 255 - 128,
      CIELabScaled[2] / 65535 * 255 - 128,
    ];

    return CIELabNormalized;
  }

  /**
   * SOP Instance UID
   *
   * @param {*} frameIndex
   *
   * @return {*}
   */
  sopInstanceUID(frameIndex = 0) {
    let sopInstanceUID =
      this._findStringEverywhere('x2005140f', 'x00080018', frameIndex);
    return sopInstanceUID;
  }

  /**
   * Transfer syntax UID
   *
   * @return {*}
   */
  transferSyntaxUID() {
    return this._dataSet.string('x00020010');
  }

  /**
   * Study date
   *
   * @return {*}
   */
  studyDate() {
    return this._dataSet.string('x00080020');
  }

  /**
   * Study description
   *
   * @return {*}
   */
  studyDescription() {
    return this._dataSet.string('x00081030');
  }

  /**
   * Series date
   *
   * @return {*}
   */
  seriesDate() {
    return this._dataSet.string('x00080021');
  }

  /**
   * Series description
   *
   * @return {*}
   */
  seriesDescription() {
    return this._dataSet.string('x0008103e');
  }

  /**
   * Patient name
   *
   * @return {*}
   */
  patientName() {
    return this._dataSet.string('x00100010');
  }

  /**
   * Patient ID
   *
   * @return {*}
   */
  patientID() {
    return this._dataSet.string('x00100020');
  }

  /**
   * Patient birthdate
   *
   * @return {*}
   */
  patientBirthdate() {
    return this._dataSet.string('x00100030');
  }

  /**
   * Patient sex
   *
   * @return {*}
   */
  patientSex() {
    return this._dataSet.string('x00100040');
  }

  /**
   * Patient age
   *
   * @return {*}
   */
  patientAge() {
    return this._dataSet.string('x00101010');
  }

  /**
   * Photometric interpretation
   *
   * @return {*}
   */
  photometricInterpretation() {
    return this._dataSet.string('x00280004');
  }

  planarConfiguration() {
    let planarConfiguration = this._dataSet.uint16('x00280006');

    if (typeof planarConfiguration === 'undefined') {
      planarConfiguration = null;
    }

    return planarConfiguration;
  }

  samplesPerPixel() {
    return this._dataSet.uint16('x00280002');
  }

  numberOfFrames() {
    let numberOfFrames = this._dataSet.intString('x00280008');

    // need something smarter!
    if (typeof numberOfFrames === 'undefined') {
      numberOfFrames = null;
    }

    return numberOfFrames;
  }

  numberOfChannels() {
    let numberOfChannels = 1;
    let photometricInterpretation = this.photometricInterpretation();

    if (!(photometricInterpretation !== 'RGB' &&
        photometricInterpretation !== 'PALETTE COLOR' &&
        photometricInterpretation !== 'YBR_FULL' &&
        photometricInterpretation !== 'YBR_FULL_422' &&
        photometricInterpretation !== 'YBR_PARTIAL_422' &&
        photometricInterpretation !== 'YBR_PARTIAL_420' &&
        photometricInterpretation !== 'YBR_RCT')) {
      numberOfChannels = 3;
    }

    // make sure we return a number! (not a string!)
    return numberOfChannels;
  }

  invert() {
    let photometricInterpretation = this.photometricInterpretation();

    return ((photometricInterpretation === 'MONOCHROME1') ? true : false);
  }

  imageOrientation(frameIndex = 0) {
    // expect frame index to start at 0!
    let imageOrientation = this._findStringEverywhere('x00209116', 'x00200037', frameIndex);

    // format image orientation ('1\0\0\0\1\0') to array containing 6 numbers
    if (imageOrientation) {
      // make sure we return a number! (not a string!)
      // might not need to split (floatString + index)
      imageOrientation = imageOrientation.split('\\').map(Number);
    }

    return imageOrientation;
  }

  referencedSegmentNumber(frameIndex = 0) {
    let referencedSegmentNumber = -1;
    let referencedSegmentNumberElement = this._findInGroupSequence('x52009230', 'x0062000a', frameIndex);

    if (referencedSegmentNumberElement !== null) {
      referencedSegmentNumber = referencedSegmentNumberElement.uint16('x0062000b');
    }

    return referencedSegmentNumber;
  }

  pixelAspectRatio() {
    let pixelAspectRatio = [
      this._dataSet.intString('x00280034', 0),
      this._dataSet.intString('x00280034', 1),
    ];

    // need something smarter!
    if (typeof pixelAspectRatio[0] === 'undefined') {
      pixelAspectRatio = null;
    }

    // make sure we return a number! (not a string!)
    return pixelAspectRatio;
  }

  imagePosition(frameIndex = 0) {
    let imagePosition = this._findStringEverywhere('x00209113', 'x00200032', frameIndex);

    // format image orientation ('1\0\0\0\1\0') to array containing 6 numbers
    if (imagePosition) {
      // make sure we return a number! (not a string!)
      imagePosition = imagePosition.split('\\').map(Number);
    }

    return imagePosition;
  }

  instanceNumber(frameIndex = 0) {
    let instanceNumber = null;
    // first look for frame!
    // per frame functionnal group sequence
    let perFrameFunctionnalGroupSequence = this._dataSet.elements.x52009230;

    if (typeof perFrameFunctionnalGroupSequence !== 'undefined') {
      if (perFrameFunctionnalGroupSequence
              .items[frameIndex].dataSet.elements.x2005140f) {
        let planeOrientationSequence = perFrameFunctionnalGroupSequence
            .items[frameIndex].dataSet.elements.x2005140f.items[0].dataSet;
        instanceNumber = planeOrientationSequence.intString('x00200013');
      } else {
        instanceNumber = this._dataSet.intString('x00200013');

        if (typeof instanceNumber === 'undefined') {
          instanceNumber = null;
        }
      }
    } else {
      // should we default to undefined??
      // default orientation
      instanceNumber = this._dataSet.intString('x00200013');

      if (typeof instanceNumber === 'undefined') {
        instanceNumber = null;
      }
    }

    return instanceNumber;
  }

  pixelSpacing(frameIndex = 0) {
    // expect frame index to start at 0!
    let pixelSpacing = this._findStringEverywhere('x00289110', 'x00280030', frameIndex);

    // format image orientation ('1\0\0\0\1\0') to array containing 6 numbers
    // should we default to undefined??
    if (pixelSpacing) {
      // make sure we return array of numbers! (not strings!)
      pixelSpacing = pixelSpacing.split('\\').map(Number);
    }

    return pixelSpacing;
  }

  rows(frameIndex = 0) {
    let rows = this._dataSet.uint16('x00280010');

    if (typeof rows === 'undefined') {
      rows = null;
      // print warning at least...
    }

    return rows;
  }

  columns(frameIndex = 0) {
    let columns = this._dataSet.uint16('x00280011');

    if (typeof columns === 'undefined') {
      columns = null;
      // print warning at least...
    }

    return columns;
  }

  pixelType(frameIndex = 0) {
    // 0 integer, 1 float
    // dicom only support integers
    return 0;
  }

  pixelRepresentation(frameIndex = 0) {
    let pixelRepresentation = this._dataSet.uint16('x00280103');
    return pixelRepresentation;
  }

  bitsAllocated(frameIndex = 0) {
    // expect frame index to start at 0!
    let bitsAllocated = this._dataSet.uint16('x00280100');
    return bitsAllocated;
  }

  highBit(frameIndex = 0) {
    // expect frame index to start at 0!
    let highBit = this._dataSet.uint16('x00280102');
    return highBit;
  }

  rescaleIntercept(frameIndex = 0) {
    return this._findFloatStringInFrameGroupSequence(
      'x00289145', 'x00281052', frameIndex);
  }

  rescaleSlope(frameIndex = 0) {
    return this._findFloatStringInFrameGroupSequence(
      'x00289145', 'x00281053', frameIndex);
  }

  windowCenter(frameIndex = 0) {
    return this._findFloatStringInFrameGroupSequence(
      'x00289132', 'x00281050', frameIndex);
  }

  windowWidth(frameIndex = 0) {
    return this._findFloatStringInFrameGroupSequence(
      'x00289132', 'x00281051', frameIndex);
  }

  sliceThickness(frameIndex = 0) {
    return this._findFloatStringInFrameGroupSequence(
      'x00289110', 'x00180050', frameIndex);
  }

  spacingBetweenSlices(frameIndex = 0) {
    let spacing = this._dataSet.intString('x00180088');

    if (typeof spacing === 'undefined') {
      spacing = null;
    }

    return spacing;
  }

  dimensionIndexValues(frameIndex = 0) {
    let dimensionIndexValues = null;

    // try to get it from enhanced MR images
    // per-frame functionnal group sequence
    let perFrameFunctionnalGroupSequence = this._dataSet.elements.x52009230;

    if (typeof perFrameFunctionnalGroupSequence !== 'undefined') {
      let frameContentSequence = perFrameFunctionnalGroupSequence
          .items[frameIndex].dataSet.elements.x00209111;
      if (frameContentSequence !== undefined &&
          frameContentSequence !== null) {
        frameContentSequence = frameContentSequence.items[0].dataSet;
        let dimensionIndexValuesElt = frameContentSequence.elements.x00209157;
        if (dimensionIndexValuesElt !== undefined &&
            dimensionIndexValuesElt !== null) {
          // /4 because UL
          let nbValues = dimensionIndexValuesElt.length / 4;
          dimensionIndexValues = [];

          for (let i = 0; i < nbValues; i++) {
            dimensionIndexValues.push(
              frameContentSequence.uint32('x00209157', i));
          }
        }
      }
    }

    return dimensionIndexValues;
  }

  inStackPositionNumber(frameIndex = 0) {
    let inStackPositionNumber = null;

    // try to get it from enhanced MR images
    // per-frame functionnal group sequence
    let perFrameFunctionnalGroupSequence = this._dataSet.elements.x52009230;

    if (typeof perFrameFunctionnalGroupSequence !== 'undefined') {
      // NOT A PHILIPS TRICK!
      let philipsPrivateSequence = perFrameFunctionnalGroupSequence
          .items[frameIndex].dataSet.elements.x00209111.items[0].dataSet;
      inStackPositionNumber = philipsPrivateSequence.uint32('x00209057');
    } else {
      inStackPositionNumber = null;
    }

    console.log(`instack position ${inStackPositionNumber}`);

    return inStackPositionNumber;
  }

  stackID(frameIndex = 0) {
    let stackID = null;

    // try to get it from enhanced MR images
    // per-frame functionnal group sequence
    let perFrameFunctionnalGroupSequence = this._dataSet.elements.x52009230;

    if (typeof perFrameFunctionnalGroupSequence !== 'undefined') {
      // NOT A PHILIPS TRICK!
      let philipsPrivateSequence = perFrameFunctionnalGroupSequence
          .items[frameIndex].dataSet.elements.x00209111.items[0].dataSet;
      stackID = philipsPrivateSequence.intString('x00209056');
    } else {
      stackID = null;
    }

    return stackID;
  }

  extractPixelData(frameIndex = 0) {
    // decompress
    let decompressedData = this._decodePixelData(frameIndex);

    let numberOfChannels = this.numberOfChannels();

    if (numberOfChannels > 1) {
      return this._convertColorSpace(decompressedData);
    } else {
      return decompressedData;
    }
  }

  //
  // private methods
  //

  _findInGroupSequence(sequence, subsequence, index) {
    let functionalGroupSequence = this._dataSet.elements[sequence];

    if (typeof functionalGroupSequence !== 'undefined') {
      let inSequence = functionalGroupSequence.items[index].dataSet.elements[subsequence];

      if (typeof inSequence !== 'undefined') {
        return inSequence.items[0].dataSet;
      }
    }

    return null;
  }

  _findStringInGroupSequence(sequence, subsequence, tag, index) {
    // index = 0 if shared!!!
    let dataSet = this._findInGroupSequence(sequence, subsequence, index);

    if (dataSet !== null) {
      return dataSet.string(tag);
    }

    return null;
  }

  _findStringInFrameGroupSequence(subsequence, tag, index) {
    return this._findStringInGroupSequence('x52009229', subsequence, tag, 0) ||
        this._findStringInGroupSequence('x52009230', subsequence, tag, index);
  }

  _findStringEverywhere(subsequence, tag, index) {
    let targetString = this._findStringInFrameGroupSequence(subsequence, tag, index);

    if (targetString === null) {
      targetString = this._dataSet.string(tag);
    }

    if (typeof targetString === 'undefined') {
      targetString = null;
    }

    return targetString;
  }

  _findFloatStringInGroupSequence(sequence, subsequence, tag, index) {
    let dataInGroupSequence = this._dataSet.floatString(tag);

    // try to get it from enhanced MR images
    // per-frame functionnal group
    if (typeof dataInGroupSequence === 'undefined') {
      dataInGroupSequence = this._findInGroupSequence(sequence, subsequence, index);

      if (dataInGroupSequence !== null) {
        return dataInGroupSequence.floatString(tag);
      } else {
        return null;
      }
    }

    return dataInGroupSequence;
  }

  _findFloatStringInFrameGroupSequence(subsequence, tag, index) {
    return this._findFloatStringInGroupSequence('x52009229', subsequence, tag, 0) ||
        this._findFloatStringInGroupSequence('x52009230', subsequence, tag, index);
  }

  _decodePixelData(frameIndex = 0) {
    // if compressed..?
    let transferSyntaxUID = this.transferSyntaxUID();

    // find compression scheme
    if (
      transferSyntaxUID === '1.2.840.10008.1.2.4.90' ||
      // JPEG 2000 Lossless
      transferSyntaxUID === '1.2.840.10008.1.2.4.91') {
      // JPEG 2000 Lossy
      return this._decodeJ2K(frameIndex);
    } else if (
      transferSyntaxUID === '1.2.840.10008.1.2.4.57' ||
      // JPEG Lossless, Nonhierarchical (Processes 14)
      transferSyntaxUID === '1.2.840.10008.1.2.4.70') {
      // JPEG Lossless, Nonhierarchical (Processes 14 [Selection 1])
      return this._decodeJPEGLossless(frameIndex);
    } else if (
      transferSyntaxUID === '1.2.840.10008.1.2.4.50' ||
      // JPEG Baseline lossy process 1 (8 bit)
      transferSyntaxUID === '1.2.840.10008.1.2.4.51') {
      // JPEG Baseline lossy process 2 & 4 (12 bit)
      return this._decodeJPEGBaseline(frameIndex);
    } else if (
      transferSyntaxUID === '1.2.840.10008.1.2' ||
      // Implicit VR Little Endian
      transferSyntaxUID === '1.2.840.10008.1.2.1') {
      // Explicit VR Little Endian
      return this._decodeUncompressed(frameIndex);
    } else if (
      transferSyntaxUID === '1.2.840.10008.1.2.2') {
      // Explicit VR Big Endian
      let frame = this._decodeUncompressed(frameIndex);
      // and sawp it!
      return this._swapFrame(frame);
    } else {
      throw {
        error: `no decoder for transfer syntax ${transferSyntaxUID}`,
      };
    }
  }

  _decodeJ2K(frameIndex = 0) {
    let encodedPixelData = DicomParser.readEncapsulatedPixelData(this._dataSet, this._dataSet.elements.x7fe00010, frameIndex);
    // let pixelDataElement = this._dataSet.elements.x7fe00010;
    // let pixelData = new Uint8Array(this._dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);
    let jpxImage = new Jpx();
    // https://github.com/OHIF/image-JPEG2000/issues/6
    // It currently returns either Int16 or Uint16 based on whether the codestream is signed or not.
    jpxImage.parse(encodedPixelData);

    // let j2kWidth = jpxImage.width;
    // let j2kHeight = jpxImage.height;

    let componentsCount = jpxImage.componentsCount;
    if (componentsCount !== 1) {
      throw 'JPEG2000 decoder returned a componentCount of ${componentsCount}, when 1 is expected';
    }
    let tileCount = jpxImage.tiles.length;

    if (tileCount !== 1) {
      throw 'JPEG2000 decoder returned a tileCount of ${tileCount}, when 1 is expected';
    }

    let tileComponents = jpxImage.tiles[0];
    let pixelData = tileComponents.items;

    // window.console.log(j2kWidth, j2kHeight);

    return pixelData;
  }

  // from cornerstone
  _decodeJPEGLossless(frameIndex = 0) {
    let encodedPixelData = DicomParser.readEncapsulatedPixelData(this._dataSet, this._dataSet.elements.x7fe00010, frameIndex);
    let pixelRepresentation = this.pixelRepresentation(frameIndex);
    let bitsAllocated = this.bitsAllocated(frameIndex);
    let byteOutput = bitsAllocated <= 8 ? 1 : 2;
    let decoder = new Jpeg.lossless.Decoder();
    let decompressedData = decoder.decode(encodedPixelData.buffer, encodedPixelData.byteOffset, encodedPixelData.length, byteOutput);

    if (pixelRepresentation === 0) {
      if (byteOutput === 2) {
        return new Uint16Array(decompressedData.buffer);
      } else {
        // untested!
        return new Uint8Array(decompressedData.buffer);
      }
    } else {
      return new Int16Array(decompressedData.buffer);
    }
  }

  _decodeJPEGBaseline(frameIndex = 0) {
    let encodedPixelData = DicomParser.readEncapsulatedPixelData(this._dataSet, this._dataSet.elements.x7fe00010, frameIndex);
    let rows = this.rows(frameIndex);
    let columns = this.columns(frameIndex);
    let bitsAllocated = this.bitsAllocated(frameIndex);
    let jpegBaseline = new JpegBaseline();
    jpegBaseline.parse(encodedPixelData);

    if (bitsAllocated === 8) {
      return jpegBaseline.getData(columns, rows);
    } else if (bitsAllocated === 16) {
      return jpegBaseline.getData16(columns, rows);
    }
  }

  _decodeUncompressed(frameIndex = 0) {
    let pixelRepresentation = this.pixelRepresentation(frameIndex);
    let bitsAllocated = this.bitsAllocated(frameIndex);
    let pixelDataElement = this._dataSet.elements.x7fe00010;
    let pixelDataOffset = pixelDataElement.dataOffset;
    let numberOfChannels = this.numberOfChannels();
    let numPixels =
      this.rows(frameIndex) * this.columns(frameIndex) * numberOfChannels;
    let frameOffset = 0;
    let buffer = this._dataSet.byteArray.buffer;

    if (pixelRepresentation === 0 && bitsAllocated === 8) {
      // unsigned 8 bit
      frameOffset = pixelDataOffset + frameIndex * numPixels;
      return new Uint8Array(buffer, frameOffset, numPixels);
    } else if (pixelRepresentation === 0 && bitsAllocated === 16) {
      // unsigned 16 bit
      frameOffset = pixelDataOffset + frameIndex * numPixels * 2;
      return new Uint16Array(buffer, frameOffset, numPixels);
    } else if (pixelRepresentation === 1 && bitsAllocated === 16) {
      // signed 16 bit
      frameOffset = pixelDataOffset + frameIndex * numPixels * 2;
      return new Int16Array(buffer, frameOffset, numPixels);
    } else if (pixelRepresentation === 0 && bitsAllocated === 32) {
      // unsigned 32 bit
      frameOffset = pixelDataOffset + frameIndex * numPixels * 4;
      return new Uint32Array(buffer, frameOffset, numPixels);
    } else if (pixelRepresentation === 0 && bitsAllocated === 1) {
      let newBuffer = new ArrayBuffer(numPixels);
      let newArray = new Uint8Array(newBuffer);

      frameOffset = pixelDataOffset + frameIndex * numPixels;
      let index = 0;

      let bitStart = frameIndex * numPixels;
      let bitEnd = frameIndex * numPixels + numPixels;

      let byteStart = Math.floor(bitStart / 8);
      let bitStartOffset = bitStart - byteStart * 8;
      let byteEnd = Math.ceil(bitEnd / 8);

      let targetBuffer = new Uint8Array(buffer, pixelDataOffset);

      for (let i = byteStart; i <= byteEnd; i++) {
        while (bitStartOffset < 8) {
          switch (bitStartOffset) {
            case 0:
              newArray[index] = targetBuffer[i] & 0x0001;
              break;
            case 1:
              newArray[index] = targetBuffer[i] >>> 1 & 0x0001;
              break;
            case 2:
              newArray[index] = targetBuffer[i] >>> 2 & 0x0001;
              break;
            case 3:
              newArray[index] = targetBuffer[i] >>> 3 & 0x0001;
              break;
            case 4:
              newArray[index] = targetBuffer[i] >>> 4 & 0x0001;
              break;
            case 5:
              newArray[index] = targetBuffer[i] >>> 5 & 0x0001;
              break;
            case 6:
              newArray[index] = targetBuffer[i] >>> 6 & 0x0001;
              break;
            case 7:
              newArray[index] = targetBuffer[i] >>> 7 & 0x0001;
              break;
            default:
              break;
          }

          bitStartOffset++;
          index++;
          // if return..
          if (index >= numPixels) {
            return newArray;
          }
        }
        bitStartOffset = 0;
      }
    }
  }

  _convertColorSpace(uncompressedData) {
    let rgbData = null;
    let photometricInterpretation = this.photometricInterpretation();
    let planarConfiguration = this.planarConfiguration();

    if (photometricInterpretation === 'RGB' &&
        planarConfiguration === 0) {
      // ALL GOOD, ALREADY ORDERED
      // planar or non planar planarConfiguration
      rgbData = uncompressedData;
    } else if (photometricInterpretation === 'RGB' &&
        planarConfiguration === 1) {
      if (uncompressedData instanceof Int8Array) {
        rgbData = new Int8Array(uncompressedData.length);
      } else if (uncompressedData instanceof Uint8Array) {
        rgbData = new Uint8Array(uncompressedData.length);
      } else if (uncompressedData instanceof Int16Array) {
        rgbData = new Int16Array(uncompressedData.length);
      } else if (uncompressedData instanceof Uint16Array) {
        rgbData = new Uint16Array(uncompressedData.length);
      } else {
        throw 'unsuported typed array: ${uncompressedData}';
      }

      let numPixels = uncompressedData.length / 3;
      let rgbaIndex = 0;
      let rIndex = 0;
      let gIndex = numPixels;
      let bIndex = numPixels * 2;
      for (let i = 0; i < numPixels; i++) {
        rgbData[rgbaIndex++] = uncompressedData[rIndex++]; // red
        rgbData[rgbaIndex++] = uncompressedData[gIndex++]; // green
        rgbData[rgbaIndex++] = uncompressedData[bIndex++]; // blue
      }
    } else if (photometricInterpretation === 'YBR_FULL') {
      if (uncompressedData instanceof Int8Array) {
        rgbData = new Int8Array(uncompressedData.length);
      } else if (uncompressedData instanceof Uint8Array) {
        rgbData = new Uint8Array(uncompressedData.length);
      } else if (uncompressedData instanceof Int16Array) {
        rgbData = new Int16Array(uncompressedData.length);
      } else if (uncompressedData instanceof Uint16Array) {
        rgbData = new Uint16Array(uncompressedData.length);
      } else {
        throw 'unsuported typed array: ${uncompressedData}';
      }

      // https://github.com/chafey/cornerstoneWADOImageLoader/blob/master/src/decodeYBRFull.js
      let nPixels = uncompressedData.length / 3;
      let ybrIndex = 0;
      let rgbaIndex = 0;
      for (let i = 0; i < nPixels; i++) {
        let y = uncompressedData[ybrIndex++];
        let cb = uncompressedData[ybrIndex++];
        let cr = uncompressedData[ybrIndex++];
        rgbData[rgbaIndex++] = y + 1.40200 * (cr - 128);// red
        rgbData[rgbaIndex++] = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128); // green
        rgbData[rgbaIndex++] = y + 1.77200 * (cb - 128); // blue
        // rgbData[rgbaIndex++] = 255; //alpha
      }
    } else {
      throw 'photometric interpolation not supported: ${photometricInterpretation}';
    }

    return rgbData;
  }

  /**
   * Swap bytes in frame.
   */
  _swapFrame(frame) {
    // swap bytes ( if 8bits (1byte), nothing to swap)
    let bitsAllocated = this.bitsAllocated();

    if (bitsAllocated === 16) {
      for (let i = 0; i < frame.length; i++) {
        frame[i] = this._swap16(frame[i]);
      }
    } else if (bitsAllocated === 32) {
      for (let i = 0; i < frame.length; i++) {
        frame[i] = this._swap32(frame[i]);
      }
    }

    return frame;
  }

}

// VJS.parsers.dicom.prototype.frameOfReferenceUID = function(imageJqueryDom) {
//   // try to access frame of reference UID through its DICOM tag
//   let seriesNumber = imageJqueryDom.find('[tag="00200052"] Value').text();

//   // if not available, assume we only have 1 frame
//   if (seriesNumber === '') {
//     seriesNumber = 1;
//   }
//   return seriesNumber;
// };

//
// ENDIAN NESS NOT TAKEN CARE OF
// http://stackoverflow.com/questions/5320439/how-do-i-swap-endian-ness-byte-order-of-a-letiable-in-javascript
// http://www.barre.nom.fr/medical/samples/
//
//
