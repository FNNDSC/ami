/* globals Stats, dat*/

import ControlsTrackball from 'base/controls/controls.trackball';
import HelpersLut from 'base/helpers/helpers.lut';
import HelpersVR from 'base/helpers/helpers.volumerendering';
import LoadersVolume from 'base/loaders/loaders.volume';

// standard global letiables
let controls;
let threeD;
let renderer;
let stats;
let camera;
let scene;
let vrHelper;
let lut;
let ready = false;
let modified = false;
let wheel = null;
let wheelTO = null;

let myStack = {
  lut: 'random',
  opacity: 'random',
  steps: 256,
  alphaCorrection: 0.5,
  frequence: 0,
  amplitude: 0,
  interpolation: 1,
};

function onStart(event) {
  if (vrHelper && vrHelper.uniforms && !wheel) {
    vrHelper.uniforms.uSteps.value = Math.floor(myStack.steps / 2);
    vrHelper.interpolation = 0;
    modified = true;
  }
}

function onEnd(event) {
  if (vrHelper && vrHelper.uniforms && !wheel) {
    vrHelper.uniforms.uSteps.value = myStack.steps;
    vrHelper.interpolation = myStack.interpolation;
    modified = true;
  }
}

function onWheel() {
  if (!wheel) {
    vrHelper.uniforms.uSteps.value = Math.floor(myStack.steps / 2);
    vrHelper.interpolation = 0;
    wheel = Date.now();
  }

  if (Date.now() - wheel < 300) {
    clearTimeout(wheelTO);
    wheelTO = setTimeout(function() {
      vrHelper.uniforms.uSteps.value = myStack.steps;
      vrHelper.interpolation = myStack.interpolation;
      wheel = null;
      modified = true;
    }, 300);
  }

  modified = true;
}

function onWindowResize() {
  // update the camera
  camera.aspect = threeD.offsetWidth / threeD.offsetHeight;
  camera.updateProjectionMatrix();

  // notify the renderer of the size change
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  modified = true;
}

function buildGUI() {
  let gui = new dat.GUI({
      autoPlace: false,
    });

  let customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);

  let stackFolder = gui.addFolder('Settings');
  let lutUpdate = stackFolder.add(myStack, 'lut', lut.lutsAvailable());
  lutUpdate.onChange(function(value) {
      lut.lut = value;
      vrHelper.uniforms.uTextureLUT.value.dispose();
      vrHelper.uniforms.uTextureLUT.value = lut.texture;
      modified = true;
    });
  // init LUT
  lut.lut = myStack.lut;
  vrHelper.uniforms.uTextureLUT.value.dispose();
  vrHelper.uniforms.uTextureLUT.value = lut.texture;

  let opacityUpdate = stackFolder.add(myStack, 'opacity', lut.lutsAvailable('opacity'));
  opacityUpdate.onChange(function(value) {
      lut.lutO = value;
      vrHelper.uniforms.uTextureLUT.value.dispose();
      vrHelper.uniforms.uTextureLUT.value = lut.texture;
      modified = true;
    });

  let stepsUpdate = stackFolder.add(myStack, 'steps', 0, 512).step(1);
  stepsUpdate.onChange(function(value) {
      if (vrHelper.uniforms) {
        vrHelper.uniforms.uSteps.value = value;
        modified = true;
      }
    });

  let alphaCorrrectionUpdate = stackFolder.add(myStack, 'alphaCorrection', 0, 1).step(0.01);
  alphaCorrrectionUpdate.onChange(function(value) {
      if (vrHelper.uniforms) {
        vrHelper.uniforms.uAlphaCorrection.value = value;
        modified = true;
      }
    });

  let interpolationUpdate = stackFolder.add(vrHelper, 'interpolation', 0, 1).step(1);
  interpolationUpdate.onChange(function(value) {
    if (vrHelper.uniforms) {
      modified = true;
    }
  });

  stackFolder.open();
}

function init() {
  // this function is executed on each animation frame
  function animate() {
    // render
    controls.update();

    if (ready && modified) {
      renderer.render(scene, camera);
      modified = false;
    }

    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    alpha: true,
  });
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  threeD.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 0.1, 100000);
  camera.position.x = 166;
  camera.position.y = -471;
  camera.position.z = 153;
  camera.up.set(-0.42, 0.86, 0.26);

  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 5.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.addEventListener('change', () => {
    modified = true;
  });
  controls.addEventListener('start', onStart);
  controls.addEventListener('end', onEnd);

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('wheel', onWheel);
  // start rendering loop
  animate();
}

window.onload = function() {
  // init threeJS
  init();

  let filename = 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/eun_brain/eun_uchar_8.nii.gz';

  // load sequence for each file
  // instantiate the loader
  let loader = new LoadersVolume(threeD);
  loader.load(filename)
  .then(() => {
    let series = loader.data[0].mergeSeries(loader.data)[0];
    loader.free();
    loader = null;
    // get first stack from series
    let stack = series.stack[0];

    vrHelper = new HelpersVR(stack);
    // scene
    scene.add(vrHelper);

    // CREATE LUT
    lut = new HelpersLut('my-lut-canvases');
    lut.luts = HelpersLut.presetLuts();
    lut.lutsO = HelpersLut.presetLutsO();
    // update related uniforms
    vrHelper.uniforms.uTextureLUT.value = lut.texture;
    vrHelper.uniforms.uLut.value = 1;

    // update camrea's and interactor's target
    let centerLPS = stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    // create GUI
    buildGUI();

    // screenshot experiment
    let screenshotElt = document.getElementById('screenshot');
    screenshotElt.addEventListener('click', function() {
      controls.update();

      if (ready) {
        renderer.render(scene, camera);
      }

      let screenshot = renderer.domElement.toDataURL();
      screenshotElt.download = 'AMI-' + Date.now() + '.png';
      screenshotElt.href = screenshot;
    });

    // good to go
    ready = true;
    modified = true;
  })
  .catch((error) => window.console.log(error));
};
