import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

/**
 * @module widgets/biruler
 */
export default class WidgetsBiRuler extends WidgetsBase {
    constructor(targetMesh, controls, stack) {
        super(targetMesh, controls);

        this._stack = stack;

        this._initOrtho = false;

        // mesh stuff
        this._material = null;
        this._material2 = null;
        this._geometry = null;
        this._geometry2 = null;
        this._mesh = null;
        this._mesh2 = null;

        // dom stuff
        this._line = null;
        this._distance = null;
        this._line2 = null;
        this._distance2 = null;
        this._dashline = null;

        // add handles
        this._handles = [];

        let firstHandle = new WidgetsHandle(targetMesh, controls);
        firstHandle.worldPosition.copy(this._worldPosition);
        firstHandle.hovered = true;
        this.add(firstHandle);
        this._handles.push(firstHandle);

        let secondHandle = new WidgetsHandle(targetMesh, controls);
        secondHandle.worldPosition.copy(this._worldPosition);
        secondHandle.hovered = true;
        secondHandle.active = true;
        secondHandle.tracking = true;
        this.add(secondHandle);
        this._handles.push(secondHandle);

        let thirdHandle = new WidgetsHandle(targetMesh, controls);
        thirdHandle.worldPosition.copy(this._worldPosition);
        thirdHandle.hovered = true;
        // active and tracking?
        this.add(thirdHandle);
        this._handles.push(thirdHandle);

        let fourthHandle = new WidgetsHandle(targetMesh, controls);
        fourthHandle.worldPosition.copy(this._worldPosition);
        fourthHandle.hovered = true;
        fourthHandle.active = true;
        fourthHandle.tracking = true;
        // active and tracking?
        this.add(fourthHandle);
        this._handles.push(fourthHandle);

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
        this._handles[0].onStart(evt);
        this._handles[1].onStart(evt);
        this._handles[2].onStart(evt);
        this._handles[3].onStart(evt);

        this._active = this._handles[0].active || this._handles[1].active ||
            this._handles[2].active || this._handles[3].active;
        this.update();
    }

    onMove(evt) {
        if (this._active) {
            this._dragged = true;
        }

        this._handles[0].onMove(evt);
        this._handles[1].onMove(evt);
        this._handles[2].onMove(evt);
        this._handles[3].onMove(evt);

        this._hovered = this._handles[0].hovered || this._handles[1].hovered ||
            this._handles[2].hovered || this._handles[3].hovered;

        this.update();
    }

    onEnd(evt) {
        this._handles[0].onEnd(evt);

        if (!this._dragged && this._active && !this._handles[2].tracking && !this._handles[3].tracking) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles[0].selected = this._selected;
        }

        // Third Handle
        if (this._handles[3].active) {
            this._handles[2].onEnd(evt);
        } else if (this._dragged || !this._handles[2].tracking) {
            this._handles[2].tracking = false;
            this._handles[2].onEnd(evt);
        } else {
            this._handles[2].tracking = false;
        }
        this._handles[2].selected = this._selected;

        // Fourth Handle
        if (this._handles[1].active) {
            this._handles[3].onEnd(evt);
        } else if (this._dragged || !this._handles[3].tracking) {
            this._handles[3].tracking = false;
            this._handles[3].onEnd(evt);
            this._handles[2].tracking = true;
        } else {
            this._handles[3].tracking = false;
        }
        this._handles[3].selected = this._selected;

        // Second Handle
        if (this._dragged || !this._handles[1].tracking) {
            this._handles[1].tracking = false;
            this._handles[1].onEnd(evt);
        } else {
            this._handles[1].tracking = false;
        }
        this._handles[1].selected = this._selected;

