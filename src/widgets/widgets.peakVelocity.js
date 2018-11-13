import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/peakVelocity (Gradient)
 */
const widgetsPeakVelocity = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);

  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'PeakVelocity';

      // incoming parameters (required: lps2IJK, worldPosition)
      this._regions = params.ultrasoundRegions || []; // required
      if (this._regions.length < 1) {
        throw new Error('Ultrasound regions should not be empty!');
      }

      // outgoing values
      this._velocity = null;
      this._gradient = null;

      this._container.style.cursor = 'pointer';
      this._controls.enabled = false; // controls should be disabled for widgets with a single handle
      this._initialized = false; // set to true onEnd
      this._active = true;
      this._domHovered = false;
      this._initialRegion = this.getRegionByXY(
        this._regions,
        CoreUtils.worldToData(params.lps2IJK, params.worldPosition)
      );
      if (this._initialRegion === null) {
        throw new Error('Invalid initial UltraSound region!');
      }

      // dom stuff
      this._line = null;
      this._label = null;

      // handle (represent line)
      const WidgetsHandle = widgetsHandleFactory(three);
      this._handle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._handle);

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._moveHandle);
      this._moveHandle.hide();

      this.create();

      // event listeners
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

      this._hovered = this._handle.hovered || this._domHovered;
      this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverDom(evt) {
      this._domHovered = evt.type === 'mouseenter';
    }

    onStart(evt) {
      this._moveHandle.onMove(evt, true);
      this._handle.onStart(evt);

      this._active = this._handle.active || this._domHovered;

      if (this._domHovered) {
        this._controls.enabled = false;
      }

      this.update();
    }

    onMove(evt) {
      if (this._active) {
        const prevPosition = this._moveHandle.worldPosition.clone();

        this._moveHandle.onMove(evt, true);

        const shift = this._moveHandle.worldPosition.clone().sub(prevPosition);

        if (!this.isCorrectRegion(shift)) {
          this._moveHandle.worldPosition.copy(prevPosition);

          return;
        }

        if (!this._handle.active) {
          this._handle.worldPosition.add(shift);
        }
        this._dragged = true;
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
      this._active = false;
      this._dragged = false;

      this.update();
    }

    isCorrectRegion(shift) {
      const region = this.getRegionByXY(
        this._regions,
        CoreUtils.worldToData(this._params.lps2IJK, this._handle.worldPosition.clone().add(shift))
      );

      return (
        region !== null &&
        region === this._initialRegion &&
        this._regions[region].unitsY === 'cm/sec'
      );
    }

    create() {
      this.createDOM();
    }

    createDOM() {
      this._line = document.createElement('div');
      this._line.className = 'widgets-dashline';
      this._container.appendChild(this._line);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';

      // Measurements
      let measurementsContainer = document.createElement('div');
      // Peak Velocity
      let pvContainer = document.createElement('div');
      pvContainer.className = 'peakVelocity';
      measurementsContainer.appendChild(pvContainer);
      // Gradient
      let gradientContainer = document.createElement('div');
      gradientContainer.className = 'gradient';
      measurementsContainer.appendChild(gradientContainer);

      this._label.appendChild(measurementsContainer);
      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    update() {
      this.updateColor();

      this._handle.update();
      this._worldPosition.copy(this._handle.worldPosition);

      this.updateDOM();
    }

    updateDOM() {
      this.updateDOMColor();

      const point = CoreUtils.worldToData(this._params.lps2IJK, this._worldPosition);
      const region = this._regions[this.getRegionByXY(this._regions, point)];
      const usPosition = this.getPointInRegion(region, point);

      this._velocity = Math.abs(usPosition.y / 100);
      this._gradient = 4 * Math.pow(this._velocity, 2);

      // content
      this._label.querySelector('.peakVelocity').innerHTML = `${this._velocity.toFixed(2)} m/s`;
      this._label.querySelector('.gradient').innerHTML = `${this._gradient.toFixed(2)} mmhg`;

      // position
      const transform = this.adjustLabelTransform(this._label, this._handle.screenPosition, true);

      this._line.style.transform = `translate3D(${transform.x -
        (point.x - region.x0) * this._camera.zoom}px, ${transform.y}px, 0)`;
      this._line.style.width = (region.x1 - region.x0) * this._camera.zoom + 'px';
      this._label.style.transform = `translate3D(${transform.x + 10}px, ${transform.y + 10}px, 0)`;
    }

    updateDOMColor() {
      this._line.style.backgroundColor = this._color;
      this._label.style.borderColor = this._color;
    }

    hideDOM() {
      this._line.style.display = 'none';
      this._label.style.display = 'none';
      this._handle.hideDOM();
    }

    showDOM() {
      this._line.style.display = '';
      this._label.style.display = '';
      this._handle.showDOM();
    }

    free() {
      this.removeEventListeners();

      this.remove(this._handle);
      this._handle.free();
      this._handle = null;
      this.remove(this._moveHandle);
      this._moveHandle.free();
      this._moveHandle = null;

      this._container.removeChild(this._line);
      this._container.removeChild(this._label);

      super.free();
    }

    getMeasurements() {
      return {
        velocity: this._velocity,
        gradient: this._gradient,
      };
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
      this._moveHandle.worldPosition.copy(worldPosition);
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
  };
};

export { widgetsPeakVelocity };
export default widgetsPeakVelocity();
