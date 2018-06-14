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
        this._label = null;
        this._line2 = null;
        this._label2 = null;
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

    onEnd() {
        this._handles[0].onEnd();
        this._handles[2].onEnd();

        if ((this._handles[1].tracking && this._handles[0].worldPosition.equals(this._handles[1].worldPosition))) {
            return;
        }

        if (!this._dragged && this._active && !this._handles[2].tracking && !this._handles[3].tracking) {
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

        this.add(this._mesh);
        this.add(this._mesh2);
    }

    createDOM() {
        this._line = document.createElement('div');
        this._line.setAttribute('class', 'widgets-line');
        this._container.appendChild(this._line);

        this._label = document.createElement('div');
        this._label.setAttribute('class', 'widgets-label');
        this._container.appendChild(this._label);

        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets-line');
        this._container.appendChild(this._line2);

        this._label2 = document.createElement('div');
        this._label2.setAttribute('class', 'widgets-label');
        this._container.appendChild(this._label2);

        this._dashline = document.createElement('div');
        this._dashline.setAttribute('class', 'widgets-dashline');
        this._container.appendChild(this._dashline);

        this.updateDOMColor();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._label.style.display = 'none';
        this._line2.style.display = 'none';
        this._label2.style.display = 'none';
        this._dashline.style.display = 'none';

        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });
    }

    showDOM() {
        this._line.style.display = '';
        this._label.style.display = '';
        this._line2.style.display = '';
        this._label2.style.display = '';
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

        // update dash line
        const line1Center = this.getPointInBetweenByPerc(
                this._handles[0].worldPosition, this._handles[1].worldPosition, 0.5),
            line2Center = this.getPointInBetweenByPerc(
                this._handles[2].worldPosition, this._handles[3].worldPosition, 0.5),
            dashLineData = this.getLineData(this.worldToScreen(line1Center), this.worldToScreen(line2Center));

        this._dashline.style.transform =`translate3D(${dashLineData.transformX}px, ${dashLineData.transformY}px, 0)
            rotate(${dashLineData.transformAngle}rad)`;
        this._dashline.style.width = dashLineData.length + 'px';

        // update labels
        const units = this._stack.frame[0].pixelSpacing === null ? 'units' : 'mm',
            title = units === 'units' ? 'Calibration is required to display the distance in mm' : '';

        this._distance = this._handles[0].worldPosition.distanceTo(this._handles[1].worldPosition);
        this._distance2 = this._handles[2].worldPosition.distanceTo(this._handles[3].worldPosition);

        this._label.innerHTML = `${this._distance.toFixed(2)} ${units}`;
        this._label2.innerHTML = `${this._distance2.toFixed(2)} ${units}`;

        if (title !== '') {
            this._label.setAttribute('title', title);
            this._label.style.color = this._colors.error;
            this._label2.setAttribute('title', title);
            this._label2.style.color = this._colors.error;
        } else {
            this._label.removeAttribute('title');
            this._label.style.color = this._colors.text;
            this._label2.removeAttribute('title');
            this._label2.style.color = this._colors.text;
        }

        let angle = Math.abs(lineData.transformAngle);
        if (angle > Math.PI / 2) {
            angle = Math.PI - angle;
        }

        const labelPadding = Math.tan(angle) < this._label.offsetHeight / this._label.offsetWidth
                ? (this._label.offsetWidth / 2) / Math.cos(angle) + 15 // 5px for each handle + padding
                : (this._label.offsetHeight / 2) / Math.cos(Math.PI / 2 - angle) + 15,
            paddingVector = lineData.line.normalize().multiplyScalar(labelPadding),
            paddingPoint = lineData.length > labelPadding * 2
                ? this._handles[1].screenPosition.clone().sub(paddingVector)
                : this._handles[1].screenPosition.clone().add(paddingVector),
            transform = this.adjustLabelTransform(this._label, paddingPoint);

        this._label.style.transform = `translate3D(${transform.x}px, ${transform.y}px, 0)`;

        let angle2 = Math.abs(line2Data.transformAngle);
        if (angle2 > Math.PI / 2) {
            angle2 = Math.PI - angle2;
        }

        const label2Padding = Math.tan(angle2) < this._label2.offsetHeight / this._label2.offsetWidth
            ? (this._label2.offsetWidth / 2) / Math.cos(angle2) + 15 // 5px for each handle + padding
            : (this._label2.offsetHeight / 2) / Math.cos(Math.PI / 2 - angle2) + 15,
            paddingVector2 = line2Data.line.normalize().multiplyScalar(label2Padding),
            paddingPoint2 = line2Data.length > label2Padding * 2
                ? this._handles[3].screenPosition.clone().sub(paddingVector2)
                : this._handles[3].screenPosition.clone().add(paddingVector2),
            transform2 = this.adjustLabelTransform(this._label2, paddingPoint2);

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

        this._handles.forEach((h) => {
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
        const dir = pointB.clone().sub(pointA),
            length = dir.length() * percentage;

        return pointA.clone().add(dir.normalize().multiplyScalar(length));
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
        return ((this._distance < this._distance2) ? this._distance : this._distance2);
    }

    get longestDistance() {
        return ((this._distance > this._distance2) ? this._distance : this._distance2);
    }
}
