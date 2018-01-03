/* globals describe, it, expect, beforeEach*/
import CoreUtils from '../../src/core/core.utils';
import {Matrix3, Vector3} from 'three';
import puppeteer from 'puppeteer';

describe('Core.Utils', function() {
  describe('bbox', function() {
    it('should return false if input is not valid', function() {
      // invalid input
      let bbox = CoreUtils.bbox(new Vector3(), new Matrix3());
      expect(bbox).toEqual(false);

      // negative half dimensions
      bbox = CoreUtils.bbox(new Vector3(), new Vector3(-1, 10, 10));
      window.console.log(bbox);
      expect(bbox).toEqual(false);
    });

    it('should return true if input is valid', function() {
      // zero bbox
      let bbox = CoreUtils.bbox(new Vector3(), new Vector3());
      // { min: { x : 0, y : 0,  z : 0 },
      //  max: { x : 0, y : 0,  z : 0 }
      // }
      expect(bbox.hasOwnProperty('min')).toEqual(true);
      expect(bbox.min.x).toEqual(0);
      expect(bbox.min.x).toEqual(0);
      expect(bbox.min.y).toEqual(0);
      expect(bbox.min.z).toEqual(0);
      expect(bbox.hasOwnProperty('max')).toEqual(true);
      expect(bbox.max.x).toEqual(0);
      expect(bbox.max.y).toEqual(0);
      expect(bbox.max.z).toEqual(0);

      // regular bbox
      bbox = CoreUtils.bbox(
        new Vector3(1, 2, 3),
        new Vector3(1, 2, 3));
      // { min: { x : 0, y : 0,  z : 0 },
      //  max: { x : 2, y : 4,  z : 6 }
      // }
      expect(bbox.hasOwnProperty('min')).toEqual(true);
      expect(bbox.min.x).toEqual(0);
      expect(bbox.min.y).toEqual(0);
      expect(bbox.min.z).toEqual(0);
      expect(bbox.hasOwnProperty('max')).toEqual(true);
      expect(bbox.max.x).toEqual(2);
      expect(bbox.max.y).toEqual(4);
      expect(bbox.max.z).toEqual(6);
    });

    it('should release memory', async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.evaluate(() => window.map = new Map());
      // Get a handle to the Map object prototype
      const mapPrototype = await page.evaluateHandle(() => Map.prototype);
      // Query all map instances into an array
      const mapInstances = await page.queryObjects(mapPrototype);
      // Count amount of map objects in heap
      const count = await page.evaluate((maps) => maps.length, mapInstances);
      await mapInstances.dispose();
      await mapPrototype.dispose();
      await browser.close();
    });
  });
});
