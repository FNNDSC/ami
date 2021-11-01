import ControlsTrackball, { trackball } from './controls.trackball';
import TrackballOrtho, { trackballOrtho } from './controls.trackballortho';
import ControlsOrbit, { orbit } from './controls.orbit';

export {
  ControlsTrackball as TrackballControl,
  trackball as trackballControlFactory,
  TrackballOrtho as TrackballOrthoControl,
  trackballOrtho as trackballOrthoControlFactory,
  ControlsOrbit as OrbitControl,
  orbit as orbitControlFactory,
};
