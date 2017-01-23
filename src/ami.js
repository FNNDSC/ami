import Cameras from './cameras/cameras';
import Controls from './controls/controls';
import Core from './core/core';
import Geometries from './geometries/geometries';
import Helpers from './helpers/helpers';
import Loaders from './loaders/loaders';
import Models from './models/models';
import Parsers from './parsers/parsers';
import Shaders from './shaders/shaders';
import Widgets from './widgets/widgets';

const pckg = require('../package.json');

export default{
  Cameras,
  Controls,
  Core,
  Geometries,
  Helpers,
  Loaders,
  Models,
  Parsers,
  Shaders,
  Widgets,
};

window.console.log(`AMI ${pckg.version} ( ThreeJS ${pckg.config.threeVersion})`);
