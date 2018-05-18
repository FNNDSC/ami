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

function render() {
  if (stackHelper) {
    stackHelper.index += 1;
    if (stackHelper.outOfBounds === true) {
      stackHelper.orientation = (stackHelper.orientation + 1) % 3;
      stackHelper.index = 0;
    }
  }

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

  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);

  let t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36748256', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242',
  ];

  let files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  // load sequence for all files
  loader.load(files)
  .then(function() {
    // make a proper function for this guy...
    let series = loader.data[0].mergeSeries(loader.data)[0];
    let stack = series.stack[0];
    stackHelper = new HelpersStack(stack);
    stackHelper.bbox.color = 0xF9F9F9;
    stackHelper.border.color = 0xF9F9F9;
    scene.add(stackHelper);

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
