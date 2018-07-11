/* globals Stats, dat*/

import ControlsTrackball from 'base/controls/controls.trackball';
import HelpersLut from 'base/helpers/helpers.lut';
import HelpersVR from 'base/helpers/helpers.volumerendering';
import LoadersVolume from 'base/loaders/loaders.volume';

// standard global letiables
let controls, threeD, renderer, stats, camera, scene;
let vrHelper;
let lut;
let ready = false;
let interpolationState;

let myStack = {
  lut: 'walking_dead',
  opacity: 'linear',
  steps: 256,
  alphaCorrection: 0.5,
  frequence: 0,
  amplitude: 0,
  interpolation: 1,
};

function onMouseDown() {
  if (vrHelper && vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = Math.floor(myStack.steps / 2);
    // save interpolation state
    interpolationState = myStack.interpolation;
    vrHelper.interpolation = 0;
  }
}

function onMouseUp() {
  if (vrHelper && vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = myStack.steps;
    vrHelper.interpolation = interpolationState;
  }
}

function onWindowResize() {
  // update the camera
  camera.aspect = threeD.offsetWidth / threeD.offsetHeight;
  camera.updateProjectionMatrix();

    // notify the renderer of the size change
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
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
    });

  let stepsUpdate = stackFolder.add(myStack, 'steps', 0, 512).step(1);
  stepsUpdate.onChange(function(value) {
      if (vrHelper.uniforms) {
        vrHelper.uniforms.uSteps.value = value;
      }
    });

  let alphaCorrrectionUpdate = stackFolder.add(myStack, 'alphaCorrection', 0, 1).step(0.01);
  alphaCorrrectionUpdate.onChange(function(value) {
      if (vrHelper.uniforms) {
        vrHelper.uniforms.uAlphaCorrection.value = value;
      }
    });

  let frequenceUpdate = stackFolder.add(myStack, 'frequence', 0, 1).step(0.01);
  frequenceUpdate.onChange(function(value) {
  if (vrHelper.uniforms) {
    vrHelper.uniforms.uFrequence.value = value;
  }
  });

  let amplitudeUpdate = stackFolder.add(myStack, 'amplitude', 0, 0.5).step(0.01);
  amplitudeUpdate.onChange(function(value) {
  if (vrHelper.uniforms) {
    vrHelper.uniforms.uAmplitude.value = value;
  }
  });

  let interpolation = stackFolder.add(vrHelper, 'interpolation', 0, 1).step(1);

  stackFolder.open();
}
function render() {
    // render
    controls.update();

    if (ready) {
      renderer.render(scene, camera);
    }

    stats.update();
}

function init() {
  // this function is executed on each animation frame
  function animate() {
    render();

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

  threeD.addEventListener('mousedown', onMouseDown, false);
  threeD.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('resize', onWindowResize, false);

  // start rendering loop
  animate();
}

window.onload = function() {
  // init threeJS
  init();

  let data = [
   'scan-00109_rec-01a.nii_.gz',
  ];

  let files = data.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/lifewatch_echinoidea/' + v;
  });

  // files = ['http://127.0.0.1:8080/brainc.nii']

  //   let data = [
  //  'scan-00109_rec-01a.nii_.gz'
  //   // '7002_t1_average_BRAINSABC.nii.gz'
  // ];

  // let files = data.map(function(v) {
  //   return '@/data/nii/' + v;
  // });

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  // hookup a progress bar....
  let loader = new LoadersVolume(threeD);
  let seriesContainer = [];
  let loadSequence = [];
  files.forEach((url) => {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(() => loader.fetch(url))
      .then((data) => loader.parse(data))
      .then((series) => {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

  // load sequence for all files
  Promise
  .all(loadSequence)
  .then(() => {
    loader.free();
    loader = null;

    let series = seriesContainer[0].mergeSeries(seriesContainer)[0];
    // get first stack from series
    let stack = series.stack[0];

    vrHelper = new HelpersVR(stack);
    // scene
    scene = new THREE.Scene();
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
      screenshotElt.download = 'VJS-' + Date.now() + '.png';
      screenshotElt.href = screenshot;
    });

    // good to go
    ready = true;

    // force first render
    render();
    // notify puppeteer to take screenshot
    const puppetDiv = document.createElement('div');
    puppetDiv.setAttribute('id', 'puppeteer');
    document.body.appendChild(puppetDiv);
  })
  .catch((error) => window.console.log(error));
};
