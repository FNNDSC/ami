import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

/**
 * @module widgets/ellipse
 */
export default class WidgetsEllipse extends WidgetsBase {
    constructor(targetMesh, controls) {
        super(targetMesh, controls);

        this._lastEvent = null;// TODO! is it needed?
        this._moving = false;
        this._domHovered = false;

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // dom stuff
        this._rectangle = null;
        this._ellipse = null;
        this._label = null;

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
        this.onEndControl = this.onEndControl.bind(this);// TODO! is it needed?
        this.onHover = this.onHover.bind(this);
        this.addEventListeners();
    }

    addEventListeners() {
        this._container.addEventListener('wheel', this.onMove);

        this._controls.addEventListener('end', this.onEndControl);

        this._rectangle.addEventListener('mouseenter', this.onHover);
        this._rectangle.addEventListener('mouseleave', this.onHover);
        this._ellipse.addEventListener('mouseenter', this.onHover);
        this._ellipse.addEventListener('mouseleave', this.onHover);
        this._label.addEventListener('mouseenter', this.onHover);
        this._label.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
        this._container.removeEventListener('wheel', this.onMove);

        this._controls.removeEventListener('end', this.onEndControl);

        this._rectangle.removeEventListener('mouseenter', this.onHover);
        this._rectangle.removeEventListener('mouseleave', this.onHover);
        this._ellipse.removeEventListener('mouseenter', this.onHover);
        this._ellipse.removeEventListener('mouseleave', this.onHover);
        this._label.removeEventListener('mouseenter', this.onHover);
        this._label.removeEventListener('mouseleave', this.onHover);
    }

    onHover(evt) {
        if (evt) {
            this._lastEvent = evt;
            evt.preventDefault();
            this.hoverDom(evt);
        }

        this.hoverMesh();

        this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
        // check raycast intersection, do we want to hover on mesh or just css?
    }

    hoverDom(evt) {
        this._domHovered = (evt.type === 'mouseenter');
    }

    onStart(evt) {
        this._lastEvent = evt;

        this.imoveHandle.onMove(evt, true);

        this._handles[0].onStart(evt);
        this._handles[1].onStart(evt);

        this._active = this._handles[0].active || this._handles[1].active || this._domHovered;

        if (this._domHovered) {
            this._moving = true;
            this._controls.enabled = false;
        }

        this.update();
    }

    onMove(evt) {
        this._lastEvent = evt;

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

        this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._domHovered;

        this.update();
    }

    onEnd(evt) {
        this._lastEvent = evt;
        // First Handle
        this._handles[0].onEnd(evt);

        if (!this._dragged && this._active && !this._handles[1].tracking) {
            this._selected = !this._selected; // change state if there was no dragging
            this._handles[0].selected = this._selected;
        }

        // Second Handle
        if (this._dragged || !this._handles[1].tracking) {
            this._handles[1].tracking = false;
            this._handles[1].onEnd(evt);
        } else {
            this._handles[1].tracking = false;
        }
        this._handles[1].selected = this._selected;

        this._active = this._handles[0].active || this._handles[1].active;
        this._dragged = false;
        this._moving = false;
        this.update();
    }

    onEndControl() {
        if (!this._lastEvent) {
            return;
        }

        window.requestAnimationFrame(() => {
            this.onMove(this._lastEvent);
        });
    }

    hideDOM() {
        this._handles.forEach(function(elem) {
            elem.hideDOM();
        });

        this._rectangle.style.display = 'none';
        this._ellipse.style.display = 'none';
        this._label.style.display = 'none';
    }

