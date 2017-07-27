const URL = require('url');
import Validators from './core.validators';

/**
 * General purpose functions.
 *
 * @module core/utils
 */
export default class CoreUtils {

  /**
   * Generate a bouding box object.
   * @param {THREE.Vector3} center - Center of the box.
   * @param {THREE.Vector3} halfDimensions - Half Dimensions of the box.
   * @return {Object} The bounding box object. {Object.min} is a {THREE.Vector3}
   * containing the min bounds. {Object.max} is a {THREE.Vector3} containing the
   * max bounds.
   * @return {boolean} False input NOT valid.
   * @example
   * // Returns
   * //{ min: { x : 0, y : 0,  z : 0 },
   * //  max: { x : 2, y : 4,  z : 6 }
   * //}
   * VJS.Core.Utils.bbox(
   *   new THREE.Vector3(1, 2, 3), new THREE.Vector3(1, 2, 3));
   *
   * //Returns false
   * VJS.Core.Utils.bbox(new THREE.Vector3(), new THREE.Matrix4());
   *
   */
  static bbox(center, halfDimensions) {
    // make sure we have valid inputs
    if (!(Validators.vector3(center) &&
      Validators.vector3(halfDimensions))) {
      window.console.log('Invalid center or plane halfDimensions.');
      return false;
    }

    // make sure half dimensions are >= 0
    if (!(halfDimensions.x >= 0 &&
      halfDimensions.y >= 0 &&
      halfDimensions.z >= 0)) {
      window.console.log('halfDimensions must be >= 0.');
      window.console.log(halfDimensions);
      return false;
    }

    // min/max bound
    let min = center.clone().sub(halfDimensions);
    let max = center.clone().add(halfDimensions);

    return {
      min,
      max,
    };
  }

  /**
   * Find min/max values in an array
   * @param {Array} data
   * @return {Array}
   */
  static minMax(data = []) {
    let minMax = [65535, -32768];
    let numPixels = data.length;

    for (let index = 0; index < numPixels; index++) {
      let spv = data[index];
      minMax[0] = Math.min(minMax[0], spv);
      minMax[1] = Math.max(minMax[1], spv);
    }

    return minMax;
  }

  /**
   * Check HTMLElement
   * @param {HTMLElement} obj
   * @return {boolean}
   */
  static isElement(obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrom)
      return obj instanceof HTMLElement;
    } catch (e) {
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have. (works on IE7)
      return (typeof obj === 'object') &&
        (obj.nodeType === 1) && (typeof obj.style === 'object') &&
        (typeof obj.ownerDocument === 'object');
    }
  }

  /**
   * Check string
   * @param {String} str
   * @return {Boolean}
   */
  static isString(str) {
    return typeof str === 'string' || str instanceof String;
  }

  /**
   * Parse url
   * @param {*} url
   * @return {Object}
   */
  static parseUrl(url) {
    //
    const data = {};
    data.filename = '';
    data.extension = '';
    data.pathname = '';
    data.query = '';

    let parsedUrl = URL.parse(url);
    data.pathname = parsedUrl.pathname;
    data.query = parsedUrl.query;

    // get file name
    data.filename = data.pathname.split('/').pop();

    // find extension
    let splittedName = data.filename.split('.');
    if (splittedName.length <= 1) {
      data.extension = 'dicom';
    } else {
      data.extension = data.filename.split('.').pop();
    }

    if (!isNaN(data.extension)) {
      data.extension = 'dicom';
    }

    if (data.query &&
      data.query.includes('contentType=application%2Fdicom')) {
      data.extension = 'dicom';
    }

    return data;
  }

  /**
   * Compute IJK to LPS tranform.
   *
   * @param {*} xCos
   * @param {*} yCos
   * @param {*} zCos
   * @param {*} spacing
   * @param {*} origin
   * @param {*} registrationMatrix
   *
   * @return {*}
   */
  static ijk2LPS(
    xCos, yCos, zCos,
    spacing, origin,
    registrationMatrix = new THREE.Matrix4()) {
    const ijk2LPS = new THREE.Matrix4();
    ijk2LPS.set(
      xCos.x * spacing.y, yCos.x * spacing.x, zCos.x * spacing.z, origin.x,
      xCos.y * spacing.y, yCos.y * spacing.x, zCos.y * spacing.z, origin.y,
      xCos.z * spacing.y, yCos.z * spacing.x, zCos.z * spacing.z, origin.z,
      0, 0, 0, 1);
    ijk2LPS.premultiply(registrationMatrix);

    return ijk2LPS;
  }

  /**
   * Compute AABB to LPS transform.
   * AABB: Axe Aligned Bounding Box.
   *
   * @param {*} xCos
   * @param {*} yCos
   * @param {*} zCos
   * @param {*} origin
   *
   * @return {*}
   */
  static aabb2LPS(
    xCos, yCos, zCos,
    origin) {
    const aabb2LPS = new THREE.Matrix4();
    aabb2LPS.set(
        xCos.x, yCos.x, zCos.x, origin.x,
        xCos.y, yCos.y, zCos.y, origin.y,
        xCos.z, yCos.z, zCos.z, origin.z,
        0, 0, 0, 1);

    return aabb2LPS;
  }

  /**
   * Transform coordinates from world coordinate to data
   *
   * @param {*} lps2IJK
   * @param {*} worldCoordinates
   *
   * @return {*}
   */
    static worldToData(lps2IJK, worldCoordinates) {
    let dataCoordinate = new THREE.Vector3()
      .copy(worldCoordinates)
      .applyMatrix4(lps2IJK);

    // same rounding in the shaders
    dataCoordinate.addScalar(0.5).floor();

    return dataCoordinate;
  }

  /**
   * Get voxel value
   *
   * @param {*} stack
   * @param {*} coordinate
   *
   * @return {*}
   */
  static value(stack, coordinate) {
    if (coordinate.z >= 0 &&
        coordinate.z < stack._frame.length) {
      return stack._frame[coordinate.z].
        value(coordinate.x, coordinate.y);
    } else {
      return null;
    }
  }

  /**
   * Apply slope/intercept to a value
   *
   * @param {*} value
   * @param {*} slope
   * @param {*} intercept
   *
   * @return {*}
   */
  static rescaleSlopeIntercept(value, slope, intercept) {
    return value * slope + intercept;
  }

}
