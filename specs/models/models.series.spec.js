/* globals describe, it, expect, beforeEach*/

import ModelsSeries from '../../src/models/models.series';

describe('Models.series', function() {
  let validSeries;
  let validSeries2;
  let invalidSeries;

  beforeEach(() => {
    //
    validSeries = new ModelsSeries();
    validSeries.seriesInstanceUID = 'validSeriesInstanceUID';

    validSeries2 = new ModelsSeries();
    validSeries2.seriesInstanceUID = 'validSeriesInstanceUID2';

    //
    invalidSeries= new ModelsSeries();
    invalidSeries._stack = undefined;
  });

  describe('mergeSeries', function() {
    it('should return false if model arrays are not valid', function() {
      //
      let valid = validSeries.mergeSeries(null);
      expect(valid).toEqual([validSeries]);

      valid = validSeries.mergeSeries([invalidSeries]);
      expect(valid).toEqual([validSeries]);

      // merge was not overloaded!
      valid = validSeries.mergeSeries([validSeries2]);
      expect(valid).toEqual([validSeries, validSeries2]);

      valid = validSeries.mergeSeries([validSeries2, invalidSeries]);
      expect(valid).toEqual([validSeries]);

    });

  });

  describe('merge', function() {
    it('should return false if merge was not successful', function() {
      //
      expect(validSeries.merge()).toEqual(false);
      expect(validSeries.merge('whatever')).toEqual(false);
      expect(validSeries.merge(validSeries2)).toEqual(false);
    });

    it('should return true if merge was successful', function() {
      //
      expect(validSeries.merge(validSeries)).toEqual(true);
    });
  });

  describe('validate', function() {
    it('should return false if model is not valid', function() {
      // model which doesn't have a merge function
      expect(invalidSeries.validate(invalidSeries)).toEqual(false);
    });

    it('should return true if target model is valid', function() {
      //
      expect(validSeries.validate(validSeries)).toEqual(true);
    });

  });

});
