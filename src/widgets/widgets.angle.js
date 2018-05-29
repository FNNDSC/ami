import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

/**
 * @module widgets/angle
 *
 */

export default class WidgetsAngle extends WidgetsBase {
    constructor(targetMesh, controls, camera, container) {
        super();

        this._targetMesh = targetMesh;
        this._controls = controls;
        this._camera = camera;
        this._container = container;

        this._active = true;
        this._moving = false;

        this._worldPosition = new Vector3();
        if (this._targetMesh !== null) {
            this._worldPosition = this._targetMesh.position;
        }

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // dom stuff
        this._line = null;
        this._distance = null;

        // dom stuff
        this._line2 = null;

        this._angle = null;
        this._opangle = null;

        // add handles
        this._handles = [];

        this._defaultAngle = true;
    }

    setPoints(pointsList) {
        for (var i = 0; i < pointsList.length; i++) {
            // first handle
            let newHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
            newHandle.worldPosition = pointsList[i].worldPosition;
            newHandle.hovered = true;
            this.add(newHandle);

            this._handles.push(newHandle);
            pointsList[i].hide();
        }

        // Create ruler
        this.create();

        this.onMove = this.onMove.bind(this);
        this.onHover = this.onHover.bind(this);
        this.addEventListeners();

        this._orientation = null;
        this._slice = null;

            // first handle
        this.imoveHandle =
            new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        this.imoveHandle.worldPosition = this._worldPosition;
        this.imoveHandle.hovered = true;
        this.add(this.imoveHandle);
        this._handles.push(this.imoveHandle);

        this.fmoveHandle =
        new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        this.fmoveHandle.worldPosition = this._worldPosition;
        this.fmoveHandle.hovered = true;
        this.add(this.fmoveHandle);
        this._handles.push(this.fmoveHandle);
    }

    addEventListeners() {
        this._container.addEventListener('mousewheel', this.onMove);
        this._container.addEventListener('DOMMouseScroll', this.onMove);

        this._line.addEventListener('mouseenter', this.onHover);
        this._line.addEventListener('mouseleave', this.onHover);
        this._line2.addEventListener('mouseenter', this.onHover);
        this._line2.addEventListener('mouseleave', this.onHover);
        this._distance.addEventListener('mouseenter', this.onHover);
        this._distance.addEventListener('mouseleave', this.onHover);
    }

    removeEventListeners() {
        this._line.removeEventListener('mouseenter', this.onHover);
        this._line.removeEventListener('mouseleave', this.onHover);
        this._line2.removeEventListener('mouseenter', this.onHover);
        this._line2.removeEventListener('mouseleave', this.onHover);
        this._distance.removeEventListener('mouseenter', this.onHover);
        this._distance.removeEventListener('mouseleave', this.onHover);
    }

    onHover(evt) {
        if (evt) {
          this._lastEvent = evt;
          evt.preventDefault();
          this.hoverDom(evt);
        }

        this.hoverMesh();

        this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._handles[2].hovered || this._meshHovered || this._domHovered;
        this._container.style.cursor = this._hovered ? 'pointer' : 'default';
    }

    hoverMesh() {
        // check raycast intersection, do we want to hover on mesh or just css?
    }

    hoverDom(evt) {
        this._domHovered = (evt.type === 'mouseenter');
    }

    onMove(evt) {
        this._dragged = true;

        if (this._active) {
            this.fmoveHandle.active = true;
            this.fmoveHandle.onMove(evt);
            this.fmoveHandle.active = false;
            this.fmoveHandle.hide();

            if (this._moving) {
              for (let index in this._handles.slice(0, -2)) {
                this._handles[index].worldPosition.x = this._handles[index].worldPosition.x + (this.fmoveHandle.worldPosition.x - this.imoveHandle.worldPosition.x);
                this._handles[index].worldPosition.y = this._handles[index].worldPosition.y + (this.fmoveHandle.worldPosition.y - this.imoveHandle.worldPosition.y);
                this._handles[index].worldPosition.z = this._handles[index].worldPosition.z + (this.fmoveHandle.worldPosition.z - this.imoveHandle.worldPosition.z);
              }
            }

            this.imoveHandle.active = true;
            this.imoveHandle.onMove(evt);
            this.imoveHandle.active = false;
            this.imoveHandle.hide();
          }

        this._handles[0].onMove(evt);
        this._handles[1].onMove(evt);
        this._handles[2].onMove(evt);

        this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._handles[2].hovered || this._meshHovered || this._domHovered;

        this.update();
    }

