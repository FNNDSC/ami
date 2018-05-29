import WidgetsBase from './widgets.base';
import CoreIntersections from '../core/core.intersections';

import {Vector2, Vector3} from 'three';

/**
 * @module widgets/handle
 */
export default class WidgetsHandle extends WidgetsBase {
  constructor(targetMesh, camera) {
    super(targetMesh, camera);

    // if no target mesh, use plane for FREE dragging.
    this._plane = {
        position: new Vector3(),
        direction: new Vector3(),
    };
    this._offset = new Vector3();
    this._raycaster = new THREE.Raycaster();

    this._tracking = false;

    this._mouse = new Vector2();
    this._lastEvent = null;

    // screen position of this handle
    this._screenPosition = new Vector2();

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

  /**
   * @param {Object} evt - Browser event
   * @param {Boolean} forced - true to move inactive handles
   */
  onMove(evt, forced) {
    this._lastEvent = evt;
    evt.preventDefault();

    const offsets = this.getMouseOffsets(evt, this._container);
    this._mouse.set(offsets.x, offsets.y);

    // update raycaster
    // set ray.position to satisfy CoreIntersections::rayPlane API
    this._raycaster.setFromCamera(this._mouse, this._camera);
    this._raycaster.ray.position = this._raycaster.ray.origin;

    if (this._active || forced) {
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

    if (this._tracking === true) { // stay active and keep controls disabled
      return;
    }

    if (!this._dragged && this._active) {
      this._selected = !this._selected; // change state if there was no dragging
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

  create() {
    this.createMesh();
    this.createDOM();
  }

  createMesh() {
    // geometry
    this._geometry = new THREE.SphereGeometry(1, 16, 16);

    // material
    this._material = new THREE.MeshBasicMaterial({
        wireframe: true,
        wireframeLinewidth: 2,
      });

    // mesh
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.position.copy(this._worldPosition);
    this._mesh.visible = true;

    this.updateMeshColor();

    // add it!
    this.add(this._mesh);
  }

  createDOM() {
    this._dom = document.createElement('div');
    this._dom.setAttribute('class', 'AMI Widget Handle');
    this._dom.style.border = '2px solid';
    this._dom.style.backgroundColor = '#F9F9F9';
    this._dom.style.color = '#F9F9F9';
    this._dom.style.position = 'absolute';
    this._dom.style.width = '12px';
    this._dom.style.height = '12px';
    this._dom.style.margin = '-6px';
    this._dom.style.borderRadius = '50%';
    this._dom.style.transformOrigin = '0 100%';
    this._dom.style.zIndex = '2';

    let posY = this._screenPosition.y - this._container.offsetHeight;
    this._dom.style.transform =
      `translate3D(${this._screenPosition.x}px, ${posY}px, 0)`;

    this.updateDOMColor();

    this._container.appendChild(this._dom);
  }

  update() {
    // general update
    this.updateColor();

    // update screen position of handle
    this._screenPosition = this.worldToScreen(this._worldPosition);

    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  //
  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if (this._mesh) {
      this._mesh.position.copy(this._worldPosition);
    }
  }

  hoverMesh() {
    // check raycast intersection, do we want to hover on mesh or just css?
    let intersectsHandle = this._raycaster.intersectObject(this._mesh);
    this._meshHovered = (intersectsHandle.length > 0);
  }

  hoverDom(evt) {
    this._domHovered = (evt.type === 'mouseenter');
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

    super.free();
  }

  hideDOM() {
    this._dom.style.display = 'none';
  }

  showDOM() {
    this._dom.style.display = '';
  }

  set screenPosition(screenPosition) {
    this._screenPosition = screenPosition;
  }

  get screenPosition() {
    return this._screenPosition;
  }

  get active() {
    return this._active;
  }

  set active(active) {
    this._active = active;
    // this._tracking = this._active;
    this._controls.enabled = !this._active;

    this.update();
  }

  get tracking() {
    return this._tracking;
  }

  set tracking(tracking) {
    this._tracking = tracking;
    this.update();
  }
}
