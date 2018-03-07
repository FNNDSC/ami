/* globals describe, it, expect, beforeEach*/

import ParsersDicom from '../../src/parsers/parsers.dicom';

let datasets = [];

function testObjectTemplate(
    name,
    from,
    url,

    modality,
    seriesInstanceUID,
    studyInstanceUID,
    transferSyntaxUID,
    numberOfFrames,
    numberOfChannels,

    photometricInterpretation,
    planarConfiguration,
    samplesPerPixel,
    imageOrientation,
    imagePosition,
    pixelSpacing,
    sopInstanceUID,
    sliceThickness,
    rows,
    columns,
    pixelRepresentation,
    bitsAllocated,
    highBit,
    rescaleIntercept,
    rescaleSlope,
    windowCenter,
    windowWidth,
    dimensionIndexValues,
    instanceNumber,
    pixelAspectRatio,
    inStackPositionNumber,
    stackID,

    minMax
    ){
  return {
    // general info
    name,
    from,
    url,

    // Series specific
    modality,
    seriesInstanceUID,
    studyInstanceUID,
    transferSyntaxUID,
    numberOfFrames,
    numberOfChannels,

    // Stack specific

    // Frame specific
    photometricInterpretation,
    planarConfiguration,
    samplesPerPixel,
    imageOrientation,
    imagePosition,
    pixelSpacing,
    sopInstanceUID,
    sliceThickness,
    rows,
    columns,
    pixelRepresentation,
    bitsAllocated,
    highBit,
    rescaleIntercept,
    rescaleSlope,
    windowCenter,
    windowWidth,
    dimensionIndexValues,
    instanceNumber,
    pixelAspectRatio,
    inStackPositionNumber,
    stackID,

    // computed values
    minMax
  };
}

// MR
let data1 = testObjectTemplate(
  'MR - 16!',
  'http://www.insight-journal.org/midas/collection/view/194',
  '/base/data/dicom/fruit.dcm',

  // Series specific
  'MR',
  '1.3.46.670589.11.5730.5.0.10204.2010041914320789246',
  '1.3.46.670589.11.5730.5.0.7888.2010041913494343000',
  '1.2.840.10008.1.2.1', 60, 1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  [1, 0, 0, 0, 1, 0],
  [-74.26927947998, -96.01170349121, -56.623718261718],
  [0.17299106717109, 0.17299106717109],
  '1.3.46.670589.11.5730.5.0.10204.2010041914353587277',
  2.5,
  896,
  896,
  0,
  16,
  11,
  0.0,
  3.04713064713064,
  359,
  623,
  [1, 1],
  1,
  null,
  1,
  1,

  // computed values
  [0, 437]
);
//datasets.push(data1);

let data2 = testObjectTemplate(
  'Osirix test',
  'OSIRIX',
  '/base/data/dicom/MELANIX.dcm',

  // Series specific
  'CT',
  '1.3.12.2.1107.5.1.4.48545.30000006091907514717100002940',
  '2.16.840.1.113669.632.20.1211.10000309035',
  '1.2.840.10008.1.2.4.91', // JPEG 2000 Image Compression
  null,
  1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  [1, 0, 0, 0, 1, 0],
  [-249.51171875, -366.51171875, -801.6],
  [0.9765625, 0.9765625],
  '1.3.12.2.1107.5.1.4.48545.30000006091907514717100003456',
  2,
  512,
  512,
  0,
  16,
  11,
  -1024,
  1.0,
  40,
  400,
  null,
  516,
  null,
  null,
  null,

  // computed values
  [0, 2402]
);
datasets.push(data2);

// US
let data3 = testObjectTemplate(
  'US - RGB',
  'http://www.barre.nom.fr/medical/samples/',
  '/base/data/dicom/US-RGB-8-esopecho.dcm',

  // Series specific
  'US',
  '999.999.2.19941105.112000.2',
  '999.999.2.19941105.112000',
  '1.2.840.10008.1.2.1', // Implicit VR Endian
  null,
  3,

  // Stack specific

  // Frame specific
  'RGB',
  0,
  3,
  null,
  null,
  null,
  '999.999.2.19941105.112000.2.107',
  null,
  120,
  256,
  0,
  8,
  7,
  null,
  null,
  null,
  null,
  null,
  107,
  [4, 3],
  null,
  null,

  // computed values
  [16, 248]
);
datasets.push(data3);

