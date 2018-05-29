/**
 * @module helpers/x/renderer3d
 */
import ControlsTrackball from '../../controls/controls.trackball';

export default class {
  constructor(containerId='r3d') {
    this._container = null;
    this._renderer = null;
    this._camera = null;
    this._controls = null;
    this._scene = null;

    this._initRenderer(containerId);
    this._initCamera();
    this._initScene();
    this._initControls();

    // setup event listeners
    this._onWindowResize = this._onWindowResize.bind(this);
    this.addEventListeners();
  }

  set container(container) {
    this._container = container;
  }

  get container() {
    return this._container;
  }

  add(obj) {
    this._scene.add(obj);
  }

  addEventListeners() {
    window.addEventListener('resize', this._onWindowResize, false);
  }

  removeEventListeners() {
    window.removeEventListener('resize', this._onWindowResize, false);
  }

  center(worldPosition) {
    // update camrea's and control's target
    this._camera.lookAt(worldPosition.x, worldPosition.y, worldPosition.z);
    this._camera.updateProjectionMatrix();
    this._controls.target.set(worldPosition.x, worldPosition.y,
      worldPosition.z);
  }

  render() {
    this._controls.update();
    this._renderer.render(this._scene, this._camera);
  }

  animate() {
    this.render();

    // request new frame
    requestAnimationFrame(this.animate.bind(this));
  }

  // private methods

  _onWindowResize() {
    this._camera.aspect =
      this._container.clientWidth / this._container.clientHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(this._container.clientWidth,
      this._container.clientHeight);
  }

  _initRenderer(containerId) {
    // renderer
    this._container = document.getElementById(containerId);
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._renderer.setSize(this._container.clientWidth,
      this._container.clientHeight);
    this._renderer.setClearColor(0x424242, 1);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._container.appendChild(this._renderer.domElement);
  }

  _initCamera() {
    this._camera = new THREE.PerspectiveCamera(45,
      this._container.clientWidth / this._container.clientHeight, 1, 10000000);
    this._camera.position.x = 250;
    this._camera.position.y = 250;
    this._camera.position.z = 250;
  }

  _initScene() {
    // add some lights to the scene by default
    this._scene = new THREE.Scene();

    // ambient
    this._scene.add(new THREE.AmbientLight(0x353535));

    // directional 1
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(200, 200, 1000).normalize();
    this._scene.add(directionalLight);

    // directional 2
    let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-200, -200, -1000).normalize();
    this._scene.add(directionalLight2);
  }

  _initControls() {
    // controls
    this._controls = new ControlsTrackball(this._camera, this._container);
    this._controls.rotateSpeed = 1.4;
    this._controls.zoomSpeed = 1.2;
    this._controls.panSpeed = 0.8;
  }
}
