import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

/**
 * @module widgets/roi
 */
export default class WidgetsRoi extends WidgetsBase {
    constructor(targetMesh, controls) {
        super(targetMesh, controls);

        this._initialized = false; // set to true onEnd if number of handles > 2

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // dom stuff
        this._lines = [];
        this._area = null;

        // add handles
        this._handles = [];

        // first handle
        let firstHandle = new WidgetsHandle(this._targetMesh, this._camera);
        firstHandle.worldPosition.copy(this._worldPosition);
        firstHandle.hovered = true;
        this.add(firstHandle);
        this._handles.push(firstHandle);

        // Create ruler
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
        let active = false;

        this._handles.forEach(function(elem) {
            elem.onStart(evt);
            active = active || elem.active;
        });

        this._active = active;
        this.update();
    }

    onMove(evt) {
        let numHandles = this._handles.length;

        if (this.active && !this._initialized) {
            let lastHandle = this._handles[numHandles-1];
            lastHandle.hovered = false;
            lastHandle.active = false;
            lastHandle.tracking = false;

            let nextHandle = new WidgetsHandle(this._targetMesh, this._camera);
            nextHandle.worldPosition.copy(this._worldPosition);
            nextHandle.hovered = true;
            nextHandle.active = true;
            nextHandle.tracking = true;
            this.add(nextHandle);

            this._handles.push(nextHandle);

            let newLine = document.createElement('div');
            newLine.setAttribute('class', 'widgets handle line');
            newLine.style.position = 'absolute';
            newLine.style.transformOrigin = '0 100%';
            newLine.style.marginTop = '-1px';
            newLine.style.height = '2px';
            newLine.style.width = '3px';
            newLine.style.backgroundColor = '#F9F9F9';

            this._lines.push(newLine);
            this._container.appendChild(newLine);
        }

        let hovered = false;

        this._handles.forEach(function(elem) {
            elem.onMove(evt);
            hovered = hovered || elem.hovered;
        });

        this._hovered = hovered;

        if (this.active) {
            this._dragged = true;
            if (numHandles > 3) {
                this.pushPopHandle();
            }
        }

        this.update();
    }

    onEnd(evt) {
        let numHandles = this._handles.length;

        if (numHandles < 3) {
            return;
        }

        let active = false;

        this._handles.slice(0, numHandles-1).forEach(function(elem) {
            elem.onEnd(evt);
            active = active || elem.active;
        });

        // Last Handle
        if (this._dragged || !this._handles[numHandles-1].tracking) {
            this._handles[numHandles-1].tracking = false;
            this._handles[numHandles-1].onEnd(evt);
        } else {
            this._handles[numHandles-1].tracking = false;
        }

        if (!this._dragged && this._active) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles.forEach(function(elem) {
                elem.selected = this._selected;
            }, this);
        }
        this._active = active || this._handles[numHandles-1].active;
        this._dragged = false;

        if (this._lines.length < numHandles) {
            let newLine = document.createElement('div');
            newLine.setAttribute('class', 'widgets handle line');
            newLine.style.position = 'absolute';
            newLine.style.transformOrigin = '0 100%';
            newLine.style.marginTop = '-1px';
            newLine.style.height = '2px';
            newLine.style.width = '3px';
            newLine.style.backgroundColor = '#F9F9F9';

            this._lines.push(newLine);
            this._container.appendChild(newLine);
        }

