import CoreUtils from './core.utils';
import Validators from './core.validators';

import {Matrix4, Vector3} from 'three';

/**
 * Compute/test intersection between different objects.
 *
 * @module core/intersections
 */

export default class Intersections {
/**
 * Compute intersection between oriented bounding box and a plane.
 *
 * Returns intersection in plane's space.
 *
 * Should return at least 3 intersections. If not, the plane and the box do not
 * intersect.
 *
 * @param {Object} aabb - Axe Aligned Bounding Box representation.
 * @param {Vector3} aabb.halfDimensions - Half dimensions of the box.
 * @param {Vector3} aabb.center - Center of the box.
 * @param {Matrix4} aabb.toAABB - Transform to go from plane space to box space.
 * @param {Object} plane - Plane representation
 * @param {Vector3} plane.position - position of normal which describes the plane.
 * @param {Vector3} plane.direction - Direction of normal which describes the plane.
 *
 * @returns {Array<Vector3>} List of all intersections in plane's space.
 * @returns {boolean} false is invalid input provided.
 *
 * @example
 * //Returns array with intersection N intersections
 * let aabb = {
 *   center: new Vector3(150, 150, 150),
 *   halfDimensions: new Vector3(50, 60, 70),
 *   toAABB: new Matrix4()
 * }
 * let plane = {
 *   position: new Vector3(110, 120, 130),
 *   direction: new Vector3(1, 0, 0)
 * }
 *
 * let intersections = CoreIntersections.aabbPlane(aabb, plane);
 * // intersections ==
 * //[ { x : 110, y : 90,  z : 80 },
 * //  { x : 110, y : 210, z : 220 },
 * //  { x : 110, y : 210, z : 80 },
 * //  { x : 110, y : 90,  z : 220 } ]
 *
 * //Returns empty array with 0 intersections
 * let aabb = {
 *
 * }
 * let plane = {
 *
 * }
 *
 * let intersections = VJS.Core.Validators.matrix4(new Vector3());
 *
 * //Returns false if invalid input?
 *
 */
  static aabbPlane(aabb, plane) {
    //
    // obb = { halfDimensions, orientation, center, toAABB }
    // plane = { position, direction }
    //
    //
    // LOGIC:
    //
    // Test intersection of each edge of the Oriented Bounding Box with the Plane
    //
    // ALL EDGES
    //
    //      .+-------+
    //    .' |     .'|
    //   +---+---+'  |
    //   |   |   |   |
    //   |  ,+---+---+
    //   |.'     | .'
    //   +-------+'
    //
    // SPACE ORIENTATION
    //
    //       +
    //     j |
    //       |
    //       |   i
    //   k  ,+-------+
    //    .'
    //   +
    //
    //
    // 1- Move Plane position and orientation in IJK space
    // 2- Test Edges/ IJK Plane intersections
    // 3- Return intersection Edge/ IJK Plane if it touches the Oriented BBox

    let intersections = [];

    if (!(this.validateAabb(aabb) &&
       this.validatePlane(plane))) {
      window.console.log('Invalid aabb or plane provided.');
      return false;
    }

    // invert space matrix
    let fromAABB = new Matrix4();
    fromAABB.getInverse(aabb.toAABB);

    let t1 = plane.direction.clone().applyMatrix4(aabb.toAABB);
    let t0 = new Vector3(0, 0, 0).applyMatrix4(aabb.toAABB);

    let planeAABB = this.posdir(
      plane.position.clone().applyMatrix4(aabb.toAABB),
      new Vector3(t1.x - t0.x, t1.y - t0.y, t1.z - t0.z).normalize()
    );

    let bbox = CoreUtils.bbox(aabb.center, aabb.halfDimensions);

    let orientation = new Vector3(
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 1));

    // 12 edges (i.e. ray)/plane intersection tests
    // RAYS STARTING FROM THE FIRST CORNER (0, 0, 0)
    //
    //       +
    //       |
    //       |
    //       |
    //      ,+---+---+
    //    .'
    //   +

    let ray = this.posdir(
      new Vector3(
        aabb.center.x - aabb.halfDimensions.x,
        aabb.center.y - aabb.halfDimensions.y,
        aabb.center.z - aabb.halfDimensions.z),
      orientation.x
    );
    this.rayPlaneInBBox(ray, planeAABB, bbox, intersections);

    ray.direction = orientation.y;
    this.rayPlaneInBBox(ray, planeAABB, bbox, intersections);

    ray.direction = orientation.z;
    this.rayPlaneInBBox(ray, planeAABB, bbox, intersections);

    // RAYS STARTING FROM THE LAST CORNER
    //
    //               +
    //             .'
    //   +-------+'
    //           |
    //           |
    //           |
    //           +
    //

