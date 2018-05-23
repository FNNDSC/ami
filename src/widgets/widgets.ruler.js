import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

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
    this._moving = false;
    this._domHovered = false;
    this._hovered = false;
    this._worldPosition = this._targetMesh !== null ? this._targetMesh.position : new Vector3();

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

    // first handle
    this.imoveHandle =
        new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    this.imoveHandle.worldPosition = this._worldPosition;
    this.imoveHandle.hovered = true;
    this.add(this.imoveHandle);
    this._handles.push(this.imoveHandle);
    this.imoveHandle.hide();

    this.fmoveHandle =
       new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
    this.fmoveHandle.worldPosition = this._worldPosition;
    this.fmoveHandle.hovered = true;
    this.add(this.fmoveHandle);
    this._handles.push(this.fmoveHandle);
    this.fmoveHandle.hide();

    // Create ruler
    this.create();
    this.initOffsets();

    this.onMove = this.onMove.bind(this);
    this.onEndControl = this.onEndControl.bind(this);
    this.onHover = this.onHover.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('wheel', this.onMove);

    this._controls.addEventListener('end', this.onEndControl);

    this._line.addEventListener('mouseenter', this.onHover);
    this._line.addEventListener('mouseleave', this.onHover);
    this._distance.addEventListener('mouseenter', this.onHover);
    this._distance.addEventListener('mouseleave', this.onHover);
  }

  removeEventListeners() {
    this._container.removeEventListener('wheel', this.onMove);

    this._controls.removeEventListener('end', this.onEndControl);

    this._line.removeEventListener('mouseenter', this.onHover);
    this._line.removeEventListener('mouseleave', this.onHover);
    this._distance.removeEventListener('mouseenter', this.onHover);
    this._distance.removeEventListener('mouseleave', this.onHover);
  }

  onHover(evt) {
      if (evt) {
        this._lastEvent = evt;
        evt.preventDefault();
        this.hoverDom(evt);
      }

      this.hoverMesh();

      this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._domHovered;
      this._container.style.cursor = this._hovered ? 'pointer' : 'default';
  }

  hoverMesh() {
      // check raycast intersection, do we want to hover on mesh or just css?
  }

  hoverDom(evt) {
      this._domHovered = (evt.type === 'mouseenter');
  }

  onMove(evt) {
    this._lastEvent = evt;
    this._dragged = true;

    if (this._active) {
      this.fmoveHandle.onMove(evt, true);

      if (this._moving) {
        this._handles.slice(0, -2).forEach(function(elem, ind) {
          this._handles[ind].worldPosition.x = elem.worldPosition.x
            + (this.fmoveHandle.worldPosition.x - this.imoveHandle.worldPosition.x);
          this._handles[ind].worldPosition.y = elem.worldPosition.y
            + (this.fmoveHandle.worldPosition.y - this.imoveHandle.worldPosition.y);
          this._handles[ind].worldPosition.z = elem.worldPosition.z
            + (this.fmoveHandle.worldPosition.z - this.imoveHandle.worldPosition.z);
        }, this);
      }

      this.imoveHandle.onMove(evt, true);
    }

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._domHovered;

    this.update();
  }

  onStart(evt) {
    this._lastEvent = evt;
    this._dragged = false;

    this.imoveHandle.onMove(evt, true);

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active || this._domHovered;

    if (this._domHovered) {
      this._moving = true;
      this._controls.enabled = false;
    }

    this.update();
  }

  onEnd(evt) {
    this._lastEvent = evt;
    // First Handle
    this._handles[0].onEnd(evt);

    this._moving = false;
    this._controls.enabled = true;

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else {
      this._handles[1].tracking = false;
    }

    // State of ruler widget
    if (!this._dragged && this._active) {
      this._selected = !this._selected; // change state if there was no dragging
      this._handles[0].selected = this._selected;
      this._handles[1].selected = this._selected;
    }
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
    this._handles.forEach(function(elem) {
      elem.hideDOM();
    });
  }

  showDOM() {
    this._line.style.display = '';
    this._distance.style.display = '';
    this._handles.forEach(function(elem) {
      elem.showDOM();
    });
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
    this._line.style.width = length + 'px';

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
    this.removeEventListeners();

    this._handles.forEach((h) => {
      h.free();
    });
    this._handles = [];

    this._container.removeChild(this._line);
    this._container.removeChild(this._distance);

    // mesh, geometry, material
    this.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._mesh.geometry = null;
    this._mesh.material.dispose();
    this._mesh.material = null;
    this._mesh = null;
    this._geometry.dispose();
    this._geometry = null;
    this._material.vertexShader = null;
    this._material.fragmentShader = null;
    this._material.uniforms = null;
    this._material.dispose();
    this._material = null;

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
