/* globals describe, fdescribe, it, fit, expect, beforeEach*/

import LoadersBase from '../../src/loaders/loaders.base';
import ProgressBar from '../../src/helpers/helpers.progressbar';

describe('Lorder.Base', function() {
  let baseLoader;

  beforeEach(() => {
    baseLoader = new LoadersBase();
  });

  afterEach(() => {
    baseLoader = null;
  });

  describe('create loader instance and then free the reference', () => {
    it('should return success with no args', () => {
      const loader = new LoadersBase();
      expect(loader instanceof LoadersBase).toEqual(true);
      loader.free();
      expect(loader._container).toEqual(null);
      expect(loader._progressBar).toEqual(null);
    });

    it('should return success only with container', () => {
      const container = document.createElement('div');
      const loader = new LoadersBase(container);
      expect(loader instanceof LoadersBase).toEqual(true);
      loader.free();
      expect(loader._container).toEqual(null);
      expect(loader._progressBar).toEqual(null);
    });

    it('should return success only with ProgressBar but have no progressbar', () => {
      const loader = new LoadersBase(null, ProgressBar);
      expect(loader instanceof LoadersBase).toEqual(true);
      expect(loader._progressBar).toEqual(null);
      loader.free();
      expect(loader._container).toEqual(null);
      expect(loader._progressBar).toEqual(null);
    });

    it('should return success with both container and ProgressBar', () => {
      const container = document.createElement('div');
      const loader = new LoadersBase(container, ProgressBar);
      expect(loader instanceof LoadersBase).toEqual(true);
      loader.free();
      expect(loader._container).toEqual(null);
      expect(loader._progressBar).toEqual(null);
    });
  });

  describe('setter/getter data', () => {
    it('data should be empty array when init', () => {
      expect(baseLoader.data).toEqual([]);
    });

    it('set the data then get it', () => {
      baseLoader.data = [1, 2, 3];
      expect(baseLoader.data.length).toEqual(3);
      expect(baseLoader.data[0]).toEqual(1);
      expect(baseLoader.data[1]).toEqual(2);
      expect(baseLoader.data[2]).toEqual(3);
      expect(baseLoader.data[2]).toEqual(3);
    });
  });

  describe('fetch data by given url, and parse it', () => {
    it('the url is availble, fetch and parse data', (done) => {
      baseLoader.fetch('/base/data/dicom/adi_slice.dcm.tar')
                .then((data) => {
                  expect(data.url).toEqual('/base/data/dicom/adi_slice.dcm.tar');
                  expect(data.buffer instanceof Object).toEqual(true);
                  baseLoader.parse(data)
                            .then((parsedData) => {
                              expect(data === parsedData).toEqual(true);
                              done();
                            });
                });
    });

    it('the url is availble, call loadSequence directly', (done) => {
      baseLoader.loadSequence('/base/data/dicom/adi_slice.dcm.tar')
                .then((data) => {
                  // because LoadersBase just have a empty parse
                  // test like above
                  expect(data.url).toEqual('/base/data/dicom/adi_slice.dcm.tar');
                  expect(data.buffer instanceof Object).toEqual(true);
                  done();
                });
    });

    xit('the url is unavailbl', (done) => {
      // some helper on how to handle this case
      expact(
        baseLoader.fetch('/base/data/dicom/xxx.tar')
                .then((errorMsg) => {
                  done();
                })
        ).toThrowError('Not Found');
    });
  });

  describe('load data by urls', () => {
    it('give a single url', (done) => {
      baseLoader.load('/base/data/dicom/adi_slice.dcm.tar')
                .then((data) => {
                  expect(Array.isArray(data)).toBe(true);
                  expect(data.length).toBe(1);
                  done();
                });
    });

    it('give urls with array', (done) => {
      const urls = [
        '/base/data/dicom/adi_slice.dcm.tar',
        '/base/data/dicom/dcm.seg.andrei.tar',
        '/base/data/nifti/adi_slice.nii.tar',
      ];
      baseLoader.load(urls)
                .then((data) => {
                  expect(Array.isArray(data)).toBe(true);
                  expect(data.length).toBe(3);
                  done();
                });
    });
  });
});
