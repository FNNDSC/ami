/* globals Stats, dat*/

import CamerasOrthographic  from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import ControlsTrackball    from '../../src/controls/controls.trackball';
import HelpersStack         from '../../src/helpers/helpers.stack';
import LoadersVolume        from '../../src/loaders/loaders.volume';

// standard global variables
var controls0, controls1, controls2, controls3, renderer0, renderer1, renderer2, renderer3, stats, camera0, camera1, camera2, camera3, sceneScreen0, sceneScreen1, sceneScreen2, sceneScreen3, uniformsSecondPass;
var ready = false;
var stackHelper1, stackHelper2, stackHelper3, threeD3;

function onMouseDown() {
  if (uniformsSecondPass) {
    uniformsSecondPass.uSteps.value = 32;
  }
}

function onMouseUp() {
  if (uniformsSecondPass) {
    uniformsSecondPass.uSteps.value = 128;
  }
}

function init() {

  // this function is executed on each animation frame
  function animate() {
    // render
    controls0.update();
    controls1.update();
    controls2.update();
    controls3.update();

    if (ready) {
      renderer0.render(sceneScreen0, camera0);
      renderer1.render(sceneScreen1, camera1);
      renderer2.render(sceneScreen2, camera2);
      renderer3.render(sceneScreen3, camera3);
    }

    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // CREATE RENDERER 0

  // renderer
  var threeD0 = document.getElementById('r0');
  renderer0 = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer0.setSize(threeD0.clientWidth, threeD0.clientHeight);
  renderer0.setClearColor(0x2196F3, 1);
  threeD0.appendChild(renderer0.domElement);

  // stats
  stats = new Stats();
  threeD0.appendChild(stats.domElement);

  // camera
  camera0 = new THREE.PerspectiveCamera(45, threeD0.clientWidth / threeD0.clientHeight, 0.1, 100000);
  camera0.position.x = 250;
  camera0.position.y = 250;
  camera0.position.z = 250;

  // controls
  controls0 = new ControlsTrackball(camera0, threeD0);
  controls0.rotateSpeed = 5.5;
  controls0.zoomSpeed = 1.2;
  controls0.panSpeed = 0.8;
  controls0.staticMoving = true;
  controls0.dynamicDampingFactor = 0.3;

  threeD0.addEventListener('mousedown', onMouseDown, false);
  threeD0.addEventListener('mouseup', onMouseUp, false);

  // CREATE RENDERER 1
  var threeD1 = document.getElementById('r1');
  renderer1 = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer1.setSize(threeD1.clientWidth, threeD1.clientHeight);
  renderer1.setClearColor(0xF44336, 1);
  threeD1.appendChild(renderer1.domElement);

  // camera
  camera1 = new THREE.PerspectiveCamera(45, threeD1.clientWidth / threeD1.clientHeight, 0.1, 100000);
  camera1.position.x = 250;
  camera1.position.y = 250;
  camera1.position.z = 250;

  // controls
  controls1 = new ControlsTrackball(camera1, threeD1);
  controls1.rotateSpeed = 5.5;
  controls1.zoomSpeed = 1.2;
  controls1.panSpeed = 0.8;
  controls1.staticMoving = true;
  controls1.dynamicDampingFactor = 0.3;

  // CREATE RENDERER 2
  var threeD2 = document.getElementById('r2');
  renderer2 = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer2.setSize(threeD2.clientWidth, threeD2.clientHeight);
  renderer2.setClearColor(0xFFEB3B, 1);
  threeD2.appendChild(renderer2.domElement);

  // camera
  camera2 = new THREE.PerspectiveCamera(45, threeD2.clientWidth / threeD2.clientHeight, 0.1, 100000);
  camera2.position.x = 250;
  camera2.position.y = 250;
  camera2.position.z = 250;

  // controls
  controls2 = new ControlsTrackball(camera2, threeD2);
  controls2.rotateSpeed = 5.5;
  controls2.zoomSpeed = 1.2;
  controls2.panSpeed = 0.8;
  controls2.staticMoving = true;
  controls2.dynamicDampingFactor = 0.3;

  // CREATE RENDERER 3
  threeD3 = document.getElementById('r3');
  renderer3 = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer3.setSize(threeD3.clientWidth, threeD3.clientHeight);
  renderer3.setClearColor(0x4CAF50, 1);
  threeD3.appendChild(renderer3.domElement);
  // camera
  camera3 = new CamerasOrthographic(threeD3.clientWidth / -2, threeD3.clientWidth / 2, threeD3.clientHeight / 2, threeD3.clientHeight / -2, 1, 1000);
  // controls
  controls3 = new ControlsOrthographic(camera3, threeD3);
  controls3.staticMoving = true;
  controls3.noRotate = true;

  // start rendering loop
  animate();
}

window.onload = function() {

  // init threeJS
  init();

  var t2 = [
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
  var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  var loader = new LoadersVolume();
  loader.load(files)
  .then(function() {
    var series = loader.data[0].mergeSeries(loader.data)[0];
    loader.free();
    loader = null;
    // get first stack from series
    var stack = series.stack[0];
    // prepare it
    // * ijk2LPS transforms
    // * Z spacing
    // * etc.
    //
    stack.prepare();
    // pixels packing for the fragment shaders now happens there
    stack.pack();

    //
    // CREATE THE BOUNDING BOX
    //

    // box geometry
    var boxGeometry = new THREE.BoxGeometry(
      stack.dimensionsIJK.x,
      stack.dimensionsIJK.y,
      stack.dimensionsIJK.z
      );

    // we use this offsect to center the first voxel on (0, 0, 0)
    // in IJK space (is it correct?)
    var offset = new THREE.Vector3(-0.5, -0.5, -0.5);

    // box is centered on 0,0,0
    // we want first voxel of the box to be centered on 0,0,0
    // in IJK space
    boxGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      stack.halfDimensionsIJK.x + offset.x,
      stack.halfDimensionsIJK.y + offset.y,
      stack.halfDimensionsIJK.z + offset.z)
    );

    // slice material
    var textures = [];
    for (var m = 0; m < stack.rawData.length; m++) {
      var tex = new THREE.DataTexture(
        stack.rawData[m],
        stack.textureSize,
        stack.textureSize,
        stack.textureType,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter);
      tex.needsUpdate = true;
      tex.flipY = true;
      textures.push(tex);
    }

    // scene
    sceneScreen0 = new THREE.Scene();
    //sceneScreen0.add(boxMeshSecondPass);

    var boxMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xFFFFFF
    });
    var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.applyMatrix(stack.ijk2LPS);
    sceneScreen0.add(boxMesh);

    // update camrea's and interactor's target
    var centerLPS = stack.worldCenter();
    // update camera's target
    camera0.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera0.updateProjectionMatrix();
    controls0.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    // fill second renderer
    stackHelper1 = new HelpersStack(stack);
    stackHelper1.orientation = 2;
    stackHelper1.bbox.visible = false;
    stackHelper1.border.color = 0xFF1744;
    // scene
    sceneScreen1 = new THREE.Scene();
    sceneScreen1.add(stackHelper1);
    sceneScreen0.add(sceneScreen1);

    // update camera's target
    camera1.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    controls1.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    camera1.updateProjectionMatrix();

    // fill third renderer
    stackHelper2 = new HelpersStack(stack);
    stackHelper2.orientation = 1;
    stackHelper2.bbox.visible = false;
    stackHelper2.border.color = 0xFFEA00;
    // scene
    sceneScreen2 = new THREE.Scene();
    sceneScreen2.add(stackHelper2);
    sceneScreen0.add(sceneScreen2);

    // update camera's target
    camera2.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    controls2.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    camera2.updateProjectionMatrix();

    //Fill fourth renderer

    stackHelper3 = new HelpersStack(stack);
    stackHelper3.orientation = 0;
    stackHelper3.bbox.visible = false;
    stackHelper3.border.color = 0x76FF03;

    sceneScreen3 = new THREE.Scene();
    sceneScreen3.add(stackHelper3);
    sceneScreen0.add(sceneScreen3);

    //
    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    // box: {halfDimensions, center}
    let bbox = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
    };

    // init and zoom
    let canvas = {
        width: threeD3.clientWidth,
        height: threeD3.clientHeight
      };
    camera3.init(stack.xCosine, stack.yCosine, stack.zCosine, controls3, bbox, canvas);
    camera3.fitBox(2);

    let gui = new dat.GUI({
            autoPlace: false
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    let stackFolder1 = gui.addFolder('Red');
    stackFolder1.add(stackHelper1, 'index', 0, stack.dimensionsIJK.y - 1).step(1);
    let stackFolder2 = gui.addFolder('Yellow');
    stackFolder2.add(stackHelper2, 'index', 0, stack.dimensionsIJK.x - 1).step(1);
    let stackFolder3 = gui.addFolder('Green');
    stackFolder3.add(stackHelper3, 'index', 0, stack.dimensionsIJK.z - 1).step(1);

    // good to go
    ready = true;
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

};
