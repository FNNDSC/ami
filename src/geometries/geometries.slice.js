/** * Imports ***/
import coreIntersections from '../core/core.intersections';

import {Matrix4, Vector3} from 'three';
/**
 *
 * It is typically used for creating an irregular 3D planar shape given a box and the cut-plane.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#geometry_slice}
 *
 * @module geometries/slice
 *
 * @param {Vector3} halfDimensions - Half-dimensions of the box to be sliced.
 * @param {Vector3} center - Center of the box to be sliced.
 * @param {Vector3<Vector3>} orientation - Orientation of the box to be sliced. (might not be necessary..?)
 * @param {Vector3} position - Position of the cutting plane.
 * @param {Vector3} direction - Cross direction of the cutting plane.
 *
 * @example
 * // Define box to be sliced
 * let halfDimensions = new THREE.Vector(123, 45, 67);
 * let center = new Vector3(0, 0, 0);
 * let orientation = new Vector3(
 *   new Vector3(1, 0, 0),
 *   new Vector3(0, 1, 0),
 *   new Vector3(0, 0, 1)
 * );
 *
 * // Define slice plane
 * let position = center.clone();
 * let direction = new Vector3(-0.2, 0.5, 0.3);
 *
 * // Create the slice geometry & materials
 * let sliceGeometry = new VJS.geometries.slice(halfDimensions, center, orientation, position, direction);
 * let sliceMaterial = new THREE.MeshBasicMaterial({
 *   'side': THREE.DoubleSide,
 *   'color': 0xFF5722
 * });
 *
 *  // Create mesh and add it to the scene
 *  let slice = new THREE.Mesh(sliceGeometry, sliceMaterial);
 *  scene.add(slice);
 */

export default class GeometriesSlice extends THREE.ShapeGeometry {
  constructor(halfDimensions, center, position, direction, toAABB = new Matrix4()) {
    //
    // prepare data for the shape!
    //
    let aabb = {
      halfDimensions,
      center,
      toAABB,
    };

    let plane = {
      position,
      direction,
    };

    // BOOM!
    let intersections = coreIntersections.aabbPlane(aabb, plane);

    // can not exist before calling the constructor
    if (intersections.length < 3) {
      window.console.log('WARNING: Less than 3 intersections between AABB and Plane.');
      window.console.log('AABB');
      window.console.log(aabb);
      window.console.log('Plane');
      window.console.log(plane);
      window.console.log('exiting...');
      const err = new Error('geometries.slice has less than 3 intersections, can not create a valid geometry.');
      throw err;
    }

    let orderedIntersections = GeometriesSlice.orderIntersections(intersections, direction);
    let sliceShape = GeometriesSlice.shape(orderedIntersections);

    //
    // Generate Geometry from shape
    // It does triangulation for us!
    //
    super(sliceShape);
    this.type = 'SliceGeometry';

    // update real position of each vertex! (not in 2d)
    this.vertices = orderedIntersections;
    this.verticesNeedUpdate = true;
  }

  static shape(points) {
    //
    // Create Shape
    //
    let shape = new THREE.Shape();
    // move to first point!
    shape.moveTo(points[0].xy.x, points[0].xy.y);

    // loop through all points!
    for (let l = 1; l < points.length; l++) {
      // project each on plane!
      shape.lineTo(points[l].xy.x, points[l].xy.y);
    }

    // close the shape!
    shape.lineTo(points[0].xy.x, points[0].xy.y);
    return shape;
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

    let area = 0.0,
        vertices = geometry.vertices;

    geometry.faces.forEach(function(elem) {
      area += new THREE.Triangle(vertices[elem.a], vertices[elem.b], vertices[elem.c]).area();
    });

    return area;
  }

 /**
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
    let reference = GeometriesSlice.centerOfMass(points);
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
}
