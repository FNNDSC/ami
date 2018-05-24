import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

/**
 * @module widgets/handle
 *
 */

export default class WidgetsRoi extends WidgetsBase {
    constructor(targetMesh, controls, camera, container) {
        super();

        this._targetMesh = targetMesh;
        this._controls = controls;
        this._camera = camera;
        this._container = container;

        this._active = true;
        this._init = false;

        this._worldPosition = new Vector3();
        if (this._targetMesh !== null) {
            this._worldPosition = this._targetMesh.position;
        }

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
        let firstHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        firstHandle.worldPosition = this._worldPosition;
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

        if (this.active && !this._init) {
            let lastHandle = this._handles[numHandles-1];
            lastHandle.hovered = false;
            lastHandle.active = false;
            lastHandle.tracking = false;

            let nextHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
            nextHandle.worldPosition = this._worldPosition;
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

        // State of widget
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

        this._init = true;
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
        // add line!
        this._line = document.createElement('div');
        this._line.setAttribute('class', 'widgets handle line');
        this._line.style.position = 'absolute';
        this._line.style.transformOrigin = '0 100%';
        this._line.style.marginTop = '-1px';
        this._line.style.height = '2px';
        this._line.style.width = '3px';
        this._container.appendChild(this._line);

        this.updateDOMColor();
    }

    hideDOM() {
        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = 'none';
        });
    }

    showDOM() {
        this._handles.forEach(function(elem) {
            elem.showDOM();
        });

        this._lines.forEach(function(elem) {
            elem.style.display = '';
        });
    }

    hideMesh() {
        this.visible = false;
    }

    showMesh() {
        this.visible = true;
    }

    show() {
        this.showDOM();
        this.showMesh();
    }

    hide() {
        this.hideDOM();
        this.hideMesh();
    }

    update() {
        this.updateColor();

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
        let side1 = new THREE.Vector3(0, 0, 0);
        let side2 = new THREE.Vector3(0, 0, 0);
        side1.subVectors(points[0], center);
        side2.subVectors(points[1], center);
        let direction = new THREE.Vector3(0, 0, 0);
        direction.crossVectors(side1, side2);

        let reference = center;
        // direction from first point to reference
        let referenceDirection = new THREE.Vector3(
            points[0].x - reference.x,
            points[0].y - reference.y,
            points[0].z - reference.z
        ).normalize();

        let base = new THREE.Vector3(0, 0, 0)
            .crossVectors(referenceDirection, direction)
            .normalize();

        let orderedpoints = [];

        // other lines // if inter, return location + angle
        for (let j = 0; j < points.length; j++) {
            let point = new THREE.Vector3(
                points[j].x,
                points[j].y,
                points[j].z);
            point.direction = new THREE.Vector3(
                points[j].x - reference.x,
                points[j].y - reference.y,
                points[j].z - reference.z).normalize();

            let x = referenceDirection.dot(point.direction);
            let y = base.dot(point.direction);
            point.xy = {x, y};
            point.angle = Math.atan2(y, x) * (180 / Math.PI);

            orderedpoints.push(point);
        }

        let sliceShape = AMI.SliceGeometry.shape(orderedpoints);

        this._geometry = new THREE.ShapeGeometry(sliceShape);
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
        let handle0 = this._handles[this._handles.length-3];
        let handle1 = this._handles[this._handles.length-2];
        let newhandle = this._handles[this._handles.length-1];

        let isOnLine = this.isPointOnLine(handle0.worldPosition, handle1.worldPosition, newhandle.worldPosition);

        let w0 = handle0;
        let w1 = newhandle;

        var interpointdist = Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z));

        if (isOnLine || interpointdist < 3) {
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
        // update rulers lines and text!
        let x1 = this._handles[handle0Index].screenPosition.x;
        let y1 = this._handles[handle0Index].screenPosition.y;
        let x2 = this._handles[handle1Index].screenPosition.x;
        let y2 = this._handles[handle1Index].screenPosition.y;

        let x0 = x2;
        let y0 = y2;

        if (y1 >= y2) {
            y0 = y2 - 30;
        } else {
            y0 = y2 + 30;
        }

        let length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        let posY = y1 - this._container.offsetHeight;

        // update line
        let transform = `translate3D(${x1}px, ${posY}px, 0)`;
        transform += ` rotate(${angle}deg)`;

        this._lines[lineIndex].style.transform = transform;
        this._lines[lineIndex].style.width = length + 'px';
    }

    updateDOMPosition() {
        if (this._handles.length >= 2) {
            this._lines.forEach(function(elem, ind) {
                this.updateLineDOM(ind, ind, ind + 1 === this._handles.length ? 0 : ind + 1);
            }, this);
        }
    }

    updateDOMColor() {
        if (this._handles.length >= 2) {
            this._lines.forEach(function(elem) {
                elem.style.backgroundColor = `${this._color}`;
            }, this);
        }
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
        this._worldPosition = worldPosition;

        this._handles.forEach(function(elem) {
            elem._worldPosition = this._worldPosition;
        }, this);

        this.update();
    }
}
