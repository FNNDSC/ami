import Validators from './core.validators';

/**
 * General purpose functions.
 *
 * @module core/utils
 */

// Missing all good stuff
// critical for testing
// transform ( IJK <-> RAS)
// bounding box (IJK, RAS, Axed Aligned)
// minBound
// maxBound
// half dimensions, etc.
//

export default class Utils {

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
   * VJS.Core.Utils.bbox( new THREE.Vector3(1, 2, 3), new THREE.Vector3(1, 2, 3));
   *
   * //Returns false
   * VJS.Core.Utils.bbox(new THREE.Vector3(), new THREE.Matrix4());
   *
   */
  static bbox(center, halfDimensions) {
    // make sure we have valid inputs
    if(!(Validators.vector3(center) &&
      Validators.vector3(halfDimensions))) {
      window.console.log('Invalid center or plane halfDimensions.');
      return false;
    }

    // make sure half dimensions are >= 0
    if(!(halfDimensions.x >= 0 &&
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

  static minMaxPixelData(pixelData = []) {
    let minMax = [65535, -32768];
    let numPixels = pixelData.length;

    for (let index = 0; index < numPixels; index++) {
      let spv = pixelData[index];
      minMax[0] = Math.min(minMax[0], spv);
      minMax[1] = Math.max(minMax[1], spv);
    }

    return minMax;
  }
}
