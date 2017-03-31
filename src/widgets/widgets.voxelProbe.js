/** * Imports ***/
import WidgetsBase from '../widgets/widgets.base';
import HelpersVoxel from '../helpers/helpers.voxel';

/**
 * @module widgets/voxelProbe
 */

export default class WidgetsVoxelProbe extends WidgetsBase {
  constructor(stack, targetMesh, controls, camera, container) {
    super(container);

    this._enabled = true;

    this._targetMesh = targetMesh;
    this._stack = stack;
    // this._container = container;
    this._controls = controls;
    this._camera = camera;

    this._mouse = {
      x: 0,
      y: 0,
      screenX: 0,
      screenY: 0,
    };

    // show only voxels that interesect the mesh
    this._showFrame = -1;

    this._raycaster = new THREE.Raycaster();

    this._active = true;

    this._hover = false;
    this._selected = false;

    // event listeners

    //Store the event handlers so that we can remove them in the destroy method.
    //If we don't do like that, since bind creates a new function, the function we would pass to addEventListener
    //would not be the same the we would pass to removeEventListener
    this.onMouseMoveHandler = this.onMouseMove.bind(this);
    this.onMouseUpHandler = this.onMouseUp.bind(this);

    this._container.addEventListener('mouseup', this.onMouseUpHandler, false);
    this._container.addEventListener('mousemove', this.onMouseMoveHandler, false);

    this._container.addEventListener('mousewheel', this.onMouseMoveHandler, false);
    this._container.addEventListener('DOMMouseScroll', this.onMouseMoveHandler, false); // firefox

    this._defaultColor = '#00B0FF';
    this._activeColor = '#FFEB3B';
    this._hoverColor = '#F50057';
    this._selectedColor = '#76FF03';

    this._showVoxel = true;
    this._showDomSVG = true;
    this._showDomMeasurements = true;

    this.createVoxel();
    this.initOffsets();
  }

  isEnabled() {

  }

  onMouseMove(event) {
    if (this._enabled === false) {
      return;
    }

    this._mouse = this.getMouseOffsets(event, this._container);
    this.updateRaycaster();
  }

  onMouseUp(event) {
    if (this._enabled === false) {
      return;
    }

    if (!this._active) {
      if (this._hover) {
        this.activateVoxel();
      }
    }
    else {
      this.deactivateVoxel();
    }

  }

  updateRaycaster() {
    // update the raycaster
    if (this._active) {
      this._raycaster.setFromCamera(this._mouse, this._camera);
    }

    this.update();
  }

  updateColor() {
    if (this._active) {
      this._voxel.color = this._activeColor;
    } else if (this._hover) {
      this._voxel.color = this._hoverColor;
    } else if (this._selected) {
      this._voxel.color = this._selectedColor;
    } else {
      this._voxel.color = this._defaultColor;
    }
  }

  activateVoxel() {
    if (!this._active && this._hover) {
      // Look for intersection against target mesh
      let intersects = this._raycaster.intersectObject(this._targetMesh);

      if (intersects.length > 0) {
        // Active voxel
        this._active = true;
        this.updateColor();
        // Disable controls
        this._controls.enabled = false;
      }
    }
  }

  deactivateVoxel() {
    if(this._active) {
      // change color + select it and nothing else selected
      this._active = false;
      // Enable controls
      this._controls.enabled = true;

      this.updateColor();
    }
  }

  createVoxel() {
    this._voxel = new HelpersVoxel(this._stack.worldCenter(), this._stack);
    this._voxel._showVoxel = true;
    this._voxel._showDomSVG = true;
    this._voxel._showDomMeasurements = true;

    this.add(this._voxel);
  }

  update() {

    // good to go
    if (!this._targetMesh) {
      return;
    }

    // Look for intersection against target mesh
    let intersects = this._raycaster.intersectObject(this._targetMesh);

    if (intersects.length > 0) {

      // modify world position with getter/setter
      this._voxel.worldCoordinates = intersects[0].point;

      // create voxel helper
      this._voxel.updateVoxel(intersects[0].point);

      // add hover colors
      this._voxel.updateVoxelScreenCoordinates(this._camera, this._container);
      this.hoverVoxel(this._mouse, this._voxel.dataCoordinates);
      this.updateColor();

      // only works if slice is a frame...
      // should test intersection of voxel with target mesh (i.e. plane, box, sphere, etc...)
      // maybe use the raycasting somehow....
      this.showOfIntersectsFrame(this._voxel, this._showFrame);

      this._voxel.updateDom(this._container);

      // show/hide mesh
      this._voxel.showVoxel = this._showVoxel;
      // show/hide dom stuff
      this._voxel.showDomSVG = this._showDomSVG;
      this._voxel.showDomMeasurements = this._showDomMeasurements;

    }
  }

  free() {
    this._container.removeEventListener('mouseup', this.onMouseUpHandler, false);
    this._container.removeEventListener('mousemove', this.onMouseMoveHandler, false);

    this._container.removeEventListener('mousewheel', this.onMouseMoveHandler, false);
    this._container.removeEventListener('DOMMouseScroll', this.onMouseMoveHandler, false); // firefox

    this._voxel.removeTest();
    this.remove(this._voxel);
    this._voxel = null;

    super.free();
  }

  hoverVoxel(mouseScreenCoordinates, currentDataCoordinates) {
    // update distance mouse/this._voxel
    let dx = mouseScreenCoordinates.screenX - this._voxel.voxel.screenCoordinates.x;
    let dy = mouseScreenCoordinates.screenY - this._voxel.voxel.screenCoordinates.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this._voxel.distance = distance;
    if (distance >= 0 && distance < 10) {
      this._hover = true;
    } else {
      this._hover = false;
    }
  }

  showOfIntersectsFrame(voxelHelper, frameIndex) {
    if (frameIndex === voxelHelper.voxel.dataCoordinates.z ||
      frameIndex === -1) {
      voxelHelper._showDomSVG = true;
      voxelHelper._showDomMeasurements = true;
    } else {
      voxelHelper._showDomSVG = false;
      voxelHelper._showDomMeasurements = false;
    }
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
}
