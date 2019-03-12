import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/velocityTimeIntegral
 */
const widgetsVelocityTimeIntegral = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'VelocityTimeIntegral';

      // incoming parameters (+ ijk2LPS, lps2IJK, worldPosition)
      this._regions = params.ultrasoundRegions || []; // required
      if (this._regions.length < 1) {
        throw new Error('Ultrasound regions should not be empty!');
      }

      // outgoing values
      this._vMax = null; // Maximum Velocity (Vmax)
      this._vMean = null; // Mean Velocity (Vmean)
      this._gMax = null; // Maximum Gradient (Gmax)
      this._gMean = null; // Mean Gradient (Gmean)
      this._envTi = null; // Envelope Duration (Env.Ti)
      this._vti = null; // Velocity Time Integral (VTI)
      this._extraInfo = null; // extra information which is added to label

      this._initialized = false; // set to true onEnd if number of handles > 2
      this._isHandleActive = true;
      this._domHovered = false;
      this._initialRegion = this.getRegionByXY(
        this._regions,
        CoreUtils.worldToData(params.lps2IJK, params.worldPosition)
      );
      if (this._initialRegion === null) {
        throw new Error('Invalid initial UltraSound region!');
      }
      this._usPoints = [];

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._lines = [];
      this._label = null;

      // add handles
      this._handles = [];
      const WidgetsHandle = widgetsHandleFactory(three);

      let handle = new WidgetsHandle(targetMesh, controls, params);
      this.add(handle);
      this._handles.push(handle);

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._moveHandle);
      this._moveHandle.hide();

      this.onMove = this.onMove.bind(this);
      this.onHover = this.onHover.bind(this);

      this.create();

      this.addEventListeners();
    }

    addEventListeners() {
      this._container.addEventListener('wheel', this.onMove);

      this._label.addEventListener('mouseenter', this.onHover);
      this._label.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
      this._container.removeEventListener('wheel', this.onMove);

      this._label.removeEventListener('mouseenter', this.onHover);
      this._label.removeEventListener('mouseleave', this.onHover);
    }

    onHover(evt) {
      if (evt) {
        this.hoverDom(evt);
      }

      this.hoverMesh();

      let hovered = false;

      this._handles.forEach(elem => (hovered = hovered || elem.hovered));

      this._hovered = hovered || this._domHovered;
      this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
      // check raycast intersection, if we want to hover on mesh instead of just css
    }

    hoverDom(evt) {
      this._domHovered = evt.type === 'mouseenter';
    }

    onStart(evt) {
      let active = false;

      this._moveHandle.onMove(evt, true);
      this._handles.forEach(elem => {
        elem.onStart(evt);
        active = active || elem.active;
      });

      this._active = active || this._domHovered;
      this._isHandleActive = active;

      if (this._domHovered) {
        this._controls.enabled = false;
      }

      this.update();
    }

    onMove(evt) {
      if (this.active) {
        const prevPosition = this._moveHandle.worldPosition.clone();

        this._moveHandle.onMove(evt, true);

        const shift = this._moveHandle.worldPosition.clone().sub(prevPosition);

        if (!this.isCorrectRegion(shift)) {
          this._moveHandle.worldPosition.copy(prevPosition);

          return;
        }

        if (!this._initialized) {
          this._handles[this._handles.length - 1].hovered = false;
          this._handles[this._handles.length - 1].active = false;
          this._handles[this._handles.length - 1].tracking = false;

          const WidgetsHandle = widgetsHandleFactory(three);
          let handle = new WidgetsHandle(this._targetMesh, this._controls, this._params);

          handle.hovered = true;
          handle.active = true;
          handle.tracking = true;
          this.add(handle);
          this._handles.push(handle);

          this.createLine();
        } else {
          this.updateDOMContent(true);

          if (
            !this._isHandleActive ||
            this._handles[this._handles.length - 2].active ||
            this._handles[this._handles.length - 1].active
          ) {
            this._handles.forEach(handle => {
              handle.worldPosition.add(shift);
            });
            this._isHandleActive = false;
            this._handles[this._handles.length - 2].active = false;
            this._handles[this._handles.length - 1].active = false;
            this._controls.enabled = false;
          }
        }
        this._dragged = true;
      } else {
        this.onHover(null);
      }

      this._handles.forEach(elem => {
        elem.onMove(evt);
      });
      if (this.active && this._handles.length > 2) {
        this.pushPopHandle();
      }
      this.update();
    }

    onEnd() {
      if (this._handles.length < 3) {
        return;
      }

      let active = false;

      this._handles.slice(0, -1).forEach(elem => {
        elem.onEnd();
        active = active || elem.active;
      });

      // Last Handle
      if (this._dragged || !this._handles[this._handles.length - 1].tracking) {
        this._handles[this._handles.length - 1].tracking = false;
        this._handles[this._handles.length - 1].onEnd();
      } else {
        this._handles[this._handles.length - 1].tracking = false;
      }

      if (this._dragged || !this._initialized) {
        this.finalize();
        this.updateDOMContent();
      }

      if (!this._dragged && this._active) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handles.forEach(elem => (elem.selected = this._selected));
      }
      this._active = active || this._handles[this._handles.length - 1].active;
      this._isHandleActive = active;
      this._dragged = false;
      this._initialized = true;

      this.update();
    }

    isCorrectRegion(shift) {
      let isCorrect = true;

      this._handles.forEach((handle, index) => {
        if (handle.active || !this._isHandleActive) {
          isCorrect = isCorrect && this.checkHandle(index, shift);
        }
      });

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
      this.createMaterial();
      this.createDOM();
    }

    createMaterial() {
      this._material = new three.LineBasicMaterial();
    }

    createDOM() {
      this._label = document.createElement('div');
      this._label.className = 'widgets-label';

      const measurementsContainer = document.createElement('div');

      ['vmax', 'vmean', 'gmax', 'gmean', 'envti', 'vti', 'info'].forEach(name => {
        const div = document.createElement('div');

        div.className = name;
        measurementsContainer.appendChild(div);
      });
      this._label.appendChild(measurementsContainer);

      this._container.appendChild(this._label);

      this.updateDOMColor();
    }

    createLine() {
      const line = document.createElement('div');

      line.className = 'widgets-line';
      line.addEventListener('mouseenter', this.onHover);
      line.addEventListener('mouseleave', this.onHover);
      this._lines.push(line);
      this._container.appendChild(line);
    }

    pushPopHandle() {
      let handle0 = this._handles[this._handles.length - 3];
      let handle1 = this._handles[this._handles.length - 2];
      let newhandle = this._handles[this._handles.length - 1];
      let isOnLine = this.isPointOnLine(
        handle0.worldPosition,
        handle1.worldPosition,
        newhandle.worldPosition
      );

      if (isOnLine || handle0.screenPosition.distanceTo(newhandle.screenPosition) < 25) {
        this.remove(handle1);
        handle1.free();

        this._handles[this._handles.length - 2] = newhandle;
        this._handles.pop();

        this._container.removeChild(this._lines.pop());
      }

      return isOnLine;
    }

    isPointOnLine(pointA, pointB, pointToCheck) {
      return !new three.Vector3()
        .crossVectors(pointA.clone().sub(pointToCheck), pointB.clone().sub(pointToCheck))
        .length();
    }

    finalize() {
      if (this._initialized) {
        // remove old axis handles
        this._handles.splice(-2).forEach(elem => {
          this.remove(elem);
          elem.free();
        });
      }

      const pointF = CoreUtils.worldToData(this._params.lps2IJK, this._handles[0]._worldPosition);
      const pointL = CoreUtils.worldToData(
        this._params.lps2IJK,
        this._handles[this._handles.length - 1]._worldPosition
      );
      const region = this._regions[this.getRegionByXY(this._regions, pointF)];
      const axisY = region.y0 + (region.axisY || 0); // data coordinate equal to US region's zero Y coordinate

      const WidgetsHandle = widgetsHandleFactory(three);
      const params = { hideHandleMesh: this._params.hideHandleMesh || false };

      pointF.y = axisY;
      pointL.y = axisY;
      this._usPoints = [
        this.getPointInRegion(region, pointL),
        this.getPointInRegion(region, pointF),
      ];

      params.worldPosition = pointL.applyMatrix4(this._params.ijk2LPS); // projection of last point on Y axis
      this._handles.push(new WidgetsHandle(this._targetMesh, this._controls, params));
      this.add(this._handles[this._handles.length - 1]);

      params.worldPosition = pointF.applyMatrix4(this._params.ijk2LPS); // projection of first point on Y axis
      this._handles.push(new WidgetsHandle(this._targetMesh, this._controls, params));
      this.add(this._handles[this._handles.length - 1]);

      while (this._lines.length < this._handles.length) {
        this.createLine();
      }
    }

    update() {
      this.updateColor();

      // update handles
      this._handles.forEach(elem => elem.update());

      // mesh stuff
      this.updateMesh();

      // DOM stuff
      this.updateDOMColor();
      this.updateDOMPosition();
    }

    updateValues() {
      const region = this._regions[
        this.getRegionByXY(
          this._regions,
          CoreUtils.worldToData(this._params.lps2IJK, this._handles[0]._worldPosition)
        )
      ];
      const boundaries = {
        xMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY,
      };
      let pVelocity;
      let pGradient;
      let pTime;
      let totalTime = 0;

      this._vMax = 0;
      this._vMean = 0;
      this._gMean = 0;
      this._usPoints.splice(2);
      this._handles.slice(0, -2).forEach(elem => {
        const usPosition = this.getPointInRegion(
          region,
          CoreUtils.worldToData(this._params.lps2IJK, elem._worldPosition)
        );
        const velocity = Math.abs(usPosition.y / 100);
        const gradient = 4 * Math.pow(velocity, 2);

        if (this._vMax === null || velocity > this._vMax) {
          this._vMax = velocity;
        }
        boundaries.xMin = Math.min(usPosition.x, boundaries.xMin);
        boundaries.xMax = Math.max(usPosition.x, boundaries.xMax);
        boundaries.yMin = Math.min(usPosition.y, boundaries.yMin);
        boundaries.yMax = Math.max(usPosition.y, boundaries.yMax);

        if (pTime) {
          const length = Math.abs(usPosition.x - pTime);

          totalTime += length;
          this._vMean += (length * (pVelocity + velocity)) / 2;
          this._gMean += (length * (pGradient + gradient)) / 2;
        }

        pVelocity = velocity;
        pGradient = gradient;
        pTime = usPosition.x;
        this._usPoints.push(usPosition);
      });

      this._gMax = 4 * Math.pow(this._vMax, 2);
      this._vMean /= totalTime;
      this._gMean /= totalTime;
      this._envTi = totalTime * 1000;
      this._vti = this.getArea(this._usPoints);

      this._shapeWarn =
        boundaries.xMax - boundaries.xMin !== totalTime ||
        boundaries.yMin < 0 !== boundaries.yMax < 0;
    }

    updateMesh() {
      if (this._mesh) {
        this.remove(this._mesh);
      }

      this._geometry = new three.Geometry();
      this._handles.forEach(elem => this._geometry.vertices.push(elem.worldPosition));
      this._geometry.vertices.push(this._handles[0].worldPosition);
      this._geometry.verticesNeedUpdate = true;

      this.updateMeshColor();

      this._mesh = new three.Line(this._geometry, this._material);
      this._mesh.visible = true;
      this.add(this._mesh);
    }

    updateMeshColor() {
      if (this._material) {
        this._material.color.set(this._color);
      }
    }

    updateDOMColor() {
      if (this._handles.length >= 2) {
        this._lines.forEach(elem => (elem.style.backgroundColor = this._color));
      }
      this._label.style.borderColor = this._color;
    }

    updateDOMContent(clear) {
      const vMaxContainer = this._label.querySelector('.vmax');
      const vMeanContainer = this._label.querySelector('.vmean');
      const gMaxContainer = this._label.querySelector('.gmax');
      const gMeanContainer = this._label.querySelector('.gmean');
      const envTiContainer = this._label.querySelector('.envti');
      const vtiContainer = this._label.querySelector('.vti');
      const infoContainer = this._label.querySelector('.info');

      if (clear) {
        vMaxContainer.innerHTML = '';
        vMeanContainer.innerHTML = '';
        gMaxContainer.innerHTML = '';
        gMeanContainer.innerHTML = '';
        envTiContainer.innerHTML = '';
        vtiContainer.innerHTML = '';
        infoContainer.innerHTML = '';

        return;
      }

      this.updateValues();

      if (this._shapeWarn && !this._label.hasAttribute('title')) {
        this._label.setAttribute('title', 'Values may be incorrect due to invalid curve.');
        this._label.style.color = this._colors.error;
      } else if (!this._shapeWarn && this._label.hasAttribute('title')) {
        this._label.removeAttribute('title');
        this._label.style.color = this._colors.text;
      }

      vMaxContainer.innerHTML = `Vmax: ${this._vMax.toFixed(2)} m/s`;
      vMeanContainer.innerHTML = `Vmean: ${this._vMean.toFixed(2)} m/s`;
      gMaxContainer.innerHTML = `Gmax: ${this._gMax.toFixed(2)} mmhg`;
      gMeanContainer.innerHTML = `Gmean: ${this._gMean.toFixed(2)} mmhg`;
      envTiContainer.innerHTML = `Env.Ti: ${this._envTi.toFixed(1)} ms`;
      vtiContainer.innerHTML = `VTI: ${this._vti.toFixed(2)} cm`;
      infoContainer.innerHTML = this._extraInfo;
    }

    updateDOMPosition() {
      if (this._handles.length < 2) {
        return;
      }
      // update lines and get coordinates of lowest handle
      let labelPosition = null;

      this._lines.forEach((elem, ind) => {
        const lineData = this.getLineData(
          this._handles[ind].screenPosition,
          this._handles[ind + 1 === this._handles.length ? 0 : ind + 1].screenPosition
        );

        elem.style.transform = `translate3D(${lineData.transformX}px, ${lineData.transformY}px, 0)
                    rotate(${lineData.transformAngle}rad)`;
        elem.style.width = lineData.length + 'px';

        if (labelPosition === null || labelPosition.y < this._handles[ind].screenPosition.y) {
          labelPosition = this._handles[ind].screenPosition.clone();
        }
      });

      if (!this._initialized) {
        return;
      }

      // update label
      labelPosition.y += 15 + this._label.offsetHeight / 2;
      labelPosition = this.adjustLabelTransform(this._label, labelPosition);

      this._label.style.transform = `translate3D(${labelPosition.x}px, ${labelPosition.y}px, 0)`;
    }

    hideDOM() {
      this._handles.forEach(elem => elem.hideDOM());

      this._lines.forEach(elem => (elem.style.display = 'none'));
      this._label.style.display = 'none';
    }

    showDOM() {
      this._handles.forEach(elem => elem.showDOM());

      this._lines.forEach(elem => (elem.style.display = ''));
      this._label.style.display = '';
    }

    free() {
      this.removeEventListeners();

      this._handles.forEach(elem => {
        this.remove(elem);
        elem.free();
      });
      this._handles = [];
      this._usPoints = [];

      this.remove(this._moveHandle);
      this._moveHandle.free();
      this._moveHandle = null;

      this._lines.forEach(elem => {
        elem.removeEventListener('mouseenter', this.onHover);
        elem.removeEventListener('mouseleave', this.onHover);
        this._container.removeChild(elem);
      });
      this._lines = [];
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

      super.free();
    }

    getMeasurements() {
      return {
        vMax: this._vMax,
        vMean: this._vMean,
        gMax: this._gMax,
        gMean: this._gMean,
        envTi: this._envTi,
        vti: this._vti,
      };
    }

    get targetMesh() {
      return this._targetMesh;
    }

    set targetMesh(targetMesh) {
      this._targetMesh = targetMesh;
      this._handles.forEach(elem => (elem.targetMesh = targetMesh));
      this._moveHandle.targetMesh = targetMesh;
      this.update();
    }

    get worldPosition() {
      return this._worldPosition;
    }

    set worldPosition(worldPosition) {
      this._handles.forEach(elem => elem._worldPosition.copy(worldPosition));
      this._worldPosition.copy(worldPosition);
      this.update();
    }

    get extraInfo() {
      return this._extraInfo;
    }

    set extraInfo(info) {
      this._extraInfo = info;
      this._label.querySelector('.info').innerHTML = info;
    }
  };
};

export { widgetsVelocityTimeIntegral };
export default widgetsVelocityTimeIntegral();
