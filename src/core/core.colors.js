/**
 * Colors utility functions
 */
export default class Colors {
  /**
   * Convert LAB to XYZ
   * http://www.easyrgb.com/index.php?X=MATH&H=08#text8
   *
   * @param {*} l
   * @param {*} a
   * @param {*} b
   *
   * @return {*}
   */
  static cielab2XYZ(l, a, b) {
    const refX = 95.047;
    const refY = 100.00;
    const refZ = 108.883;

    let y = (l + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;

    if (Math.pow(y, 3) > 0.008856) {
      y = Math.pow(y, 3);
    } else {
      y = (y - 16 / 116) / 7.787;
    }

    if (Math.pow(x, 3) > 0.008856) {
      x = Math.pow(x, 3);
    } else {
      x = (x - 16 / 116) / 7.787;
    }

    if (Math.pow(z, 3) > 0.008856) {
      z = Math.pow(z, 3);
    } else {
      z = (z - 16 / 116) / 7.787;
    }

    return [refX * x, refY * y, refZ * z];
  }

  /**
   * Convert XYZ to RGB space
   *
   * @param {*} x
   * @param {*} y
   * @param {*} z
   *
   * @return {*}
   */
  static xyz2RGB(x, y, z) {
    x /= 100;
    y /= 100;
    z /= 100;
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    if (r > 0.0031308) {
      r = 1.055 * (Math.pow(r, 1 / 2.4)) - 0.055;
    } else {
      r = 12.92 * r;
    }

    if (g > 0.0031308) {
      g = 1.055 * (Math.pow(g, 1 / 2.4)) - 0.055;
    } else {
      g = 12.92 * g;
    }

    if (b > 0.0031308) {
      b = 1.055 * (Math.pow(b, 1 / 2.4)) - 0.055;
    } else {
      b = 12.92 * b;
    }

    r = r * 255;
    g = g * 255;
    b = b * 255;

    return [r, g, b];
  }

  /**
   * Convert LAB to RGB
   *
   * @param {*} l
   * @param {*} a
   * @param {*} b
   *
   * @return {*}
   */
  static cielab2RGB(l = 50, a = 0, b = 0) {
    if (!(l >= 0 && l <= 100)) {
      return null;
    }

    let xyz = this.cielab2XYZ(l, a, b);
    return this.xyz2RGB(...xyz);
  }
}
