/* globals describe, it, expect, beforeEach*/

import ModelsBase from '../../src/models/models.base';

describe('Models.Base', function() {
  let validBase;
  let invalidBase;

  beforeEach(() => {
    //
    validBase = new ModelsBase();
    validBase.seriesInstanceUID = 'validBaseInstanceUID';

    //
    invalidBase= new ModelsBase();
    invalidBase.merge = undefined;
  });

  describe('mergeModels', function() {
    it('should return false if model arrays are not valid', function() {
      //
      let valid = validBase.mergeModels(null, [validBase]);
      expect(valid).toEqual(false);

      valid = validBase.mergeModels([validBase], [invalidBase]);
      expect(valid).toEqual(false);
    });

    it('should return true if was successful', function() {
      // merge was not overloaded!
      let valid = validBase.mergeModels([validBase], [validBase]);
      expect(valid).toEqual(true);
    });

  });

  describe('merge', function() {
    it('should return false if merge was not successful', function() {
      //
      expect(validBase.merge()).toEqual(false);
      expect(validBase.merge('whatever')).toEqual(false);
    });

    it('should return true if merge was successful', function() {
      //
      expect(validBase.merge(validBase)).toEqual(true);
    });
  });

  describe('validate', function() {
    it('should return false if model is not valid', function() {
      // model which doesn't have a merge function
      expect(invalidBase.validate(invalidBase)).toEqual(false);
    });

    it('should return true if target model is valid', function() {
      //
      expect(validBase.validate(validBase)).toEqual(true);
    });

  });

  describe('_validateModelArray', function() {
    it('should return false if model array is not valid', function() {

      //
      let valid = validBase._validateModelArray(null);
      expect(valid).toEqual(false);

      //
      valid = validBase._validateModelArray([validBase, null]);
      expect(valid).toEqual(false);
      
      //
      valid = validBase._validateModelArray([validBase, invalidBase]);
      expect(valid).toEqual(false);
    });

    it('should return true if model array is valid', function() {
      //
      let valid = validBase._validateModelArray([validBase, validBase]);
      expect(valid).toEqual(true);
    });

  });

});
