// bootstrap target version of three
// as a global variable
// that allows the app to use three via npm module
// but still use the three glbal variables in ami.
// ideally ami should not use global variables but
// it seems tricky to export custom classes:
//
// slice geometry
//
// export default class extends THREE.ShapeGeometry
// should be
// export default class extends ShapeGeometryBootstraped
// where ShapeGeometryBootstraped
// {ShapeGeometry} from 'three' (in ami)
// THREE.ShapeGeometry (after bootstrap)
// 
// however ShapeGeometryBootstraped can not be changed at runtime (after bootstrap)
//
// {ShapeGeometry} from 'three';
// const bootstrap = () => {
//   if (THREE.ShapeGeometry) {
//       return THREE.ShapeGeometry;
//    } else {
//      return ShapeGeometry;
//    }
// }
// export default class extends bootstrap() {...}
//   
//

export const bootstrap = (three) => {
  if (window.THREE && window.THREE.VERSION !== three.VERSION) {
    window.console.log(`Bootstraping three v${three.VERSION} over v${window.THREE.VERSION}`);
  }
  window.THREE = three;
};

export * from './cameras/cameras';
export * from './controls/controls';
export * from './core/core';
export * from './geometries/geometries';
export * from './helpers/helpers';
export * from './loaders/loaders';
export * from './models/models';
export * from './parsers/parsers';
export * from './presets/presets';
export * from './shaders/shaders';
export * from './widgets/widgets';

const pckg = require('../package.json');
window.console.log(`ami v${pckg.version} (three v${pckg.config.threeVersion})`);
