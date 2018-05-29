/* globals Stats*/

import ControlsTrackball from 'base/controls/controls.trackball';
import HelpersStack from 'base/helpers/helpers.stack';
import LoadersVolume from 'base/loaders/loaders.volume';

// standard global variables
let controls;
let renderer;
let stats;
let scene;
let camera;
let stackHelper;
let threeD;
let brain;

function render() {
  controls.update();
  renderer.render(scene, camera);
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
    antialias: true,
  });
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor(0x673AB7, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
  camera.position.x = 250;
  camera.position.y = 250;
  camera.position.z = 250;

  scene.add(new THREE.AmbientLight(0x353535));
  let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(200, 200, 1000).normalize();
  scene.add(directionalLight);

  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 1.4;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  animate();
}

window.onload = function() {
  // init threeJS...
  init();

  // load vtk file
  let loader1 = new THREE.VTKLoader();
  loader1.load('https://cdn.rawgit.com/FNNDSC/data/master/vtk/fetalatlas_brain/cortex.vtk', function(geometry) {
    geometry.computeVertexNormals();
    let material = new THREE.MeshLambertMaterial({
      color: 0x009688,
      side: THREE.DoubleSide});
    brain = new THREE.Mesh(geometry, material);
    let toLPS = new THREE.Matrix4();
    toLPS.set(
      -1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1);
    brain.applyMatrix(toLPS);
    scene.add(brain);
  });

  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);

  let t2 = [
    'template_T2.nii.gz',
  ];

  let files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/fetalatlas_brain/t2/' + v;
  });

  // load sequence for each file
  let loadSequence = [];
  files.forEach(function(url) {
    loadSequence.push(
      loader.load(url)
    );
  });

  // load sequence for all files
  Promise
  .all(loadSequence)
  .then(function() {
    // make a proper function for this guy...
    let series = loader.data[0].mergeSeries(loader.data)[0];
    let stack = series.stack[0];
    stackHelper = new HelpersStack(stack);
    stackHelper.bbox.color = 0xF9F9F9;
    stackHelper.border.color = 0xF9F9F9;
    scene.add(stackHelper);

    // fill second renderer
    let stackHelper1 = new HelpersStack(stack);
    stackHelper1.orientation = 2;
    stackHelper1.bbox.visible = false;
    stackHelper1.border.color = 0xFF1744;
    scene.add(stackHelper1);

    // fill second renderer
    let stackHelper2 = new HelpersStack(stack);
    stackHelper2.orientation = 1;
    stackHelper2.bbox.visible = false;
    stackHelper2.border.color = 0xFF1744;
    scene.add(stackHelper2);

    // /
    let geometry = new THREE.SphereBufferGeometry(5, 32, 32);
    let material = new THREE.MeshBasicMaterial({color: 0xffff00});
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(stack._origin.x, stack._origin.y, stack._origin.z);
    scene.add(sphere);

    // update camrea's and control's target
    let centerLPS = stackHelper.stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    loader.free();
    loader = null;

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    // force 1st render
    render();
    // notify puppeteer to take screenshot
    const puppetDiv = document.createElement('div');
    puppetDiv.setAttribute('id', 'puppeteer');
    document.body.appendChild(puppetDiv);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
};
