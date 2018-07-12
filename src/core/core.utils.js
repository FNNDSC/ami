import Validators from './core.validators';

import {Box3, Matrix4, Raycaster, Triangle, Vector3} from 'three';

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

    let parsedUrl = new URL(url);

    data.pathname = parsedUrl.pathname;
    data.query = parsedUrl.search;
    data.filename = parsedUrl.searchParams.get('filename');

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

  static value(stack, coordinate) {
    window.console.warn('value is deprecated, please use getPixelData instead');
    this.getPixelData(stack, coordinate);
  }

  /**
   * Get voxel value
   *
   * @param {ModelsStack} stack
   * @param {Vector3} coordinate
   * @return {*}
   */
  static getPixelData(stack, coordinate) {
    if (coordinate.z >= 0 &&
        coordinate.z < stack._frame.length) {
      return stack._frame[coordinate.z].
        getPixelData(coordinate.x, coordinate.y);
    } else {
      return null;
    }
  }

  /**
   * Set voxel value
   *
   * @param {ModelsStack} stack
   * @param {Vector3} coordinate
   * @param {Number} value
   * @return {*}
   */
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
  * 
  *
  * Convenience function to extract center of mass from list of points.
  *
  * @private
  *
  * @param {Array<Vector3>} points - Set of points from which we want to extract the center of mass.
  *
  * @returns {Vector3} Center of mass from given points.
  */
  static centerOfMass(points) {
    let centerOfMass = new Vector3(0, 0, 0);
    for (let i = 0; i < points.length; i++) {
      centerOfMass.x += points[i].x;
      centerOfMass.y += points[i].y;
      centerOfMass.z += points[i].z;
    }
    centerOfMass.divideScalar(points.length);

    return centerOfMass;
  }

  /**
  *
  * Order 3D planar points around a refence point.
  *
  * @private
  *
  * @param {Array<Vector3>} points - Set of planar 3D points to be ordered.
  * @param {Vector3} direction - Direction of the plane in which points and reference are sitting.
  *
  * @returns {Array<Object>} Set of object representing the ordered points.
  */
  static orderIntersections(points, direction) {
    let reference = this.centerOfMass(points);
    // direction from first point to reference
    let referenceDirection = new Vector3(
      points[0].x - reference.x,
      points[0].y - reference.y,
      points[0].z - reference.z
      ).normalize();

    let base = new Vector3(0, 0, 0)
        .crossVectors(referenceDirection, direction)
        .normalize();

    let orderedpoints = [];

    // other lines // if inter, return location + angle
    for (let j = 0; j < points.length; j++) {
      let point = new Vector3(
        points[j].x,
        points[j].y,
        points[j].z);
      point.direction = new Vector3(
        points[j].x - reference.x,
        points[j].y - reference.y,
        points[j].z - reference.z).normalize();

      let x = referenceDirection.dot(point.direction);
      let y = base.dot(point.direction);
      point.xy = {x, y};

      let theta = Math.atan2(y, x) * (180 / Math.PI);
      point.angle = theta;

      orderedpoints.push(point);
    }

    orderedpoints.sort(function(a, b) {
      return a.angle - b.angle;
    });

    let noDups = [orderedpoints[0]];
    let epsilon = 0.0001;
    for (let i=1; i<orderedpoints.length; i++) {
      if (Math.abs(orderedpoints[i-1].angle - orderedpoints[i].angle) > epsilon) {
        noDups.push(orderedpoints[i]);
      }
    }

    return noDups;
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

    const bbox = new Box3().setFromObject(mesh);
    const min = bbox.min.clone().project(camera);
    const max = bbox.max.clone().project(camera);
    const offsetWidth = camera.controls.domElement.offsetWidth;
    const offsetHeight = camera.controls.domElement.offsetHeight;
    const rayCaster = new Raycaster();
    const values = [];

    min.x = Math.round((min.x + 1) * offsetWidth / 2);
    min.y = Math.round((-min.y + 1) * offsetHeight / 2);
    max.x = Math.round((max.x + 1) * offsetWidth / 2);
    max.y = Math.round((-max.y + 1) * offsetHeight / 2);
    [min.x, max.x] = [Math.min(min.x, max.x), Math.max(min.x, max.x)];
    [min.y, max.y] = [Math.min(min.y, max.y), Math.max(min.y, max.y)];

    let intersect = [];
    let value = null;

    for (let x = min.x; x <= max.x; x++) {
      for (let y = min.y; y <= max.y; y++) {
        rayCaster.setFromCamera({
          x: (x / offsetWidth) * 2 - 1,
          y: -(y / offsetHeight) * 2 + 1,
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
      sd: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length),
    };
  }

  /**
   * Calculate shape area (sum of triangle polygons area).
   *
   * @param {THREE.Geometry} geometry
   *
   * @returns {Number}
   */
  static getGeometryArea(geometry) {
    if (geometry.faces.length < 1) {
      return 0.0;
    }

    let area = 0.0;
    let vertices = geometry.vertices;

    geometry.faces.forEach(function(elem) {
      area += new Triangle(vertices[elem.a], vertices[elem.b], vertices[elem.c]).getArea();
    });

    return area;
  }
}
