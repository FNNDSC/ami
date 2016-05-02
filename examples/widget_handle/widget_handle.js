/* globals Stats, dat*/

// promises polyfill from the babel team
import 'babel-polyfill';

import HelpersStack      from '../../src/helpers/helpers.stack';
import HelpersVoxel      from '../../src/helpers/helpers.voxel';
import LoadersVolume     from '../../src/loaders/loaders.volume';
import WidgetsHandle     from '../../src/widgets/widgets.handle';
import WidgetsRuler      from '../../src/widgets/widgets.ruler';
import ControlsTrackball from '../../src/controls/controls.trackball';

// standard global variables
let controls, renderer, threeD, stats, scene, camera, handle0, handle1, helpersVoxel, directions, bbox, line, lineDOM, distanceDOM, handles;
let widgets = [];
function init() {
  // this function is executed on each animation frame
  function animate() {

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

    threeD.addEventListener('mouseup', function(evt){
      // if something hovered, exit
      for(let widget of widgets){
        window.console.log(widget);
        if(widget.active){
          widget.onEnd(evt);
          return;
        }
      }

    });

    threeD.addEventListener('mousemove', function(evt){
      // if something hovered, exit
      var cursor = 'default';

      for(let widget of widgets){
        widget.onMove(evt);
        if(widget.hovered){
          cursor = 'pointer';
        }
      }

      threeD.style.cursor = cursor;

    });

    // add on mouse down listener, to add handles/etc. if not hovering anything..
    threeD.addEventListener('mousedown', function(evt){
      // if something hovered, exit
      for(let widget of widgets){
        if(widget.hovered){
          widget.onStart(evt);
          return;
        }
      }

      threeD.style.cursor = 'default';

      // mouse position
      let mouse = {
        x: (evt.clientX / threeD.offsetWidth) * 2 - 1,
        y: -(event.clientY / threeD.offsetHeight) * 2 + 1
      };

      // update the raycaster
      let raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObject(stackHelper.slice.mesh);

      if(intersects.length <= 0){
        return;
      }

      var widgetType = widgets.length % 4;
      if(widgetType === 0){
        // add ruler
        let widget = new WidgetsRuler(stackHelper.slice.mesh, controls, camera, threeD);
        widget.worldPosition = intersects[0].point;

        widgets.push(widget);
        scene.add(widget);
      }
      else if(widgetType === 1){
        // add handle
        let widget = new WidgetsHandle(stackHelper.slice.mesh, controls, camera, threeD);
        widget.worldPosition = intersects[0].point;
        widget.hovered = true;

        widgets.push(widget);
        scene.add(widget);
      }
      else if(widgetType === 2){
        // add  "FREE" ruler
        let widget = new WidgetsRuler(null, controls, camera, threeD);
        // OK for now but what if no intersection?
        widget.worldPosition = intersects[0].point;

        widgets.push(widget);
        scene.add(widget);
      }
      else{
        // add "FREE" handle
        let widget = new WidgetsHandle(null, controls, camera, threeD);
        // OK for now but what if no intersection?
        widget.worldPosition = intersects[0].point;

        widgets.push(widget);
        scene.add(widget);
      }
    });

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
