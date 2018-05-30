import WidgetsBase from './widgets.base';
import GeometriesVoxel from '../geometries/geometries.voxel';
import ModelsVoxel from '../models/models.voxel';
import CoreIntersections from '../core/core.intersections';
import CoreUtils from '../core/core.utils';

import {Vector2, Vector3} from 'three';

/**
 * @module widgets/voxelProbe
 */
export default class WidgetsVoxelProbe extends WidgetsBase {
  constructor(targetMesh, controls, stack) {
    super(targetMesh, controls);

    this._stack = stack;

    // if no target mesh, use plane for FREE dragging.
    this._plane = {
        position: new Vector3(),
        direction: new Vector3(),
    };

    this._offset = new Vector3();
    this._raycaster = new THREE.Raycaster();

    this._mouse = new Vector2();
    this._lastEvent = null;
    this._controls.enabled = false;

    this._initialized = false; // set to true onEnd

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._mesh = null;
    this._meshDisplayed = true;
    this._meshHovered = false;
    this._meshStyle = 'sphere'; // cube, etc.

    // dom stuff
    this._dom = null;
    this._domDisplayed = true;
    this._domHovered = false;
    this._domStyle = 'circle'; // square, triangle

    this._screenPosition = this.worldToScreen(this._worldPosition);

    this.create();
    this.initOffsets();

    // event listeners
    this.onMove = this.onMove.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onEndControl = this.onEndControl.bind(this);
    this.addEventListeners();
  }

  addEventListeners() {
    this._dom.addEventListener('mouseenter', this.onHover);
    this._dom.addEventListener('mouseleave', this.onHover);

    this._container.addEventListener('wheel', this.onMove);

    this._controls.addEventListener('end', this.onEndControl);
  }

  removeEventListeners() {
    this._dom.removeEventListener('mouseenter', this.onHover);
    this._dom.removeEventListener('mouseleave', this.onHover);

    this._container.removeEventListener('wheel', this.onMove);

    this._controls.removeEventListener('end', this.onEndControl);
  }

  onStart(evt) {
    this._lastEvent = evt;
    evt.preventDefault();

    const offsets = this.getMouseOffsets(evt, this._container);
    this._mouse.set(offsets.x, offsets.y);

    // update raycaster
    this._raycaster.setFromCamera(this._mouse, this._camera);
    this._raycaster.ray.position = this._raycaster.ray.origin;

    if (this._hovered) {
      this._active = true;
      this._controls.enabled = false;

      if (this._targetMesh) {
        let intersectsTarget =
          this._raycaster.intersectObject(this._targetMesh);
        if (intersectsTarget.length > 0) {
          this._offset.copy(intersectsTarget[0].point).sub(this._worldPosition);
        }
      } else {
        this._plane.position.copy(this._worldPosition);
        this._plane.direction.copy(this._camera.getWorldDirection());
        let intersection =
          CoreIntersections.rayPlane(this._raycaster.ray, this._plane);
        if (intersection !== null) {
          this._offset.copy(intersection).sub(this._plane.position);
        }
      }

      this.update();
    }
  }

  onMove(evt) {
    this._lastEvent = evt;
    evt.preventDefault();

    const offsets = this.getMouseOffsets(evt, this._container);
    this._mouse.set(offsets.x, offsets.y);

    // update raycaster
    // set ray.position to satisfy CoreIntersections::rayPlane API
    this._raycaster.setFromCamera(this._mouse, this._camera);
    this._raycaster.ray.position = this._raycaster.ray.origin;

    if (this._active) {
      this._dragged = true;

      if (this._targetMesh !== null) {
        let intersectsTarget =
          this._raycaster.intersectObject(this._targetMesh);
        if (intersectsTarget.length > 0) {
          this._worldPosition.copy(intersectsTarget[0].point.sub(this._offset));
        }
      } else {
        if (this._plane.direction.length() === 0) {
          // free mode!this._targetMesh
          this._plane.position.copy(this._worldPosition);
          this._plane.direction.copy(this._camera.getWorldDirection());
         }

        let intersection =
          CoreIntersections.rayPlane(this._raycaster.ray, this._plane);
        if (intersection !== null) {
          this._worldPosition.copy(intersection.sub(this._offset));
        }
      }
    } else {
      this.onHover(null);
    }

    this.update();
  }

