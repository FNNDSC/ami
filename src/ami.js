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