        this._active = this._handles[0].active || this._handles[1].active ||
            this._handles[2].active || this._handles[3].active;
        this._dragged = false;
        this.update();
    }

    create() {
        this.createMesh();
        this.createDOM();
    }

    createMesh() {
        // geometry
        this._geometry = new THREE.Geometry();
        this._geometry.vertices.push(this._handles[0].worldPosition);
        this._geometry.vertices.push(this._handles[1].worldPosition);

        // geometry
        this._geometry2 = new THREE.Geometry();
        this._geometry2.vertices.push(this._handles[2].worldPosition);
        this._geometry2.vertices.push(this._handles[3].worldPosition);

        // material
        this._material = new THREE.LineBasicMaterial();
        this._material2 = new THREE.LineBasicMaterial();
        this.updateMeshColor();

        // mesh
        this._mesh = new THREE.Line(this._geometry, this._material);
        this._mesh.visible = true;
        this._mesh2 = new THREE.Line(this._geometry2, this._material2);
        this._mesh2.visible = true;

        // add it!
        this.add(this._mesh);
        this.add(this._mesh2);
    }

    createDOM() {
        this._line = document.createElement('div');
        this._line.setAttribute('class', 'widgets-line');
        this._line.style.position = 'absolute';
        this._line.style.transformOrigin = '0 100%';
        this._line.style.marginTop = '-1px';
        this._line.style.height = '2px';
        this._line.style.width = '3px';
        this._container.appendChild(this._line);

        this._distance = document.createElement('div');
        this._distance.setAttribute('class', 'widgets-label');
        this._distance.style.border = '2px solid';
        this._distance.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
        // this._distance.style.opacity = '0.5';
        this._distance.style.color = '#222';
        this._distance.style.padding = '4px';
        this._distance.style.position = 'absolute';
        this._distance.style.transformOrigin = '0 100%';
        this._distance.style.zIndex = '3';
        this._container.appendChild(this._distance);

        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets-line');
        this._line2.style.position = 'absolute';
        this._line2.style.transformOrigin = '0 100%';
        this._line2.style.marginTop = '-1px';
        this._line2.style.height = '2px';
        this._line2.style.width = '3px';
        this._container.appendChild(this._line2);

        this._distance2 = document.createElement('div');
        this._distance2.setAttribute('class', 'widgets-label');
        this._distance2.style.border = '2px solid';
        this._distance2.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
        // this._distance2.style.opacity = '0.5';
        this._distance2.style.color = '#222';
        this._distance2.style.padding = '4px';
        this._distance2.style.position = 'absolute';
        this._distance2.style.transformOrigin = '0 100%';
        this._distance2.style.zIndex = '3';
        this._container.appendChild(this._distance2);

        this._dashline = document.createElement('div');
        this._dashline.setAttribute('class', 'widgets-dashline');
        this._dashline.style.position = 'absolute';
        this._dashline.style.border = 'none';
        this._dashline.style.borderTop = '2.5px dashed #F9F9F9';
        this._dashline.style.transformOrigin = '0 100%';
        this._dashline.style.height = '1px';
        this._dashline.style.width = '50%';
        this._container.appendChild(this._dashline);

        this.updateDOMColor();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._distance.style.display = 'none';
        this._line2.style.display = 'none';
        this._distance2.style.display = 'none';
        this._dashline.style.display = 'none';

        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });
    }

    showDOM() {
        this._line.style.display = '';
        this._distance.style.display = '';
        this._line2.style.display = '';
        this._distance2.style.display = '';
        this._dashline.style.display = '';

        this._handles.forEach(function(elem) {
            elem.showDOM();
        });
    }

    update() {
        this.updateColor();

        // update handles
        this._handles[0].update();
        this._handles[1].update();
        this._handles[2].update();
        this._handles[3].update();

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
        // update rulers lines and text!
        let x1 = this._handles[0].screenPosition.x;
        let y1 = this._handles[0].screenPosition.y;
        let x2 = this._handles[1].screenPosition.x;
        let y2 = this._handles[1].screenPosition.y;

        let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        let angle = Math.atan2(y2 - y1, x2 - x1);

        let posY = y1 - this._container.offsetHeight;

        // update line
        let transform = `translate3D(${x1}px,${posY}px, 0) rotate(${angle}rad)`;

        this._line.style.transform = transform;
        this._line.style.width = length + 'px';

        // update distance
        const units = this._stack.frame[0].pixelSpacing === null ? 'units' : 'mm',
            title = units === 'units' ? 'Calibration is required to display the distance in mm' : '';

        this._distanceValue = this._handles[0].worldPosition.distanceTo(this._handles[1].worldPosition).toFixed(2);
        this._distance.innerHTML = `${this._distanceValue} ${units}`;
        if (title !== '') {
            this._distance.setAttribute('title', title);
            this._distance.style.color = '#C22';
        } else {
            this._distance.removeAttribute('title');
            this._distance.style.color = '#222';
        }

        let x0 = Math.round(x2 - this._distance.offsetWidth/2);
        let y0 = Math.round(y2 - this._container.offsetHeight - this._distance.offsetHeight/2);

        y0 += y1 >= y2 ? -30 : 30;

        this._distance.style.transform = `translate3D(${x0}px,${y0}px, 0)`;

        // update rulers lines 2 and text!
        let x3 = this._handles[2].screenPosition.x;
        let y3 = this._handles[2].screenPosition.y;
        let x4 = this._handles[3].screenPosition.x;
        let y4 = this._handles[3].screenPosition.y;

        length = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
        angle = Math.atan2(y4 - y3, x4 - x3);

        posY = y3 - this._container.offsetHeight;

        // update line
        transform = `translate3D(${x3}px,${posY}px, 0) rotate(${angle}rad)`;

        this._line2.style.transform = transform;
        this._line2.style.width = length + 'px';

        // update distance
        this._distance2Value = this._handles[2].worldPosition.distanceTo(this._handles[3].worldPosition).toFixed(2);
        this._distance2.innerHTML = `${this._distance2Value} ${units}`;
        if (title !== '') {
            this._distance2.setAttribute('title', title);
            this._distance2.style.color = '#C22';
        } else {
            this._distance2.removeAttribute('title');
            this._distance2.style.color = '#222';
        }

        let x02 = Math.round(x4 - this._distance.offsetWidth/2);
        let y02 = Math.round(y4 - this._container.offsetHeight - this._distance.offsetHeight/2);

        y02 += y3 >= y4 ? -30 : 30;

        this._distance2.style.transform = `translate3D(${x02}px,${y02}px, 0)`;

        // update dash line
        let l1center = this.getPointInBetweenByPerc(
            this._handles[0].worldPosition, this._handles[1].worldPosition, 0.5);
        let l2center = this.getPointInBetweenByPerc(
            this._handles[2].worldPosition, this._handles[3].worldPosition, 0.5);

        let screen1 = this.worldToScreen(l1center);
        let screen2 = this.worldToScreen(l2center);

        x1 = screen1.x;
        y1 = screen1.y;
        x2 = screen2.x;
        y2 = screen2.y;

        length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        angle = Math.atan2(y2 - y1, x2 - x1);

        posY = y1 - this._container.offsetHeight;

        // update line
        transform = `translate3D(${x1}px,${posY}px, 0) rotate(${angle}rad)`;

        this._dashline.style.transform = transform;
        this._dashline.style.width = length + 'px';
    }

    updateDOMColor() {
        this._line.style.backgroundColor = `${this._color}`;
        this._distance.style.borderColor = `${this._color}`;

        this._line2.style.backgroundColor = `${this._color}`;
        this._distance2.style.borderColor = `${this._color}`;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];

        this._container.removeChild(this._line);
        this._container.removeChild(this._distance);
        this._container.removeChild(this._line2);
        this._container.removeChild(this._distance2);
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

    getPointInBetweenByPerc(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA);
        dir = dir.normalize().multiplyScalar(dir.length() * percentage);

        return pointA.clone().add(dir);
    }

    initOrtho() {
        this._initOrtho = true;

        let pcenter = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.5);
        this._handles[2].worldPosition = this.getPointInBetweenByPerc(
            this._handles[0].worldPosition, this._handles[1].worldPosition, 0.25);
        this._handles[3].worldPosition = this.getPointInBetweenByPerc(
            this._handles[0].worldPosition, this._handles[1].worldPosition, 0.75);

        this._handles[2].worldPosition.x = pcenter.x -
            Math.sqrt((pcenter.y - this._handles[2].worldPosition.y)*(pcenter.y - this._handles[2].worldPosition.y));
        this._handles[2].worldPosition.y = pcenter.y +
            Math.sqrt((pcenter.x - this._handles[2].worldPosition.x)*(pcenter.x - this._handles[2].worldPosition.x));

        this._handles[3].worldPosition.x = pcenter.x +
            Math.sqrt((pcenter.y - this._handles[2].worldPosition.y)*(pcenter.y - this._handles[2].worldPosition.y));
        this._handles[3].worldPosition.y = pcenter.y -
            Math.sqrt((pcenter.x - this._handles[2].worldPosition.x)*(pcenter.x - this._handles[2].worldPosition.x));
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
        this._handles[0].worldPosition.copy(worldPosition);
        this._handles[1].worldPosition.copy(worldPosition);
        this._handles[2].worldPosition.copy(worldPosition);
        this._handles[3].worldPosition.copy(worldPosition);
        this._worldPosition.copy(worldPosition);
        this.update();
    }

    get shotestDistance() {
        return ((this._distanceValue < this._distance2Value) ? this._distanceValue : this._distance2Value);
    }

    get longestDistance() {
        return ((this._distanceValue > this._distance2Value) ? this._distanceValue : this._distance2Value);
    }
}
