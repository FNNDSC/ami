import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

/**
 * @module widgets/angle
 */
export default class WidgetsAngle extends WidgetsBase {
    constructor(targetMesh, controls) {
        super(targetMesh, controls);

        this._moving = false;
        this._domHovered = false;

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
        this._angle = null;

        this._opangle = null;
        this._defaultAngle = true;

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
        thirdHandle.active = true;
        thirdHandle.tracking = true;
        this.add(thirdHandle);
        this._handles.push(thirdHandle);

        // handles to move widget
        this.imoveHandle = new WidgetsHandle(targetMesh, controls);
        this.imoveHandle.worldPosition.copy(this._worldPosition);
        this.imoveHandle.hovered = true;
        this.add(this.imoveHandle);
        this._handles.push(this.imoveHandle);
        this.imoveHandle.hide();

        this.fmoveHandle = new WidgetsHandle(targetMesh, controls);
        this.fmoveHandle.worldPosition.copy(this._worldPosition);
        this.fmoveHandle.hovered = true;
        this.add(this.fmoveHandle);
        this._handles.push(this.fmoveHandle);
        this.fmoveHandle.hide();

        this.create();

        this.onMove = this.onMove.bind(this);
        this.onHover = this.onHover.bind(this);
        this.addEventListeners();
    }

    addEventListeners() {
        this._container.addEventListener('wheel', this.onMove);

        this._line.addEventListener('mouseenter', this.onHover);
        this._line.addEventListener('mouseleave', this.onHover);
        this._line2.addEventListener('mouseenter', this.onHover);
        this._line2.addEventListener('mouseleave', this.onHover);
        this._angle.addEventListener('mouseenter', this.onHover);
        this._angle.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
        this._container.removeEventListener('wheel', this.onMove);

        this._line.removeEventListener('mouseenter', this.onHover);
        this._line.removeEventListener('mouseleave', this.onHover);
        this._line2.removeEventListener('mouseenter', this.onHover);
        this._line2.removeEventListener('mouseleave', this.onHover);
        this._angle.removeEventListener('mouseenter', this.onHover);
        this._angle.removeEventListener('mouseleave', this.onHover);
    }

    onHover(evt) {
        if (evt) {
          this.hoverDom(evt);
        }

        this.hoverMesh();

        this._hovered = this._handles[0].hovered || this._handles[1].hovered ||
            this._handles[2].hovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
        // check raycast intersection, do we want to hover on mesh or just css?
    }

    hoverDom(evt) {
        this._domHovered = (evt.type === 'mouseenter');
    }

    onStart(evt) {
        this.imoveHandle.onMove(evt, true);

        this._handles[0].onStart(evt);
        this._handles[1].onStart(evt);
        this._handles[2].onStart(evt);

        this._active = this._handles[0].active || this._handles[1].active ||
            this._handles[2].active || this._domHovered;

        if (this._domHovered) {
            this._moving = true;
            this._controls.enabled = false;
        }

        this.update();
    }

    onMove(evt) {
        if (this._active) {
            this._dragged = true;

            this.fmoveHandle.onMove(evt, true);

            if (this._moving) {
                this._handles.slice(0, -2).forEach(function(elem, ind) {
                    this._handles[ind].worldPosition.x = elem.worldPosition.x
                        + (this.fmoveHandle.worldPosition.x - this.imoveHandle.worldPosition.x);
                    this._handles[ind].worldPosition.y = elem.worldPosition.y
                        + (this.fmoveHandle.worldPosition.y - this.imoveHandle.worldPosition.y);
                    this._handles[ind].worldPosition.z = elem.worldPosition.z
                        + (this.fmoveHandle.worldPosition.z - this.imoveHandle.worldPosition.z);
                }, this);
            }

            this.imoveHandle.onMove(evt, true);
        }

        this._handles[0].onMove(evt);
        this._handles[1].onMove(evt);
        this._handles[2].onMove(evt);

        this._hovered = this._handles[0].hovered || this._handles[1].hovered ||
            this._handles[2].hovered || this._domHovered;

        this.update();
    }

    onEnd() {
        // First Handle
        this._handles[0].onEnd();

        if (!this._dragged && this._active && !this._handles[2].tracking) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles[0].selected = this._selected;
        }

        // Third Handle
        if (this._handles[1].active) {
            this._handles[2].onEnd();
        } else if (this._dragged || !this._handles[2].tracking) {
            this._handles[2].tracking = false;
            this._handles[2].onEnd();
        } else {
            this._handles[2].tracking = false;
        }
        this._handles[2].selected = this._selected;

