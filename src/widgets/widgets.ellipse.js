import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/ellipse
 */
const widgetsEllipse = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'Ellipse';

      // incoming parameters (optional: frameIndex, worldPosition)
      this._stack = params.stack; // required
      this._calibrationFactor = params.calibrationFactor || null;

      // outgoing values
      this._area = null;
      this._units =
        !this._calibrationFactor && !params.stack.frame[params.frameIndex].pixelSpacing
          ? 'units'
          : 'cm²';

      this._moving = false;
      this._domHovered = false;

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._rectangle = null;
      this._ellipse = null;
      this._label = null;

      // add handles
      this._handles = [];

      let handle;
      const WidgetsHandle = widgetsHandleFactory(three);
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

      this._rectangle.addEventListener('mouseenter', this.onHover);
      this._rectangle.addEventListener('mouseleave', this.onHover);
      this._ellipse.addEventListener('mouseenter', this.onHover);
      this._ellipse.addEventListener('mouseleave', this.onHover);
      this._label.addEventListener('mouseenter', this.onHover);
      this._label.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
      this._container.removeEventListener('wheel', this.onMove);

      this._rectangle.removeEventListener('mouseenter', this.onHover);
      this._rectangle.removeEventListener('mouseleave', this.onHover);
      this._ellipse.removeEventListener('mouseenter', this.onHover);
      this._ellipse.removeEventListener('mouseleave', this.onHover);
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
      // check raycast intersection, if we want to hover on mesh instead of just css
    }

    hoverDom(evt) {
      this._domHovered = evt.type === 'mouseenter';
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
          this._handles.slice(0, -1).forEach(handle => {
            handle.worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
          });
        }

        this.updateRoI(true);
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
      this._moving = false;

      this.updateRoI(); // TODO: if (this._dragged || !this._initialized)
      this.update();
    }

    hideDOM() {
      this._handles.forEach(elem => elem.hideDOM());

      this._rectangle.style.display = 'none';
      this._ellipse.style.display = 'none';
      this._label.style.display = 'none';
    }

    showDOM() {
      this._handles[0].showDOM();
      this._handles[1].showDOM();

      this._rectangle.style.display = '';
      this._ellipse.style.display = '';
      this._label.style.display = '';
    }

    create() {
      this.createMaterial();
      this.createDOM();
    }

    createMaterial() {
      this._material = new three.MeshBasicMaterial();
      this._material.transparent = true;
      this._material.opacity = 0.2;
    }

    createDOM() {
      this._rectangle = document.createElement('div');
      this._rectangle.className = 'widgets-rectangle-helper';
      this._container.appendChild(this._rectangle);

      this._ellipse = document.createElement('div');
      this._ellipse.className = 'widgets-ellipse';
      this._container.appendChild(this._ellipse);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';

      // measurements
      const measurementsContainer = document.createElement('div');
      // Mean / SD
      let meanSDContainer = document.createElement('div');
      meanSDContainer.className = 'mean-sd';
      measurementsContainer.appendChild(meanSDContainer);
      // Max / Min
      let maxMinContainer = document.createElement('div');
      maxMinContainer.className = 'max-min';
      measurementsContainer.appendChild(maxMinContainer);
      // Area
      let areaContainer = document.createElement('div');
      areaContainer.className = 'area';
      measurementsContainer.appendChild(areaContainer);

      this._label.appendChild(measurementsContainer);

      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    update() {
      this.updateColor();

      this._handles[0].update();
      this._handles[1].update();

      this.updateMeshColor();
      this.updateMeshPosition();

      this.updateDOM();
    }

    updateMeshColor() {
      if (this._material) {
        this._material.color.set(this._color);
      }
    }

    updateMeshPosition() {
      if (this._mesh) {
        this.remove(this._mesh);
      }

      const vec01 = this._handles[1].worldPosition.clone().sub(this._handles[0].worldPosition);
      const height = vec01
        .clone()
        .projectOnVector(this._camera.up)
        .length();
      const width = vec01
        .clone()
        .projectOnVector(this._camera._right)
        .length();

      if (width === 0 || height === 0) {
        return;
      }

      this._geometry = new three.ShapeGeometry(
        new three.Shape(
          new three.EllipseCurve(0, 0, width / 2, height / 2, 0, 2 * Math.PI, false).getPoints(50)
        )
      );

      this._mesh = new three.Mesh(this._geometry, this._material);
      this._mesh.position.copy(
        this._handles[0].worldPosition.clone().add(vec01.multiplyScalar(0.5))
      );
      this._mesh.rotation.copy(this._camera.rotation);
      this._mesh.visible = true;
      this.add(this._mesh);
    }

    updateRoI(clear) {
      if (!this._geometry) {
        return;
      }

      const meanSDContainer = this._label.querySelector('.mean-sd');
      const maxMinContainer = this._label.querySelector('.max-min');

      if (clear) {
        meanSDContainer.innerHTML = '';
        maxMinContainer.innerHTML = '';

        return;
      }

      const roi = CoreUtils.getRoI(this._mesh, this._camera, this._stack);

      if (roi !== null) {
        meanSDContainer.innerHTML = `Mean: ${roi.mean.toFixed(1)} / SD: ${roi.sd.toFixed(1)}`;
        maxMinContainer.innerHTML = `Max: ${roi.max.toFixed()} / Min: ${roi.min.toFixed()}`;
      } else {
        meanSDContainer.innerHTML = '';
        maxMinContainer.innerHTML = '';
      }
    }

    updateDOMColor() {
      this._rectangle.style.borderColor = this._color;
      this._ellipse.style.borderColor = this._color;
      this._label.style.borderColor = this._color;
    }

    updateDOM() {
      if (!this._geometry) {
        return;
      }

      this.updateDOMColor();

      const regions = this._stack.frame[this._params.frameIndex].ultrasoundRegions || [];

      this._area = CoreUtils.getGeometryArea(this._geometry);
      if (this._calibrationFactor) {
        this._area *= Math.pow(this._calibrationFactor, 2);
      } else if (regions && regions.length > 0 && this._stack.lps2IJK) {
        const region0 = this.getRegionByXY(
          regions,
          CoreUtils.worldToData(this._stack.lps2IJK, this._handles[0].worldPosition)
        );
        const region1 = this.getRegionByXY(
          regions,
          CoreUtils.worldToData(this._stack.lps2IJK, this._handles[1].worldPosition)
        );

        if (
          region0 !== null &&
          region1 !== null &&
          region0 === region1 &&
          regions[region0].unitsX === 'cm' &&
          regions[region0].unitsY === 'cm'
        ) {
          this._area *= Math.pow(regions[region0].deltaX, 2);
          this._units = 'cm²';
        } else if (this._stack.frame[this._params.frameIndex].pixelSpacing) {
          this._area /= 100;
          this._units = 'cm²';
        } else {
          this._units = 'units';
        }
      } else if (this._units === 'cm²') {
        this._area /= 100;
      }

      if (this._units === 'units' && !this._label.hasAttribute('title')) {
        this._label.setAttribute('title', 'Calibration is required to display the area in cm²');
        this._label.style.color = this._colors.error;
      } else if (this._units !== 'units' && this._label.hasAttribute('title')) {
        this._label.removeAttribute('title');
        this._label.style.color = this._colors.text;
      }
      this._label.querySelector('.area').innerHTML = `Area: ${this._area.toFixed(2)} ${
        this._units
      }`;

      const rectData = this.getRectData(
        this._handles[0].screenPosition,
        this._handles[1].screenPosition
      );
      const labelTransform = this.adjustLabelTransform(
        this._label,
        this._handles[1].screenPosition
          .clone()
          .add(rectData.paddingVector.multiplyScalar(15 + this._label.offsetHeight / 2))
      );

      // update rectangle
      this._rectangle.style.transform = `translate3D(${rectData.transformX}px, ${
        rectData.transformY
      }px, 0)`;
      this._rectangle.style.width = rectData.width + 'px';
      this._rectangle.style.height = rectData.height + 'px';

      // update ellipse
      this._ellipse.style.transform = `translate3D(${rectData.transformX}px, ${
        rectData.transformY
      }px, 0)`;
      this._ellipse.style.width = rectData.width + 'px';
      this._ellipse.style.height = rectData.height + 'px';

      // update label
      this._label.style.transform =
        'translate3D(' + labelTransform.x + 'px,' + labelTransform.y + 'px, 0)';
    }

    free() {
      this.removeEventListeners();

      this._handles.forEach(h => {
        this.remove(h);
        h.free();
      });
      this._handles = [];

      this._container.removeChild(this._rectangle);
      this._container.removeChild(this._ellipse);
      this._container.removeChild(this._label);

      // mesh, geometry, material
      if (this._mesh) {
        this.remove(this._mesh);
        this._mesh.geometry.dispose();
        this._mesh.geometry = null;
        this._mesh.material.dispose();
        this._mesh.material = null;
        this._mesh = null;
      }
      if (this._geometry) {
        this._geometry.dispose();
        this._geometry = null;
      }
      this._material.vertexShader = null;
      this._material.fragmentShader = null;
      this._material.uniforms = null;
      this._material.dispose();
      this._material = null;

      this._stack = null;

      super.free();
    }

    getMeasurements() {
      return {
        area: this._area,
        units: this._units,
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

    get calibrationFactor() {
      return this._calibrationFactor;
    }

    set calibrationFactor(calibrationFactor) {
      this._calibrationFactor = calibrationFactor;
      this._units = 'cm²';
      this.update();
    }
  };
};

export { widgetsEllipse };
export default widgetsEllipse();
