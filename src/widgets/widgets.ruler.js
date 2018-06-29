import {widgetsBase} from './widgets.base';
import {widgetsHandle as widgetsHandleFactory} from './widgets.handle';

/**
 * @module widgets/ruler
 */
const widgetsRuler = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
  constructor(targetMesh, controls, stack) {
    super(targetMesh, controls);

    this._stack = stack;

    this._widgetType = 'Ruler';
    this._moving = false;
    this._domHovered = false;

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // dom stuff
    this._line = null;
    this._label = null;

    this._distance = null;

    // add handles
    this._handles = [];
    const WidgetsHandle = widgetsHandleFactory(three);

    let handle;
    for (let i = 0; i < 2; i++) {
      handle = new WidgetsHandle(targetMesh, controls);
      handle.worldPosition.copy(this._worldPosition);
      this.add(handle);
      this._handles.push(handle);
    }
    this._handles[1].active = true;
    this._handles[1].tracking = true;

    this._moveHandle = new WidgetsHandle(targetMesh, controls);
    this._moveHandle.worldPosition.copy(this._worldPosition);
    this.add(this._moveHandle);
    this._handles.push(this._moveHandle);
    this._moveHandle.hide();

    this.create();

    this.onMove = this.onMove.bind(this);
    this.onHover = this.onHover.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._container.addEventListener('wheel', this.onMove);

    this._line.addEventListener('mouseenter', this.onHover);
    this._line.addEventListener('mouseleave', this.onHover);
    this._label.addEventListener('mouseenter', this.onHover);
    this._label.addEventListener('mouseleave', this.onHover);
  }

  removeEventListeners() {
    this._container.removeEventListener('wheel', this.onMove);

    this._line.removeEventListener('mouseenter', this.onHover);
    this._line.removeEventListener('mouseleave', this.onHover);
    this._label.removeEventListener('mouseenter', this.onHover);
    this._label.removeEventListener('mouseleave', this.onHover);
  }

  onHover(evt) {
      if (evt) {
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

  onStart(evt) {
    this._moveHandle.onMove(evt, true);

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active || this._domHovered;

    if (this._domHovered && !this._handles[1].tracking) {
      this._moving = true;
      this._controls.enabled = false;
    }

    this.update();
  }

  onMove(evt) {
    if (this._active) {
      const prevPosition = this._moveHandle.worldPosition.clone();

      this._dragged = true;
      this._moveHandle.onMove(evt, true);

      if (this._moving) {
        this._handles.slice(0, -1).forEach(function(elem, ind) {
          this._handles[ind].worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
        }, this);
      }
    } else {
        this.onHover(null);
    }

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this.update();
  }

  onEnd() {
    this._handles[0].onEnd(); // First Handle

    if (this._handles[1].tracking &&
      this._handles[0].screenPosition.distanceTo(this._handles[1].screenPosition) < 10
    ) {
      return;
    }

    if (!this._dragged && this._active && !this._handles[1].tracking) {
      this._selected = !this._selected; // change state if there was no dragging
      this._handles[0].selected = this._selected;
    }

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd();
    } else {
      this._handles[1].tracking = false;
    }
    this._handles[1].selected = this._selected;

    this._active = this._handles[0].active || this._handles[1].active;
    this._dragged = false;
    this._moving = false;
    this.update();
  }

  create() {
    this.createMesh();
    this.createDOM();
  }

  createMesh() {
    // geometry
    this._geometry = new three.Geometry();
    this._geometry.vertices.push(this._handles[0].worldPosition);
    this._geometry.vertices.push(this._handles[1].worldPosition);

    // material
    this._material = new three.LineBasicMaterial();

    this.updateMeshColor();

    // mesh
    this._mesh = new three.Line(this._geometry, this._material);
    this._mesh.visible = true;

    this.add(this._mesh);
  }

  createDOM() {
    this._line = document.createElement('div');
    this._line.setAttribute('class', 'widgets-line');
    this._container.appendChild(this._line);

    this._label = document.createElement('div');
    this._label.setAttribute('class', 'widgets-label');
    this._container.appendChild(this._label);

    this.updateDOMColor();
  }

  hideDOM() {
    this._line.style.display = 'none';
    this._label.style.display = 'none';
    this._handles.forEach(function(elem) {
      elem.hideDOM();
    });
  }

  showDOM() {
    this._line.style.display = '';
    this._label.style.display = '';
    this._handles[0].showDOM();
    this._handles[1].showDOM();
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

  updateDOMPosition() {
    // update line
    const lineData = this.getLineData(this._handles[0].screenPosition, this._handles[1].screenPosition);

    this._line.style.transform =`translate3D(${lineData.transformX}px, ${lineData.transformY}px, 0)
      rotate(${lineData.transformAngle}rad)`;
    this._line.style.width = lineData.length + 'px';

    // update label
    this._distance = this._handles[1].worldPosition.distanceTo(this._handles[0].worldPosition);

    const units = this._stack.frame[0].pixelSpacing === null ? 'units' : 'mm',
      title = units === 'units' ? 'Calibration is required to display the distance in mm' : '';

    if (title !== '') {
      this._label.setAttribute('title', title);
      this._label.style.color = this._colors.error;
    } else {
      this._label.removeAttribute('title');
      this._label.style.color = this._colors.text;
    }
    this._label.innerHTML = `${this._distance.toFixed(2)} ${units}`;

    let angle = Math.abs(lineData.transformAngle);
    if (angle > Math.PI / 2) {
      angle = Math.PI - angle;
    }

    const labelPadding = Math.tan(angle) < this._label.offsetHeight / this._label.offsetWidth
        ? (this._label.offsetWidth / 2) / Math.cos(angle) + 15 // 5px for each handle + padding
        : (this._label.offsetHeight / 2) / Math.cos(Math.PI / 2 - angle) + 15,
      paddingVector = lineData.line.normalize().multiplyScalar(labelPadding),
      paddingPoint = lineData.length > labelPadding * 2
        ? this._handles[1].screenPosition.clone().sub(paddingVector)
        : this._handles[1].screenPosition.clone().add(paddingVector),
      transform = this.adjustLabelTransform(this._label, paddingPoint);

    this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;
  }

  updateDOMColor() {
    this._line.style.backgroundColor = this._color;
    this._label.style.borderColor = this._color;
  }

  free() {
    this.removeEventListeners();

    this._handles.forEach((h) => {
      this.remove(h);
      h.free();
    });
    this._handles = [];

    this._container.removeChild(this._line);
    this._container.removeChild(this._label);

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

  get targetMesh() {
    return this._targetMesh;
  }

  set targetMesh(targetMesh) {
    this._targetMesh = targetMesh;
    this._handles.forEach(function(elem) {
      elem.targetMesh = targetMesh;
    });
    this.update();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._handles[0].worldPosition.copy(worldPosition);
    this._handles[1].worldPosition.copy(worldPosition);
    this._worldPosition.copy(worldPosition);
    this.update();
  }
  };
};

export {widgetsRuler};
export default widgetsRuler();
