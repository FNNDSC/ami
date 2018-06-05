const URL = require('url');
import Validators from './core.validators';

import {Matrix4, Vector3} from 'three';

/**
 * General purpose functions.
 *
 * @module core/utils
 */
export default class CoreUtils {
  /**
   * Generate a bouding box object.
   * @param {Vector3} center - Center of the box.
   * @param {Vector3} halfDimensions - Half Dimensions of the box.
   * @return {Object} The bounding box object. {Object.min} is a {Vector3}
   * containing the min bounds. {Object.max} is a {Vector3} containing the
   * max bounds.
   * @return {boolean} False input NOT valid.
   * @example
   * // Returns
   * //{ min: { x : 0, y : 0,  z : 0 },
   * //  max: { x : 2, y : 4,  z : 6 }
   * //}
   * VJS.Core.Utils.bbox(
   *   new Vector3(1, 2, 3), new Vector3(1, 2, 3));
   *
   * //Returns false
   * VJS.Core.Utils.bbox(new Vector3(), new Matrix4());
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
   * Parse url and find out the extension of the exam file.
   *
   * @param {*} url - The url to be parsed.
   * The query string can contain some "special" parameters that can be used to ease the parsing process
   * when the url doesn't match the exam file name on the filesystem:
   * - filename: the name of the exam file
   * - contentType: the mime type of the exam file. Currently only "application/dicom" is recognized, nifti files don't have a standard mime type.
   * For  example:
   * http://<hostname>/getExam?id=100&filename=myexam%2Enii%2Egz
   * http://<hostname>/getExam?id=100&contentType=application%2Fdicom
   *
   * @return {Object}
   */
  static parseUrl(url) {
    const data = {};
    data.filename = '';
    data.extension = '';
    data.pathname = '';
    data.query = '';

    let parsedUrl = URL.parse(url);

    data.pathname = parsedUrl.pathname;
    data.query = parsedUrl.query;

    if (data.query) {
      // Find "filename" parameter value, if present
      data.filename = data.query.split('&').reduce((acc, fieldval) => {
        let fvPair = fieldval.split('=');
        if (fvPair.length > 0 && fvPair[0] == 'filename') {
            acc = fvPair[1];
        }
        return acc;
      });
    }

    // get file name
    if (!data.filename) {
      data.filename = data.pathname.split('/').pop();
    }


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
   *  http://nipy.org/nibabel/dicom/dicom_orientation.html
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
    registrationMatrix = new Matrix4()) {
    const ijk2LPS = new Matrix4();
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
    const aabb2LPS = new Matrix4();
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
    let dataCoordinate = new Vector3()
      .copy(worldCoordinates)
      .applyMatrix4(lps2IJK);

    // same rounding in the shaders
    dataCoordinate.addScalar(0.5).floor();

    return dataCoordinate;
  }

  /**
   * Get and set voxel value
   *
   * @param {*} stack
   * @param {*} coordinate
   * @param {*} value
   * @return {*}
   */
  static value(stack, coordinate) {
    window.console.warn('value is deprecated, please use getPixelData instead');
    this.getPixelData(stack, coordinate);
  }

  static getPixelData(stack, coordinate) {
    if (coordinate.z >= 0 &&
        coordinate.z < stack._frame.length) {
      return stack._frame[coordinate.z].
        getPixelData(coordinate.x, coordinate.y);
    } else {
      return null;
    }
  }

  static setPixelData(stack, coordinate, value) {
    if (coordinate.z >= 0 &&
        coordinate.z < stack._frame.length) {
      stack._frame[coordinate.z].
        setPixelData(coordinate.x, coordinate.y, value);
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

  /**
   * Get min, max, mean and sd of voxel values behind the mesh
   *
   * @param {THREE.Mesh}  mesh    Region of Interest
   * @param {*}           camera  Tested on CamerasOrthographic
   * @param {ModelsStack} stack
   *
   * @return {Object|null}
   */
  static getRoI(mesh, camera, stack) {
    mesh.geometry.computeBoundingBox();

    const min = mesh.geometry.boundingBox.min.clone().project(camera),
      max = mesh.geometry.boundingBox.max.clone().project(camera),
      offsetWidth = camera.controls.domElement.offsetWidth,
      offsetHeight = camera.controls.domElement.offsetHeight,
      rayCaster = new THREE.Raycaster(),
      values = [];

    min.x = Math.round((min.x + 1) * offsetWidth / 2);
    min.y = Math.round((-min.y + 1) * offsetHeight / 2);
    max.x = Math.round((max.x + 1) * offsetWidth / 2);
    max.y = Math.round((-max.y + 1) * offsetHeight / 2);
    [min.x, max.x] = [Math.min(min.x, max.x), Math.max(min.x, max.x)];
    [min.y, max.y] = [Math.min(min.y, max.y), Math.max(min.y, max.y)];

    let intersect = [],
      value = null;

    for (let x = min.x; x <= max.x; x++) {
      for (let y = min.y; y <= max.y; y++) {
        rayCaster.setFromCamera({
          x: (x / offsetWidth) * 2 - 1,
          y: -(y / offsetHeight) * 2 + 1
        }, camera);
        intersect = rayCaster.intersectObject(mesh);

        if (intersect.length === 0) {
          continue;
        }

        value = CoreUtils.getPixelData(stack, CoreUtils.worldToData(stack.lps2IJK, intersect[0].point));

        // the image isn't RGB and coordinates are inside it
        if (value !== null && stack.numberOfChannels === 1) {
          values.push(CoreUtils.rescaleSlopeIntercept(value, stack.rescaleSlope, stack.rescaleIntercept));
        }
      }
    }

    if (values.length === 0) {
      return null;
    }

    const avg = values.reduce((sum, val) => sum + val) / values.length;

    return {
      min: values.reduce((prev, val) => prev < val ? prev : val),
      max: values.reduce((prev, val) => prev > val ? prev : val),
      mean: avg,
      sd: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2)) / values.length)
    }
  }
}
