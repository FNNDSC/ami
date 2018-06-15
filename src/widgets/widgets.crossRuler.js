import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

/**
 * @module widgets/crossRuler
 */
export default class WidgetsCrossRuler extends WidgetsBase {
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
        this._line2 = null;

        // add handles
        this._handles = [];

        let handle;
        for (let i = 0; i < 4; i++) {
            handle = new WidgetsHandle(targetMesh, controls);
            handle.worldPosition.copy(this._worldPosition);
            handle.hovered = true;
            this.add(handle);
            this._handles.push(handle);
        }
        this._handles[1].active = true;
        this._handles[1].tracking = true;

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
        } else {
            this._hovered = this._handles[0].hovered || this._handles[1].hovered ||
                this._handles[2].hovered || this._handles[3].hovered;
            this._container.style.cursor = this._hovered ? 'pointer' : 'default';
        }

        this._handles[0].onMove(evt);
        this._handles[1].onMove(evt);
        this._handles[2].onMove(evt);
        this._handles[3].onMove(evt);

        this.update();
    }

    onEnd() {
        this._handles[0].onEnd();
        this._handles[2].onEnd();
        this._handles[3].onEnd();

        if (this._handles[1].tracking && this._handles[0].worldPosition.equals(this._handles[1].worldPosition)) {
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

        this.initOrtho();
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

        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets-line');
        this._container.appendChild(this._line2);

        this.updateDOMColor();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._line2.style.display = 'none';

        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });
    }

    showDOM() {
        this._line.style.display = '';
        this._line2.style.display = '';

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

    getPointInBetweenByPerc(pointA, pointB, percentage) {
        const dir = pointB.clone().sub(pointA),
            length = dir.length() * percentage;

        return pointA.clone().add(dir.normalize().multiplyScalar(length));
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
}
