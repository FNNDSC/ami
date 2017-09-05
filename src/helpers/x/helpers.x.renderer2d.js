/**
 * @module helpers/x/renderer2d
 */
import CamerasOrthographic from '../../cameras/cameras.orthographic';
import ControlsOrthographic from '../../controls/controls.trackballortho';

import {Vector3} from 'three';

export default class {
  constructor(containerId='r2d', orientation='default') {
    this._container = null;
    this._renderer = null;
    this._camera = null;
    this._controls = null;
    this._orientation = orientation;
    this._scene = null;
    this._object = null;

    this._initRenderer(containerId);
    this._initCamera();
    this._initScene();
    this._initControls();

    // setup event listeners
    this._onScroll = this._onScroll.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this.addEventListeners();
  }

  add(object) {
    this._object = object;
    this._scene.add(this._object);

    this._setupCamera(this._object.stack);
    this._orientCamera(this._object, this._orientation);

    this._object.canvasWidth = this._container.clientWidth;
    this._object.canvasHeight = this._container.clientHeight;
  }

  addEventListeners() {
    this._controls.addEventListener('OnScroll', this._onScroll, false);
    window.addEventListener('resize', this._onWindowResize, false);
  }

  removeEventListeners() {
    this._controls.removeEventListener('OnScroll', this._onScroll, false);
    window.removeEventListener('resize', this._onWindowResize, false);
  }

  animate() {
    this._controls.update();
    this._renderer.render(this._scene, this._camera);

    // request new frame
    requestAnimationFrame(this.animate.bind(this));
  }

  // private methods

  _initRenderer(containerId) {
    // renderer
    this._container = document.getElementById(containerId);
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._renderer.setSize(this._container.clientWidth,
      this._container.clientHeight);
    this._renderer.setClearColor(0x212121, 1);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._container.appendChild(this._renderer.domElement);
  }

  _initCamera() {
    this._camera = new CamerasOrthographic(this._container.clientWidth / -2,
      this._container.clientWidth / 2, this._container.clientHeight / 2,
      this._container.clientHeight / -2, 1, 1000);
  }

  _initScene() {
    this._scene = new THREE.Scene();
  }

  _initControls() {
    // controls
    this._controls = new ControlsOrthographic(this._camera, this._container);
    this._controls.staticMoving = true;
    this._controls.noRotate = true;
    this._camera.controls = this._controls;
  }

  _setupCamera(stack) {
    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    // box: {halfDimensions, center}
    let box = {
      center: stack.worldCenter().clone(),
      halfDimensions: new Vector3(lpsDims.x + 10, lpsDims.y + 10,
        lpsDims.z + 10),
    };

    // init and zoom
    let canvas = {
        width: this._container.clientWidth,
        height: this._container.clientHeight,
      };

    this._camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    this._camera.box = box;
    this._camera.canvas = canvas;
    this._camera.update();
    this._camera.fitBox(2);
  }

  _orientCamera(target, orientation='default') {
      this._camera.orientation = orientation;
      this._camera.update();
      this._camera.fitBox(2);
      target.orientation = this._camera.stackOrientation;
  }

  _onWindowResize() {
      this._camera.canvas = {
        width: this._container.clientWidth,
        height: this._container.clientHeight,
      };
      this._camera.fitBox(2);
      this._renderer.setSize(this._container.clientWidth,
        this._container.clientHeight);
      this._object.canvasWidth = this._container.clientWidth;
      this._object.canvasHeight = this._container.clientHeight;
  }

  _onScroll(event) {
    if (event.delta > 0) {
      if (this._object.index >= this._object.orientationMaxIndex) {
        return false;
      }
      this._object.index += 1;
    } else {
      if (this._object.index <= 0) {
        return false;
      }
      this._object.index -= 1;
    }
  }
}
