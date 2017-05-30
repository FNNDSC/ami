import WidgetsBase from '../widgets/widgets.base';
import WidgetsHandle from '../widgets/widgets.handle';

/**
 * @module widgets/handle
 *
 */

export default class WidgetsRuler extends WidgetsBase {

  constructor(targetMesh, controls, camera, container) {
    super(container);

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;

    this._active = true;
    this._lastEvent = null;

    this._worldPosition = new THREE.Vector3();
    if (this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // dom stuff
    this._line = null;
    this._distance = null;

    // add handles
    this._handles = [];

    // first handle
    let firstHandle =
      new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    firstHandle.worldPosition = this._worldPosition;
    firstHandle.hovered = true;
    this.add(firstHandle);

    this._handles.push(firstHandle);

    let secondHandle =
      new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    secondHandle.worldPosition = this._worldPosition;
    secondHandle.hovered = true;
    // active and tracking might be redundant
    secondHandle.active = true;
    secondHandle.tracking = true;
    this.add(secondHandle);

    this._handles.push(secondHandle);

    // Create ruler
    this.create();
    this.initOffsets();

    this.onMove = this.onMove.bind(this);
    this.onEndControl = this.onEndControl.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);

    this._controls.addEventListener('end', this.onEndControl);
  }

  removeEventListeners() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);

    this._controls.removeEventListener('end', this.onEndControl);
  }

  onMove(evt) {
    this._lastEvent = evt;
    this._dragged = true;

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered;
    this.update();
  }

  onStart(evt) {
    this._lastEvent = evt;
    this._dragged = false;

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  onEnd(evt) {
    this._lastEvent = evt;
    // First Handle
    this._handles[0].onEnd(evt);

    // window.console.log(this);

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else {
      this._handles[1].tracking = false;
    }

    // State of ruler widget
    this._active = this._handles[0].active || this._handles[1].active;
    this.update();
  }

  onEndControl() {
    if (!this._lastEvent) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.onMove(this._lastEvent);
    });
  }

  create() {
    this.createMesh();
    this.createDOM();
  }

  hideDOM() {
    this._line.style.display = 'none';
    this._distance.style.display = 'none';
    for (let index in this._handles) {
      this._handles[index].hideDOM();
    }
  }

  showDOM() {
    this._line.style.display = '';
    this._distance.style.display = '';
    for (let index in this._handles) {
      this._handles[index].showDOM();
    }
  }

  hideMesh() {
    this.visible = false;
  }

  showMesh() {
    this.visible = true;
  }

  show() {
    this.showDOM();
    this.showMesh();
  }

  hide() {
    this.hideDOM();
    this.hideMesh();
  }

  update() {
    this.updateColor();

    // update handles
    this._handles[0].update();
    this._handles[1].update();

    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  createMesh() {
    // geometry
    this._geometry = new THREE.Geometry();
    this._geometry.vertices.push(this._handles[0].worldPosition);
    this._geometry.vertices.push(this._handles[1].worldPosition);

    // material
    this._material = new THREE.LineBasicMaterial();
    this.updateMeshColor();

    // mesh
    this._mesh = new THREE.Line(this._geometry, this._material);
    this._mesh.visible = true;

    // add it!
    this.add(this._mesh);
  }

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if (this._geometry) {
      this._geometry.verticesNeedUpdate = true;
    }
  }

  createDOM() {
    // add line!
    this._line = document.createElement('div');
    this._line.setAttribute('id', this.uuid);
    this._line.setAttribute('class', 'AMI Widget Ruler');
    this._line.style.position = 'absolute';
    this._line.style.transformOrigin = '0 100%';
    this._line.style.marginTop = '-1px';
    this._line.style.height = '2px';
    this._line.style.width = '3px';
    this._container.appendChild(this._line);

    // add distance!
    this._distance = document.createElement('div');
    this._distance.setAttribute('class', 'widgets handle distance');
    this._distance.style.border = '2px solid';
    this._distance.style.backgroundColor = '#F9F9F9';
    // this._distance.style.opacity = '0.5';
    this._distance.style.color = '#353535';
    this._distance.style.padding = '4px';
    this._distance.style.position = 'absolute';
    this._distance.style.transformOrigin = '0 100%';
    this._distance.innerHTML = 'Hello, world!';
    this._container.appendChild(this._distance);

    this.updateDOMColor();
  }

  updateDOMPosition() {
    // update rulers lines and text!
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    //let x0 = x1 + (x2 - x1)/2;
    //let y0 = y1 + (y2 - y1)/2;
    let x0 = x2;
    let y0 = y2;

    if (y1 >= y2) {
      y0 = y2 - 30;
    } else {
      y0 = y2 + 30;
    }

    let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    this._line.style.transform = transform;
    this._line.style.width = length;

    // update distance
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    this._distance.innerHTML =
      `${
        Math.sqrt(
          (w0.x-w1.x)*(w0.x-w1.x) +
          (w0.y-w1.y)*(w0.y-w1.y) +
          (w0.z-w1.z)*(w0.z-w1.z)
        ).toFixed(2)} mm`;
    let posY0 =
      y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
    x0 -= this._distance.offsetWidth/2;

    let transform2 =
      `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
    this._distance.style.transform = transform2;
  }

  updateDOMColor() {
    this._line.style.backgroundColor = `${this._color}`;
    this._distance.style.borderColor = `${this._color}`;
  }

  free() {
    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);

    this._handles.forEach((h) => {
      h.free();
    });

    this._handles = [];

    this._container.removeChild(this._line);
    this._container.removeChild(this._distance);

    this.remove(this._mesh);

    super.free();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._worldPosition = worldPosition;
    this._handles[0].worldPosition = this._worldPosition;
    this._handles[1].worldPosition = this._worldPosition;

    this.update();
  }

}