// MR
let data4 = testObjectTemplate(
  'MR - Multiframe',
  'http://www.barre.nom.fr/medical/samples/',
  '/base/data/dicom/MR-MONO2-8-16x-heart.dcm',

  // Series specific
  'MR',
  '999.999.2.19960619.163000.1',
  '999.999.2.19960619.163000',
  '1.2.840.10008.1.2.1', // Implicit VR Endian
  16,
  1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  null,
  null,
  null,
  '999.999.2.19960619.163000.1.103',
  10,
  256,
  256,
  0,
  8,
  7,
  null,
  null,
  null,
  null,
  null,
  103,
  null,
  null,
  null,

  // computed values
  [0, 252]
);
datasets.push(data4);

// datasets = [];
let data5 = testObjectTemplate(
  'SEG - Multiframe',
  'http://www.barre.nom.fr/medical/samples/',
  '/base/data/dicom/dcm.seg.andrei',

  // Series specific
  'SEG',
  '1.2.276.0.7230010.3.1.3.0.14020.1415374328.261593',
  '1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159',
  '1.2.840.10008.1.2.1', // Implicit VR Endian
  275,
  1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  [1, 0, 0, 0, 1, 0],
  [ -201, -59, -679.800049 ],
  [0.78125, 0.78125],
  '1.2.276.0.7230010.3.1.4.0.14020.1415374328.261594',
  1,
  512,
  512,
  0,
  1,
  0,
  null,
  null,
  null,
  null,
  [ 1, 1 ],
  1,
  null,
  1,
  1,

  // computed values
  // not tested...
  [0, 0]
);
datasets.push(data5);

let data6 = testObjectTemplate(
  'MR - JPEG Lossless',
  'http://www.barre.nom.fr/medical/samples/',
  '/base/data/dicom/mi2b2.dcm',

  // Series specific
  'MR',
  '1.2.840.113619.2.176.3596.6688992.26319.1176381616.470',
  '1.2.124.113532.132.183.36.32.20070412.82753.18081132',
  '1.2.840.10008.1.2.4.70', // ??
  null,
  1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  [ 1, 0, 0, 0, 1, 0 ],
  [ -102.497, -140.594, -44.4881 ],
  [0.8594, 0.8594],
  '1.2.840.113619.2.176.3596.6688992.23495.1176381733.338',
  5,
  256,
  256,
  1,
  16,
  15,
  null,
  null,
  521,
  1042,
  null,
  1,
  null,
  null,
  null,

  // computed values
  // not tested...
  [0, 1042]
);
datasets.push(data6);

let data7 = testObjectTemplate(
  'CT - 16 signed - Explicit VR Big Endian',
  '@tommy.qichang',
  '/base/data/dicom/ser002img00001-16-signed.dcm',

  // Series specific
  'CT',
  '1.2.840.113619.2.327.3.3020574471.558.1462106543.508',
  '1.2.840.113745.101000.1186000.42489.8465.17042787',
  '1.2.840.10008.1.2.2', // ??
  null,
  1,

  // Stack specific

  // Frame specific
  'MONOCHROME2',
  null,
  1,
  [ 1, 0, 0, 0, 0.998135, -0.061049 ],
  [ -110, -130.495, 12.981 ],
  [ 0.429688, 0.429688 ],
  '1.2.840.113619.2.327.3.3020574471.558.1462106543.539.1',
  5,
  512,
  512,
  1,
  16,
  15,
  -1024,
  1,
  40,
  90,
  null,
  1,
  null,
  null,
  null,

  // computed values
  [0, 4095]
);
datasets.push(data7);

