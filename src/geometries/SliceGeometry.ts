/** * Imports ***/
import {CoreIntersections, CoreUtils} from '../core'

const THREE = (window as any).THREE;
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
 export default class SliceGeometry extends THREE.ShapeBufferGeometry {
   constructor(halfDimensions, center, position, direction, toAABB = new THREE.Matrix4()) {
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
      let intersections = CoreIntersections.aabbPlane(aabb, plane);

      // can not exist before calling the constructor
      if (intersections && intersections.length < 3) {
        window.console.log('WARNING: Less than 3 intersections between AABB and Plane.');
        window.console.log('AABB');
        window.console.log(aabb);
        window.console.log('Plane');
        window.console.log(plane);
        window.console.log('exiting...');
        const err = new Error(
          'geometries.slice has less than 3 intersections, can not create a valid geometry.'
        );
        throw err;
      }

      let points = CoreUtils.orderIntersections(intersections, direction);

      // create the shape
      let shape = new THREE.Shape();
      // move to first point!
      shape.moveTo(points[0].xy.x, points[0].xy.y);

      // loop through all points!
      const positions = new Float32Array(points.length * 3);
      positions.set(points[0].position.toArray(), 0);

      for (let i = 1; i < points.length; i++) {
        // project each on plane!
        positions.set(points[i].position.toArray(), i * 3);

        shape.lineTo(points[i].xy.x, points[i].xy.y);
      }

      // close the shape!
      shape.lineTo(points[0].xy.x, points[0].xy.y);

      //
      // Generate Slice Buffer Geometry from Shape Buffer Geomtry
      // because it does triangulation for us!
      super(shape);
      this.type = 'SliceBufferGeometry';

      // update real position of each vertex! (not in 2d)
      this.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
      this.computeVertexNormals();
      //this.attributes.position = points; // legacy code to compute normals in the SliceHelper
   }
 }