    onStart(evt) {
        this._dragged = false;

        this.imoveHandle.active = true;
        this.imoveHandle.onMove(evt);
        this.imoveHandle.active = false;
        this.imoveHandle.hide();

        this._handles[0].onStart(evt);
        this._handles[1].onStart(evt);
        this._handles[2].onStart(evt);

        this._active = this._handles[0].active || this._handles[1].active || this._handles[2].active || this._domHovered;

        if (this._domHovered) {
            this._moving = true;
        }

        this.update();
    }

    onEnd(evt) {
        // First Handle
        this._handles[0].onEnd(evt);
        this._handles[2].onEnd(evt);

        this._moving = false;

        // Second Handle
        if (this._dragged || !this._handles[1].tracking) {
            this._handles[1].tracking = false;
            this._handles[1].onEnd(evt);
        } else {
            this._handles[1].tracking = false;
        }

        // State of ruler widget
        this._active = this._handles[0].active || this._handles[1].active || this._handles[2].active;
        this.update();
    }

    create() {
        this.createMesh();
        this.createDOM();
    }

    hideDOM() {
        this._line.style.display = 'none';
        this._distance.style.display = 'none';
        this._line2.style.display = 'none';

        for (let index in this._handles) {
          this._handles[index].hideDOM();
        }

        this._dashline.style.display = 'none';
    }

    showDOM() {
        this._line.style.display = '';
        this._distance.style.display = '';
        this._line2.style.display = '';

        for (let index in this._handles) {
          this._handles[index].showDOM();
        }

        this._dashline.style.display = '';
    }

    hideMesh() {
        this._mesh.visible = false;
        this._mesh2.visible = false;
        this._handles[0].visible = false;
        this._handles[1].visible = false;
        this._handles[2].visible = false;
    }

    showMesh() {
        this._mesh.visible = true;
        this._mesh2.visible = true;
        this._handles[0].visible = true;
        this._handles[1].visible = true;
        this._handles[2].visible = true;
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
        this._distance.setAttribute('selectable', 'true');
        this._distance.style.border = '2px solid';
        this._distance.style.backgroundColor = '#F9F9F9';
        // this._distance.style.opacity = '0.5';
        this._distance.style.color = '#353535';
        this._distance.style.padding = '4px';
        this._distance.style.position = 'absolute';
        this._distance.style.transformOrigin = '0 100%';
        this._distance.innerHTML = 'Hello, world!';
        this._container.appendChild(this._distance);

        // add line!
        this._line2 = document.createElement('div');
        this._line2.setAttribute('class', 'widgets handle line');
        this._line2.style.position = 'absolute';
        this._line2.style.transformOrigin = '0 100%';
        this._line2.style.marginTop = '-1px';
        this._line2.style.height = '2px';
        this._line2.style.width = '3px';
        this._container.appendChild(this._line2);

        // add dash line
        this._dashline = document.createElement('div');
        this._dashline.setAttribute('class', 'widgets handle dashline');
        this._dashline.style.position = 'absolute';
        this._dashline.style.border = 'none';
        this._dashline.style.borderTop = '2.5px dashed #F9F9F9';
        this._dashline.style.transformOrigin = '0 100%';
        this._dashline.style.height = '1px';
        this._dashline.style.width = '50%';
        this._container.appendChild(this._dashline);

        this.updateDOMColor();
    }