function dicomTestSequence(referenceDataset) {
  describe(referenceDataset.name, () => {

    // before each, load the data...
    let parser;

    beforeEach((done) => {
      // originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      // jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

      // fetch the data!
      let oReq = new XMLHttpRequest();
      oReq.open('GET', referenceDataset.url, true);
      oReq.responseType = 'arraybuffer';
      
      oReq.onload = () => {
        let buffer = oReq.response;
        if (buffer) {
          parser = new ParsersDicom({
            url: referenceDataset.url,
            buffer}
          , 0);
          done();
        }
      };
      oReq.send();
    });

    // SERIES TESTING
    describe('Series Information', () => {
      it('Modality: ' + referenceDataset.modality, () => {
        expect(parser.modality()).toBe(referenceDataset.modality);
      });

      it('Series Instance UID: ' + referenceDataset.seriesInstanceUID, () => {
        expect(parser.seriesInstanceUID()).toBe(referenceDataset.seriesInstanceUID);
      });

      it('Study Instance UID: ' + referenceDataset.studyInstanceUID, () => {
        expect(parser.studyInstanceUID()).toBe(referenceDataset.studyInstanceUID);
      });

      it('Transfer Syntax UID: ' + referenceDataset.transferSyntaxUID, () => {
        expect(parser.transferSyntaxUID()).toBe(referenceDataset.transferSyntaxUID);
      });

      it('Number of frames: ' + referenceDataset.numberOfFrames, () => {
        expect(parser.numberOfFrames()).toBe(referenceDataset.numberOfFrames);
      });

      it('Number of channels: ' + referenceDataset.numberOfChannels, () => {
        expect(parser.numberOfChannels()).toBe(referenceDataset.numberOfChannels);
      });
    });

    // FRAME TESTING
    describe('Frame (image) Information', () => {
      it('Photometric Interpolation: ' + referenceDataset.photometricInterpretation, () => {
        expect(parser.photometricInterpretation()).toBe(referenceDataset.photometricInterpretation);
      });

      it('Planar configuration: ' + referenceDataset.planarConfiguration, () => {
        expect(parser.planarConfiguration()).toBe(referenceDataset.planarConfiguration);
      });

      it('Samples per pixel: ' + referenceDataset.samplesPerPixel, () => {
        expect(parser.samplesPerPixel()).toBe(referenceDataset.samplesPerPixel);
      });

      it('Rows: ' + referenceDataset.rows, () => {
        let frameIndex = 0;
        expect(parser.rows(frameIndex)).toBe(referenceDataset.rows);
      });

      it('Columns: ' + referenceDataset.columns, () => {
        let frameIndex = 0;
        expect(parser.columns(frameIndex)).toBe(referenceDataset.columns);
      });

      it('Image Orientation: ' + referenceDataset.imageOrientation, () => {
        let frameIndex = 0;

        // compare array through strings as sometimes comparaison appears to fail without reason.

        var orientation = parser.imageOrientation(frameIndex);
        var orientationReference = referenceDataset.imageOrientation;

        if (orientation !== null) {
          orientation = orientation.toString();
          orientationReference = orientationReference.toString();
        }

        expect(orientation).toEqual(orientationReference);
      });

      it('Image Position: ' + referenceDataset.imagePosition, () => {
        let frameIndex = 0;
        expect(parser.imagePosition(frameIndex)).toEqual(referenceDataset.imagePosition);
      });

      it('Pixel Spacing: ' + referenceDataset.pixelSpacing, () => {
        let frameIndex = 0;
        expect(parser.pixelSpacing(frameIndex)).toEqual(referenceDataset.pixelSpacing);
      });

      it('SOP Instance UID: ' + referenceDataset.sopInstanceUID, () => {
        let frameIndex = 0;
        expect(parser.sopInstanceUID(frameIndex)).toBe(referenceDataset.sopInstanceUID);
      });

      it('Slice Thickness: ' + referenceDataset.sliceThickness, () => {
        let frameIndex = 0;
        expect(parser.sliceThickness(frameIndex)).toBe(referenceDataset.sliceThickness);
      });

      it('Pixel representation: ' + referenceDataset.pixelRepresentation, () => {
        let frameIndex = 0;
        expect(parser.pixelRepresentation(frameIndex)).toBe(referenceDataset.pixelRepresentation);
      });

      it('Bits allocated: ' + referenceDataset.bitsAllocated, () => {
        let frameIndex = 0;
        expect(parser.bitsAllocated(frameIndex)).toBe(referenceDataset.bitsAllocated);
      });

      it('High bit: ' + referenceDataset.highBit, () => {
        let frameIndex = 0;
        expect(parser.highBit(frameIndex)).toBe(referenceDataset.highBit);
      });

      it('Rescale intercept: ' + referenceDataset.rescaleIntercept, () => {
        let frameIndex = 0;
        expect(parser.rescaleIntercept(frameIndex)).toBe(referenceDataset.rescaleIntercept);
      });

      it('Rescale slope: ' + referenceDataset.rescaleSlope, () => {
        let frameIndex = 0;
        expect(parser.rescaleSlope(frameIndex)).toBe(referenceDataset.rescaleSlope);
      });

      it('Window center: ' + referenceDataset.windowCenter, () => {
        let frameIndex = 0;
        expect(parser.windowCenter(frameIndex)).toBe(referenceDataset.windowCenter);
      });

      it('Window width: ' + referenceDataset.windowWidth, () => {
        let frameIndex = 0;
        expect(parser.windowWidth(frameIndex)).toBe(referenceDataset.windowWidth);
      });

      it('Dimension index values: ' + referenceDataset.dimensionIndexValues, () => {
        let frameIndex = 0;
        expect(parser.dimensionIndexValues(frameIndex)).toEqual(referenceDataset.dimensionIndexValues);
      });

      it('Instance number: ' + referenceDataset.instanceNumber, () => {
        let frameIndex = 0;
        expect(parser.instanceNumber(frameIndex)).toEqual(referenceDataset.instanceNumber);
      });

      it('Pixel aspect ratio: ' + referenceDataset.pixelAspectRatio, () => {
        let frameIndex = 0;
        expect(parser.pixelAspectRatio(frameIndex)).toEqual(referenceDataset.pixelAspectRatio);
      });

      it('In stack position number: ' + referenceDataset.inStackPositionNumber, () => {
        let frameIndex = 0;
        expect(parser.inStackPositionNumber(frameIndex)).toEqual(referenceDataset.inStackPositionNumber);
      });

      it('Stack id: ' + referenceDataset.stackID, () => {
        let frameIndex = 0;
        expect(parser.stackID(frameIndex)).toEqual(referenceDataset.stackID);
      });
    });
  });
}

