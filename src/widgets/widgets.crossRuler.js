import {widgetsBase} from './widgets.base';
import {widgetsHandle as widgetsHandleFactory} from './widgets.handle';

/**
 * @module widgets/crossRuler
 */
const widgetsCrossRuler = (three = window.THREE) => {
    if (three === undefined || three.Object3D === undefined) {
      return null;
    }

    const Constructor = widgetsBase(three);
    return class extends Constructor {
    constructor(targetMesh, controls, stack) {
        super(targetMesh, controls);

        this._stack = stack;

        this._widgetType = 'CrossRuler';
        this._domHovered = false;
        this._moving = false;

        this._distances = null; // from intersection point to handles
        this._line01 = null; // vector from 0 to 1st handle
        this._normal = null; // normal vector to line01

        // mesh stuff
        this._material = null;
        this._material2 = null;
        this._geometry = null;
        this._geometry2 = null;
        this._mesh = null;
        this._mesh2 = null;

        // dom stuff
        this._line = null;
        this._line2 = null;

        // add handles
        this._handles = [];

        let handle;
        const WidgetsHandle = widgetsHandleFactory(three);
        for (let i = 0; i < 4; i++) {
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

        this._hovered = this._handles[0].hovered || this._handles[1].hovered ||
            this._handles[2].hovered || this._handles[3].hovered || this._domHovered;
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

        this._handles.slice(0, -1).forEach(function(elem) {
            elem.onStart(evt);
        });

        this._active = this._handles[0].active || this._handles[1].active ||
            this._handles[2].active || this._handles[3].active || this._domHovered;

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
                this._handles.slice(0, -1).forEach(function(elem, ind) {
                    this._handles[ind].worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
                }, this);
            }
        } else {
            this.onHover(null);
        }

        this._handles.slice(0, -1).forEach(function(elem) {
            elem.onMove(evt);
        });

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

        if (this._handles[1].tracking &&
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

        this._active = this._handles[0].active || this._handles[1].active ||
            this._handles[2].active || this._handles[3].active;
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
        this._geometry.vertices.push(this._handles[0].worldPosition);
        this._geometry.vertices.push(this._handles[1].worldPosition);

        // geometry
        this._geometry2 = new three.Geometry();
        this._geometry2.vertices.push(this._handles[2].worldPosition);
        this._geometry2.vertices.push(this._handles[3].worldPosition);

        // material
        this._material = new three.LineBasicMaterial();
        this._material2 = new three.LineBasicMaterial();

        this.updateMeshColor();

        // mesh
        this._mesh = new three.Line(this._geometry, this._material);
        this._mesh.visible = true;
        this._mesh2 = new three.Line(this._geometry2, this._material2);
        this._mesh2.visible = true;

        this.add(this._mesh);
        this.add(this._mesh2);
    }

    createDOM() {
        this._line = document.createElement('div');
        this._line.setAttribute('class', 'widgets-line');
        this._container.appendChild(this._line);

        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets-line');
        this._container.appendChild(this._line2);

        this.updateDOMColor();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._line2.style.display = 'none';

        this._handles.slice(0, -1).forEach(function(elem) {
            elem.hideDOM();
        });
    }

    showDOM() {
        this._line.style.display = '';
        this._line2.style.display = '';

        this._handles.slice(0, -1).forEach(function(elem) {
            elem.showDOM();
        });
    }

    update() {
        this.updateColor();

        // update handles
        this._handles.slice(0, -1).forEach(function(elem) {
            elem.update();
        });

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
        if (this._material2) {
            this._material2.color.set(this._color);
        }
    }

    updateMeshPosition() {
        if (this._geometry) {
            this._geometry.verticesNeedUpdate = true;
        }
        if (this._geometry2) {
            this._geometry2.verticesNeedUpdate = true;
        }
    }

    updateDOMPosition() {
        // update first line
        const lineData = this.getLineData(this._handles[0].screenPosition, this._handles[1].screenPosition);

        this._line.style.transform =`translate3D(${lineData.transformX}px, ${lineData.transformY}px, 0)
            rotate(${lineData.transformAngle}rad)`;
        this._line.style.width = lineData.length + 'px';

        // update second line
        const line2Data = this.getLineData(this._handles[2].screenPosition, this._handles[3].screenPosition);

        this._line2.style.transform =`translate3D(${line2Data.transformX}px, ${line2Data.transformY}px, 0)
            rotate(${line2Data.transformAngle}rad)`;
        this._line2.style.width = line2Data.length + 'px';
    }

    updateDOMColor() {
        this._line.style.backgroundColor = this._color;
        this._line2.style.backgroundColor = this._color;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];

        this._container.removeChild(this._line);
        this._container.removeChild(this._line2);

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
        this.remove(this._mesh2);
        this._mesh2.geometry.dispose();
        this._mesh2.geometry = null;
        this._mesh2.material.dispose();
        this._mesh2.material = null;
        this._mesh2 = null;
        this._geometry2.dispose();
        this._geometry2 = null;
        this._material2.vertexShader = null;
        this._material2.fragmentShader = null;
        this._material2.uniforms = null;
        this._material2.dispose();
        this._material2 = null;

        super.free();
    }

    initLineAndNormal() {
        this._line01 = this._handles[1].worldPosition.clone().sub(this._handles[0].worldPosition);
        this._normal = this._line01.clone().cross(this._camera._direction).normalize();
    }

    initOrtho() { // called onEnd if distances are null
        this.initLineAndNormal();

        const center = this._handles[1].worldPosition.clone().add(this._handles[0].worldPosition).multiplyScalar(0.5),
            halfLength = this._line01.length() / 2,
            normLine = this._normal.clone().multiplyScalar(halfLength * 0.8),
            normLength = normLine.length();

        this._handles[2].worldPosition.copy(center.clone().add(normLine));
        this._handles[3].worldPosition.copy(center.clone().sub(normLine));

        this._distances = [halfLength, halfLength, normLength, normLength];
    }

    repositionOrtho() { // called onMove if 0 or 1st handle is active
        this.initLineAndNormal();
        this._distances[0] *= this._line01.length() / (this._distances[0] + this._distances[1]);
        this._distances[1] = this._line01.length() - this._distances[0];

        const intersect = this._handles[0].worldPosition.clone()
                .add(this._line01.clone().normalize().multiplyScalar(this._distances[0]));

        this._handles[2].worldPosition
            .copy(intersect.clone().add(this._normal.clone().multiplyScalar(this._distances[2])));
        this._handles[3].worldPosition
            .copy(intersect.clone().sub(this._normal.clone().multiplyScalar(this._distances[3])));
    }

    recalculateOrtho() { // called onMove if 2nd or 3rd handle is active
        const activeInd = this._handles[2].active ? 2 : 3,
            lines = [],
            intersect = new three.Vector3();

        lines[2] = this._handles[2].worldPosition.clone().sub(this._handles[0].worldPosition);
        lines[3] = this._handles[3].worldPosition.clone().sub(this._handles[0].worldPosition);
        new three.Ray(this._handles[0].worldPosition, this._line01.clone().normalize())
            .closestPointToPoint(this._handles[activeInd].worldPosition, intersect);

        const isOutside = intersect.clone().sub(this._handles[0].worldPosition).length() > this._line01.length();
        // if intersection is outside of the line01 then change worldPosition of active handle
        if (isOutside || intersect.equals(this._handles[0].worldPosition)) {
            if (isOutside) {
                intersect.copy(this._handles[1].worldPosition);
            }

            this._handles[activeInd].worldPosition
                .copy(intersect.clone().add(lines[activeInd].clone().projectOnVector(this._normal)));
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

        this._distances[activeInd] = intersect.clone().sub(this._handles[activeInd].worldPosition).length();
        this._distances[0] = intersect.clone().sub(this._handles[0].worldPosition).length();
        this._distances[1] = intersect.clone().sub(this._handles[1].worldPosition).length();
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
        const intersectR = new three.Vector3(),
            intersectS = new three.Vector3(),
            ray = new three.Ray(first);

        ray.lookAt(second);
        ray.distanceSqToSegment(third, fourth, intersectR, intersectS);

        if (intersectR.distanceTo(intersectS) > 0.01 &&
            intersectR.clone().sub(first).length() > second.clone().sub(first).length() + 0.01
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
            intersectR.clone().sub(first).length(),
            intersectR.clone().sub(second).length(),
            intersectR.clone().sub(third).length(),
            intersectR.clone().sub(fourth).length(),
        ];

        this.initLineAndNormal();
        this.update();
    }

    setDefaultColor(color) {
        this._colors.default = color;
        this._handles.forEach(function(elem) {
            elem._colors.default = color;
        });
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
        this._handles.slice(0, -1).forEach(function(elem) {
            elem.worldPosition.copy(worldPosition);
        });
        this._worldPosition.copy(worldPosition);
        this.update();
    }
  };
};

export {widgetsCrossRuler};
export default widgetsCrossRuler();