    showDOM() {
        this._handles.forEach(function(elem) {
            elem.showDOM();
        });

        this._rectangle.style.display = '';
        this._ellipse.style.display = '';
        this._label.style.display = '';
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
        this._rectangle = document.createElement('div');
        this._rectangle.setAttribute('class', 'widgets handle rectangle');
        this._rectangle.style.border = '2px dashed';
        this._rectangle.style.position = 'absolute';
        this._rectangle.style.transformOrigin = '0 100%';
        this._container.appendChild(this._rectangle);

        this._ellipse = document.createElement('div');
        this._ellipse.setAttribute('class', 'widgets handle ellipse');
        this._ellipse.style.border = '2px solid';
        this._ellipse.style.borderRadius = '50%';
        this._ellipse.style.position = 'absolute';
        this._ellipse.style.transformOrigin = '0 100%';
        this._ellipse.style.zIndex = '2';
        this._container.appendChild(this._ellipse);

        this._label = document.createElement('div');
        this._label.setAttribute('class', 'widgets handle label');
        this._label.style.border = '2px solid';
        this._label.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
        // this._label.style.opacity = '0.5';
        this._label.style.color = '#222';
        this._label.style.padding = '4px';
        this._label.style.position = 'absolute';
        this._label.style.transformOrigin = '0 100%';
        this._label.style.zIndex = '3';
        this._container.appendChild(this._label);

        this.updateDOMColor();
    }

    update() {
        this.updateColor();

        // update handles
        this._handles[0].update();
        this._handles[1].update();

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
    }

    updateMeshPosition() {
        if (this._mesh) {
            this.remove(this._mesh);
        }

        const direction = new Vector3();
        this._camera.getWorldDirection(direction);
        const vec01 = new Vector3().subVectors(this._handles[1].worldPosition, this._handles[0].worldPosition),
            height = vec01.clone().projectOnVector(this._camera.up).length(),
            width = vec01.clone().projectOnVector(direction.cross(this._camera.up)).length();

        if (width === 0 || height === 0) {
            return;
        }

        this._geometry = new THREE.ShapeGeometry(new THREE.Shape(
            new THREE.EllipseCurve(0, 0, width / 2, height / 2, 0, 2 * Math.PI, false).getPoints(50)
        ));

        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.position.copy(this._handles[0].worldPosition.clone().add(vec01.multiplyScalar(0.5)));
        this._mesh.rotation.copy(this._camera.rotation);
        this._mesh.visible = true;
        this.add(this._mesh);
    }

    updateDOMPosition() {
        let x1 = this._handles[0].screenPosition.x,
            y1 = this._handles[0].screenPosition.y,
            x2 = this._handles[1].screenPosition.x,
            y2 = this._handles[1].screenPosition.y;

        let transform = `translate3D(${Math.min(x1, x2)}px,${Math.min(y1, y2) - this._container.offsetHeight}px, 0)`,
            width = Math.abs(x2 - x1),
            height = Math.abs(y2 - y1);

        // update rectangle
        this._rectangle.style.transform = transform;
        this._rectangle.style.width = width + 'px';
        this._rectangle.style.height = height + 'px';

        // update ellipse
        this._ellipse.style.transform = transform;
        this._ellipse.style.width = width + 'px';
        this._ellipse.style.height = height + 'px';

        // update label
        const area = this._geometry ? (AMI.SliceGeometry.shapeGeometryArea(this._geometry) / 100).toFixed(2) : 0.0;
        this._label.innerHTML = `${area} cm²`;

        let x0 = Math.round(x2 - this._label.offsetWidth/2),
            y0 = Math.round(y2 - this._container.offsetHeight - this._label.offsetHeight/2);

        y0 += y1 >= y2 ? -30 : 30;

        this._label.style.transform = `translate3D(${x0}px,${y0}px, 0)`;
    }

    updateDOMColor() {
        this._rectangle.style.borderColor = `${this._color}`;
        this._ellipse.style.borderColor = `${this._color}`;
        this._label.style.borderColor = `${this._color}`;
    }

    free() {
        this.removeEventListeners();

        this._handles.forEach((h) => {
            this.remove(h);
            h.free();
        });
        this._handles = [];

        this._container.removeChild(this._rectangle);
        this._container.removeChild(this._ellipse);
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

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._handles[0].worldPosition.copy(worldPosition);
        this._handles[1].worldPosition.copy(worldPosition);
        this._worldPosition.copy(worldPosition);
        this.update();
    }
}