    updateDOMPosition() {
        // update rulers lines and text!
        let x1 = this._handles[0].screenPosition.x;
        let y1 = this._handles[0].screenPosition.y;
        let x2 = this._handles[1].screenPosition.x;
        let y2 = this._handles[1].screenPosition.y;

        let x0 = x2;
        let y0 = y2;

        if (y1 >= y2) {
            y0 = y2 - 30;
        } else {
            y0 = y2 + 30;
        }

        let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        let posY = y1 - this._container.offsetHeight;

        // update line
        let transform = `translate3D(${x1}px,${posY}px, 0)`;
        transform += ` rotate(${angle}deg)`;

        this._line.style.transform = transform;
        this._line.style.width = length + 'px';

        // update distance
        let w0 = this._handles[0].worldPosition;
        let w1 = this._handles[1].worldPosition;
        let w2 = this._handles[2].worldPosition;

        let p10 = Math.sqrt((w1.x-w0.x)*(w1.x-w0.x) + (w1.y-w0.y)*(w1.y-w0.y) + (w1.z-w0.z)*(w1.z-w0.z));
        let p12 = Math.sqrt((w1.x-w2.x)*(w1.x-w2.x) + (w1.y-w2.y)*(w1.y-w2.y) + (w1.z-w2.z)*(w1.z-w2.z));
        let p02 = Math.sqrt((w0.x-w2.x)*(w0.x-w2.x) + (w0.y-w2.y)*(w0.y-w2.y) + (w0.z-w2.z)*(w0.z-w2.z));

        let a0102 = Math.acos((p10*p10 + p12*p12 - p02*p02)/(2 * p10 * p12));
        this._opangle = this._defaultAngle ? a0102*180/Math.PI : 360-(a0102*180/Math.PI);
        this._distance.innerHTML = `${this._opangle.toFixed(2)}&deg;`;

        this._distanceValue = Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2);
        let posY0 = y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
        x0 -= this._distance.offsetWidth/2;

        let transform2 = `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
        this._distance.style.transform = transform2;

        // update rulers lines 2 and text!
        let x3 = this._handles[1].screenPosition.x;
        let y3 = this._handles[1].screenPosition.y;
        let x4 = this._handles[2].screenPosition.x;
        let y4 = this._handles[2].screenPosition.y;

        let x02 = x4;
        let y02 = y4;

        if (y3 >= y4) {
            y02 = y4 - 30;
        } else {
            y02 = y4 + 30;
        }

        length = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
        angle = Math.atan2(y4 - y3, x4 - x3) * 180 / Math.PI;

        posY = y3 - this._container.offsetHeight;

        // update line
        transform = `translate3D(${x3}px,${posY}px, 0)`;
        transform += ` rotate(${angle}deg)`;

        this._line2.style.transform = transform;
        this._line2.style.width = length + 'px';

        // update distance
        let w02 = this._handles[1].worldPosition;
        let w12 = this._handles[2].worldPosition;

        // update dash line

        let l1center = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.75);
        let l2center = this.getPointInBetweenByPerc(this._handles[1].worldPosition, this._handles[2].worldPosition, 0.25);

        let screen1 = this._handles[0].worldToScreen(l1center, this._camera, this._container);
        let screen2 = this._handles[0].worldToScreen(l2center, this._camera, this._container);

        x1 = screen1.x;
        y1 = screen1.y;
        x2 = screen2.x;
        y2 = screen2.y;

        length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        posY = y1 - this._container.offsetHeight;

        // update line
        transform = `translate3D(${x1}px,${posY}px, 0)`;
        transform += ` rotate(${angle}deg)`;

        this._dashline.style.transform = transform;
        this._dashline.style.width = length + 'px';
    }

    updateDOMColor() {
        this._line.style.backgroundColor = `${this._color}`;
        this._distance.style.borderColor = `${this._color}`;

        this._line2.style.backgroundColor = `${this._color}`;
    }

    getPointInBetweenByPerc(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA);
        let len = dir.length();
        dir = dir.normalize().multiplyScalar(len*percentage);
        return pointA.clone().add(dir);
    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._worldPosition = worldPosition;

        this.update();
    }

    get angle() {
        return this._opangle;
    }

    toggleDefaultAngle() {
        this._defaultAngle = !this._defaultAngle;
        if (this._defaultAngle) {
            this._dashline.style.borderTop = '2.5px dashed #F9F9F9';
        } else {
            this._dashline.style.borderTop = '2.5px dashed #ffa7a7';
        }
    }
}
