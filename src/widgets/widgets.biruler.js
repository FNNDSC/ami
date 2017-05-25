import WidgetsBase from '../widgets/widgets.base';
import WidgetsHandle from '../widgets/widgets.handle';

/**
 * @module widgets/handle
 *
 */

export default class WidgetsBiRuler extends WidgetsBase {

    constructor(targetMesh, controls, camera, container) {
        super();

        this._targetMesh = targetMesh;
        this._controls = controls;
        this._camera = camera;
        this._container = container;

        this._active = true;
        this._initOrtho = false;

        this._worldPosition = new THREE.Vector3();
        if(this._targetMesh !== null) {
            this._worldPosition = this._targetMesh.position;
        }

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // dom stuff
        this._line = null;
        this._distance = null;

        // add handles
        this._handles = [];

        // first handle
        let firstHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        firstHandle.worldPosition = this._worldPosition;
        firstHandle.hovered = true;
        this.add(firstHandle);

        this._handles.push(firstHandle);

        let secondHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        secondHandle.worldPosition = this._worldPosition;
        secondHandle.hovered = true;
        // active and tracking might be redundant
        secondHandle.active = true;
        secondHandle.tracking = true;
        this.add(secondHandle);

        this._handles.push(secondHandle);

        // third handle
        let thirdHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        thirdHandle.worldPosition = this._worldPosition;
        thirdHandle.hovered = true;
        this.add(thirdHandle);

        this._handles.push(thirdHandle);

        // fourth handle
        let fourthHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
        fourthHandle.worldPosition = this._worldPosition;
        fourthHandle.hovered = true;
        this.add(fourthHandle);

        this._handles.push(fourthHandle);

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

        this._handles[0].onMove(evt);
        this._handles[1].onMove(evt);
        this._handles[2].onMove(evt);
        this._handles[3].onMove(evt);

        this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._handles[2].hovered || this._handles[3].hovered;

        this.update();
    }

    onStart(evt) {
        this._dragged = false;

        this._handles[0].onStart(evt);
        this._handles[1].onStart(evt);
        this._handles[2].onStart(evt);
        this._handles[3].onStart(evt);

        this._active = this._handles[0].active || this._handles[1].active || this._handles[2].active || this._handles[3].active;
        this.update();
    }

    onEnd(evt) {
        // First Handle
        this._handles[0].onEnd(evt);
        this._handles[2].onEnd(evt);
        this._handles[3].onEnd(evt);

        window.console.log(this);

        // Second Handle
        if(this._dragged || !this._handles[1].tracking) {
            this._handles[1].tracking = false;
            this._handles[1].onEnd(evt);
        } else{
            this._handles[1].tracking = false;
        }

        // State of ruler widget
        this._active = this._handles[0].active || this._handles[1].active || this._handles[2].active || this._handles[3].active;
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
        this._distance2.style.display = 'none';

        for (let index in this._handles) {
            this._handles[index].hideDOM();
        }

        this._dashline.style.display = 'none';
    }

    showDOM() {
        this._line.style.display = '';
        this._distance.style.display = '';
        this._line2.style.display = '';
        this._distance2.style.display = '';

        for (let index in this._handles) {
            this._handles[index].showDOM();
        }

        this._dashline.style.display = '';
    }

    hideMesh(){
        this._mesh.visible = false;
        this._mesh2.visible = false;
        this._handles[0].visible = false;
        this._handles[1].visible = false;
        this._handles[2].visible = false;
        this._handles[3].visible = false;
    }

