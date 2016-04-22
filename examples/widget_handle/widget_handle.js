/* globals Stats, dat*/

// promises polyfill from the babel team
import 'babel-polyfill';

import HelpersStack      from '../../src/helpers/helpers.stack';
import HelpersVoxel      from '../../src/helpers/helpers.voxel';
import LoadersVolume     from '../../src/loaders/loaders.volume';
import WidgetsHandle     from '../../src/widgets/widgets.handle';
import ControlsTrackball from '../../src/controls/controls.trackball';

// standard global variables
let controls, renderer, threeD, stats, scene, camera, handle0, handle1, helpersVoxel, directions, bbox, line, lineDOM, distanceDOM, handles;
let rulers = [];
function init() {
  // this function is executed on each animation frame
  function animate() {

    for(let ruler of rulers){
      //update rulers lines and text!
      var x1 = ruler.handles[0].screenPosition.x;
      var y1 = ruler.handles[0].screenPosition.y; 
      var x2 = ruler.handles[1].screenPosition.x;
      var y2 = ruler.handles[1].screenPosition.y;

      var x0 = x1 + (x2 - x1)/2;
      var y0 = y1 + (y2 - y1)/2;

      var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
      var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      
      let posY = y1 - threeD.offsetHeight;

      // update line
      let transform = `translate3D(${x1}px,${posY}px, 0)`;
      transform += ` rotate(${angle}deg)`;

      ruler.line.style.transform = transform;
      ruler.line.style.width = length;

      // update distance
      let w0 = ruler.handles[0].worldPosition;
      let w1 = ruler.handles[1].worldPosition;

      ruler.distance.innerHTML = `${Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2)} mm`;
      let posY0 = y0 - threeD.offsetHeight - ruler.distance.offsetHeight/2;
      x0 -= ruler.distance.offsetWidth/2;

      var transform2 = `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
      ruler.distance.style.transform = transform2;
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

    // add on mouse down listener, to add handles/etc. if not hovering anything..
    threeD.addEventListener('mousedown', function(evt){
      // if something hovered, exit
      for(let ruler of rulers){
        for(let handle of ruler.handles){
          if(handle.hovered){
            // handle.onStart(evt);
            return;
          }
        }
      }

      // nothing hovered, add it if we intersect target!
      let mouse = {
        x: (evt.clientX / threeD.offsetWidth) * 2 - 1,
        y: -(event.clientY / threeD.offsetHeight) * 2 + 1,
        screenX: evt.clientX,
        screenY: evt.clientY
      };

      // update the raycaster
      let raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      let intersectsTarget = raycaster.intersectObject(stackHelper.slice.mesh);
      if(intersectsTarget.length > 0){
        // line should be:
        //dom.line
        //dome.distance
        //distance
        let ruler = {
          handles: [],
          line: null,
          distance: null
        };

        // add handles
        let firstHandle = new WidgetsHandle(stackHelper.slice.mesh, controls, camera, threeD);
        firstHandle.worldPosition = intersectsTarget[0].point;
        firstHandle.hovered = true;
        scene.add(firstHandle);
        
        ruler.handles.push(firstHandle);

        let secondHandle = new WidgetsHandle(stackHelper.slice.mesh, controls, camera, threeD);
        secondHandle.worldPosition = firstHandle.worldPosition;
        secondHandle.hovered = true;
        secondHandle.active = true;
        scene.add(secondHandle);
        
        ruler.handles.push(secondHandle);

        // add line!
        let line = document.createElement('div');
        line.setAttribute('class', 'widgets handle line');
        line.style.backgroundColor = '#353535';
        line.style.position = 'absolute';
        line.style.transformOrigin = '0 100%';
        line.style.marginTop = '-1px';
        line.style.height = '2px';
        line.style.width = '3px';
        threeD.appendChild(line);

        ruler.line = line;

        // add distance!
        let distance = document.createElement('div');
        distance.setAttribute('class', 'widgets handle distance');
        distance.style.border = '2px solid #353535';
        distance.style.backgroundColor = '#F9F9F9';
        distance.style.color = '#353535';
        distance.style.padding = '4px';
        distance.style.position = 'absolute';
        distance.style.transformOrigin = '0 100%';
        distance.innerHTML = 'Hello, world!';
        threeD.appendChild(distance);

        ruler.distance = distance;

        // push ruler!
        rulers.push(ruler);
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
