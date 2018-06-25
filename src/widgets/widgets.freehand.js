import {widgetsBase} from './widgets.base';
import {widgetsHandle as widgetsHandleFactory} from './widgets.handle';
import CoreUtils from '../core/core.utils';

/**
 * @module widgets/freehand
 */
const widgetsFreehand = (three = window.THREE) => {
    if (three === undefined || three.Object3D === undefined) {
      return null;
    }

    const Constructor = widgetsBase(three);
    return class extends Constructor {
    constructor(targetMesh, controls, stack) {
        super(targetMesh, controls);

        this._stack = stack;

        this._widgetType = 'Freehand';
        this._initialized = false; // set to true onEnd if number of handles > 2
        this._moving = false;
        this._domHovered = false;

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

        let handle = new WidgetsHandle(targetMesh, controls);
        handle.worldPosition.copy(this._worldPosition);
        this.add(handle);
        this._handles.push(handle);

        this._moveHandle = new WidgetsHandle(targetMesh, controls);
        this._moveHandle.worldPosition.copy(this._worldPosition);
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

        this._handles.forEach(function(elem) {
            hovered = hovered || elem.hovered;
        });

        this._hovered = hovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
        // check raycast intersection, if we want to hover on mesh instead of just css
    }

    hoverDom(evt) {
        this._domHovered = (evt.type === 'mouseenter');
    }

    onStart(evt) {
        let active = false;

        this._moveHandle.onMove(evt, true);
        this._handles.forEach(function(elem) {
            elem.onStart(evt);
            active = active || elem.active;
        });

        this._active = active || this._domHovered;

        if (this._domHovered && this._initialized) {
            this._moving = true;
            this._controls.enabled = false;
        }

        this.update();
    }

    onMove(evt) {
        let numHandles = this._handles.length,
            hovered = false;

        if (this.active) {
            this._dragged = true;

            if (!this._initialized) {
                this._handles[numHandles - 1].hovered = false;
                this._handles[numHandles - 1].active = false;
                this._handles[numHandles - 1].tracking = false;

                const WidgetsHandle = widgetsHandleFactory(three);
                let handle = new WidgetsHandle(this._targetMesh, this._controls);
                handle.worldPosition.copy(this._worldPosition);
                handle.hovered = true;
                handle.active = true;
                handle.tracking = true;
                this.add(handle);
                this._handles.push(handle);

                this.createLine();
            } else {
                const prevPosition = this._moveHandle.worldPosition.clone();

                if (this._mesh) {
                    this.remove(this._mesh);
                }
                this.updateDOMContent(true);

                this._moveHandle.onMove(evt, true);

                if (this._moving) {
                    this._handles.forEach(function(elem, ind) {
                        this._handles[ind].worldPosition.add(this._moveHandle.worldPosition.clone().sub(prevPosition));
                    }, this);
                }
            }
        }

        this._handles.forEach(function(elem) {
            elem.onMove(evt);
            hovered = hovered || elem.hovered;
        });

        this._hovered = hovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';

        if (this.active && this._handles.length > 2) {
            this.pushPopHandle();
        }

        this.update();
    }

    onEnd() {
        let numHandles = this._handles.length;

        if (numHandles < 3) {
            return;
        }

        let active = false;

        this._handles.slice(0, numHandles-1).forEach(function(elem) {
            elem.onEnd();
            active = active || elem.active;
        });

        // Last Handle
        if (this._dragged || !this._handles[numHandles-1].tracking) {
            this._handles[numHandles-1].tracking = false;
            this._handles[numHandles-1].onEnd();
        } else {
            this._handles[numHandles-1].tracking = false;
        }

        if (this._lines.length < numHandles) {
            this.createLine();
        }

        if (!this._dragged && this._active) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles.forEach(function(elem) {
                elem.selected = this._selected;
            }, this);
        }
        this._active = active || this._handles[numHandles-1].active;
        this._dragged = false;
        this._moving = false;
        this._initialized = true;

        this.updateMesh();
        this.updateDOMContent();
        this.update();
    }

    create() {
        this.createMaterial();
        this.createDOM();
    }

    createMaterial() {
        this._material = new three.MeshBasicMaterial({side: three.DoubleSide});
        this._material.transparent = true;
        this._material.opacity = 0.2;
    }

    createDOM() {
        this._label = document.createElement('div');
        this._label.setAttribute('class', 'widgets-label');

        // measurenents
        const measurementsContainer = document.createElement('div');
        // Mean / SD
        let meanSDContainer = document.createElement('div');
        meanSDContainer.setAttribute('class', 'mean-sd');
        measurementsContainer.appendChild(meanSDContainer);
        // Max / Min
        let maxMinContainer = document.createElement('div');
        maxMinContainer.setAttribute('class', 'max-min');
        measurementsContainer.appendChild(maxMinContainer);
        // Area
        let areaContainer = document.createElement('div');
        areaContainer.setAttribute('class', 'area');
        measurementsContainer.appendChild(areaContainer);

        this._label.appendChild(measurementsContainer);

        this._container.appendChild(this._label);

        this.updateDOMColor();
    }

    createLine() {
        const line = document.createElement('div');

        line.setAttribute('class', 'widgets-line');
        line.addEventListener('mouseenter', this.onHover);
        line.addEventListener('mouseleave', this.onHover);
        this._lines.push(line);
        this._container.appendChild(line);
    }

    hideDOM() {
        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = 'none';
        });
        this._label.style.display = 'none';
    }

    showDOM() {
        this._handles.forEach(function(elem) {
            elem.showDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = '';
        });
        this._label.style.display = '';
    }

    update() {
        this.updateColor();

        // update handles
        this._handles.forEach(function(elem) {
            elem.update();
        });

        // mesh stuff
        this.updateMeshColor();
        this.updateMeshPosition();

        // DOM stuff
        this.updateDOMColor();
        this.updateDOMPosition();
    }

    updateMesh() { // geometry
        if (this._mesh) {
            this.remove(this._mesh);
        }

        let points = [];
        this._handles.forEach(function(elem) {
            points.push(elem.worldPosition);
        });

        let center = CoreUtils.centerOfMass(points);
        let direction = new three.Vector3().crossVectors(
            new three.Vector3().subVectors(points[0], center), // side 1
            new three.Vector3().subVectors(points[1], center) // side 2
        );

        // direction from first point to center
        let referenceDirection = new three.Vector3().subVectors(points[0], center).normalize();
        let base = new three.Vector3().crossVectors(referenceDirection, direction).normalize();
        let orderedpoints = [];

        // other lines // if inter, return location + angle
        for (let j = 0; j < points.length; j++) {
            let point = new three.Vector3(points[j].x, points[j].y, points[j].z);
            point.direction = new three.Vector3().subVectors(points[j], center).normalize();

            let x = referenceDirection.dot(point.direction);
            let y = base.dot(point.direction);
            point.xy = {x, y};
            point.angle = Math.atan2(y, x) * (180 / Math.PI);

            orderedpoints.push(point);
        }

        // override to catch console.warn "THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()"
        this._shapeWarn = false;
        const oldWarn = console.warn;
        console.warn = function(...rest) {
            if (rest[0] === 'three.ShapeUtils: Unable to triangulate polygon! in triangulate()') {
                this._shapeWarn = true;
            }
            return oldWarn.apply(console, rest);
        }.bind(this);

        // create the shape
        let shape = new three.Shape();
        // move to first point!
        shape.moveTo(orderedpoints[0].xy.x, orderedpoints[0].xy.y);

        // loop through all points!
        for (let l = 1; l < orderedpoints.length; l++) {
            // project each on plane!
            shape.lineTo(orderedpoints[l].xy.x, orderedpoints[l].xy.y);
        }

        // close the shape!
        shape.lineTo(orderedpoints[0].xy.x, orderedpoints[0].xy.y);

        this._geometry = new three.ShapeGeometry(shape);

        console.warn = oldWarn;

        this._geometry.vertices = orderedpoints;
        this._geometry.verticesNeedUpdate = true;
        this._geometry.elementsNeedUpdate = true;

        this.updateMeshColor();

        this._mesh = new three.Mesh(this._geometry, this._material);
        this._mesh.visible = true;
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

    isPointOnLine(pointA, pointB, pointToCheck) {
        let c = new three.Vector3();
        c.crossVectors(pointA.clone().sub(pointToCheck), pointB.clone().sub(pointToCheck));
        return !c.length();
    }

    pushPopHandle() {
        let handle0 = this._handles[this._handles.length-3],
            handle1 = this._handles[this._handles.length-2],
            newhandle = this._handles[this._handles.length-1];

        let isOnLine = this.isPointOnLine(handle0.worldPosition, handle1.worldPosition, newhandle.worldPosition);

        if (isOnLine || handle0.screenPosition.distanceTo(newhandle.screenPosition) < 25) {
            this.remove(handle1);
            handle1.free();

            this._handles[this._handles.length-2] = newhandle;
            this._handles.pop();

            let tempLine = this._lines.pop();
            tempLine.style.display = 'none';
            this._container.removeChild(tempLine);
        }

        return isOnLine;
    }

    updateDOMColor() {
        if (this._handles.length >= 2) {
            this._lines.forEach(function(elem) {
                elem.style.backgroundColor = this._color;
            }, this);
        }
        this._label.style.borderColor = this._color;
    }

    updateDOMContent(clear) {
        const meanSDContainer = this._label.querySelector('.mean-sd'),
            maxMinContainer = this._label.querySelector('.max-min'),
            areaContainer = this._label.querySelector('.area');

        if (clear) {
            meanSDContainer.innerHTML = '';
            maxMinContainer.innerHTML = '';
            areaContainer.innerHTML = '';

            return;
        }

        let units = this._stack.frame[0].pixelSpacing === null ? 'units' : 'cm²',
            title = units === 'units' ? 'Calibration is required to display the area in cm². ' : '';

        if (this._shapeWarn) {
            title += 'Values may be incorrect due to triangulation error.';
        }
        if (title !== '') {
            this._label.setAttribute('title', title);
            this._label.style.color = this._colors.error;
        } else {
            this._label.removeAttribute('title');
            this._label.style.color = this._colors.text;
        }

        const roi = CoreUtils.getRoI(this._mesh, this._camera, this._stack);

        if (roi !== null) {
            meanSDContainer.innerHTML = `Mean: ${roi.mean.toFixed(1)} / SD: ${roi.sd.toFixed(1)}`;
            maxMinContainer.innerHTML = `Max: ${roi.max.toFixed()} / Min: ${roi.min.toFixed()}`;
        } else {
            meanSDContainer.innerHTML = '';
            maxMinContainer.innerHTML = '';
        }
        areaContainer.innerHTML = `Area: ${(GeometriesSlice.getGeometryArea(this._geometry)/100).toFixed(2)} ${units}`;
    }

    updateDOMPosition() {
        if (this._handles.length < 2) {
            return;
        }
        // update lines and get coordinates of lowest handle
        let labelPosition = null;

        this._lines.forEach(function(elem, ind) {
            const lineData = this.getLineData(this._handles[ind].screenPosition,
                    this._handles[ind + 1 === this._handles.length ? 0 : ind + 1].screenPosition);

            elem.style.transform =`translate3D(${lineData.transformX}px, ${lineData.transformY}px, 0)
                rotate(${lineData.transformAngle}rad)`;
            elem.style.width = lineData.length + 'px';

            if (labelPosition === null || labelPosition.y < this._handles[ind].screenPosition.y) {
                labelPosition = this._handles[ind].screenPosition.clone();
            }
        }, this);

        if (!this._initialized) {
            return;
        }

        // update label
        labelPosition.y += 15 + this._label.offsetHeight / 2;
        labelPosition = this.adjustLabelTransform(this._label, labelPosition);

        this._label.style.transform = `translate3D(${labelPosition.x}px, ${labelPosition.y}px, 0)`;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];

        this.remove(this._moveHandle);
        this._moveHandle.free();
        this._moveHandle = null;

        this._lines.forEach(function(elem) {
            elem.removeEventListener('mouseenter', this.onHover);
            elem.removeEventListener('mouseleave', this.onHover);
            this._container.removeChild(elem);
        }, this);
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


    get targetMesh() {
        return this._targetMesh;
    }

    set targetMesh(targetMesh) {
        this._targetMesh = targetMesh;
        this._handles.forEach(function(elem) {
            elem.targetMesh = targetMesh;
        });
        this._moveHandle.targetMesh = targetMesh;
        this.update();
    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._handles.forEach(function(elem) {
            elem._worldPosition.copy(worldPosition);
        }, this);
        this._worldPosition.copy(worldPosition);
        this.update();
    }
  };
};

export {widgetsFreehand};
export default widgetsFreehand();
