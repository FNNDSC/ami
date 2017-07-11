
import WidgetsBase from '../widgets/widgets.base';
import GeometriesVoxel from '../geometries/geometries.voxel';
import ModelsStack from '../models/models.stack';
import ModelsVoxel from '../models/models.voxel';
import CoreIntersections from '../core/core.intersections';

/**
 * @module widgets/voxelProbe
 */

export default class WidgetsVoxelProbe extends WidgetsBase {
  constructor(stack, targetMesh, controls, camera, container) {
    super(container);

    this._stack = stack;

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;

    // if no target mesh, use plane for FREE dragging.
    this._plane = {
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(),
    };

    this._offset = new THREE.Vector3();
    this._raycaster = new THREE.Raycaster();

    this._tracking = false;

    this._mouse = new THREE.Vector2();
    this._lastEvent = null;

    // world (LPS) position of the center
    this._worldPosition = new THREE.Vector3();

    // screen position of the center
    this._screenPosition = new THREE.Vector2();

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

    if (this._targetMesh !== null) {
      this._worldPosition.copy(this._targetMesh.position);
    }

    this._screenPosition =
      this.worldToScreen(this._worldPosition, this._camera, this._container);

    // create handle
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

    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);

    this._controls.addEventListener('end', this.onEndControl);
  }

  removeEventListeners() {
    this._dom.removeEventListener('mouseenter', this.onHover);
    this._dom.removeEventListener('mouseleave', this.onHover);

    this._container.removeEventListener('mousewheel', this.onMove);
    this._container.removeEventListener('DOMMouseScroll', this.onMove);

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

  onEnd(evt) {
    this._lastEvent = evt;
    evt.preventDefault();

    // stay active and keep controls disabled
    if (this._tracking === true) {
      return;
    }

    // unselect if go up without moving
    if (!this._dragged && this._active) {
      // change state if was not dragging
      this._selected = !this._selected;
    }

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

  worldToScreen(worldCoordinate, camera, canvas) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(camera);

    screenCoordinates.x =
      Math.round((screenCoordinates.x + 1) * canvas.offsetWidth / 2);
    screenCoordinates.y =
      Math.round((-screenCoordinates.y + 1) * canvas.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
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
    const dataCoordinates = ModelsStack.worldToData(
      this._stack,
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

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  createDOM() {
    // dom
    this._dom = document.createElement('div');
    this._dom.setAttribute('id', this.uuid);
    this._dom.setAttribute('class', 'AMI Widget VoxelProbe');
    this._dom.style.border = '2px solid #000';
    this._dom.style.backgroundColor = 'rgb(249, 249, 249)';
    this._dom.style.color = '#212121';
    this._dom.style.position = 'absolute';
    this._dom.style.transformOrigin = '0px 100% 0px';

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

    // add it!
    this._container.appendChild(this._dom);
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

  update() {
    // general update
    this.updateColor();
    this._screenPosition =
      this.worldToScreen(this._worldPosition, this._camera, this._container);

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
    this._voxel.dataCoordinates = ModelsStack.worldToData(
                  this._stack,
                  this._voxel.worldCoordinates);

    // update value
    let value = ModelsStack.value(
      this._stack,
      this._voxel.dataCoordinates);

    this._voxel.value = ModelsStack.valueRescaleSlopeIntercept(
      value,
      this._stack.rescaleSlope,
      this._stack.rescaleIntercept);
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
    this._container.
      removeEventListener('mouseup', this.onMouseUpHandler, false);
    this._container.
      removeEventListener('mousemove', this.onMouseMoveHandler, false);

    this._container.
      removeEventListener('mousewheel', this.onMouseMoveHandler, false);
    this._container.
      removeEventListener('DOMMouseScroll', this.onMouseMoveHandler, false);

    this._voxel.removeTest();
    this.remove(this._voxel);
    this._voxel = null;

    super.free();
  }

  hoverVoxel(mouseScreenCoordinates, currentDataCoordinates) {
    // update distance mouse/this._voxel
    let dx =
      mouseScreenCoordinates.screenX - this._voxel.voxel.screenCoordinates.x;
    let dy =
      mouseScreenCoordinates.screenY - this._voxel.voxel.screenCoordinates.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this._voxel.distance = distance;
    if (distance >= 0 && distance < 10) {
      this._hover = true;
    } else {
      this._hover = false;
    }
  }

  set worldPosition(worldPosition) {
    this._worldPosition.copy(worldPosition);
    this.update();
  }

  set defaultColor(defaultColor) {
    this._defaultColor = defaultColor;
    this.update();
  }

  get defaultColor() {
    return this._defaultColor;
  }

  set activeColor(activeColor) {
    this._activeColor = activeColor;
    this.update();
  }

  get activeColor() {
    return this._activeColor;
  }

  set hoverColor(hoverColor) {
    this._hoverColor = hoverColor;
    this.update();
  }

  get hoverColor() {
    return this._hoverColor;
  }

  set selectedColor(selectedColor) {
    this._selectedColor = selectedColor;
    this.update();
  }

  get selectedColor() {
    return this._selectedColor;
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

  hideDOM() {
    this._dom.style.display = 'none';
  }

  showDOM() {
    this._dom.style.display = '';
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
}
