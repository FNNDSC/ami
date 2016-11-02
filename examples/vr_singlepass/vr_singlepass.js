/* globals Stats, dat*/

import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersLut        from '../../src/helpers/helpers.lut';
import HelpersVR         from '../../src/helpers/helpers.volumerendering';
import LoadersVolume     from '../../src/loaders/loaders.volume';

// standard global letiables
let controls, threeD, renderer, stats, camera, scene;
let vrHelper;
let lut;
let ready = false;

let myStack = {
  lut: 'walking_dead',
  opacity: 'linear',
  steps: 256,
  alphaCorrection: 0.5,
  frequence: 0,
  amplitude: 0,
  interpolation: 1
};

function onMouseDown() {
  if (vrHelper &&  vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = Math.floor(myStack.steps / 2);
  }
}

function onMouseUp() {
  if (vrHelper && vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = myStack.steps;
  }
}

function onWindowResize(){
  // update the camera
  camera.aspect = threeD.offsetWidth / threeD.offsetHeight;
  camera.updateProjectionMatrix();

    // notify the renderer of the size change
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
}

function buildGUI() {
  let gui = new dat.GUI({
      autoPlace: false
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

  let interpolation = stackFolder.add(myStack, 'interpolation', 0, 1).step(1);
  interpolation.onChange(function(value) {
  if (vrHelper.uniforms) {
    vrHelper.uniforms.uInterpolation.value = value;
    vrHelper.uniforms.uInterpolation.needsUpdate = true;
    vrHelper._updateMaterial();
  }
  });

  stackFolder.open();
}

function init() {

  // this function is executed on each animation frame
  function animate() {
    // render
    controls.update();

    if (ready) {
      renderer.render(scene, camera);
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
    alpha: true
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

  let t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36444420', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242',
    '36748256'
  ];

  let files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  // files = ['http://127.0.0.1:8080/brainc.nii']

  //   let data = [
  //  'scan-00109_rec-01a.nii_.gz'
  //   // '7002_t1_average_BRAINSABC.nii.gz'
  // ];

  // let files = data.map(function(v) {
  //   return '../../data/nii/' + v;
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
  })
  .catch((error) => window.console.log(error));

};
