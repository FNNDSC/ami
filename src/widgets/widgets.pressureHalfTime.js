import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/pressureHalfTime
 */
const widgetsPressureHalfTime = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);

  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'PressureHalfTime';

      // incoming parameters (required: lps2IJK, worldPosition)
      this._regions = params.ultrasoundRegions || []; // required
      if (this._regions.length < 1) {
        throw new Error('Ultrasound regions should not be empty!');
      }

      // outgoing values
      this._vMax = null; // Maximum Velocity (Vmax)
      this._gMax = null; // Maximum Gradient (Gmax)
      this._pht = null; // Pressure Half Time (PHT)
      this._mva = null; // Mitral Valve Area (MVA)
      this._dt = null; // Deceleration Time (DT)
      this._ds = null; // Deceleration Slope (DS)

      this._domHovered = false;
      this._initialRegion = this.getRegionByXY(
        this._regions,
        CoreUtils.worldToData(params.lps2IJK, params.worldPosition)
      );
      if (this._initialRegion === null) {
        throw new Error('Invalid initial UltraSound region!');
      }

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._line = null;
      this._label = null;

      // add handles
      this._handles = [];
      const WidgetsHandle = widgetsHandleFactory(three);

      let handle;
      for (let i = 0; i < 2; i++) {
        handle = new WidgetsHandle(targetMesh, controls, params);
        this.add(handle);
        this._handles.push(handle);
      }
      this._handles[1].active = true;
      this._handles[1].tracking = true;

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
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
      this._domHovered = evt.type === 'mouseenter';
    }

    onStart(evt) {
      this._moveHandle.onMove(evt, true);

      this._handles[0].onStart(evt);
      this._handles[1].onStart(evt);

      this._active = this._handles[0].active || this._handles[1].active || this._domHovered;

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

        if (!this._handles[0].active && !this._handles[1].active) {
          this._handles.slice(0, -1).forEach(handle => {
            handle.worldPosition.add(shift);
          });
        }
        this._dragged = true;
      } else {
        this.onHover(null);
      }

      this._handles[0].onMove(evt);
      this._handles[1].onMove(evt);
      this.update();
    }

    onEnd() {
      this._handles[0].onEnd(); // First Handle

      if (
        this._handles[1].tracking &&
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

      this.update();
    }

    isCorrectRegion(shift) {
      const inActive = !(this._handles[0].active || this._handles[1].active);
      let isCorrect = true;

      if (this._handles[0].active || inActive) {
        isCorrect = isCorrect && this.checkHandle(0, shift);
      }
      if (this._handles[1].active || inActive) {
        isCorrect = isCorrect && this.checkHandle(1, shift);
      }

      return isCorrect;
    }

    checkHandle(index, shift) {
      const region = this.getRegionByXY(
        this._regions,
        CoreUtils.worldToData(
          this._params.lps2IJK,
          this._handles[index].worldPosition.clone().add(shift)
        )
      );

      return (
        region !== null &&
        region === this._initialRegion &&
        this._regions[region].unitsY === 'cm/sec'
      );
    }

    create() {
      this.createMesh();
      this.createDOM();
    }

    createMesh() {
      // geometry
      this._geometry = new three.Geometry();
      this._geometry.vertices = [this._handles[0].worldPosition, this._handles[1].worldPosition];

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
      this._line.className = 'widgets-line';
      this._container.appendChild(this._line);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';

      const measurementsContainer = document.createElement('div');

      ['vmax', 'gmax', 'pht', 'mva', 'dt', 'ds'].forEach(name => {
        const div = document.createElement('div');

        div.className = name;
        measurementsContainer.appendChild(div);
      });
      this._label.appendChild(measurementsContainer);

      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    hideDOM() {
      this._line.style.display = 'none';
      this._label.style.display = 'none';
      this._handles.forEach(elem => elem.hideDOM());
    }

    showDOM() {
      this._line.style.display = '';
      this._label.style.display = '';
      this._handles[0].showDOM();
      this._handles[1].showDOM();
    }

    update() {
      this.updateColor();

      this._handles[0].update();
      this._handles[1].update();

      this.updateValues();

      this.updateMeshColor();
      this.updateMeshPosition();

      this.updateDOM();
    }

    updateValues() {
      const usPosition0 = this.getUsPoint(
        this._regions,
        CoreUtils.worldToData(this._params.lps2IJK, this._handles[0].worldPosition)
      );
      const usPosition1 = this.getUsPoint(
        this._regions,
        CoreUtils.worldToData(this._params.lps2IJK, this._handles[1].worldPosition)
      );
      const velocity0 = Math.abs(usPosition0.y / 100);
      const velocity1 = Math.abs(usPosition1.y / 100);
      const time0 = Math.abs(usPosition0.x);
      const time1 = Math.abs(usPosition1.x);
      const vMaxTime = this._vMax === velocity0 ? time0 : time1;

      this._vMax = Math.max(velocity0, velocity1);
      this._gMax = 4 * Math.pow(this._vMax, 2);

      const phtVelocity = this._vMax / Math.sqrt(2);
      const phtKoeff = (velocity0 - phtVelocity) / (velocity1 - phtVelocity);
      const dtKoeff = velocity0 / velocity1;

      this._pht =
        phtKoeff === 1
          ? Number.POSITIVE_INFINITY
          : Math.abs(vMaxTime - (time0 - phtKoeff * time1) / (1 - phtKoeff)) * 1000;
      this._mva = 220 / this._pht;
      this._dt =
        dtKoeff === 1
          ? Number.POSITIVE_INFINITY
          : Math.abs(vMaxTime - (time0 - dtKoeff * time1) / (1 - dtKoeff)) * 1000;
      this._ds = this._dt === 0 ? Number.POSITIVE_INFINITY : (this._vMax / this._dt) * 1000;
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

    updateDOM() {
      this.updateDOMColor();

      // update line
      const lineData = this.getLineData(
        this._handles[0].screenPosition,
        this._handles[1].screenPosition
      );

      this._line.style.transform = `translate3D(${lineData.transformX}px, ${
        lineData.transformY
      }px, 0)
                rotate(${lineData.transformAngle}rad)`;
      this._line.style.width = lineData.length + 'px';

      // update label
      this._label.querySelector('.vmax').innerHTML = `Vmax: ${this._vMax.toFixed(2)} m/s`;
      this._label.querySelector('.gmax').innerHTML = `Gmax: ${this._gMax.toFixed(2)} mmhg`;
      this._label.querySelector('.pht').innerHTML = `PHT: ${this._pht.toFixed(1)} ms`;
      this._label.querySelector('.mva').innerHTML = `MVA: ${this._mva.toFixed(2)} cm²`;
      this._label.querySelector('.dt').innerHTML = `DT: ${this._dt.toFixed(1)} ms`;
      this._label.querySelector('.ds').innerHTML = `DS: ${this._ds.toFixed(2)} m/s²`;

      let angle = Math.abs(lineData.transformAngle);

      if (angle > Math.PI / 2) {
        angle = Math.PI - angle;
      }

      const labelPadding =
        Math.tan(angle) < this._label.offsetHeight / this._label.offsetWidth
          ? this._label.offsetWidth / 2 / Math.cos(angle) + 15 // 5px for each handle + padding
          : this._label.offsetHeight / 2 / Math.cos(Math.PI / 2 - angle) + 15;
      const paddingVector = lineData.line.normalize().multiplyScalar(labelPadding);
      const paddingPoint =
        lineData.length > labelPadding * 2
          ? this._handles[1].screenPosition.clone().sub(paddingVector)
          : this._handles[1].screenPosition.clone().add(paddingVector);
      const transform = this.adjustLabelTransform(this._label, paddingPoint);

      this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;
    }

    updateDOMColor() {
      this._line.style.backgroundColor = this._color;
      this._label.style.borderColor = this._color;
    }

    free() {
      this.removeEventListeners();

      this._handles.forEach(h => {
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

    getMeasurements() {
      return {
        vMax: this._vMax,
        gMax: this._gMax,
        pht: this._pht,
        mva: this._mva,
        dt: this._dt,
        ds: this._ds,
      };
    }

    get targetMesh() {
      return this._targetMesh;
    }

    set targetMesh(targetMesh) {
      this._targetMesh = targetMesh;
      this._handles.forEach(elem => (elem.targetMesh = targetMesh));
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

export { widgetsPressureHalfTime };
export default widgetsPressureHalfTime();
