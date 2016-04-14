/* globals describe, it, expect, beforeEach*/

import CoreValidators from '../../src/core/core.validators';

describe('Core.Validator', function() {

  describe('matrix4', function() {
    it('should return false if matrix is not valid', function() {

      // null provided
      let validate = CoreValidators.matrix4(null);
      expect(validate).toEqual(false);

      // undefined provided
      let obj = {};
      validate = CoreValidators.matrix4(obj.iamundefined);
      expect(validate).toEqual(false);

      // {} ptovided
      validate = CoreValidators.matrix4({});
      expect(validate).toEqual(false);

      // [] provided
      validate = CoreValidators.matrix4([]);
      expect(validate).toEqual(false);

      // Matrix3 provided
      validate = CoreValidators.matrix4(new THREE.Matrix3());
      expect(validate).toEqual(false);

      // Vector3 provided
      validate = CoreValidators.matrix4(new THREE.Vector3());
      expect(validate).toEqual(false);
    });

    it('should return true if matrix is valid', function() {
      let validate = CoreValidators.matrix4(new THREE.Matrix4());
      expect(validate).toEqual(true);
    });
  });

  describe('vector3', function() {
    it('should return false if vector is not valid', function() {

      // null provided
      let validate = CoreValidators.vector3(null);
      expect(validate).toEqual(false);

      // undefined provided
      let obj = {};
      validate = CoreValidators.vector3(obj.iamundefined);
      expect(validate).toEqual(false);

      // {} ptovided
      validate = CoreValidators.vector3({});
      expect(validate).toEqual(false);

      // [] provided
      validate = CoreValidators.vector3([]);
      expect(validate).toEqual(false);

      // Vector2 provided
      validate = CoreValidators.vector3(new THREE.Vector2());
      expect(validate).toEqual(false);

      // Vector4 provided
      validate = CoreValidators.vector3(new THREE.Vector4());
      expect(validate).toEqual(false);

      // Matrix4 provided
      validate = CoreValidators.vector3(new THREE.Matrix4());
      expect(validate).toEqual(false);
    });

    it('should return true if vector is valid', function() {
      let validate = CoreValidators.vector3(new THREE.Vector3());
      expect(validate).toEqual(true);
    });
  });

  describe('box', function() {
    it('should return false if box is not valid', function() {

      // null provided
      let validate = CoreValidators.box(null);
      expect(validate).toEqual(false);

      // undefined provided
      let obj = {};
      validate = CoreValidators.box(obj.iamundefined);
      expect(validate).toEqual(false);

      // {} ptovided
      validate = CoreValidators.box({});
      expect(validate).toEqual(false);

      // [] provided
      validate = CoreValidators.box([]);
      expect(validate).toEqual(false);

      // Missing halfDimensions
      validate = CoreValidators.box({center: new THREE.Vector3()});
      expect(validate).toEqual(false);

      // Missing center
      validate = CoreValidators.box({halfDimensions: new THREE.Vector3()});
      expect(validate).toEqual(false);

      // Invalid center
      validate = CoreValidators.box({
        center: new THREE.Vector4(),
        halfDimensions: new THREE.Vector3()
      });
      expect(validate).toEqual(false);

      // Half dimensions must be >= 0
      validate = CoreValidators.box({
        center: new THREE.Vector3(),
        halfDimensions: new THREE.Vector3(-1, 0, 0)
      });
      expect(validate).toEqual(false);
    });

    it('should return true if box is valid', function() {
      let validate = CoreValidators.box({
        center: new THREE.Vector3(),
        halfDimensions: new THREE.Vector3()
      });
      expect(validate).toEqual(true);
    });
  });

  describe('ray', function() {
    it('should return false if ray is not valid', function() {

      // null provided
      let validate = CoreValidators.ray(null);
      expect(validate).toEqual(false);

      // undefined provided
      let obj = {};
      validate = CoreValidators.ray(obj.iamundefined);
      expect(validate).toEqual(false);

      // {} ptovided
      validate = CoreValidators.ray({});
      expect(validate).toEqual(false);

      // [] provided
      validate = CoreValidators.ray([]);
      expect(validate).toEqual(false);

      // Missing direction
      validate = CoreValidators.ray({position: new THREE.Vector3()});
      expect(validate).toEqual(false);

      // Missing position
      validate = CoreValidators.ray({direction: new THREE.Vector3()});
      expect(validate).toEqual(false);

      // Invalid position
      validate = CoreValidators.ray({
        position: new THREE.Vector4(),
        direction: new THREE.Vector3()
      });
      expect(validate).toEqual(false);
    });

    it('should return true if ray is valid', function() {
      let validate = CoreValidators.ray({
        position: new THREE.Vector3(),
        direction: new THREE.Vector3()
      });
      expect(validate).toEqual(true);
    });
  });
});