//dPixelData
// get pixel data, decompress
// length output
// min/max
function pixelDataTestSequence(referenceDataset) {
  describe(referenceDataset.name, function() {

    // before each, load the data...
    let parser;

    beforeEach((done) => {
      // originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      // jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

      // fetch the data!
      let oReq = new XMLHttpRequest();
      oReq.open('GET', referenceDataset.url, true);
      oReq.responseType = 'arraybuffer';
      
      oReq.onload = () => {
        let buffer = oReq.response;
        if (buffer) {
          parser = new ParsersDicom({
            url: referenceDataset.url,
            buffer}
          , 0);
          done();
        }
      };
      oReq.send();
    });

    describe('Parse pixel data', function() {

      // it('Decompress pixel data', function() {
      //   let frameIndex = 0;
      //   let pixelData = parser.decompressPixelData(frameIndex);
      //   // check typeof and length...
      //   expect(true).toBe(true);
      // });

      it('Extract pixel data', function() {
        let frameIndex = 0;
        parser.extractPixelData(frameIndex);
        // check typeof and length...
        expect(true).toBe(true);
      });

      it('Min,Max pixel data: ' + referenceDataset.minMax, function() {
        let frameIndex = 0;
        let pixelData = parser.extractPixelData(frameIndex);
        // hack for the compressed data, for now...
        if (pixelData) {
          let minMax = parser.minMaxPixelData(pixelData);
          expect(minMax).toEqual(referenceDataset.minMax);
        }
      });
    });
  });
}

// test extraction of tags of interest
describe('Parser.dicom', function() {
  for (let i = 0; i < datasets.length; i++) {
    // test utility functions to get dicom tags
    dicomTestSequence(datasets[i]);

    // test pixelData related functionnalities
    pixelDataTestSequence(datasets[i]);
  }
});