        // Second Handle
        if (this._dragged || !this._handles[1].tracking) {
            this._handles[1].tracking = false;
            this._handles[1].onEnd();
        } else {
            this._handles[1].tracking = false;
        }
        this._handles[1].selected = this._selected;

        this._active = this._handles[0].active || this._handles[1].active || this._handles[2].active;
        this._dragged = this._handles[2].tracking;
        this._moving = false;
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
        this._geometry2.vertices.push(this._handles[1].worldPosition);
        this._geometry2.vertices.push(this._handles[2].worldPosition);

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

        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets-line');
        this._line2.style.position = 'absolute';
        this._line2.style.transformOrigin = '0 100%';
        this._line2.style.marginTop = '-1px';
        this._line2.style.height = '2px';
        this._line2.style.width = '3px';
        this._container.appendChild(this._line2);

        this._angle = document.createElement('div');
        this._angle.setAttribute('class', 'widgets-label');
        this._angle.style.border = '2px solid';
        this._angle.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
        // this._angle.style.opacity = '0.5';
        this._angle.style.color = '#222';
        this._angle.style.padding = '4px';
        this._angle.style.position = 'absolute';
        this._angle.style.transformOrigin = '0 100%';
        this._angle.style.zIndex = '3';
        this._container.appendChild(this._angle);

        this.updateDOMColor();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._line2.style.display = 'none';
        this._angle.style.display = 'none';

        this._handles.forEach(function(elem) {
          elem.hideDOM();
        });
    }

    showDOM() {
        this._line.style.display = '';
        this._line2.style.display = '';
        this._angle.style.display = '';

        this._handles[0].showDOM();
        this._handles[1].showDOM();
        this._handles[2].showDOM();
    }

    update() {
        this.updateColor();

        // update handles
        this._handles[0].update();
        this._handles[1].update();
        this._handles[2].update();

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
        let x1 = this._handles[0].screenPosition.x,
            y1 = this._handles[0].screenPosition.y,
            x2 = this._handles[1].screenPosition.x,
            y2 = this._handles[1].screenPosition.y;

        let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)),
            angle = Math.atan2(y2 - y1, x2 - x1);

        let posY = y1 - this._container.offsetHeight;

        this._line.style.transform = `translate3D(${x1}px,${posY}px, 0)  rotate(${angle}rad)`;
        this._line.style.width = length + 'px';

        // update second line
        let x3 = this._handles[1].screenPosition.x,
            y3 = this._handles[1].screenPosition.y,
            x4 = this._handles[2].screenPosition.x,
            y4 = this._handles[2].screenPosition.y;

        length = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
        angle = Math.atan2(y4 - y3, x4 - x3);

        posY = y3 - this._container.offsetHeight;

        // update line
        this._line2.style.transform = `translate3D(${x3}px,${posY}px, 0) rotate(${angle}rad)`;
        this._line2.style.width = length + 'px';

        // update angle
        let p10 = this._handles[1].worldPosition.distanceTo(this._handles[0].worldPosition),
            p12 = this._handles[1].worldPosition.distanceTo(this._handles[2].worldPosition),
            p02 = this._handles[0].worldPosition.distanceTo(this._handles[2].worldPosition);

        let a0102 = p10 > 0 && p12 > 0
                ? Math.acos((p10*p10 + p12*p12 - p02*p02)/(2 * p10 * p12))
                : 0.0;
        this._opangle = this._defaultAngle ? a0102*180/Math.PI : 360-(a0102*180/Math.PI);
        this._angle.innerHTML = `${this._opangle.toFixed(2)}&deg;`;

        let x0 = Math.round(x2 - this._angle.offsetWidth/2),
            y0 = Math.round(y2 - this._container.offsetHeight - this._angle.offsetHeight/2);

        y0 += y1 >= y2 ? -30 : 30;

        this._angle.style.transform = `translate3D(${x0}px,${y0}px, 0)`;
    }

    updateDOMColor() {
        this._line.style.backgroundColor = `${this._color}`;
        this._line2.style.backgroundColor = `${this._color}`;
        this._angle.style.borderColor = `${this._color}`;
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
        this._container.removeChild(this._angle);

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

    toggleDefaultAngle() {
        this._defaultAngle = !this._defaultAngle;
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
        this._worldPosition.copy(worldPosition);
        this.update();
    }

    get angle() {
        return this._opangle;
    }
}
