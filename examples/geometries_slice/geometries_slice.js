/* globals Stats, dat*/

import ControlsTrackball from 'base/controls/controls.trackball';
import HelpersStack from 'base/helpers/helpers.stack';
import LoadersVolume from 'base/loaders/loaders.volume';

// standard global letiables
let controls;
let renderer;
let stats;
let scene;
let camera;
let stackHelper;
let particleLight;
let line;
let threeD;

/**
 * Convert number to hex
 *
 * @param {Number} c
 *
 * @return {*}
 */
function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Convert RGB to HEX
 * @param {*} r
 * @param {*} g
 * @param {*} b
 *
 * @return {*}
 */
function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


/**
 * Update geometries
 */
function updateGeometries() {
  if (stackHelper) {
    // move the "light"
    // update light position
    let timer = Date.now() * 0.00025;
    particleLight.position.x = Math.sin(timer * 7) * 70;
    particleLight.position.y = Math.cos(timer * 5) * 80;
    particleLight.position.z = Math.cos(timer * 3) * 90;

    // re-draw the line
    line.geometry.vertices[0] = stackHelper.slice.planePosition;
    line.geometry.vertices[1] = particleLight.position;
    line.geometry.verticesNeedUpdate = true;

    // update plane direction...
    let dirLPS = new THREE.Vector3(
      particleLight.position.x - stackHelper.slice.planePosition.x,
      particleLight.position.y - stackHelper.slice.planePosition.y,
      particleLight.position.z - stackHelper.slice.planePosition.z
    ).normalize();

    // update slice and THEN its border
    stackHelper.slice.planeDirection = dirLPS;

    // update border with new slice
    stackHelper.border.helpersSlice = stackHelper.slice;

    // update colors based on planeDirection
    let color = rgbToHex(
      Math.round(Math.abs(255*dirLPS.x)),
      Math.round(Math.abs(255*dirLPS.y)),
      Math.round(Math.abs(255*dirLPS.z)));
    stackHelper.bbox.color = color;
    stackHelper.border.color = color;
    particleLight.material.color.set(color);
    line.material.color.set(color);
  }
}

function render() {
  controls.update();
  renderer.render(scene, camera);
  stats.update();
}

/**
 * Initialize the scene
 */
function init() {
  /**
   * Animation loop
   */
  function animate() {
    updateGeometries();
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
  renderer.setClearColor(0x353535, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera(
    45, threeD.offsetWidth / threeD.offsetHeight,
    0.01, 10000000);
  camera.position.x = 150;
  camera.position.y = 150;
  camera.position.z = 100;

  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 1.4;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.dynamicDampingFactor = 0.3;

  particleLight = new THREE.Mesh(
    new THREE.SphereGeometry(2, 8, 8),
    new THREE.MeshBasicMaterial({color: 0xFFF336}));
  scene.add(particleLight);

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

  loader.load(files)
  .then(function() {
    const series = loader.data[0].mergeSeries(loader.data)[0];
    const stack = series.stack[0];
    stackHelper = new HelpersStack(stack);
    const centerLPS = stackHelper.stack.worldCenter();
    stackHelper.slice.aabbSpace = 'LPS';
    stackHelper.slice.planePosition.x = centerLPS.x;
    stackHelper.slice.planePosition.y = centerLPS.y;
    stackHelper.slice.planePosition.z = centerLPS.z;
    stackHelper.slice.thickness = 2.0;
    stackHelper.slice.spacing = 0.5;
    scene.add(stackHelper);

    // LINE STUFF
    const materialLine = new THREE.LineBasicMaterial();
    const geometryLine = new THREE.Geometry();
    stackHelper.slice.updateMatrixWorld();
    geometryLine.vertices.push(stackHelper.slice.position);
    geometryLine.vertices.push(particleLight.position);
    geometryLine.verticesNeedUpdate = true;
    line = new THREE.Line(geometryLine, materialLine);
    scene.add(line);

    // update camrea's and control's target
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    // create GUI
    let gui = new dat.GUI({
      autoPlace: false,
    });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    customContainer = null;

    let positionFolder = gui.addFolder('Plane position');
    let worldBBox = stackHelper.stack.worldBoundingBox();
    let frameIndexControllerOriginI = positionFolder.add(
      stackHelper.slice.planePosition, 'x',
      worldBBox[0], worldBBox[1]).step(0.01).listen();
    let frameIndexControllerOriginJ = positionFolder.add(
      stackHelper.slice.planePosition, 'y',
      worldBBox[2], worldBBox[3]).step(0.01).listen();
    let frameIndexControllerOriginK = positionFolder.add(
      stackHelper.slice.planePosition, 'z',
      worldBBox[4], worldBBox[5]).step(0.01).listen();
    positionFolder.add(stackHelper.slice, 'interpolation',
      0, 1).step(1).listen();
    positionFolder.add(stackHelper.slice, 'thickness',
      0, 20).step(1).listen();
    positionFolder.add(stackHelper.slice, 'spacing',
      0, 2).step(.2).listen();
    positionFolder.open();

    frameIndexControllerOriginI.onChange(updateGeometries);
    frameIndexControllerOriginJ.onChange(updateGeometries);
    frameIndexControllerOriginK.onChange(updateGeometries);

    loader.free();
    loader = null;

    /**
     * onWindowResize callback
     */
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


