import CoreColors from '../../src/core/core.colors';

describe('Core.Colors', () => {
  it('should convert LAB to XYZ', () => {
    // invalid input
    let xyz = CoreColors.cielab2XYZ(0, 0, 0);
    expect(xyz).toEqual([0, 0, 0]);

    xyz = CoreColors.cielab2XYZ(100, 0, 0);
    expect(Math.round(xyz[0] * 1000)).toEqual(95.047 * 1000);
    expect(Math.round(xyz[1] * 1000)).toEqual(100.000 * 1000);
    expect(Math.round(xyz[2] * 1000)).toEqual(108.883 * 1000);

    xyz = CoreColors.cielab2XYZ(50, 0, 0);
    expect(Math.round(xyz[0] * 1000)).toEqual(17.506 * 1000);
    expect(Math.round(xyz[1] * 1000)).toEqual(18.419 * 1000);
    expect(Math.round(xyz[2] * 1000)).toEqual(20.055 * 1000);

    // not correct?
    // xyz = CoreColors.cielab2XYZ(0, -128, 0);
    // expect(xyz).toEqual([0, 0, 0]);

    // not correct?
    // xyz = CoreColors.cielab2XYZ(0, +128, 0);
    // expect(xyz).toEqual([0, 0, 0]);

    xyz = CoreColors.cielab2XYZ(64, -128, 0);
    expect(Math.round(xyz[0] * 1000)).toEqual(7.751 * 1000);
    expect(Math.round(xyz[1] * 1000)).toEqual(32.802 * 1000);
    expect(Math.round(xyz[2] * 1000)).toEqual(35.715 * 1000);
  });
});
