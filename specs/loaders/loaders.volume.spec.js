/* globals describe, fdescribe, it, fit, expect, beforeEach*/

import VolumeLoader from '../../src/loaders/loaders.volume';

describe('Volume Loader', function() {
  let loader;
  const eventsHandleSpy = {};
  const sourceUrl = '/base/data/dicom/adi_slice.dcm';
  const baseSinonMatch = new sinon.match({file: sourceUrl}).and(new sinon.match.hasOwn('time'));

  beforeEach(() => {
    loader = new VolumeLoader();
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
        loader.on(evtName, eventsHandleSpy[evtName]);
      });
  });

  afterEach(() => {
    loader = null;
  });

  describe('parse data', () => {
    it('give a single url', (done) => {
      loader.load(sourceUrl)
                .then((data) => {
                  expect(Array.isArray(data)).toBe(true);
                  expect(data.length).toBe(1);
                  // just test events of parse, the other events test at loader.base.spec.js
                  sinon.assert.calledWith(eventsHandleSpy['parse-start'], baseSinonMatch);
                  sinon.assert.calledWith(eventsHandleSpy['parsing'], baseSinonMatch
                                                                        .and(new sinon.match.hasOwn('total'))
                                                                        .and(new sinon.match.hasOwn('parsed')));
                  sinon.assert.calledWith(eventsHandleSpy['parse-success'], baseSinonMatch
                                                                        .and(new sinon.match.hasOwn('total'))
                                                                        .and(new sinon.match.hasOwn('parsed')));
                  done();
                });
    });

    it('give urls with array', (done) => {
      const urls = [
        '/base/data/dicom/adi_slice.dcm',
        '/base/data/nifti/adi_slice.nii',
      ];
      loader.load(urls)
                .then((data) => {
                  expect(Array.isArray(data)).toBe(true);
                  expect(data.length).toBe(2);
                  done();
                });
    });
  });
});
