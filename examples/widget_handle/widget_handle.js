/* globals Stats, dat*/

import ControlsTrackball from 'base/controls/controls.trackball';
import HelpersStack from 'base/helpers/helpers.stack';
import LoadersVolume from 'base/loaders/loaders.volume';
import WidgetsAnnotation from 'base/widgets/widgets.annotation';
import WidgetsAngle from 'base/widgets/widgets.angle';
import WidgetsBiRuler from 'base/widgets/widgets.biruler';
import WidgetsCrossRuler from 'base/widgets/widgets.crossRuler';
import WidgetsEllipse from 'base/widgets/widgets.ellipse';
import WidgetsFreehand from 'base/widgets/widgets.freehand';
import WidgetsHandle from 'base/widgets/widgets.handle';
import WidgetsPolygon from 'base/widgets/widgets.polygon';
import WidgetsRectangle from 'base/widgets/widgets.rectangle';
import WidgetsRuler from 'base/widgets/widgets.ruler';
import WidgetsVoxelProbe from 'base/widgets/widgets.voxelProbe';

// standard global variables
let controls;
let renderer;
let threeD;
let stats;
let scene;
let camera;
let offsets;
let widgets = [];
const widgetsAvailable = [
  'Handle',
  'VoxelProbe',
  'Ruler',
  'BiRuler',
  'CrossRuler',
  'Angle',
  'Rectangle',
  'Ellipse',
  'Polygon',
  'Freehand',
  'Annotation',
];
const guiObjects = {
  type: 'Handle',
};

function render() {
    // render
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
  renderer.setClearColor(0xFFFFFF, 1);

  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // scene
  scene = new THREE.Scene();

  // camera
  camera =
    new THREE.PerspectiveCamera(
      45, threeD.offsetWidth / threeD.offsetHeight,
      1, 10000000);
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
  camera.controls = controls;

  animate();
}

window.onload = function() {
  // init threeJS...
  init();

  const file =
    'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/36749894';

  const loader = new LoadersVolume(threeD);
  // Start off with a promise that always resolves
  loader.load(file)
  .then((series) => {
    const stack = series[0]._stack[0];
    loader.free();
    let stackHelper = new HelpersStack(stack);

    scene.add(stackHelper);

    threeD.addEventListener('mouseup', function() {
      // if something hovered, exit
      for (let widget of widgets) {
        if (widget.active) {
          widget.onEnd();
          return;
        }
      }
    });

    threeD.addEventListener('mousemove', function(evt) {
      // if something hovered, exit
      let cursor = 'default';
      for (let widget of widgets) {
        widget.onMove(evt);
        if (widget.hovered) {
          cursor = 'pointer';
        }
      }

      threeD.style.cursor = cursor;
    });

    threeD.addEventListener('mousedown', function(evt) {
      // if something hovered, exit
      for (let widget of widgets) {
        if (widget.hovered) {
          widget.onStart(evt);
          return;
        }
      }

      threeD.style.cursor = 'default';

      // mouse position
      let mouse = {
        x: (evt.clientX - offsets.left) / threeD.offsetWidth * 2 - 1,
        y: -((evt.clientY - offsets.top) / threeD.offsetHeight)
          * 2 + 1,
      };

      // update the raycaster
      let raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObject(stackHelper.slice.mesh);

      if (intersects.length <= 0) {
        return;
      }

      let widget = null;
      switch (guiObjects.type) {
        case 'Handle':
          widget = new WidgetsHandle(stackHelper.slice.mesh, controls);
          break;
        case 'VoxelProbe':
          widget = new WidgetsVoxelProbe(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Ruler':
          widget = new WidgetsRuler(stackHelper.slice.mesh, controls, stack);
          break;
        case 'WidgetsCrossRuler':
          widget = new WidgetsCrossRuler(stackHelper.slice.mesh, controls, stack);
          break;
        case 'BiRuler':
          widget = new WidgetsBiRuler(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Angle':
          widget = new WidgetsAngle(stackHelper.slice.mesh, controls);
          break;
        case 'Rectangle':
          widget = new WidgetsRectangle(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Ellipse':
          widget = new WidgetsEllipse(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Polygon':
          widget = new WidgetsPolygon(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Freehand':
          widget = new WidgetsFreehand(stackHelper.slice.mesh, controls, stack);
          break;
        case 'Annotation':
          widget = new WidgetsAnnotation(stackHelper.slice.mesh, controls);
          break;
        default:
          widget = new WidgetsHandle(stackHelper.slice.mesh, controls);
      }

      widget.worldPosition = intersects[0].point;
      widgets.push(widget);
      scene.add(widget);
    });

    function onWindowResize() {
      camera.aspect = threeD.clientWidth / threeD.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(threeD.clientWidth, threeD.clientHeight);

      // update offset
      const box = threeD.getBoundingClientRect();

      const body = document.body;
      const docEl = document.documentElement;

      const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      const scrollLeft =
        window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

      const clientTop = docEl.clientTop || body.clientTop || 0;
      const clientLeft = docEl.clientLeft || body.clientLeft || 0;

      const top = box.top + scrollTop - clientTop;
      const left = box.left + scrollLeft - clientLeft;

      offsets = {
        top: Math.round(top),
        left: Math.round(left),
      };

      // repaint all widgets
      for (let widget of widgets) {
        widget.update();
      }
    }

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    //
    const centerLPS = stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();

    const gui = new dat.GUI({
      autoPlace: false,
    });

    const widgetFolder = gui.addFolder('Widget');
    widgetFolder.add(guiObjects, 'type', widgetsAvailable);
    widgetFolder.open();

    const customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    // force first render
    render();
    // notify puppeteer to take screenshot
    const puppetDiv = document.createElement('div');
    puppetDiv.setAttribute('id', 'puppeteer');
    document.body.appendChild(puppetDiv);
  });
};
