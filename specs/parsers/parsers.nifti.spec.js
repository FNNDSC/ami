/* globals describe, it, expect, beforeEach*/

import ParsersDicom from '../../src/parsers/parsers.dicom';
import ParsersNifti from '../../src/parsers/parsers.nifti';

let dicomDataset = {
    format: 'dicom',
    url: '/base/data/dicom/adi_slice.dcm',
    parser: ParsersDicom,
};

let niftiDataset = {
    format: 'nifti',
    url: '/base/data/nifti/adi_slice.nii',
    parser: ParsersNifti,
};

// let nrrdDataset = {
//     format: 'nrrd',
//     url: '/base/data/nrrd/adi_slice.nrrd',
//     parser: ParsersNrrd
// };

function crop(value, decimals) {
  return (Math.floor(Math.pow(10, decimals) * value) / Math.pow(10, decimals));
}

function test(dataset, datasetDicom) {
    let parserDicom = null;

    beforeEach((done) => {
        // fetch dicom data
        let oReqDicom = new XMLHttpRequest();
        oReqDicom.open('GET', datasetDicom.url, true);
        oReqDicom.responseType = 'arraybuffer';

        oReqDicom.onload = () => {
        let buffer = oReqDicom.response;
        if (buffer) {
            parserDicom = new datasetDicom.parser({
            url: datasetDicom.url,
            buffer}
            , 0);
            done();
        }
        };
        oReqDicom.send();
    });

  // test extraction of tags of interest
  describe(dataset.format, function() {
    let parser = null;

    beforeEach((done) => {
      // fetch other data
      let oReqData = new XMLHttpRequest();
      oReqData.open('GET', dataset.url, true);
      oReqData.responseType = 'arraybuffer';

      oReqData.onload = () => {
        let buffer = oReqData.response;
        if (buffer) {
          parser = new dataset.parser({
            url: dataset.url,
            buffer}
          , 0);
          done();
        }
      };
      oReqData.send();
    });

    it('image position', function() {
        let frameIndex = 0;
        let dicomImagePosition = parserDicom.imagePosition(frameIndex);
        let imagePosition = parser.imagePosition(frameIndex);

        expect(crop(imagePosition[0], 5)).toBe(crop(dicomImagePosition[0], 5));
        expect(crop(imagePosition[1], 5)).toBe(crop(dicomImagePosition[1], 5));
        expect(crop(imagePosition[2], 5)).toBe(crop(dicomImagePosition[2], 5));
    });

    it('pixel spacing', function() {
        let frameIndex = 0;
        let dicomPixelSpacing = parserDicom.pixelSpacing(frameIndex);
        let pixelSpacing = parser.pixelSpacing(frameIndex);
        // check typeof and length...
        expect(crop(pixelSpacing[0], 5)).toBe(crop(dicomPixelSpacing[0], 5));
        expect(crop(pixelSpacing[1], 5)).toBe(crop(dicomPixelSpacing[1], 5));
    });

    it('image orientation', function() {
        let frameIndex = 0;
        let dicomOrientation = parserDicom.imageOrientation(frameIndex);
        let dataOrientation = parser.imageOrientation(frameIndex);

        expect(crop(dataOrientation[0], 5)).toBe(crop(dicomOrientation[0], 5));
        expect(crop(dataOrientation[1], 5)).toBe(crop(dicomOrientation[1], 5));
        expect(crop(dataOrientation[2], 5)).toBe(crop(dicomOrientation[2], 5));
        expect(crop(dataOrientation[3], 5)).toBe(crop(dicomOrientation[3], 5));
        expect(crop(dataOrientation[4], 5)).toBe(crop(dicomOrientation[4], 5));
        expect(crop(dataOrientation[5], 5)).toBe(crop(dicomOrientation[5], 5));
      });

    it('pixel data', function() {
        let frameIndex = 0;
        let rows = parser.rows(frameIndex);
        let columns = parser.columns(frameIndex);
        let dicomPixelData = parserDicom.extractPixelData(frameIndex);
        let pixelData = parser.extractPixelData(frameIndex);

        expect(pixelData.join()).toEqual(dicomPixelData.join());
      });
  });
}

describe('Orientation', function() {
  test(niftiDataset, dicomDataset);
//   test( nrrdDataset );
});

// test dataset that does not work anymore..
// does current visualization make sense?

// test first and last from siena