    let ray2 = this.posdir(
      new Vector3(
        aabb.center.x + aabb.halfDimensions.x,
        aabb.center.y + aabb.halfDimensions.y,
        aabb.center.z + aabb.halfDimensions.z),
      orientation.x
    );
    this.rayPlaneInBBox(ray2, planeAABB, bbox, intersections);

    ray2.direction = orientation.y;
    this.rayPlaneInBBox(ray2, planeAABB, bbox, intersections);

    ray2.direction = orientation.z;
    this.rayPlaneInBBox(ray2, planeAABB, bbox, intersections);

    // RAYS STARTING FROM THE SECOND CORNER
    //
    //               +
    //               |
    //               |
    //               |
    //               +
    //             .'
    //           +'

    let ray3 = this.posdir(
      new Vector3(
        aabb.center.x + aabb.halfDimensions.x,
        aabb.center.y - aabb.halfDimensions.y,
        aabb.center.z - aabb.halfDimensions.z),
      orientation.y
    );
    this.rayPlaneInBBox(ray3, planeAABB, bbox, intersections);

    ray3.direction = orientation.z;
    this.rayPlaneInBBox(ray3, planeAABB, bbox, intersections);

    // RAYS STARTING FROM THE THIRD CORNER
    //
    //      .+-------+
    //    .'
    //   +
    //
    //
    //
    //

    let ray4 = this.posdir(
      new Vector3(
        aabb.center.x - aabb.halfDimensions.x,
        aabb.center.y + aabb.halfDimensions.y,
        aabb.center.z - aabb.halfDimensions.z),
      orientation.x
    );
    this.rayPlaneInBBox(ray4, planeAABB, bbox, intersections);

    ray4.direction = orientation.z;
    this.rayPlaneInBBox(ray4, planeAABB, bbox, intersections);

    // RAYS STARTING FROM THE FOURTH CORNER
    //
    //
    //
    //   +
    //   |
    //   |
    //   |
    //   +-------+

    let ray5 = this.posdir(
      new Vector3(
        aabb.center.x - aabb.halfDimensions.x,
        aabb.center.y - aabb.halfDimensions.y,
        aabb.center.z + aabb.halfDimensions.z),
      orientation.x
    );
    this.rayPlaneInBBox(ray5, planeAABB, bbox, intersections);

    ray5.direction = orientation.y;
    this.rayPlaneInBBox(ray5, planeAABB, bbox, intersections);

    // @todo make sure objects are unique...

    // back to original space
    intersections.map(
      function(element) {
        return element.applyMatrix4(fromAABB);
      }
    );

    return intersections;
  }

