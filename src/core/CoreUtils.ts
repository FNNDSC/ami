import THREE from "three"
import { isNull } from 'util';
import Validators from './CoreValidators';

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
   * VJS.Core.Utils.bbox(new THREE.Vector3(), new Matrix4());
   *
   */
  // tslint:disable-next-line:typedef
  public static bbox(center, halfDimensions): {min: THREE.Vector3, max: THREE.Vector3} | false {
    // make sure we have valid inputs
    if (!(Validators.vector3(center) && Validators.vector3(halfDimensions))) {
      window.console.log('Invalid center or plane halfDimensions.');
      return false;
    }

    // make sure half dimensions are >= 0
    if (!(halfDimensions.x >= 0 && halfDimensions.y >= 0 && halfDimensions.z >= 0)) {
      window.console.log('halfDimensions must be >= 0.');
      window.console.log(halfDimensions);
      return false;
    }

    // min/max bound
    const min = center.clone().sub(halfDimensions);
    const max = center.clone().add(halfDimensions);

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
  // tslint:disable-next-line:typedef
  public static minMax(data = []) {
    const minMax = [65535, -32768];
    const numPixels = data.length;

    for (let index = 0; index < numPixels; index++) {
      const spv = data[index];
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
  // tslint:disable-next-line:typedef
  public static isElement(obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrom)
      return obj instanceof HTMLElement;
    } catch (e) {
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have. (works on IE7)
      return (
        typeof obj === 'object' &&
        obj.nodeType === 1 &&
        typeof obj.style === 'object' &&
        typeof obj.ownerDocument === 'object'
      );
    }
  }

  /**
   * Check string
   * @param {String} str
   * @return {Boolean}
   */
  // tslint:disable-next-line:typedef
  public static isString(str) {
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
  // tslint:disable-next-line:typedef
  public static parseUrl(url) {
    const parsedUrl = new URL(url, 'http://fix.me');
    const data = {
      filename: parsedUrl.searchParams.get('filename'),
      extension: '',
      pathname: parsedUrl.pathname,
      query: parsedUrl.search,
    };

    // get file name
    if (!data.filename) {
      data.filename = data.pathname.split('/').pop();
    }

    // find extension
    const splittedName = data.filename.split('.');

    data.extension = splittedName.length > 1 ? splittedName.pop() : 'dicom';

    const skipExt = [
      'asp',
      'aspx',
      'go',
      'gs',
      'hs',
      'jsp',
      'js',
      'php',
      'pl',
      'py',
      'rb',
      'htm',
      'html',
    ];

    if (
      !isNull(data.extension) ||
      skipExt.indexOf(data.extension) !== -1 ||
      (data.query && data.query.includes('contentType=application%2Fdicom'))
    ) {
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
  // tslint:disable-next-line:typedef
  public static ijk2LPS(xCos, yCos, zCos, spacing, origin, registrationMatrix = new THREE.Matrix4()) {
    const ijk2LPS = new THREE.Matrix4();
    ijk2LPS.set(
      xCos.x * spacing.y,
      yCos.x * spacing.x,
      zCos.x * spacing.z,
      origin.x,
      xCos.y * spacing.y,
      yCos.y * spacing.x,
      zCos.y * spacing.z,
      origin.y,
      xCos.z * spacing.y,
      yCos.z * spacing.x,
      zCos.z * spacing.z,
      origin.z,
      0,
      0,
      0,
      1
    );
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
  // tslint:disable-next-line:typedef
  public static aabb2LPS(xCos, yCos, zCos, origin) {
    const aabb2LPS = new THREE.Matrix4();
    aabb2LPS.set(
      xCos.x,
      yCos.x,
      zCos.x,
      origin.x,
      xCos.y,
      yCos.y,
      zCos.y,
      origin.y,
      xCos.z,
      yCos.z,
      zCos.z,
      origin.z,
      0,
      0,
      0,
      1
    );

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
  // tslint:disable-next-line:typedef
  public static worldToData(lps2IJK, worldCoordinates) {
    const dataCoordinate = new THREE.Vector3().copy(worldCoordinates).applyMatrix4(lps2IJK);

    // same rounding in the shaders
    dataCoordinate.addScalar(0.5).floor();

    return dataCoordinate;
  }

  // tslint:disable-next-line:typedef
  public static value(stack, coordinate) {
    window.console.warn('value is deprecated, please use getPixelData instead');
    this.getPixelData(stack, coordinate);
  }

  /**
   * Get voxel value
   *
   * @param {ModelsStack} stack
   * @param {THREE.Vector3} coordinate
   * @return {*}
   */
  // tslint:disable-next-line:typedef
  public static getPixelData(stack, coordinate) {
    if (coordinate.z >= 0 && coordinate.z < stack._frame.length) {
      return stack._frame[coordinate.z].getPixelData(coordinate.x, coordinate.y);
    } else {
      return null;
    }
  }

  /**
   * Set voxel value
   *
   * @param {ModelsStack} stack
   * @param {THREE.Vector3} coordinate
   * @param {Number} value
   * @return {*}
   */
  // tslint:disable-next-line:typedef
  public static setPixelData(stack, coordinate, value) {
    if (coordinate.z >= 0 && coordinate.z < stack._frame.length) {
      stack._frame[coordinate.z].setPixelData(coordinate.x, coordinate.y, value);
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
  // tslint:disable-next-line:typedef
  public static rescaleSlopeIntercept(value, slope, intercept) {
    return value * slope + intercept;
  }

  /**
   *
   * Convenience function to extract center of mass from list of points.
   *
   * @param {Array<THREE.Vector3>} points - Set of points from which we want to extract the center of mass.
   *
   * @returns {THREE.Vector3} Center of mass from given points.
   */
  // tslint:disable-next-line:typedef
  public static centerOfMass(points) {
    const centerOfMass = new THREE.Vector3(0, 0, 0);
    points.forEach(element => {
      centerOfMass.x += element.x;
      centerOfMass.y += element.y;
      centerOfMass.z += element.z;
    });

    centerOfMass.divideScalar(points.length);

    return centerOfMass;
  }

  /**
   *
   * Order 3D planar points around a refence point.
   *
   * @private
   *
   * @param {Array<THREE.Vector3>} points - Set of planar 3D points to be ordered.
   * @param {THREE.Vector3} direction - Direction of the plane in which points and reference are sitting.
   *
   * @returns {Array<Object>} Set of object representing the ordered points.
   */
  // tslint:disable-next-line:typedef
  public static orderIntersections(points, direction) {
    const reference = this.centerOfMass(points);
    // direction from first point to reference
    const referenceDirection = new THREE.Vector3(
      points[0].x - reference.x,
      points[0].y - reference.y,
      points[0].z - reference.z
    ).normalize();

    const base = new THREE.Vector3(0, 0, 0).crossVectors(referenceDirection, direction).normalize();

    const orderedpoints = [];

    // other lines // if inter, return location + angle
    points.forEach(element => {
      const point = {
        position: new THREE.Vector3(element.x, element.y, element.z),
        direction:  new THREE.Vector3(
          element.x - reference.x,
          element.y - reference.y,
          element.z - reference.z
        ).normalize(),
        xy: {
          x: 0,
          y: 0
        },
        angle: 0
      };

      const x = referenceDirection.dot(point.direction);
      const y = base.dot(point.direction);
      point.xy = { x, y };

      const theta = Math.atan2(y, x) * (180 / Math.PI);
      point.angle = theta;

      orderedpoints.push(point); 
    });

    orderedpoints.sort((a, b) => {
      return a.angle - b.angle;
    });

    const noDups = [orderedpoints[0]];
    const epsilon = 0.0001;
    for (let i = 1; i < orderedpoints.length; i++) {
      if (Math.abs(orderedpoints[i - 1].angle - orderedpoints[i].angle) > epsilon) {
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
  // tslint:disable-next-line:typedef
  public static getRoI(mesh, camera, stack) {
    mesh.geometry.computeBoundingBox();

    const bbox = new THREE.Box3().setFromObject(mesh);
    const min = bbox.min.clone().project(camera);
    const max = bbox.max.clone().project(camera);
    const offsetWidth = camera.controls.domElement.offsetWidth;
    const offsetHeight = camera.controls.domElement.offsetHeight;
    const rayCaster = new THREE.Raycaster();
    const values = [];

    min.x = Math.round(((min.x + 1) * offsetWidth) / 2);
    min.y = Math.round(((-min.y + 1) * offsetHeight) / 2);
    max.x = Math.round(((max.x + 1) * offsetWidth) / 2);
    max.y = Math.round(((-max.y + 1) * offsetHeight) / 2);
    [min.x, max.x] = [Math.min(min.x, max.x), Math.max(min.x, max.x)];
    [min.y, max.y] = [Math.min(min.y, max.y), Math.max(min.y, max.y)];

    let intersect = [];
    let value = null;

    for (let x = min.x; x <= max.x; x++) {
      for (let y = min.y; y <= max.y; y++) {
        rayCaster.setFromCamera(
          {
            x: (x / offsetWidth) * 2 - 1,
            y: -(y / offsetHeight) * 2 + 1,
          },
          camera
        );
        intersect = rayCaster.intersectObject(mesh);

        if (intersect.length === 0) {
          continue;
        }

        value = CoreUtils.getPixelData(
          stack,
          CoreUtils.worldToData(stack.lps2IJK, intersect[0].point)
        );

        // the image isn't RGB and coordinates are inside it
        if (value !== null && stack.numberOfChannels === 1) {
          values.push(
            CoreUtils.rescaleSlopeIntercept(value, stack.rescaleSlope, stack.rescaleIntercept)
          );
        }
      }
    }

    if (values.length === 0) {
      return null;
    }

    const avg = values.reduce((sum, val) => sum + val) / values.length;

    return {
      min: values.reduce((prev, val) => (prev < val ? prev : val)),
      max: values.reduce((prev, val) => (prev > val ? prev : val)),
      mean: avg,
      sd: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length),
    };
  }

  /**
   * Calculate shape area (sum of triangle polygons area).
   * May be inaccurate or completely wrong for some shapes.
   *
   * @param {THREE.Geometry} geometry
   *
   * @returns {Number}
   */
  // tslint:disable-next-line:typedef
  public static getGeometryArea(geometry) {
    if (geometry.faces.length < 1) {
      return 0.0;
    }

    let area = 0.0;
    const vertices = geometry.vertices;

    geometry.faces.forEach((elem) => {
      area += new THREE.Triangle(vertices[elem.a], vertices[elem.b], vertices[elem.c]).getArea();
    });

    return area;
  }
}
