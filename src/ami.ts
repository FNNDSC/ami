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

import { Raycaster } from 'three/src/core/Raycaster';

const packageVersion = require('../package.json').version;
const d3Version = require('../node_modules/three/package.json').version;
window.console.log(`ami ${packageVersion} (three ${d3Version})`);