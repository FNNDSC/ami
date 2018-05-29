import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';
import CoreUtils from '../core/core.utils';

import {Vector3} from 'three';

/**
 * @module widgets/handle
 *
 */
export default class WidgetsRoi extends WidgetsBase {
    constructor(stack, targetMesh, controls, camera, container) {
        super();

        this._stack = stack;
        this._targetMesh = targetMesh;
        this._controls = controls;
        this._camera = camera;
        this._container = container;

        this._active = false;
        this._dragged = false;
        this._resizeHandleIdx = null;
        this.roiWidth = 60;
        this.roiHeight = 60;

        this._worldPosition = new Vector3();
        if (this._targetMesh !== null) {
            this._worldPosition = this._targetMesh.position;
        }

        // mesh stuff
        this._material = null;
        this._geometry = null;
        this._mesh = null;

        // add handles
        this._handles = [];
        for (let i = 0; i <= 4; i++) {
            let handle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container);
            handle.worldPosition = this._worldPosition;
            this.add(handle);
            this._handles.push(handle);
        }

        this.create();
        this.initOffsets();

        this.onMove = this.onMove.bind(this);
        this.onMousedown = this.onMousedown.bind(this);
        this.onMouseup = this.onMouseup.bind(this);

        this.addEventListeners();

    }

    addEventListeners() {
        this._container.addEventListener('mousedown', this.onMousedown);
        this._container.addEventListener('mouseup', this.onMouseup);
        this._container.addEventListener('mousemove', this.onMove);
    }

    removeEventListeners() {
        this._container.removeEventListener('mousedown', this.onMousedown);
        this._container.removeEventListener('mouseup', this.onMouseup);
        this._container.removeEventListener('mousemove', this.onMove);
    }

    onMousedown(evt) {

        if (evt.target == this._handles[0]._dom) {
            this._active = true;
            this._dragged = true;
        }
        else {
            for (let idx = 1; idx < this._handles.length; idx++) {
                if (evt.target == this._handles[idx]._dom) {
                    this._active = true;
                    this._resizeHandleIdx = idx;
                    break;
                }
            }
        }
    }

    onMouseup(evt) {
        this._active = false;
        this._dragged = false;
        this._resizeHandleIdx = null;
    }

    onMove(evt) {
        if (this._active) {
            if (this._dragged) {
                this.updateHandles(evt);
            }
            else if (this._resizeHandleIdx) {
                this.resize(this._resizeHandleIdx, evt.clientX, evt.clientY);
            }

            this.update();

            evt.stopPropagation();
        }

    }

    resize(handleIdx, x, y) {

        // Check intersection with mesh
        const offsets = this.screen2NDC(x, y, this._container);

        let h = 0;

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(offsets, this._camera);
        raycaster.ray.position = raycaster.ray.origin;

        let intersectsTarget = raycaster.intersectObject(this._targetMesh);

        if (intersectsTarget.length > 0) {
            switch (handleIdx) {
                case 1:
                case 3:
                    offsets.x = this._handles[3]._mouse.x;
                    this.updateHandlePosition(handleIdx, offsets);
                    h = Math.abs((this._handles[3]._mouse.y - this._handles[1]._mouse.y) / 2);
                    this.updateHandlePosition(2, {x: this._handles[2]._mouse.x, y: this._handles[1]._mouse.y - h});
                    this.updateHandlePosition(4, {x: this._handles[4]._mouse.x, y: this._handles[1]._mouse.y - h});
                    this.updateHandlePosition(0, {x: this._handles[0]._mouse.x, y: this._handles[1]._mouse.y - h});
                    break;

                case 2:
                case 4:
                    offsets.y = this._handles[2]._mouse.y;
                    this.updateHandlePosition(handleIdx, offsets);
                    h = Math.abs((this._handles[4]._mouse.x - this._handles[2]._mouse.x) / 2);
                    this.updateHandlePosition(1, {x: this._handles[2]._mouse.x - h, y: this._handles[1]._mouse.y});
                    this.updateHandlePosition(3, {x: this._handles[2]._mouse.x - h, y: this._handles[3]._mouse.y});
                    this.updateHandlePosition(0, {x: this._handles[2]._mouse.x - h, y: this._handles[0]._mouse.y});
                    break;
            }

            this.roiWidth = Math.abs(this._handles[2].screenPosition.x - this._handles[4].screenPosition.x);
            this.roiHeight = Math.abs(this._handles[3].screenPosition.y - this._handles[1].screenPosition.y);
        }
    }

    onStart(evt) {
        this._handles.forEach((h) => h.onStart(evt));
        this.updateHandles(evt);

        this.update();
    }

    updateHandles(evt) {

        const halfWidth = Math.round(this.roiWidth / 2);
        const halfHeight = Math.round(this.roiHeight / 2);

        const ndcs = [
            this.screen2NDC(evt.clientX, evt.clientY, this._container), // origin
            this.screen2NDC(evt.clientX, evt.clientY - halfHeight, this._container), // top
            this.screen2NDC(evt.clientX + halfWidth, evt.clientY, this._container), // right
            this.screen2NDC(evt.clientX, evt.clientY + halfHeight, this._container), // bottom
            this.screen2NDC(evt.clientX - halfWidth, evt.clientY, this._container),  // left
        ];

        let allIntersects = ndcs.every((ndc) => {

            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(ndc, this._camera);
            raycaster.ray.position = raycaster.ray.origin;

            let intersectsTarget = raycaster.intersectObject(this._targetMesh);

            return intersectsTarget.length > 0;
        });

        if (allIntersects) {
            ndcs.forEach((ndc, idx) => this.updateHandlePosition(idx, ndc));
        }

    }

    updateHandlePosition(idx, offsets) {
        this._handles[idx].move(offsets);
    }

    updateValues() {
        const wp1 = this._handles[1].worldPosition;
        const wp2 = this._handles[2].worldPosition;
        const wp3 = this._handles[3].worldPosition;
        const wp4 = this._handles[4].worldPosition;

        const ijk1 = CoreUtils.worldToData(this._stack.lps2IJK, wp1);
        const ijk2 = CoreUtils.worldToData(this._stack.lps2IJK, wp2);
        const ijk3 = CoreUtils.worldToData(this._stack.lps2IJK, wp3);
        const ijk4 = CoreUtils.worldToData(this._stack.lps2IJK, wp4);

        let max = null;
        let min = null;
        let values = [];

        for (let x = ijk4.x; x <= ijk2.x; x++) {
            for (let y = ijk3.y; y <= ijk1.y; y++) {
                let value = CoreUtils.getPixelData(
                    this._stack,
                    new Vector3(x, y, ijk1.z)
                );

                let rescaledValue = CoreUtils.rescaleSlopeIntercept(
                    value,
                    this._stack.rescaleSlope,
                    this._stack.rescaleIntercept
                );

                if (rescaledValue > max || max == null) {
                    max = rescaledValue;
                }

                if (rescaledValue < min || min == null) {
                    min = rescaledValue;
                }

                values.push(rescaledValue);
            }
        }

        if (values.length > 0) {
            const width = Math.sqrt(
                (wp4.x - wp2.x) * (wp4.x - wp2.x) +
                (wp4.y - wp2.y) * (wp4.y - wp2.y) +
                (wp4.z - wp2.z) * (wp4.z - wp2.z)
            ).toFixed(1);

            const height = Math.sqrt(
                (wp1.x - wp3.x) * (wp1.x - wp3.x) +
                (wp1.y - wp3.y) * (wp1.y - wp3.y) +
                (wp1.z - wp3.z) * (wp1.z - wp3.z)
            ).toFixed(1);

            const avg = (values.reduce((sum, v1) => v1 + sum) / values.length).toFixed(1);
            const sd = Math.sqrt(values.reduce((sum, v1) => (v1 - avg) * (v1 - avg) + sum) / values.length).toFixed(1);

            this.updateDOMContent({
                width,
                height,
                avg,
                sd,
                max,
                min,
            });
        }
    }

    create() {
        this.createMesh();
        this.createDOM();
    }

    hideDOM() {
        this._handles.forEach((h) => {
           h.hideDOM();
        });
    }

    showDOM() {
        this._handles.forEach((h) => {
            h.showDOM();
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
        // this.updateColor();

        this._handles.forEach((h) => {
            h.update();
        });

        // mesh stuff
        this.updateMeshColor();
        this.updateMeshPosition();

        // DOM stuff
        this.updateValues();
        this.updateDOMPosition();
    }

    createMesh() {
        // geometry
        this._geometry = new THREE.Geometry();

        for (let index = 1; index <= 4; index++) {
            this._geometry.vertices.push(this._handles[index].worldPosition);
        }
        this._geometry.vertices.push(this._handles[1].worldPosition);

        // material
        this._material = new THREE.LineBasicMaterial();
        this.updateMeshColor();

        // mesh
        this._mesh = new THREE.Line(this._geometry, this._material);
        this._mesh.visible = true;

        // add it!
        this.add(this._mesh);
    }

/*
    createMesh_ellipse() {
        //geometry
        let ellipse = new THREE.EllipseCurve(0, 0, 1, 5, 0, 2.0 * Math.PI, false);
        let ellipsePath = new THREE.CurvePath();
        ellipsePath.add(ellipse);
        this._geometry = ellipsePath.createPointsGeometry(100);
        // this._geometry.computeTangents();

        // material
        this._material = new THREE.LineBasicMaterial();
        this.updateMeshColor();
        this._mesh= new THREE.Line(this._geometry, this._material);
        this._mesh.visible = true;
        this.add(this._mesh);
    }
*/
    updateMeshColor() {
        if (this._material) {
            this._material.color.set(this._color);
        }
    }

    updateMeshPosition() {
        if (this._geometry) {
            let v1 = this.ndc2world(this._handles[4]._mouse.x, this._handles[1]._mouse.y);
            let v2 = this.ndc2world(this._handles[2]._mouse.x, this._handles[1]._mouse.y);
            let v3 = this.ndc2world(this._handles[2]._mouse.x, this._handles[3]._mouse.y);
            let v4 = this.ndc2world(this._handles[4]._mouse.x, this._handles[3]._mouse.y);

            this._geometry.vertices[0] = v1;
            this._geometry.vertices[1] = v2;
            this._geometry.vertices[2] = v3;
            this._geometry.vertices[3] = v4;
            this._geometry.vertices[4] = v1;

            this._geometry.verticesNeedUpdate = true;
        }
    }

    createDOM() {
        this._dom = document.createElement('div');
        this._dom.classList.add('roi-data');
        this._dom.style.position = 'absolute';
        this._dom.style.top = 0;
        this._dom.style.left = 0;
        this._dom.style.lineHeight = '1.5';
        this._dom.style.padding = '.2rem .5rem';
        this._dom.style.border = '1px solid #ccc';
        this._dom.style.color = '#fff';
        this._dom.style.backgroundColor = 'rgba(0, 0, 0, .8)';
        this._container.appendChild(this._dom);

        this.updateDOMContent(0, 0, 0);
    }

    updateDOMContent(roiData) {
        const area = (roiData.width * roiData.height).toFixed(2);

        this._dom.innerHTML = `<div>area: ${area}mm<sup>2</sup> (${roiData.width}mm x ${roiData.height}mm)</div>
            <div>avg/sd: ${roiData.avg} / ${roiData.sd} HU</div>
            <div>min/max: ${roiData.min} / ${roiData.max} HU</div>`;
    }

    updateDOMPosition() {
        let sp0 = this._handles[0].screenPosition;
        let sp2 = this._handles[2].screenPosition;
        let sp4 = this._handles[4].screenPosition;

        let x = 0;
        let y = 0;

        const rect = this._dom.getBoundingClientRect();

        if (rect.width < sp4.x) {
            // Element left of the roi element
            x = (sp4.x - rect.width - 10);
        } else if (sp2.x + rect.width < this._offsets.width) {
            // Element right of the roi element
            x = (sp2.x + 10);
        } else {
            x = (sp0.x - rect.width - 10);
        }

        if (sp4.y + rect.height < this._offsets.height) {
            // Element below the lower half of the roi element
            y = (sp4.y + 10);
        } else if (rect.height < sp4.y) {
            // Element above the lower half of the roi element
            y = (sp4.y - rect.height - 10);
        } else {
            y = (sp0.y - rect.height - 10);
        }

        this._dom.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }

    free() {
        this._handles.forEach((h) => {
            h.free();
        });

        this._container.removeChild(this._dom);

        // event
        this.removeEventListeners();

        this.remove(this._mesh);
        this._mesh = null;
        this._geometry = null;


        super.free();
    }

    get worldPosition() {
        return this._worldPosition;
    }

    set worldPosition(worldPosition) {
        this._worldPosition = worldPosition;

        this._handles.forEach((h) => {
            h.worldPosition = this._worldPosition;
        });

        this.update();
    }

    set targetMesh(targetMesh) {
        this._targetMesh = targetMesh;

        this._handles.forEach((h) => {
            h.targetMesh = targetMesh;
        });

        // this.update();
    }

    get targetMesh() {
        return this._targetMesh;
    }
}