  onEnd(evt) {
    this._lastEvent = evt;
    evt.preventDefault();

    if (!this._dragged && this._active && this._initialized) {
      this._selected = !this._selected; // change state if there was no dragging
    }

    this._initialized = true;
    this._active = false;
    this._dragged = false;
    this._controls.enabled = true;

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

  onHover(evt) {
    if (evt) {
      this._lastEvent = evt;
      evt.preventDefault();
      this.hoverDom(evt);
    }

    this.hoverMesh();

    this._hovered = this._meshHovered || this._domHovered;
    this._container.style.cursor = this._hovered ? 'pointer' : 'default';
  }

  hoverMesh() {
    // check raycast intersection, do we want to hover on mesh or just css?
    let intersectsHandle = this._raycaster.intersectObject(this._mesh);
    this._meshHovered = (intersectsHandle.length > 0);
  }

  hoverDom(evt) {
    this._domHovered = (evt.type === 'mouseenter');
  }

  create() {
    this.createVoxel();
    this.createMesh();
    this.createDOM();
  }

  createVoxel() {
    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
    this._voxel.worldCoordinates = this._worldCoordinates;
  }

  createMesh() {
    const dataCoordinates = CoreUtils.worldToData(
      this._stack.lps2IJK,
      this._worldPosition);

    this._geometry = new GeometriesVoxel(dataCoordinates);
    this._material = new THREE.MeshBasicMaterial({
        wireframe: true,
        wireframeLinewidth: 1,
      });
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.applyMatrix(this._stack.ijk2LPS);
    this._mesh.visible = true;

    this.updateMeshColor();

    this.add(this._mesh);
  }

  createDOM() {
    this._dom = document.createElement('div');
    this._dom.setAttribute('class', 'AMI Widget VoxelProbe');
    this._dom.style.border = '2px solid';
    this._dom.style.backgroundColor = 'rgba(250, 250, 250, 0.8)';
    this._dom.style.color = '#222';
    this._dom.style.padding = '4px';
    this._dom.style.position = 'absolute';
    this._dom.style.transformOrigin = '0px 100% 0px';
    this._dom.style.zIndex = '3';

    // measurenents
    let measurementsContainer = document.createElement('div');
    // LPS
    let lpsContainer = document.createElement('div');
    lpsContainer.setAttribute('id', 'lpsPosition');
    measurementsContainer.appendChild(lpsContainer);
    // IJK
    let ijkContainer = document.createElement('div');
    ijkContainer.setAttribute('id', 'ijkPosition');
    measurementsContainer.appendChild(ijkContainer);
    // Value
    let valueContainer = document.createElement('div');
    valueContainer.setAttribute('id', 'value');
    measurementsContainer.appendChild(valueContainer);

    this.updateDOMColor();
    this._dom.appendChild(measurementsContainer);

    this._container.appendChild(this._dom);
  }

  update() {
    // general update
    this.updateColor();
    this._screenPosition = this.worldToScreen(this._worldPosition);

    // set data coordinates && value
    this.updateVoxel(this._worldPosition);

    // update mesh position
    this.updateMeshColor();
    if (this._mesh && this._mesh.geometry) {
      this._mesh.geometry.location = this._voxel.dataCoordinates;
      this._mesh.updateMatrix();
    }

    // update dom
    this.updateDOMContent();
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  updateVoxel(worldCoordinates) {
    // update world coordinates
    this._voxel.worldCoordinates = worldCoordinates;

    // update data coordinates
    this._voxel.dataCoordinates = CoreUtils.worldToData(
      this._stack.lps2IJK,
      this._voxel.worldCoordinates);

    // update value
    let value = CoreUtils.getPixelData(
      this._stack,
      this._voxel.dataCoordinates);

    this._voxel.value = value === null || this._stack.numberOfChannels > 1
      ? 'NA' // coordinates are outside of image or RGB
      : CoreUtils.rescaleSlopeIntercept(
        value,
        this._stack.rescaleSlope,
        this._stack.rescaleIntercept).toFixed();
  }

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateDOMContent() {
    const rasContainer = this._dom.querySelector('#lpsPosition');
    rasContainer.innerHTML = `LPS: 
      ${this._voxel.worldCoordinates.x.toFixed(2)} :
      ${this._voxel.worldCoordinates.y.toFixed(2)} :
      ${this._voxel.worldCoordinates.z.toFixed(2)}`;

    const ijkContainer = this._dom.querySelector('#ijkPosition');
    ijkContainer.innerHTML = `IJK: 
      ${this._voxel.dataCoordinates.x} :
      ${this._voxel.dataCoordinates.y} :
      ${this._voxel.dataCoordinates.z}`;

    const valueContainer = this._dom.querySelector('#value');
    valueContainer.innerHTML = `Value: ${this._voxel.value}`;
  }

  updateDOMPosition() {
    if (this._dom) {
      let posY = this._screenPosition.y - this._container.offsetHeight;
      this._dom.style.transform =
        `translate3D(${this._screenPosition.x}px, ${posY}px, 0)`;
    }
  }

  updateDOMColor() {
    this._dom.style.borderColor = `${this._color}`;
  }

  free() {
    // events
    this.removeEventListeners();
    // dom
    this._container.removeChild(this._dom);
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

    this._voxel = null;

    super.free();
  }

  hideDOM() {
    this._dom.style.display = 'none';
  }

  showDOM() {
    this._dom.style.display = '';
  }

  hoverVoxel(mouseScreenCoordinates, currentDataCoordinates) {
    // update distance mouse/this._voxel
    let dx =
      mouseScreenCoordinates.screenX - this._voxel.voxel.screenCoordinates.x;
    let dy =
      mouseScreenCoordinates.screenY - this._voxel.voxel.screenCoordinates.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this._voxel.distance = distance;
    this._hover = distance >= 0 && distance < 10;
  }

  get active() {
    return this._active;
  }

  set active(active) {
    this._active = active;
    this._controls.enabled = !this._active;

    this.update();
  }

  set showVoxel(showVoxel) {
    this._showVoxel = showVoxel;
    this.update();
  }

  get showVoxel() {
    return this._showVoxel;
  }

  set showDomSVG(showDomSVG) {
    this._showDomSVG = showDomSVG;
    this.update();
  }

  get showDomSVG() {
    return this._showDomSVG;
  }

  set showDomMeasurements(showDomMeasurements) {
    this._showDomMeasurements = showDomMeasurements;
    this.update();
  }

  get showDomMeasurements() {
    return this._showDomMeasurements;
  }
}
