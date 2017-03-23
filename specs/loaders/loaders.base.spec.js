/* globals describe, sinon, it, expect, beforeEach*/

import LoadersBase from '../../src/loaders/loaders.base';
import ProgressBar from '../../src/helpers/helpers.progressbar';

/**
 * events test here only cover two function case: loadSequence and load.
 * because this two case cover all the events.
 */

describe('Loader.Base', function() {
  let baseLoader;
  const eventsHandleSpy = {};
  const sourceUrl = '/base/data/dicom/adi_slice.dcm';
  const baseSinonMatch =
    new sinon.match({file: sourceUrl}).and(new sinon.match.hasOwn('time'));

  beforeEach(() => {
    baseLoader = new LoadersBase();
    // setup event handle spy
    ['load-start',
      'fetch-start',
      'fetch-success',
      'fetch-error',
      'fetch-abort',
      'fetch-timeout',
      'fetch-progress',
      'fetch-end',
      'parse-start',
      'parsing',
      'parse-success',
      'parse-error'].map((evtName) => {
        eventsHandleSpy[evtName] = new sinon.spy();
        baseLoader.on(evtName, eventsHandleSpy[evtName]);
      });
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

    it('should return success only with ProgressBar', () => {
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
      baseLoader.fetch(sourceUrl)
                .then((data) => {
                  expect(data.url).toEqual(sourceUrl);
                  expect(data.buffer instanceof Object).toEqual(true);
                  baseLoader.parse(data)
                            .then((parsedData) => {
                              expect(data === parsedData).toEqual(true);
                              done();
                            });
                });
    });
    it('the url is availble, call loadSequence directly', (done) => {
      baseLoader
        .loadSequence(sourceUrl)
        .then((data) => {
          // because LoadersBase just have a empty parse
          // test like above
          expect(data.url).toEqual(sourceUrl);
          expect(data.buffer instanceof Object).toEqual(true);
          // event tests
          sinon.assert.calledWith(
            eventsHandleSpy['fetch-start'], baseSinonMatch);
          sinon.assert.calledWith(
            eventsHandleSpy['fetch-success'], baseSinonMatch
                      .and(new sinon.match.hasOwn('totalLoaded')));
          sinon.assert.calledWith(
            eventsHandleSpy['fetch-progress'], baseSinonMatch
                      .and(new sinon.match.hasOwn('total'))
                      .and(new sinon.match.hasOwn('loaded')));
          done();
        });
    });

    it('the url is unavailble', (done) => {
      // some helper on how to handle this case
      baseLoader.fetch('/base/data/dicom/xxx.tar')
        .catch((error) => {
          expect(error).toEqual('Not Found');
          done();
        });
    });
  });

  describe('load data by urls', () => {
    it('give a single url', (done) => {
      baseLoader.load(sourceUrl)
                .then((data) => {
                  expect(Array.isArray(data)).toBe(true);
                  expect(data.length).toBe(1);
                  expect(eventsHandleSpy['load-start'].calledOnce).toBe(true);
                  sinon.assert.calledWith(
                    eventsHandleSpy['load-start'],
                    new sinon.match({files: [sourceUrl]})
                              .and(new sinon.match.hasOwn('time')));
                  done();
                });
    });

    it('give urls with array', (done) => {
      const urls = [
        '/base/data/dicom/adi_slice.dcm',
        '/base/data/dicom/dcm.seg.andrei',
        '/base/data/nifti/adi_slice.nii',
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