        this._initialized = true;
        this.updateMesh();
        this.update();
    }

    create() {
        this.createMaterial();
        this.createDOM();
    }

    createMaterial() {
        this._material = new THREE.MeshBasicMaterial();
        this._material.transparent = true;
        this._material.opacity = 0.2;
    }

    createDOM() {
        this._line = document.createElement('div');
        this._line.setAttribute('class', 'widgets handle line');
        this._line.style.position = 'absolute';
        this._line.style.transformOrigin = '0 100%';
        this._line.style.marginTop = '-1px';
        this._line.style.height = '2px';
        this._line.style.width = '3px';
        this._container.appendChild(this._line);

        // add label!
        this._area = document.createElement('div');
        this._area.setAttribute('class', 'widgets handle label');
        this._area.style.border = '2px solid';
        this._area.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
        // this._area.style.opacity = '0.5';
        this._area.style.color = '#222';
        this._area.style.padding = '4px';
        this._area.style.position = 'absolute';
        this._area.style.transformOrigin = '0 100%';
        this._area.style.zIndex = '3';
        this._container.appendChild(this._area);

        this.updateDOMColor();
    }

    hideDOM() {
        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = 'none';
        });
        this._area.style.display = 'none';
    }

    showDOM() {
        this._handles.forEach(function(elem) {
            elem.showDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = '';
        });
        this._area.style.display = '';
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

        let center = AMI.SliceGeometry.centerOfMass(points);
        let direction = new Vector3().crossVectors(
            new Vector3().subVectors(points[0], center), // side 1
            new Vector3().subVectors(points[1], center) // side 2
        );

        // direction from first point to center
        let referenceDirection = new Vector3().subVectors(points[0], center).normalize();
        let base = new Vector3().crossVectors(referenceDirection, direction).normalize();
        let orderedpoints = [];

        // other lines // if inter, return location + angle
        for (let j = 0; j < points.length; j++) {
            let point = new Vector3(points[j].x, points[j].y, points[j].z);
            point.direction = new Vector3().subVectors(points[j], center).normalize();

            let x = referenceDirection.dot(point.direction);
            let y = base.dot(point.direction);
            point.xy = {x, y};
            point.angle = Math.atan2(y, x) * (180 / Math.PI);

            orderedpoints.push(point);
        }

        let sliceShape = AMI.SliceGeometry.shape(orderedpoints);

        // override to catch console.warn "THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()"
        this._shapeWarn = false;
        const oldWarn = console.warn;
        console.warn = function() {
            if (arguments[0] === 'THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()') {
                this._shapeWarn = true;
            }
            return oldWarn.apply(console, arguments);
        }.bind(this);

        this._geometry = new THREE.ShapeGeometry(sliceShape);

        console.warn = oldWarn;

        this._geometry.vertices = orderedpoints;
        this._geometry.verticesNeedUpdate = true;
        this._geometry.elementsNeedUpdate = true;

        this.updateMeshColor();

        this._mesh = new THREE.Mesh(this._geometry, this._material);
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
        let c = new Vector3();
        c.crossVectors(pointA.clone().sub(pointToCheck), pointB.clone().sub(pointToCheck));
        return !c.length();
    }

    pushPopHandle() {
        let handle0 = this._handles[this._handles.length-3],
            handle1 = this._handles[this._handles.length-2],
            newhandle = this._handles[this._handles.length-1];

        let isOnLine = this.isPointOnLine(handle0.worldPosition, handle1.worldPosition, newhandle.worldPosition);

        let interpointdist = handle0.worldPosition.distanceTo(newhandle.worldPosition);

        if (isOnLine || interpointdist < 10) { // TODO! make 10 configurable
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

    updateLineDOM(lineIndex, handle0Index, handle1Index) {
        let x1 = this._handles[handle0Index].screenPosition.x,
            y1 = this._handles[handle0Index].screenPosition.y,
            x2 = this._handles[handle1Index].screenPosition.x,
            y2 = this._handles[handle1Index].screenPosition.y;

        let length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)),
            angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        let posY = y1 - this._container.offsetHeight;

        // update line
        this._lines[lineIndex].style.transform = `translate3D(${x1}px, ${posY}px, 0) rotate(${angle}deg)`;
        this._lines[lineIndex].style.width = length + 'px';
    }

    updateDOMPosition() {
        // update lines and get coordinates of lowest handle
        let labelPosition = new Vector3();

        if (this._handles.length >= 2) {
            this._lines.forEach(function(elem, ind) {
                this.updateLineDOM(ind, ind, ind + 1 === this._handles.length ? 0 : ind + 1);
                if (labelPosition.y < this._handles[ind].screenPosition.y) {
                    labelPosition.copy(this._handles[ind].screenPosition);
                }
            }, this);
        }

        if (!this._initialized) {
            return;
        }

        // update area
        this._area.innerHTML = `${(AMI.SliceGeometry.shapeGeometryArea(this._geometry)/100).toFixed(2)} cm²`;
        if (this._shapeWarn) {
            this._area.setAttribute('title', 'Area may be incorrect due to triangulation error');
            this._area.style.color = '#C22';
        } else {
            this._area.removeAttribute('title');
            this._area.style.color = '#222';
        }

        labelPosition.x = Math.round(labelPosition.x - this._area.offsetWidth/2);
        labelPosition.y = Math.round(labelPosition.y - this._area.offsetHeight/2 - this._container.offsetHeight + 30);
        this._area.style.transform = `translate3D(${labelPosition.x}px,${labelPosition.y}px, 0)`;
    }

    updateDOMColor() {
        if (this._handles.length >= 2) {
            this._lines.forEach(function(elem) {
                elem.style.backgroundColor = `${this._color}`;
            }, this);
        }
        this._area.style.borderColor = `${this._color}`;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];

        this._lines.forEach(function(elem) {
            this._container.removeChild(elem);
        }, this);
        this._lines = [];
        this._container.removeChild(this._area);

        if (this._mesh) {// mesh, geometry, material
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
        }

        super.free();
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
}
