import { Matrix3 } from 'three/src/math/Matrix3';
import { Vector3 } from 'three/src/math/Vector3';

import CoreUtils from '../../src/core/core.utils';

describe('Core.Utils', () => {
  describe('bbox', () => {
    it('should return false if input is not valid', () => {
      // negative half dimensions
      const bbox = CoreUtils.bbox(new Vector3(), new Vector3(-1, 10, 10));
      expect(bbox).toEqual(false);
    });

    it('should return true if input is valid', () => {
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
      bbox = CoreUtils.bbox(new Vector3(1, 2, 3), new Vector3(1, 2, 3));
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
  });

  describe('string to number', () => {
    it('should convert valid strings to number', () => {
      // number with a dot
      let numberFromString = CoreUtils.stringToNumber('5.0');
      expect(numberFromString).toEqual(5.0);

      // number with a comma
      numberFromString = CoreUtils.stringToNumber('5,0');
      expect(numberFromString).toEqual(5.0);

      // number with a dot and a comma
      numberFromString = CoreUtils.stringToNumber('5,000.1');
      expect(numberFromString).toEqual(5000.1);
    });

    it('should convert invalid strings to 1.0', () => {
      // number with a dot
      let numberFromString = CoreUtils.stringToNumber('abc');
      expect(numberFromString).toEqual(1.0);

      // number with a comma
      numberFromString = CoreUtils.stringToNumber('5..0,');
      expect(numberFromString).toEqual(1.0);

      // number with a dot and a comma
      numberFromString = CoreUtils.stringToNumber('5,,1');
      expect(numberFromString).toEqual(1.0);
    });
  });
});
