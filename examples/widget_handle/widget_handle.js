/* globals Stats, dat*/

// promises polyfill from the babel team
import 'babel-polyfill';

import HelpersStack      from '../../src/helpers/helpers.stack';
import HelpersVoxel      from '../../src/helpers/helpers.voxel';
import LoadersVolume     from '../../src/loaders/loaders.volume';
import WidgetsHandle     from '../../src/widgets/widgets.handle';
import ControlsTrackball from '../../src/controls/controls.trackball';

// standard global variables
let controls, renderer, threeD, stats, scene, camera, handle0, handle1, helpersVoxel, directions, bbox, line, lineDOM, distanceDOM;

function init() {
  // this function is executed on each animation frame
  function animate() {

    //
    // re-draw the line
    if(handle0 && handle0._mesh && handle1 && handle1._mesh){
      // line.geometry.vertices[0] = handle0._mesh.position;
      // line.geometry.vertices[1] = handle1._mesh.position;
      // line.geometry.verticesNeedUpdate = true;


      // draw DOM line
      var x1 = handle0._screenPosition.x;
      var y1 = handle0._screenPosition.y; 
      var x2 = handle1._screenPosition.x;
      var y2 = handle1._screenPosition.y;

      var x0 = x1 + (x2 - x1)/2;
      var y0 = y1 + (y2 - y1)/2;

      var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
      var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      let posY = y1 - threeD.offsetHeight;
      var transform = 'translate3D(' + x1 +'px,' + posY + 'px, 0)';
      transform += ' rotate('+angle+'deg)';

      lineDOM.style.transform = transform;
      lineDOM.style.width = length;

      // update distance content
      let w0 = handle0._worldPosition;
      let w1 = handle1._worldPosition;

      distanceDOM.innerHTML = Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2);
      let posY0 = y0 - threeD.offsetHeight - distanceDOM.offsetHeight/2;
      x0 -= distanceDOM.offsetWidth/2;

      var transform2 = 'translate3D(' + Math.round(x0) +'px,' + Math.round(posY0) + 'px, 0)';
      distanceDOM.style.transform = transform2;

    }

    // render
    controls.update();
    renderer.render(scene, camera);
    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor(0xFFFFFF, 1);

  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // scene
  scene = new THREE.Scene();
  
  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
  camera.position.x = 150;
  camera.position.y = 50;
  camera.position.z = 50;
  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 1.4;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  animate();
}

window.onload = function() {
  // init threeJS...
  init();

  let file = 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/36749894';

  let loader = new LoadersVolume(threeD);
  // Start off with a promise that always resolves
  let sequence = Promise.resolve();
  sequence
  // fetch the file
  .then(function() {
    return loader.fetch(file);
  })
  .then(function(data) {
    return loader.parse(data);
  })
  .then(function(series) {

    loader.free();
    loader = null;

    let stack = series._stack[0];
    let stackHelper = new HelpersStack(stack);

    scene.add(stackHelper);

    window.console.log(stackHelper.stack.worldCenter());

    // LINE STUFF
    // var materialLine = new THREE.LineBasicMaterial();
    // var geometryLine = new THREE.Geometry();
    // geometryLine.vertices.push(stackHelper.stack.worldCenter());
    // geometryLine.vertices.push(stackHelper.stack.worldCenter());
    // geometryLine.verticesNeedUpdate = true;
    // line = new THREE.Line(geometryLine, materialLine);
    // scene.add(line);


    // dom
    lineDOM = document.createElement('div');
    lineDOM.setAttribute('id', 'lineDOM');
    lineDOM.setAttribute('class', 'widgets handle line');
    lineDOM.style.backgroundColor = '#353535';
    lineDOM.style.position = 'absolute';
    lineDOM.style.transformOrigin = '0 100%';
    lineDOM.style.marginTop = '-1px';
    lineDOM.style.height = '2px';
    lineDOM.style.width = '3px';

    // add it!
    threeD.appendChild(lineDOM);

    // distance
    distanceDOM = document.createElement('div');
    distanceDOM.setAttribute('id', 'distanceDOM');
    distanceDOM.setAttribute('class', 'widgets handle distance');
    distanceDOM.style.border = '2px solid #353535';
    distanceDOM.style.backgroundColor = '#F9F9F9';
    //distanceDOM.style.backgroundColor = 'rgba(230, 230, 230, 0.7)';
    distanceDOM.style.color = '#353535';
    distanceDOM.style.padding = '4px';
    distanceDOM.style.position = 'absolute';
    distanceDOM.style.transformOrigin = '0 100%';

    distanceDOM.innerHTML = 'Hello, world!';

    // add it!
    threeD.appendChild(distanceDOM);

    handle0 = new WidgetsHandle(stackHelper.slice.mesh, controls, camera, threeD);
    scene.add(handle0);

    handle0.added = function(){
      // add it at the same location but make it active!
      handle1 = new WidgetsHandle(stackHelper.slice.mesh, controls, camera, threeD, handle0._worldPosition, true);
      scene.add(handle1);
    }

    //
    let centerLPS = stack.worldCenter();

    bbox = stack.dimensionsIJK;

    // update camrea's and interactor's target
    // update camera's target
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
  });
};
