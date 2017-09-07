/* globals describe, it, expect, beforeEach*/

import CoreIntersections from '../../src/core/core.intersections';
import {Matrix4, Vector3} from 'three';

describe('Core.Intersections', function() {
  describe('validateAabb', function() {
    it('should return false if AABB is not valid', function() {
      // null provided
      let validate = CoreIntersections.validateAabb(null);
      expect(validate).toEqual(false);

      // missing toAABB
      validate = CoreIntersections.validateAabb({});
      expect(validate).toEqual(false);

      // missing center
      validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
      });
      expect(validate).toEqual(false);

      // missing halfDimensions
      validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
        center: new Vector3(),
      });
      expect(validate).toEqual(false);

      // toAABB should be Matrix4
      validate = CoreIntersections.validateAabb({
        toAABB: new Vector3(),
        center: new Vector3(),
        halfDimensions: new Vector3(),
      });
      expect(validate).toEqual(false);

      // center should be vector3
      validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
        center: new Matrix4(),
        halfDimensions: new Vector3(),
      });
      expect(validate).toEqual(false);

      // halfDimensions should be vector3
      validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
        center: new Vector3(),
        halfDimensions: new Matrix4(),
      });
      expect(validate).toEqual(false);

      // halfDimensions should be positive
      validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
        center: new Vector3(),
        halfDimensions: new Vector3(-1, -1, -1),
      });
      expect(validate).toEqual(false);
    });

    it('should return true if AABB is valid', function() {
      let validate = CoreIntersections.validateAabb({
        toAABB: new Matrix4(),
        center: new Vector3(),
        halfDimensions: new Vector3(),
      });
      expect(validate).toEqual(true);
    });
  });

  describe('validatePlane', function() {
    it('should return false if Plane is not valid', function() {
      // null provided
      let validate = CoreIntersections.validatePlane(null);
      expect(validate).toEqual(false);

      // missing position
      validate = CoreIntersections.validatePlane({});
      expect(validate).toEqual(false);

      // missing direction
      validate = CoreIntersections.validatePlane({
        position: new Vector3(),
      });
      expect(validate).toEqual(false);

      // position should be vector3
      validate = CoreIntersections.validatePlane({
        position: new Matrix4(),
        direction: new Vector3(),
      });
      expect(validate).toEqual(false);

      // direction should be vector3
      validate = CoreIntersections.validatePlane({
        position: new Vector3(),
        direction: new Matrix4(),
      });
      expect(validate).toEqual(false);
    });

    it('should return true if Plane is valid', function() {
      let validate = CoreIntersections.validatePlane({
        position: new Vector3(),
        direction: new Vector3(),
      });
      expect(validate).toEqual(true);
    });
  });

  describe('aabbPlane', function() {
    it('should return false if aabb or plane is not valid', function() {
      // null provided
      let validate = CoreIntersections.aabbPlane(null, null);
      expect(validate).toEqual(false);
    });

    it('should return array of intersections (if any) if aabb and plane are valid', function() {
      // identity transform
      let aabb = {
        center: new Vector3(150, 150, 150),
        halfDimensions: new Vector3(50, 60, 70),
        toAABB: new Matrix4(),
      };
      let plane = {
        position: new Vector3(110, 120, 130),
        direction: new Vector3(1, 0, 0),
      };

      let intersections = CoreIntersections.aabbPlane(aabb, plane);
      // 4 intersections:
      // [ { x : 110, y : 90,  z : 80 },
      //   { x : 110, y : 210, z : 220 },
      //   { x : 110, y : 210, z : 80 },
      //   { x : 110, y : 90,  z : 220 } ]
      expect(intersections.length).toEqual(4);
      expect(intersections[0].x).toEqual(110);
      expect(intersections[0].y).toEqual(90);
      expect(intersections[0].z).toEqual(80);
      expect(intersections[1].x).toEqual(110);
      expect(intersections[1].y).toEqual(210);
      expect(intersections[1].z).toEqual(220);
      expect(intersections[2].x).toEqual(110);
      expect(intersections[2].y).toEqual(210);
      expect(intersections[2].z).toEqual(80);
      expect(intersections[3].x).toEqual(110);
      expect(intersections[3].y).toEqual(90);
      expect(intersections[3].z).toEqual(220);

      // rotate along 1 axis && translate
      // do not return duplicate values
      let m = new Matrix4();

      let m1 = new Matrix4();
      let m2 = new Matrix4();

      let gamma = Math.PI/4;

      m1.makeRotationY(gamma);
      m2.makeTranslation(150, 150, 150);
      m.multiplyMatrices(m2, m1);

      aabb = {
        center: new Vector3(150, 150, 150),
        halfDimensions: new Vector3(50, 50, 50),
        toAABB: m,
      };
      plane = {
        position: new Vector3(0, 0, 0),
        direction: new Vector3(1, 0, 0),
      };

      intersections = CoreIntersections.aabbPlane(aabb, plane);
      // 4 intersections
      // [ {x: 0, y: -50, z: -70.71068048477173},
      //   {x: 0, y: 50, z: 70.71067333221436},
      //   {x: 0, y: -50, z: 70.71067333221436},
      //   {x: 0, y: 50, z: -70.71068048477173}]
      expect(intersections.length).toEqual(4);
      expect(intersections[0].x).toBeCloseTo(0, 4);
      expect(intersections[0].y).toBeCloseTo(-50, 4);
      expect(intersections[0].z).toBeCloseTo(-70.710680, 4);
      expect(intersections[1].x).toBeCloseTo(0, 4);
      expect(intersections[1].y).toBeCloseTo(50, 4);
      expect(intersections[1].z).toBeCloseTo(70.710673, 4);
      expect(intersections[2].x).toBeCloseTo(0, 4);
      expect(intersections[2].y).toBeCloseTo(-50, 4);
      expect(intersections[2].z).toBeCloseTo(70.710673, 4);
      expect(intersections[3].x).toBeCloseTo(0, 4);
      expect(intersections[3].y).toBeCloseTo(50, 4);
      expect(intersections[3].z).toBeCloseTo(-70.710680, 4);

      // plane is a border of the aabb
      aabb = {
        center: new Vector3(150, 150, 150),
        halfDimensions: new Vector3(50, 50, 50),
        toAABB: new Matrix4(),
      };
      plane = {
        position: new Vector3(100, 150, 150),
        direction: new Vector3(1, 0, 0),
      };

      intersections = CoreIntersections.aabbPlane(aabb, plane);
      // 4 intersections
      // [ {x: 100, y: 100, z: 100},
      //   {x: 100, y: 200, z: 200},
      //   {x: 100, y: 200, z: 100},
      //   {x: 100, y: 100, z: 200}]
      expect(intersections.length).toEqual(4);
      expect(intersections[0].x).toEqual(100);
      expect(intersections[0].y).toEqual(100);
      expect(intersections[0].z).toEqual(100);
      expect(intersections[1].x).toEqual(100);
      expect(intersections[1].y).toEqual(200);
      expect(intersections[1].z).toEqual(200);
      expect(intersections[2].x).toEqual(100);
      expect(intersections[2].y).toEqual(200);
      expect(intersections[2].z).toEqual(100);
      expect(intersections[3].x).toEqual(100);
      expect(intersections[3].y).toEqual(100);
      expect(intersections[3].z).toEqual(200);

      // plane and aabb do not intersect
      // 0 intersections
      aabb = {
        center: new Vector3(150, 150, 150),
        halfDimensions: new Vector3(50, 50, 50),
        toAABB: new Matrix4(),
      };
      plane = {
        position: new Vector3(99, 150, 150),
        direction: new Vector3(1, 0, 0),
      };

      intersections = CoreIntersections.aabbPlane(aabb, plane);
      expect(intersections.length).toEqual(0);
    });
  });
});
