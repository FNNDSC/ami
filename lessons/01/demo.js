/* globals Stats, dat, AMI*/

// VJS classes we will be using in this lesson
var LoadersVolume     = AMI.default.Loaders.Volume;
var ControlsTrackball = AMI.default.Controls.Trackball;
var HelpersStack      = AMI.default.Helpers.Stack;

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
var  camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.01, 10000000);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 100;

// Setup controls
var controls = new ControlsTrackball(camera, container);

// handle resize
function onWindowResize() {

  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);

}
window.addEventListener('resize', onWindowResize, false);

// build GUI
function gui(stackHelper){

  var stack = stackHelper.stack;
  var gui = new dat.GUI({
            autoPlace: false
  });
  var customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);

  //stack
  var stackFolder = gui.addFolder('Stack');
  // index range depends on stackHelper orientation.
  var index = stackFolder.add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();
  var orientation = stackFolder.add(stackHelper, 'orientation', 0, 2).step(1).listen();
  orientation.onChange(function(value){
    //update index max
    if(value === 0){
      index.__max = stack.dimensionsIJK.z - 1;
    }
    else if(value === 1){
      index.__max = stack.dimensionsIJK.x - 1
    }
    else if(value === 2){
      index.__max = stack.dimensionsIJK.y - 1
    }

    // center index
    stackHelper.index = Math.floor(index.__max/2);
  });
  stackFolder.open();

  // slice
  var sliceFolder = gui.addFolder('Slice');
  sliceFolder.add(stackHelper.slice, 'windowWidth', 1, stack.minMax[1] - stack.minMax[0]).step(1).listen();
  sliceFolder.add(stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1]).step(1).listen();
  sliceFolder.add(stackHelper.slice, 'intensityAuto').listen();
  sliceFolder.add(stackHelper.slice, 'invert');
  sliceFolder.open();

  // bbox
  var bboxFolder = gui.addFolder('Bounding Box');
  bboxFolder.add(stackHelper.bbox, 'visible');
  bboxFolder.addColor(stackHelper.bbox, 'color');
  bboxFolder.open();

  // border
  var borderFolder = gui.addFolder('Border');
  borderFolder.add(stackHelper.border, 'visible');
  borderFolder.addColor(stackHelper.border, 'color');
  borderFolder.open();
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
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36444420', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856'
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
    stackHelper.bbox.color = 0x8BC34A;
    stackHelper.border.color = 0xF44336;

    scene.add(stackHelper);

    // build the gui
    gui(stackHelper);

    // center camera and interactor to center of bouding box
    // for nicer experience
    var centerLPS = stackHelper.stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