/**
 * Compute intersection between a ray and a plane.
 *
 * @memberOf this
 * @public
 *
 * @param {Object} ray - Ray representation.
 * @param {Vector3} ray.position - position of normal which describes the ray.
 * @param {Vector3} ray.direction - Direction of normal which describes the ray.
 * @param {Object} plane - Plane representation
 * @param {Vector3} plane.position - position of normal which describes the plane.
 * @param {Vector3} plane.direction - Direction of normal which describes the plane.
 *
 * @returns {Vector3|null} Intersection between ray and plane or null.
 */
  static rayPlane(ray, plane) {
  // ray: {position, direction}
  // plane: {position, direction}

  if (ray.direction.dot(plane.direction) !== 0) {
    //
    // not parallel, move forward
    //
    // LOGIC:
    //
    // Ray equation: P = P0 + tV
    // P = <Px, Py, Pz>
    // P0 = <ray.position.x, ray.position.y, ray.position.z>
    // V = <ray.direction.x, ray.direction.y, ray.direction.z>
    //
    // Therefore:
    // Px = ray.position.x + t*ray.direction.x
    // Py = ray.position.y + t*ray.direction.y
    // Pz = ray.position.z + t*ray.direction.z
    //
    //
    //
    // Plane equation: ax + by + cz + d = 0
    // a = plane.direction.x
    // b = plane.direction.y
    // c = plane.direction.z
    // d = -( plane.direction.x*plane.position.x +
    //        plane.direction.y*plane.position.y +
    //        plane.direction.z*plane.position.z )
    //
    //
    // 1- in the plane equation, we replace x, y and z by Px, Py and Pz
    // 2- find t
    // 3- replace t in Px, Py and Pz to get the coordinate of the intersection
    //
    let t = (plane.direction.x * (plane.position.x - ray.position.x) + plane.direction.y * (plane.position.y - ray.position.y) + plane.direction.z * (plane.position.z - ray.position.z)) /
        (plane.direction.x * ray.direction.x + plane.direction.y * ray.direction.y + plane.direction.z * ray.direction.z);

    let intersection = new Vector3(
        ray.position.x + t * ray.direction.x,
        ray.position.y + t * ray.direction.y,
        ray.position.z + t * ray.direction.z);

    return intersection;
  }

  return null;
}

  /**
   * Compute intersection between a ray and a box
   * @param {Object} ray
   * @param {Object} box
   * @return {Array}
   */
  static rayBox(ray, box) {
    // should also do the space transforms here
    // ray: {position, direction}
    // box: {halfDimensions, center}

    let intersections = [];

    let bbox = CoreUtils.bbox(box.center, box.halfDimensions);

    // window.console.log(bbox);

    // X min
    let plane = this.posdir(
      new Vector3(
        bbox.min.x,
        box.center.y,
        box.center.z),
      new Vector3(-1, 0, 0)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    // X max
    plane = this.posdir(
      new Vector3(
        bbox.max.x,
        box.center.y,
        box.center.z),
      new Vector3(1, 0, 0)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    // Y min
    plane = this.posdir(
      new Vector3(
        box.center.x,
        bbox.min.y,
        box.center.z),
      new Vector3(0, -1, 0)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    // Y max
    plane = this.posdir(
      new Vector3(
        box.center.x,
        bbox.max.y,
        box.center.z),
      new Vector3(0, 1, 0)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    // Z min
    plane = this.posdir(
      new Vector3(
        box.center.x,
        box.center.y,
        bbox.min.z),
      new Vector3(0, 0, -1)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    // Z max
    plane = this.posdir(
      new Vector3(
        box.center.x,
        box.center.y,
        bbox.max.z),
      new Vector3(0, 0, 1)
    );
    this.rayPlaneInBBox(ray, plane, bbox, intersections);

    return intersections;
  }

  /**
   * Intersection between ray and a plane that are in a box.
   * @param {*} ray
   * @param {*} planeAABB
   * @param {*} bbox
   * @param {*} intersections
   */
  static rayPlaneInBBox(ray, planeAABB, bbox, intersections) {
    let intersection = this.rayPlane(ray, planeAABB);
    // window.console.log(intersection);
    if (intersection && this.inBBox(intersection, bbox)) {
      if (!intersections.find(this.findIntersection(intersection))) {
        intersections.push(intersection);
      }
    }
  }

  /**
   * Find intersection in array
   * @param {*} myintersection
   */
  static findIntersection(myintersection) {
    return function found(element, index, array) {
      if (myintersection.x === element.x &&
        myintersection.y === element.y &&
        myintersection.z === element.z) {
        return true;
      }

      return false;
    };
  }

  /**
   * Is point in box.
   * @param {Object} point
   * @param {Object} bbox
   * @return {Boolean}
   */
  static inBBox(point, bbox) {
    //
    let epsilon = 0.0001;
    if (point &&
        point.x >= bbox.min.x - epsilon &&
        point.y >= bbox.min.y - epsilon &&
        point.z >= bbox.min.z - epsilon &&
        point.x <= bbox.max.x + epsilon &&
        point.y <= bbox.max.y + epsilon &&
        point.z <= bbox.max.z + epsilon) {
      return true;
    }
    return false;
  }

  static posdir(position, direction) {
    return {position, direction};
  }

  static validatePlane(plane) {
    //
    if (plane === null) {
      window.console.log('Invalid plane.');
      window.console.log(plane);

      return false;
    }

    if (!Validators.vector3(plane.position)) {
      window.console.log('Invalid plane.position.');
      window.console.log(plane.position);

      return false;
    }

    if (!Validators.vector3(plane.direction)) {
      window.console.log('Invalid plane.direction.');
      window.console.log(plane.direction);

      return false;
    }

    return true;
  }

  static validateAabb(aabb) {
    //
    if (aabb === null) {
      window.console.log('Invalid aabb.');
      window.console.log(aabb);
      return false;
    }

    if (!Validators.matrix4(aabb.toAABB)) {
      window.console.log('Invalid aabb.toAABB: ');
      window.console.log(aabb.toAABB);

      return false;
    }

    if (!Validators.vector3(aabb.center)) {
      window.console.log('Invalid aabb.center.');
      window.console.log(aabb.center);

      return false;
    }

    if (!(Validators.vector3(aabb.halfDimensions) &&
       aabb.halfDimensions.x >= 0 &&
       aabb.halfDimensions.y >= 0 &&
       aabb.halfDimensions.z >= 0)) {
      window.console.log('Invalid aabb.halfDimensions.');
      window.console.log(aabb.halfDimensions);

      return false;
    }

    return true;
  }
}
