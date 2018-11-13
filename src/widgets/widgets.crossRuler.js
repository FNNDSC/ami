import { widgetsBase } from './widgets.base';
import { widgetsHandle as widgetsHandleFactory } from './widgets.handle';

/**
 * @module widgets/crossRuler
 */
const widgetsCrossRuler = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = widgetsBase(three);
  return class extends Constructor {
    constructor(targetMesh, controls, params = {}) {
      super(targetMesh, controls, params);

      this._widgetType = 'CrossRuler';

      // incoming parameters (optional: lps2IJK, pixelSpacing, ultrasoundRegions, worldPosition)
      this._calibrationFactor = params.calibrationFactor || null;

      this._distances = null; // from intersection point to handles
      this._line01 = null; // vector from 0 to 1st handle
      this._normal = null; // normal vector to line01

      // outgoing values
      this._distance = null;
      this._distance2 = null;
      this._units = !this._calibrationFactor && !params.pixelSpacing ? 'units' : 'mm';

      this._domHovered = false;
      this._moving = false;

      // mesh stuff
      this._material = null;
      this._geometry = null;
      this._mesh = null;

      // dom stuff
      this._line = null;
      this._line2 = null;
      this._label = null;
      this._label2 = null;

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

      this._moveHandle = new WidgetsHandle(targetMesh, controls, params);
      this.add(this._moveHandle);
      this._handles.push(this._moveHandle);
      this._moveHandle.hide();

      this.onHover = this.onHover.bind(this);
      this.onMove = this.onMove.bind(this);

      this.create();

      this.addEventListeners();
    }

    addEventListeners() {
      this._line.addEventListener('mouseenter', this.onHover);
      this._line.addEventListener('mouseleave', this.onHover);
      this._line2.addEventListener('mouseenter', this.onHover);
      this._line2.addEventListener('mouseleave', this.onHover);

      this._container.addEventListener('wheel', this.onMove);
    }

    removeEventListeners() {
      this._line.removeEventListener('mouseenter', this.onHover);
      this._line.removeEventListener('mouseleave', this.onHover);
      this._line2.removeEventListener('mouseenter', this.onHover);
      this._line2.removeEventListener('mouseleave', this.onHover);

      this._container.removeEventListener('wheel', this.onMove);
    }

    onHover(evt) {
      if (evt) {
        this.hoverDom(evt);
      }

      this.hoverMesh();

      this._hovered =
        this._handles[0].hovered ||
        this._handles[1].hovered ||
        this._handles[2].hovered ||
        this._handles[3].hovered ||
        this._domHovered;
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

      this._handles.slice(0, -1).forEach(elem => elem.onStart(evt));

      this._active =
        this._handles[0].active ||
        this._handles[1].active ||
        this._handles[2].active ||
        this._handles[3].active ||
        this._domHovered;

      if (this._domHovered && this._distances) {
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
      } else {
        this.onHover(null);
      }

      this._handles.slice(0, -1).forEach(elem => elem.onMove(evt));

      if (this._distances) {
        if (this._handles[0].active || this._handles[1].active) {
          this.repositionOrtho(); // change worldPosition of 2nd and 3rd handle
        } else if (this._handles[2].active || this._handles[3].active) {
          this.recalculateOrtho();
        }
      }
      this.update();
    }

    onEnd() {
      this._handles[0].onEnd();
      this._handles[2].onEnd();
      this._handles[3].onEnd();

      if (
        this._handles[1].tracking &&
        this._handles[0].screenPosition.distanceTo(this._handles[1].screenPosition) < 10
      ) {
        return;
      }

      if (!this._dragged && this._active && !this._handles[1].tracking) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handles[0].selected = this._selected;
        this._handles[2].selected = this._selected;
        this._handles[3].selected = this._selected;
      }

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
      this._moving = false;

      if (!this._distances) {
        this.initOrtho();
      }
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

      this._line2 = document.createElement('div');
      this._line2.className = 'widgets-line';
      this._container.appendChild(this._line2);

      this._label = document.createElement('div');
      this._label.className = 'widgets-label';
      this._container.appendChild(this._label);

      this._label2 = document.createElement('div');
      this._label2.className = 'widgets-label';
      this._container.appendChild(this._label2);

      this.updateDOMColor();
    }

    hideDOM() {
      this._line.style.display = 'none';
      this._line2.style.display = 'none';
      this._label.style.display = 'none';
      this._label2.style.display = 'none';

      this._handles.slice(0, -1).forEach(elem => elem.hideDOM());
    }

    showDOM() {
      this._line.style.display = '';
      this._line2.style.display = '';
      this._label.style.display = '';
      this._label2.style.display = '';

      this._handles.slice(0, -1).forEach(elem => elem.showDOM());
    }

    update() {
      this.updateColor();

      this._handles.slice(0, -1).forEach(elem => elem.update());

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
            : this._label.offsetHeight / 2 / Math.cos(Math.PI / 2 - angle) + 15,
        paddingVector = lineData.line.normalize().multiplyScalar(labelPadding),
        paddingPoint =
          lineData.length > labelPadding * 4
            ? this._handles[1].screenPosition.clone().sub(paddingVector)
            : this._handles[1].screenPosition.clone().add(paddingVector),
        transform = this.adjustLabelTransform(this._label, paddingPoint);

      this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;

      let angle2 = Math.abs(line2Data.transformAngle);
      if (angle2 > Math.PI / 2) {
        angle2 = Math.PI - angle2;
      }

      const label2Padding =
          Math.tan(angle2) < this._label2.offsetHeight / this._label2.offsetWidth
            ? this._label2.offsetWidth / 2 / Math.cos(angle2) + 15 // 5px for each handle + padding
            : this._label2.offsetHeight / 2 / Math.cos(Math.PI / 2 - angle2) + 15,
        paddingVector2 = line2Data.line.normalize().multiplyScalar(label2Padding),
        paddingPoint2 =
          line2Data.length > label2Padding * 4
            ? this._handles[3].screenPosition.clone().sub(paddingVector2)
            : this._handles[3].screenPosition.clone().add(paddingVector2),
        transform2 = this.adjustLabelTransform(this._label2, paddingPoint2);

      this._label2.style.transform = `translate3D(${transform2.x}px, ${transform2.y}px, 0)`;
    }

    updateDOMColor() {
      this._line.style.backgroundColor = this._color;
      this._line2.style.backgroundColor = this._color;
      this._label.style.borderColor = this._color;
      this._label2.style.borderColor = this._color;
    }

    free() {
      this.removeEventListeners();

      this._handles.forEach(h => {
        this.remove(h);
        h.free();
      });
      this._handles = [];

      this._container.removeChild(this._line);
      this._container.removeChild(this._line2);
      this._container.removeChild(this._label);
      this._container.removeChild(this._label2);

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

    initLineAndNormal() {
      this._line01 = this._handles[1].worldPosition.clone().sub(this._handles[0].worldPosition);
      this._normal = this._line01
        .clone()
        .cross(this._camera._direction)
        .normalize();
    }

    initOrtho() {
      // called onEnd if distances are null
      this.initLineAndNormal();

      const center = this._handles[1].worldPosition
        .clone()
        .add(this._handles[0].worldPosition)
        .multiplyScalar(0.5);
      const halfLength = this._line01.length() / 2;
      const normLine = this._normal.clone().multiplyScalar(halfLength * 0.8);
      const normLength = normLine.length();

      this._handles[2].worldPosition.copy(center.clone().add(normLine));
      this._handles[3].worldPosition.copy(center.clone().sub(normLine));

      this._distances = [halfLength, halfLength, normLength, normLength];
    }

    repositionOrtho() {
      // called onMove if 0 or 1st handle is active
      this.initLineAndNormal();
      this._distances[0] *= this._line01.length() / (this._distances[0] + this._distances[1]);
      this._distances[1] = this._line01.length() - this._distances[0];

      const intersect = this._handles[0].worldPosition.clone().add(
        this._line01
          .clone()
          .normalize()
          .multiplyScalar(this._distances[0])
      );

      this._handles[2].worldPosition.copy(
        intersect.clone().add(this._normal.clone().multiplyScalar(this._distances[2]))
      );
      this._handles[3].worldPosition.copy(
        intersect.clone().sub(this._normal.clone().multiplyScalar(this._distances[3]))
      );
    }

    recalculateOrtho() {
      // called onMove if 2nd or 3rd handle is active
      const activeInd = this._handles[2].active ? 2 : 3;
      const lines = [];
      const intersect = new three.Vector3();

      lines[2] = this._handles[2].worldPosition.clone().sub(this._handles[0].worldPosition);
      lines[3] = this._handles[3].worldPosition.clone().sub(this._handles[0].worldPosition);
      new three.Ray(
        this._handles[0].worldPosition,
        this._line01.clone().normalize()
      ).closestPointToPoint(this._handles[activeInd].worldPosition, intersect);

      const isOutside =
        intersect
          .clone()
          .sub(this._handles[0].worldPosition)
          .length() > this._line01.length();
      // if intersection is outside of the line01 then change worldPosition of active handle
      if (isOutside || intersect.equals(this._handles[0].worldPosition)) {
        if (isOutside) {
          intersect.copy(this._handles[1].worldPosition);
        }

        this._handles[activeInd].worldPosition.copy(
          intersect.clone().add(lines[activeInd].clone().projectOnVector(this._normal))
        );
      }

      if (lines[2].cross(this._line01).angleTo(this._camera._direction) > 0.01) {
        this._handles[2].worldPosition.copy(intersect); // 2nd handle should always be above line01
      }
      if (lines[3].cross(this._line01).angleTo(this._camera._direction) < Math.PI - 0.01) {
        this._handles[3].worldPosition.copy(intersect); // 3nd handle should always be below line01
      }

      lines[0] = this._normal.clone().multiplyScalar(this._distances[5 - activeInd]);
      if (activeInd === 2) {
        lines[0].negate();
      }
      this._handles[5 - activeInd].worldPosition.copy(intersect.clone().add(lines[0]));

      this._distances[activeInd] = intersect.distanceTo(this._handles[activeInd].worldPosition);
      this._distances[0] = intersect.distanceTo(this._handles[0].worldPosition);
      this._distances[1] = intersect.distanceTo(this._handles[1].worldPosition);
    }

    /**
     * Get length of rulers
     *
     * @return {Array}
     */
    getDimensions() {
      return [this._distance, this._distance2];
    }

    /**
     * Get CrossRuler handles position
     *
     * @return {Array.<Vector3>} First begin, first end, second begin, second end
     */
    getCoordinates() {
      return [
        this._handles[0].worldPosition,
        this._handles[1].worldPosition,
        this._handles[2].worldPosition,
        this._handles[3].worldPosition,
      ];
    }

    /**
     * Set CrossRuler handles position
     *
     * @param {Vector3} first   The beginning of the first line
     * @param {Vector3} second  The end of the first line
     * @param {Vector3} third   The beginning of the second line (clockwise relative to the first line)
     * @param {Vector3} fourth  The end of the second line
     */
    initCoordinates(first, second, third, fourth) {
      const intersectR = new three.Vector3();
      const intersectS = new three.Vector3();
      const ray = new three.Ray(first);

      ray.lookAt(second);
      ray.distanceSqToSegment(third, fourth, intersectR, intersectS);

      if (
        intersectR.distanceTo(intersectS) > 0.01 &&
        intersectR.distanceTo(first) > second.distanceTo(first) + 0.01
      ) {
        window.console.warn('Lines do not intersect');

        return;
      }

      this.active = false;
      this.hovered = false;
      this.setDefaultColor('#198');
      this._worldPosition.copy(first);
      this._handles[0].worldPosition.copy(first);
      this._handles[1].worldPosition.copy(second);
      this._handles[1].active = false;
      this._handles[1].tracking = false;
      this._handles[2].worldPosition.copy(third);
      this._handles[3].worldPosition.copy(fourth);
      this._distances = [
        intersectR.distanceTo(first),
        intersectR.distanceTo(second),
        intersectR.distanceTo(third),
        intersectR.distanceTo(fourth),
      ];

      this.initLineAndNormal();
      this.update();
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
      this._handles.slice(0, -1).forEach(elem => elem.worldPosition.copy(worldPosition));
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
  };
};

export { widgetsCrossRuler };
export default widgetsCrossRuler();
