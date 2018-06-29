import {widgetsBase} from './widgets.base';
import {widgetsHandle as widgetsHandleFactory} from './widgets.handle';
import ModelsVoxel from '../models/models.voxel';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/voxelProbe
 */
const widgetsVoxelprobe = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
  constructor(targetMesh, controls, stack) {
    super(targetMesh, controls);

    this._stack = stack;

    this._widgetType = 'VoxelProbe';
    this._controls.enabled = false; // controls should be disabled for widgets with a single handle
    this._initialized = false; // set to true onEnd
    this._moving = false;

    // dom stuff
    this._label = null;
    this._domDisplayed = true;
    this._domHovered = false;

    // handle (represent voxel)
    const WidgetsHandle = widgetsHandleFactory(three);
    this._handle = new WidgetsHandle(targetMesh, controls);
    this._handle.worldPosition.copy(this._worldPosition);
    this.add(this._handle);

    this._moveHandle = new WidgetsHandle(targetMesh, controls);
    this._moveHandle.worldPosition.copy(this._worldPosition);
    this.add(this._moveHandle);
    this._moveHandle.hide();

    this.create();

    // event listeners
    this.onMove = this.onMove.bind(this);
    this.onHover = this.onHover.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._label.addEventListener('mouseenter', this.onHover);
    this._label.addEventListener('mouseleave', this.onHover);

    this._container.addEventListener('wheel', this.onMove);
  }

  removeEventListeners() {
    this._label.removeEventListener('mouseenter', this.onHover);
    this._label.removeEventListener('mouseleave', this.onHover);

    this._container.removeEventListener('wheel', this.onMove);
  }

  onStart(evt) {
    this._moveHandle.onMove(evt, true);
    this._handle.onStart(evt);

    this._active = this._handle.active || this._domHovered;

    if (this._domHovered) {
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
        this._handle.worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
      }
    } else {
      this.onHover(null);
    }

    this._handle.onMove(evt);

    this.update();
  }

  onEnd() {
    this._handle.onEnd();

    if (!this._dragged && this._active && this._initialized) {
      this._selected = !this._selected; // change state if there was no dragging
      this._handle.selected = this._selected;
    }

    this._initialized = true;
    this._active = this._handle.active;
    this._dragged = false;
    this._moving = false;

    this.update();
  }

  onHover(evt) {
    if (evt) {
      this.hoverDom(evt);
    }

    this._hovered = this._handle.hovered || this._domHovered;
    this._container.style.cursor = this._hovered ? 'pointer' : 'default';
  }

  hoverDom(evt) {
    this._domHovered = (evt.type === 'mouseenter');
  }

  create() {
    this.createVoxel();
    this.createDOM();
  }

  createVoxel() {
    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
  }

  createDOM() {
    this._label = document.createElement('div');
    this._label.setAttribute('class', 'widgets-label');

    // measurenents
    let measurementsContainer = document.createElement('div');
    // LPS
    let lpsContainer = document.createElement('div');
    lpsContainer.setAttribute('id', 'lpsPosition');
    measurementsContainer.appendChild(lpsContainer);
    // IJK
    let ijkContainer = document.createElement('div');
    ijkContainer.setAttribute('id', 'ijkPosition');
    measurementsContainer.appendChild(ijkContainer);
    // Value
    let valueContainer = document.createElement('div');
    valueContainer.setAttribute('id', 'value');
    measurementsContainer.appendChild(valueContainer);

    this._label.appendChild(measurementsContainer);

    this._container.appendChild(this._label);

    this.updateDOMColor();
  }

  update() {
    this.updateColor();

    this._handle.update();
    this._worldPosition.copy(this._handle.worldPosition);

    this.updateVoxel(); // set data coordinates && value

    // update dom
    this.updateDOMContent();
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  updateVoxel() {
    this._voxel.worldCoordinates = this._worldPosition;
    this._voxel.dataCoordinates = CoreUtils.worldToData(this._stack.lps2IJK, this._worldPosition);

    // update value
    let value = CoreUtils.getPixelData(this._stack, this._voxel.dataCoordinates);

    this._voxel.value = value === null || this._stack.numberOfChannels > 1
      ? 'NA' // coordinates outside the image or RGB
      : CoreUtils.rescaleSlopeIntercept(
        value,
        this._stack.rescaleSlope,
        this._stack.rescaleIntercept).toFixed();
  }

  updateDOMContent() {
    const rasContainer = this._label.querySelector('#lpsPosition'),
      ijkContainer = this._label.querySelector('#ijkPosition'),
      valueContainer = this._label.querySelector('#value');

    rasContainer.innerHTML = `LPS: 
      ${this._voxel.worldCoordinates.x.toFixed(2)} :
      ${this._voxel.worldCoordinates.y.toFixed(2)} :
      ${this._voxel.worldCoordinates.z.toFixed(2)}`;
    ijkContainer.innerHTML = `IJK: 
      ${this._voxel.dataCoordinates.x} :
      ${this._voxel.dataCoordinates.y} :
      ${this._voxel.dataCoordinates.z}`;
    valueContainer.innerHTML = `Value: ${this._voxel.value}`;
  }

  updateDOMPosition() {
    const transform = this.adjustLabelTransform(this._label, this._handle.screenPosition, true);

    this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;
  }

  updateDOMColor() {
    this._label.style.borderColor = this._color;
  }

  free() {
    this.removeEventListeners();

    this.remove(this._handle);
    this._handle.free();
    this._handle = null;
    this.remove(this._moveHandle);
    this._moveHandle.free();
    this._moveHandle = null;

    this._container.removeChild(this._label);

    this._voxel = null;

    super.free();
  }

  hideDOM() {
    this._label.style.display = 'none';
    this._handle.hideDOM();
  }

  showDOM() {
    this._label.style.display = '';
    this._handle.showDOM();
  }

  get targetMesh() {
    return this._targetMesh;
  }

  set targetMesh(targetMesh) {
    this._targetMesh = targetMesh;
    this._handle.targetMesh = targetMesh;
    this._moveHandle.targetMesh = targetMesh;
    this.update();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._handle.worldPosition.copy(worldPosition);
    this._worldPosition.copy(worldPosition);
    this.update();
  }

  get active() {
    return this._active;
  }

  set active(active) {
    this._active = active;
    this._controls.enabled = !this._active;

    this.update();
  }

  set showVoxel(showVoxel) {
    this._showVoxel = showVoxel;
    this.update();
  }

  get showVoxel() {
    return this._showVoxel;
  }

  set showDomSVG(showDomSVG) {
    this._showDomSVG = showDomSVG;
    this.update();
  }

  get showDomSVG() {
    return this._showDomSVG;
  }

  set showDomMeasurements(showDomMeasurements) {
    this._showDomMeasurements = showDomMeasurements;
    this.update();
  }

  get showDomMeasurements() {
    return this._showDomMeasurements;
  }
};
};

export {widgetsVoxelprobe};
export default widgetsVoxelprobe();
