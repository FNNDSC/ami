/* globals Stats, dat, AMI*/

var LoadersVolume         = AMI.default.Loaders.Volume;
var ControlsTrackball     = AMI.default.Controls.Trackball;
var HelpersLut            = AMI.default.Helpers.Lut;
var HelpersVR             = AMI.default.Helpers.VolumeRendering;

// standard global letiables
var controls, threeD, renderer, stats, camera, scene;
var vrHelper;
var lut;
var ready = false;

var myStack = {
  lut: 'random',
  opacity: 'random',
  steps: 256,
  alphaCorrection: 0.5,
  interpolation: 1
};

function onMouseDown() {
  if (vrHelper &&  vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = Math.floor(myStack.steps / 2);
    vrHelper.interpolation = 0;
  }
}

function onMouseUp() {
  if (vrHelper && vrHelper.uniforms) {
    vrHelper.uniforms.uSteps.value = myStack.steps;
    vrHelper.interpolation = myStack.interpolation;
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

  let interpolation = stackFolder.add(vrHelper, 'interpolation', 0, 1).step(1);

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

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 0.1, 100000);
  camera.position.x = 150;
  camera.position.y = 400;
  camera.position.z = -350;
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

// init threeJS...
init();

var files = ['https://cdn.rawgit.com/FNNDSC/data/master/nifti/eun_brain/eun_uchar_8.nii.gz'];

var loader = new LoadersVolume(threeD);
var seriesContainer = [];
var loadSequence = [];
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
    console.log( vrHelper );
    // scene
    scene.add(vrHelper);

    // CREATE LUT
    lut = new HelpersLut('my-tf');
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

    ready = true;

});