import WidgetsBase from '../widgets/widgets.base';
import WidgetsHandle from '../widgets/widgets.handle';

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

        this._worldPosition = new THREE.Vector3();
        if(this._targetMesh !== null) {
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

        this._orientation = null;
        this._slice = null;
    }

    addEventListeners() {
        this._container.addEventListener('mousewheel', this.onMove);
        this._container.addEventListener('DOMMouseScroll', this.onMove);
    }

    onMove(evt) {
        this._dragged = true;
        let numHandles =  this._handles.length;

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

        var hovered = false;

        for (let index in this._handles) {
            this._handles[index].onMove(evt);
            hovered = hovered || this._handles[index].hovered
        }

        this._hovered = hovered;

        if (this.active && numHandles > 2) {
            this.pushPopHandle();
        }

        this.update();
    }

    onStart(evt) {
        this._dragged = false;

        var active = false;

        for (let index in this._handles) {
            this._handles[index].onStart(evt);
            active = active || this._handles[index].active
        }

        this._active = active;
        this.update();
    }

    onEnd(evt) {
        // First Handle
        var active = false;
        for (let index in this._handles.slice(0, this._handles.length-2)) {
            this._handles[index].onEnd(evt);
            active = active || this._handles[index].active
        }

        // Second Handle
        if(this._dragged || !this._handles[this._handles.length-1].tracking) {
            this._handles[this._handles.length-1].tracking = false;
            this._handles[this._handles.length-1].onEnd(evt);
        } else{
            this._handles[this._handles.length-1].tracking = false;
        }

        active = active || this._handles[this._handles.length-1].active
        // State of ruler widget
        this._active = active;

        if (this._lines.length < this._handles.length) {
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
        this.update();
    }

    create() {
        this.createMesh();
        this.createDOM();
    }

    hideDOM() {
        for (let index in this._handles) {
            this._handles[index].hideDOM();
        }

        for (let index in this._lines) {
            this._lines[index].style.display = 'none';
        }
    }

    showDOM() {
        for (let index in this._handles) {
            this._handles[index].showDOM();
        }

        for (let index in this._lines) {
            this._lines[index].style.display = '';
        }
    }

    hideMesh(){
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

        for (let index in this._handles) {
            this._handles[index].update();
        }

        // mesh stuff
        this.updateMeshColor();
        this.updateMeshPosition();

        // DOM stuff
        this.updateDOMPosition();
        this.updateDOMColor();
    }

    createMesh() {
        // geometry
        this._geometry = new THREE.Geometry();
        for (let index in this._handles) {
            this._geometry.vertices.push(this._handles[index].worldPosition);
        }

        // material
        this._material = new THREE.LineBasicMaterial();
        this.updateMeshColor();

        // mesh
        this._mesh = new THREE.Line(this._geometry, this._material);
        this._mesh.visible = true;

        // add it!
        this.add(this._mesh);
    }

    updateMeshColor() {
        if(this._material) {
            this._material.color.set(this._color);
        }
    }

    updateMeshPosition() {
        if(this._geometry) {
            this._geometry.verticesNeedUpdate = true;
        }
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

        // add distance!
        this._distance = document.createElement('div');
        this._distance.setAttribute('class', 'widgets handle distance');
        this._distance.style.border = '2px solid';
        this._distance.style.backgroundColor = '#F9F9F9';
        // this._distance.style.opacity = '0.5';
        this._distance.style.color = '#353535';
        this._distance.style.padding = '4px';
        this._distance.style.position = 'absolute';
        this._distance.style.transformOrigin = '0 100%';
        this._distance.innerHTML = 'Hello, world!';
        this._container.appendChild(this._distance);

        this.updateDOMColor();
    }

    isPointOnLine (pointA, pointB, pointToCheck) {
        var c = new THREE.Vector3();
        c.crossVectors(pointA.clone().sub(pointToCheck), pointB.clone().sub(pointToCheck));
        return !c.length();
    }

    pushPopHandle () {
        let handle0 = this._handles[this._handles.length-3];
        let handle1 = this._handles[this._handles.length-2];
        let newhandle = this._handles[this._handles.length-1];

        var isOnLine = this.isPointOnLine(handle0.worldPosition, handle1.worldPosition, newhandle.worldPosition);

        if (isOnLine) {
            handle1._dom.style.display = 'none';
            this.remove(handle1);

            this._handles[this._handles.length-2] = newhandle;
            this._handles.pop();

            let tempLine = this._lines.pop();
            tempLine.style.display = 'none';
            this._container.removeChild(tempLine);
        }

        return isOnLine;
    }

    updateLineDOM (lineIndex, handle0Index, handle1Index) {
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

        //this._lines[lineIndex].style.display = '';
        this._lines[lineIndex].style.transform = transform;
        this._lines[lineIndex].style.width = length;
    }

    updateDOMPosition() {
        if (this._handles.length >= 2) {
            for (let index in this._lines) {
                this.updateLineDOM(index, index, parseInt(index) + 1 == this._handles.length ? 0 : parseInt(index) + 1)
            }
        }
    }

    updateDOMColor() {
        this._line.style.backgroundColor = `${this._color}`;
        this._distance.style.borderColor = `${this._color}`;
    }

    getPointInBetweenByPerc(pointA, pointB, percentage) {

        var dir = pointB.clone().sub(pointA);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len*percentage);
        return pointA.clone().add(dir);

    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._worldPosition = worldPosition;

        for (let index in this._handles) {
            this._handles[index]._worldPosition = this._worldPosition;
        }

        this.update();
    }
}