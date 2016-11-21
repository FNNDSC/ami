/* globals Stats, dat, AMI*/

// VJS classes we will be using in this lesson
var LoadersVolume         = AMI.default.Loaders.Volume;
var CamerasOrthographic   = AMI.default.Cameras.Orthographic;
var ControlsOrthographic  = AMI.default.Controls.TrackballOrtho;
var HelpersStack          = AMI.default.Helpers.Stack;

// Setup renderer
var container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer({
    antialias: true
  });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(0x353535, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Setup scene
var scene = new THREE.Scene();

// Setup camera
var camera = new CamerasOrthographic(container.clientWidth / -2, container.clientWidth / 2, container.clientHeight / 2, container.clientHeight / -2, 0.1, 10000);

// Setup controls
var controls = new ControlsOrthographic(camera, container);
controls.staticMoving = true;
controls.noRotate = true;

// handle resize
function onWindowResize() {

  camera.canvas = {
    width: container.offsetWidth,
    height: container.offsetHeight
  };
  camera.fitBox(2);

  renderer.setSize(container.offsetWidth, container.offsetHeight);

}
window.addEventListener('resize', onWindowResize, false);


// build GUI
function gui(stackHelper){

  var gui = new dat.GUI({
            autoPlace: false
  });
  var customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);
  // only reason to use this object is to satusfy data.GUI
  var camUtils = {
    invertRows: false,
    invertColumns: false,
    rotate45: false,
    rotate: 0
  };

  // camera
  var cameraFolder = gui.addFolder('Camera');
  var invertRows = cameraFolder.add(camUtils, 'invertRows');
  invertRows.onChange(function() {
    camera.invertRows();
  });

  var invertColumns = cameraFolder.add(camUtils, 'invertColumns');
  invertColumns.onChange(function() {
  camera.invertColumns();
  });

  var rotate45 = cameraFolder.add(camUtils, 'rotate45');
  rotate45.onChange(function() {
    camera.rotate();
  });

  var rotate = cameraFolder.add(camera, 'angle', 0, 360).step(1).listen();

  cameraFolder.open();

  // of course we can do everything from lesson 01!
  var stackFolder = gui.addFolder('Stack');
  stackFolder.add(stackHelper, 'index', 0, stackHelper.stack.dimensionsIJK.z - 1).step(1).listen();
  stackFolder.add(stackHelper.slice, 'interpolation', 0, 1 ).step( 1 ).listen();
  stackFolder.open();
}

// Start animation loop
function animate() {
    controls.update();
    renderer.render(scene, camera);

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }
animate();

// Setup loader
var loader = new LoadersVolume(container);

var t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336'
];
var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

// load sequence for each file
// 1- fetch
// 2- parse
// 3- add to array
var seriesContainer = [];
var loadSequence = [];
files.forEach(function(url) {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(function() {
        return loader.fetch(url);
      })
      .then(function(data) {
        return loader.parse(data);
      })
      .then(function(series) {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

// once all files have been loaded (fetch + parse + add to array)
// merge them into series / stacks / frames
Promise
.all(loadSequence)
  .then(function() {
    loader.free();
    loader = null;

    // merge files into clean series/stack/frame structure
    var series = seriesContainer[0].mergeSeries(seriesContainer);
    var stack = series[0].stack[0];
    // be carefull that series and target stack exist!
    var stackHelper = new HelpersStack(stack);
    // stackHelper.orientation = 2;
    // stackHelper.index = 56;

    // tune bounding box
    stackHelper.bbox.visible = false;

    //tune slice border
    stackHelper.border.color = 0xFF9800;
    //stackHelper.border.visible = false;

    scene.add(stackHelper);

    // build the gui
    gui(stackHelper);

    // center camera and interactor to center of bouding box
    // for nicer experience
    // set camera
    var worldbb = stack.worldBoundingBox();
    var lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    // box: {halfDimensions, center}
    var bbox = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
    };

    // init and zoom
    var canvas = {
        width: container.clientWidth,
        height: container.clientHeight
      };
    camera.init(stack.xCosine, stack.yCosine, stack.zCosine, controls, bbox, canvas, stack.referenceSpace);
    camera.fitBox(2);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

