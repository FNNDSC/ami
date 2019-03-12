import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';

/**
 * @module widgets/biruler
 */
const widgetsBiruler = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'BiRuler';

      // incoming parameters (optional: lps2IJK, pixelSpacing, ultrasoundRegions, worldPosition)
      this._calibrationFactor = params.calibrationFactor || null;

      // outgoing values
      this._distance = null;
      this._distance2 = null;
      this._units = !this._calibrationFactor && !params.pixelSpacing ? 'units' : 'mm';

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._line = null;
      this._label = null;
      this._line2 = null;
      this._label2 = null;
      this._dashline = null;

      // add handles
      this._handles = [];

      let handle;
      const WidgetsHandle = widgetsHandleFactory(three);
      for (let i = 0; i < 4; i++) {
        handle = new WidgetsHandle(targetMesh, controls, params);
        this.add(handle);
        this._handles.push(handle);
      }
      this._handles[1].active = true;
      this._handles[1].tracking = true;
      this._handles[3].active = true;
      this._handles[3].tracking = true;

      this.create();

      this.onMove = this.onMove.bind(this);
      this.addEventListeners();
    }

    addEventListeners() {
      this._container.addEventListener('wheel', this.onMove);
    }

    removeEventListeners() {
      this._container.removeEventListener('wheel', this.onMove);
    }

    onStart(evt) {
      this._handles.forEach(elem => elem.onStart(evt));

      this._active =
        this._handles[0].active ||
        this._handles[1].active ||
        this._handles[2].active ||
        this._handles[3].active;

      this.update();
    }

    onMove(evt) {
      if (this._active) {
        this._dragged = true;
      } else {
        this._hovered =
          this._handles[0].hovered ||
          this._handles[1].hovered ||
          this._handles[2].hovered ||
          this._handles[3].hovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
      }

      this._handles.forEach(elem => elem.onMove(evt));

      this.update();
    }

    onEnd() {
      this._handles[0].onEnd();
      this._handles[2].onEnd();

      if (
        this._handles[1].tracking &&
        this._handles[0].screenPosition.distanceTo(this._handles[1].screenPosition) < 10
      ) {
        return;
      }

      if (!this._dragged && this._active && !this._handles[3].tracking) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handles[0].selected = this._selected;
        this._handles[2].selected = this._selected;
      }

      // Fourth Handle
      if (this._handles[1].active) {
        this._handles[3].onEnd();
      } else if (this._dragged || !this._handles[3].tracking) {
        this._handles[3].tracking = false;
        this._handles[3].onEnd();
      } else {
        this._handles[3].tracking = false;
      }
      this._handles[3].selected = this._selected;

      // Second Handle
      if (this._dragged || !this._handles[1].tracking) {
        this._handles[1].tracking = false;
        this._handles[1].onEnd();
      } else {
        this._handles[1].tracking = false;
      }
      this._handles[1].selected = this._selected;

      this._active =
        this._handles[0].active ||
        this._handles[1].active ||
        this._handles[2].active ||
        this._handles[3].active;
      this._dragged = false;
      this.update();
    }

    create() {
      this.createMesh();
      this.createDOM();
    }

    createMesh() {
      // geometry
      this._geometry = new three.Geometry();
      this._geometry.vertices = [
        this._handles[0].worldPosition,
        this._handles[1].worldPosition,
        this._handles[2].worldPosition,
        this._handles[3].worldPosition,
      ];

      // material
      this._material = new three.LineBasicMaterial();

      this.updateMeshColor();

      // mesh
      this._mesh = new three.LineSegments(this._geometry, this._material);
      this._mesh.visible = true;
      this.add(this._mesh);
    }

    createDOM() {
      this._line = document.createElement('div');
      this._line.className = 'widgets-line';
      this._container.appendChild(this._line);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';
      this._container.appendChild(this._label);

      this._line2 = document.createElement('div');
      this._line2.className = 'widgets-line';
      this._container.appendChild(this._line2);

      this._label2 = document.createElement('div');
      this._label2.className = 'widgets-label';
      this._container.appendChild(this._label2);

      this._dashline = document.createElement('div');
      this._dashline.className = 'widgets-dashline';
      this._container.appendChild(this._dashline);

      this.updateDOMColor();
    }

    hideDOM() {
      this._line.style.display = 'none';
      this._label.style.display = 'none';
      this._line2.style.display = 'none';
      this._label2.style.display = 'none';
      this._dashline.style.display = 'none';

      this._handles.forEach(elem => elem.hideDOM());
    }

    showDOM() {
      this._line.style.display = '';
      this._label.style.display = '';
      this._line2.style.display = '';
      this._label2.style.display = '';
      this._dashline.style.display = '';

      this._handles.forEach(elem => elem.showDOM());
    }

    update() {
      this.updateColor();

      this._handles.forEach(elem => elem.update());

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
      if (this._geometry) {
        this._geometry.verticesNeedUpdate = true;
      }
    }

    updateDOM() {
      this.updateDOMColor();

      // update first line
      const lineData = this.getLineData(
        this._handles[0].screenPosition,
        this._handles[1].screenPosition
      );

      this._line.style.transform = `translate3D(${lineData.transformX}px, ${
        lineData.transformY
      }px, 0)
                rotate(${lineData.transformAngle}rad)`;
      this._line.style.width = lineData.length + 'px';

      // update second line
      const line2Data = this.getLineData(
        this._handles[2].screenPosition,
        this._handles[3].screenPosition
      );

      this._line2.style.transform = `translate3D(${line2Data.transformX}px, ${
        line2Data.transformY
      }px, 0)
                rotate(${line2Data.transformAngle}rad)`;
      this._line2.style.width = line2Data.length + 'px';

      // update dash line
      const line1Center = this._handles[0].worldPosition
        .clone()
        .add(this._handles[1].worldPosition)
        .multiplyScalar(0.5);
      const line2Center = this._handles[2].worldPosition
        .clone()
        .add(this._handles[3].worldPosition)
        .multiplyScalar(0.5);
      const dashLineData = this.getLineData(
        this.worldToScreen(line1Center),
        this.worldToScreen(line2Center)
      );

      this._dashline.style.transform = `translate3D(${dashLineData.transformX}px, ${
        dashLineData.transformY
      }px, 0)
                rotate(${dashLineData.transformAngle}rad)`;
      this._dashline.style.width = dashLineData.length + 'px';

      // update labels
      const distanceData = this.getDistanceData(
        this._handles[0].worldPosition,
        this._handles[1].worldPosition,
        this._calibrationFactor
      );
      const distanceData2 = this.getDistanceData(
        this._handles[2].worldPosition,
        this._handles[3].worldPosition,
        this._calibrationFactor
      );
      const title = 'Calibration is required to display the distance in mm';

      this._distance = distanceData.distance;
      this._distance2 = distanceData2.distance;
      if (distanceData.units && distanceData2.units && distanceData.units === distanceData2.units) {
        this._units = distanceData.units;
      } else {
        if (!distanceData.units) {
          distanceData.units = this._units;
        }
        if (!distanceData2.units) {
          distanceData2.units = this._units;
        }
      }

      if (distanceData.units === 'units' && !this._label.hasAttribute('title')) {
        this._label.setAttribute('title', title);
        this._label.style.color = this._colors.error;
      } else if (distanceData.units !== 'units' && this._label.hasAttribute('title')) {
        this._label.removeAttribute('title');
        this._label.style.color = this._colors.text;
      }
      if (distanceData2.units === 'units' && !this._label2.hasAttribute('title')) {
        this._label2.setAttribute('title', title);
        this._label2.style.color = this._colors.error;
      } else if (distanceData2.units !== 'units' && this._label2.hasAttribute('title')) {
        this._label2.removeAttribute('title');
        this._label2.style.color = this._colors.text;
      }
      this._label.innerHTML = `${this._distance.toFixed(2)} ${distanceData.units}`;
      this._label2.innerHTML = `${this._distance2.toFixed(2)} ${distanceData2.units}`;

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

      let angle2 = Math.abs(line2Data.transformAngle);
      if (angle2 > Math.PI / 2) {
        angle2 = Math.PI - angle2;
      }

      const label2Padding =
        Math.tan(angle2) < this._label2.offsetHeight / this._label2.offsetWidth
          ? this._label2.offsetWidth / 2 / Math.cos(angle2) + 15 // 5px for each handle + padding
          : this._label2.offsetHeight / 2 / Math.cos(Math.PI / 2 - angle2) + 15;
      const paddingVector2 = line2Data.line.normalize().multiplyScalar(label2Padding);
      const paddingPoint2 =
        line2Data.length > label2Padding * 2
          ? this._handles[3].screenPosition.clone().sub(paddingVector2)
          : this._handles[3].screenPosition.clone().add(paddingVector2);
      const transform2 = this.adjustLabelTransform(this._label2, paddingPoint2);

      this._label2.style.transform = `translate3D(${transform2.x}px, ${transform2.y}px, 0)`;
    }

    updateDOMColor() {
      this._line.style.backgroundColor = this._color;
      this._label.style.borderColor = this._color;

      this._line2.style.backgroundColor = this._color;
      this._label2.style.borderColor = this._color;

      this._dashline.style.borderTop = '1.5px dashed ' + this._color;
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
      this._container.removeChild(this._line2);
      this._container.removeChild(this._label2);
      this._container.removeChild(this._dashline);

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

    /**
     * Get length of rulers
     *
     * @return {Array}
     */
    getDistances() {
      return [this._distance, this._distance2];
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
      this._handles.forEach(elem => elem.worldPosition.copy(worldPosition));
      this._worldPosition.copy(worldPosition);
      this.update();
    }

    get calibrationFactor() {
      return this._calibrationFactor;
    }

    set calibrationFactor(calibrationFactor) {
      this._calibrationFactor = calibrationFactor;
      this._units = 'mm';
      this.update();
    }

    get shotestDistance() {
      return this._distance < this._distance2 ? this._distance : this._distance2;
    }

    get longestDistance() {
      return this._distance > this._distance2 ? this._distance : this._distance2;
    }
  };
};

export { widgetsBiruler };
export default widgetsBiruler();
