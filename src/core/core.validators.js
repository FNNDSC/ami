/**
 * Validate basic structures.
 *
 * @example
 * //Returns true
 * VJS.Core.Validators.matrix4(new THREE.Matrix4());
 *
 * //Returns false
 * VJS.Core.Validators.matrix4(new THREE.Vector3());
 *
 * @module core/validators
 */

export default class Validators {
  /**
   * Validates a matrix as a THREEJS.Matrix4
   * link
   * @param {Object} objectToTest - The object to be tested.
   * @return {boolean} True if valid Matrix4, false if NOT.
   */
  static matrix4(objectToTest) {
    if (!(objectToTest !== null &&
       typeof objectToTest !== 'undefined' &&
       objectToTest.hasOwnProperty('elements') &&
       objectToTest.elements.length === 16 &&
       typeof objectToTest.identity === 'function'&&
       typeof objectToTest.copy === 'function' &&
       typeof objectToTest.determinant === 'function')) {
      return false;
    }

    return true;
  }

  /**
  * Validates a vector as a THREEJS.Vector3
  * @param {Object} objectToTest - The object to be tested.
  * @return {boolean} True if valid Vector3, false if NOT.
  */
  static vector3(objectToTest) {
    if (!(objectToTest !== null &&
       typeof objectToTest !== 'undefined' &&
       objectToTest.hasOwnProperty('x') &&
       objectToTest.hasOwnProperty('y') &&
       objectToTest.hasOwnProperty('z') &&
       !objectToTest.hasOwnProperty('w'))) {
      return false;
    }

    return true;
  }

 /**
  * Validates a box.
  *
  * @example
  * // a box is defined as
  * let box = {
  *   center: THREE.Vector3,
  *   halfDimensions: THREE.Vector3
  * }
  *
  * @param {Object} objectToTest - The object to be tested.
  * @return {boolean} True if valid box, false if NOT.
  */
  static box(objectToTest) {
    if (!(objectToTest !== null &&
       typeof objectToTest !== 'undefined' &&
       objectToTest.hasOwnProperty('center') &&
       this.vector3(objectToTest.center) &&
       objectToTest.hasOwnProperty('halfDimensions') &&
       this.vector3(objectToTest.halfDimensions) &&
       objectToTest.halfDimensions.x >= 0 &&
       objectToTest.halfDimensions.y >= 0 &&
       objectToTest.halfDimensions.z >= 0)) {
      return false;
    }

    return true;
  }

 /**
  * Validates a ray.
  *
  * @example
  * // a ray is defined as
  * let ray = {
  *   postion: THREE.Vector3,
  *   direction: THREE.Vector3
  * }
  *
  * @param {Object} objectToTest - The object to be tested.
  * @return {boolean} True if valid ray, false if NOT.
  */
  static ray(objectToTest) {
    if (!(objectToTest !== null &&
       typeof objectToTest !== 'undefined' &&
       objectToTest.hasOwnProperty('position') &&
       this.vector3(objectToTest.position) &&
       objectToTest.hasOwnProperty('direction') &&
       this.vector3(objectToTest.direction))) {
      return false;
    }

    return true;
  }
}