    showMesh() {
        this._mesh.visible = true;
        this._mesh2.visible = true;
        this._handles[0].visible = true;
        this._handles[1].visible = true;
        this._handles[2].visible = true;
        this._handles[3].visible = true;
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

    updateMeshColor() {
        if(this._material) {
            this._material.color.set(this._color);
        }
        if(this._material2) {
            this._material2.color.set(this._color);
        }
    }

    updateMeshPosition() {
        if(this._geometry) {
            this._geometry.verticesNeedUpdate = true;
        }
        if(this._geometry2) {
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

        // add distance!
        this._distance2 = document.createElement('div');
        this._distance2.setAttribute('class', 'widgets handle distance');
        this._distance.style.border = '2px solid';
        this._distance.style.backgroundColor = '#F9F9F9';
        // this._distance2.style.opacity = '0.5';
        this._distance2.style.color = '#353535';
        this._distance2.style.padding = '4px';
        this._distance2.style.position = 'absolute';
        this._distance2.style.transformOrigin = '0 100%';
        this._distance2.innerHTML = 'Hello, world!';
        this._container.appendChild(this._distance2);

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

        //let x0 = x1 + (x2 - x1)/2;
        //let y0 = y1 + (y2 - y1)/2;
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
        this._line.style.width = length;

        // update distance
        let w0 = this._handles[0].worldPosition;
        let w1 = this._handles[1].worldPosition;

        this._distance.innerHTML = `${Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2)} mm`;
        this._distanceValue = Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2);
        let posY0 = y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
        x0 -= this._distance.offsetWidth/2;

        let transform2 = `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
        this._distance.style.transform = transform2;

        // update rulers lines 2 and text!
        let x3 = this._handles[2].screenPosition.x;
        let y3 = this._handles[2].screenPosition.y;
        let x4 = this._handles[3].screenPosition.x;
        let y4 = this._handles[3].screenPosition.y;

        //let x0 = x1 + (x2 - x1)/2;
        //let y0 = y1 + (y2 - y1)/2;
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
        this._line2.style.width = length;

        // update distance
        let w02 = this._handles[2].worldPosition;
        let w12 = this._handles[3].worldPosition;

        this._distance2.innerHTML = `${Math.sqrt((w02.x-w12.x)*(w02.x-w12.x) + (w02.y-w12.y)*(w02.y-w12.y) + (w02.z-w12.z)*(w02.z-w12.z)).toFixed(2)} mm`;
        this._distance2Value = Math.sqrt((w02.x-w12.x)*(w02.x-w12.x) + (w02.y-w12.y)*(w02.y-w12.y) + (w02.z-w12.z)*(w02.z-w12.z)).toFixed(2);
        let posY02 = y02 - this._container.offsetHeight - this._distance2.offsetHeight/2;
        x02 -= this._distance2.offsetWidth/2;

        transform2 = `translate3D(${Math.round(x02)}px,${Math.round(posY02)}px, 0)`;
        this._distance2.style.transform = transform2;

        // update dash line

        let l1center = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.5);
        let l2center = this.getPointInBetweenByPerc(this._handles[2].worldPosition, this._handles[3].worldPosition, 0.5);

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
        this._dashline.style.width = length;
    }

    updateDOMColor() {
        this._line.style.backgroundColor = `${this._color}`;
        this._distance.style.borderColor = `${this._color}`;

        this._line2.style.backgroundColor = `${this._color}`;
        this._distance2.style.borderColor = `${this._color}`;
    }

    getPointInBetweenByPerc(pointA, pointB, percentage) {

        var dir = pointB.clone().sub(pointA);
        var len = dir.length();
        dir = dir.normalize().multiplyScalar(len*percentage);
        return pointA.clone().add(dir);

    }

    initOrtho () {
        this._initOrtho = true;

        let pcenter = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.5);
        this._handles[2].worldPosition = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.25);
        this._handles[3].worldPosition = this.getPointInBetweenByPerc(this._handles[0].worldPosition, this._handles[1].worldPosition, 0.75);

        this._handles[2].worldPosition.x = pcenter.x - Math.sqrt((pcenter.y - this._handles[2].worldPosition.y)*(pcenter.y - this._handles[2].worldPosition.y));
        this._handles[2].worldPosition.y = pcenter.y + Math.sqrt((pcenter.x - this._handles[2].worldPosition.x)*(pcenter.x - this._handles[2].worldPosition.x));

        this._handles[3].worldPosition.x = pcenter.x + Math.sqrt((pcenter.y - this._handles[2].worldPosition.y)*(pcenter.y - this._handles[2].worldPosition.y));
        this._handles[3].worldPosition.y = pcenter.y - Math.sqrt((pcenter.x - this._handles[2].worldPosition.x)*(pcenter.x - this._handles[2].worldPosition.x));
    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._worldPosition = worldPosition;
        this._handles[0].worldPosition = this._worldPosition;
        this._handles[1].worldPosition = this._worldPosition;
        this._handles[2].worldPosition = this._worldPosition;
        this._handles[3].worldPosition = this._worldPosition;

        this.update();
    }

    get shotestDistance() {
        return ((this._distanceValue < this._distance2Value) ? this._distanceValue : this._distance2Value);
    }

    get longestDistance() {
        return ((this._distanceValue > this._distance2Value) ? this._distanceValue : this._distance2Value);
    }

}
