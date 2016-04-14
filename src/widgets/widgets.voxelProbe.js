/*** Imports ***/
import HelpersVoxel from '../../src/helpers/helpers.voxel';

/**
 * @module widgets/voxelProbe
 */

export default class WidgetsVoxelProbe extends THREE.Object3D{
  constructor(stack, targetMesh, controls, camera, container) {
    super();

    this._enabled = true;

    this._targetMesh = targetMesh;
    this._stack = stack;
    this._container = container;
    this._controls = controls;
    this._camera = camera;
    this._mouse = {
      x: 0,
      y: 0,
      screenX: 0,
      screenY: 0
    };
    // show only voxels that interesect the mesh
    this._showFrame = -1;

    this._raycaster = new THREE.Raycaster();
    this._draggingMouse = false;
    this._active = -1;
    this._hover = -1;
    this._closest = null;
    this._selected = [];

    this._voxels = [];
    this._current = new HelpersVoxel(stack.worldCenter(), stack);
    this._current._showVoxel =  true;
    this._current._showDomSVG =  true;
    this._current._showDomMeasurements =  true;

    this.add(this._current);

    // event listeners
    this._container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this._container.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this._container.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    this._container.addEventListener('mousewheel', this.onMouseMove.bind(this), false);
    this._container.addEventListener('DOMMouseScroll', this.onMouseMove.bind(this), false); // firefox

    window.addEventListener('keypress', this.onKeyPress.bind(this), false);

    this._defaultColor = '0x00B0FF';
    this._activeColor = '0xFFEB3B';
    this._hoverColor = '0xF50057';
    this._selectedColor = '0x76FF03';

    this._showVoxel = true;
    this._showDomSVG = true;
    this._showDomMeasurements = true;
  }

  isEnabled() {

  }

  onKeyPress(event) {
    if (this._enabled === false) {
      return;
    }

    if (event.keyCode === 100) {
      this.deleteAllSelected();
    }
  }

  onMouseMove() {

    if (this._enabled === false) {
      return;
    }

    this.updateRaycaster(this._raycaster, event, this._container);

    this._draggingMouse  = true;

    this.update();
  }

  onMouseDown(event) {

    if (this._enabled === false) {
      return;
    }

    this.updateRaycaster(this._raycaster, event, this._container);

    this._draggingMouse  = false;
  
    this.activateVoxel();
  }

  onMouseUp(event) {

    if (this._enabled === false) {
      return;
    }

    this.updateRaycaster(this._raycaster, event, this._container);

    if (this._draggingMouse === false) {
      if (this._active === -1) {
        // create voxel
        this.createVoxel();
      } else {
        // select / unselect voxel
        this.selectVoxel();
        // disactivate voxel
        this.activateVoxel();
      }
    } else {
      if (this._active >= 0) {
        this.activateVoxel();
      }
    }
  }

  updateRaycaster(raycaster, event, container) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this._mouse = {
      x: (event.clientX / container.offsetWidth) * 2 - 1,
      y: -(event.clientY / container.offsetHeight) * 2 + 1,
      screenX: event.clientX,
      screenY: event.clientY
    };
    // update the raycaster
    raycaster.setFromCamera(this._mouse, this._camera);
  }

  updateColor(voxel) {
    if (voxel._active) {
      voxel.color = this._activeColor;
    } else if (voxel.hover) {
      voxel.color = this._hoverColor;
    } else if (voxel.selected) {
      voxel.color = this._selectedColor;
    } else {
      voxel.color = this._defaultColor;
    }
  }

  deleteAllSelected() {
    let i = this._voxels.length;
    while (i--) {
      let match = this._selected.indexOf(i);
      if (match >= 0) {

        // selected && active
        if (this._active === i) {
          this._active = -1;
        }

        this.remove(this._voxels[i]);
        this._voxels[i].removeTest();
        this._voxels.splice(i, 1);
      }
    }

    this._selected = [];
    this._closest = null;
  }

  selectVoxel() {
    // select/unselect the active voxel
    let selIndex = this._selected.indexOf(this._active);
    if (selIndex === -1) {
      this._selected.push(this._active);
      this._voxels[this._active].selected = true;
      this.updateColor(this._voxels[this._active]);
    } else {
      this._selected.splice(selIndex, 1);
      this._voxels[this._active].selected = false;
    }
  }

  activateVoxel() {
    if (this._active === -1) {
      // Look for intersection against target mesh
      let intersects = this._raycaster.intersectObject(this._targetMesh);

      if (intersects.length > 0) {
        if (this._hover >= 0 ||
           (this._closest !== null && this._voxels[this._closest].distance < 10)) {
          let index = Math.max(this._hover, this._closest);
          // Active voxel
          this._voxels[index]._active = true;
          this.updateColor(this._voxels[index]);
          this._active = index;
          // Disable controls
          this._controls.enabled = false;
        }
      }

    } else {
      // change color + select it and nothing else selected
      this._voxels[this._active].active = false;
      this._active = -1;
      // Enable controls
      this._controls.enabled = true;
    }
  }

  createVoxel() {
    if (this._hover >= 0) {
      return;
    }

    // Look for intersection against target mesh
    let intersects = this._raycaster.intersectObject(this._targetMesh);

    if (intersects.length > 0) {
      // create voxel helper
      let helpersVoxel = new HelpersVoxel(intersects[0].point, this._stack);
      this.add(helpersVoxel);

      // push it
      this._voxels.push(helpersVoxel);

      // add hover colors
      helpersVoxel.updateVoxelScreenCoordinates(this._camera, this._container);
      this.hoverVoxel(helpersVoxel,
          this._mouse,
          this._current.voxel.dataCoordinates);
      this.updateColor(helpersVoxel);
      helpersVoxel.updateDom(this._container);

      // show/hide mesh
      helpersVoxel.showVoxel = this._showVoxel;
      // show/hide dom stuff
      helpersVoxel.showDomSVG = this._showDomSVG;
      helpersVoxel.showDomMeasurements = this._showDomMeasurements;
    }
  }

  update() {
    // good to go
    if (!this._targetMesh) {
      return;
    }

    let intersects = this._raycaster.intersectObject(this._targetMesh);

    if (intersects.length > 0) {
      // modify world position with getter/setter
      this._current.worldCoordinates = intersects[0].point;
      this._current.updateVoxelScreenCoordinates(this._camera, this._container);
      this.updateColor(this._current);
      this._current.updateDom(this._container);
      // show/hide mesh
      this._current.showVoxel = this._showVoxel;
      // show/hide dom stuff
      this._current.showDomSVG = this._showDomSVG;
      this._current.showDomMeasurements = this._showDomMeasurements;

      //  if dragging a voxel
      if (this._active >= 0) {
        this._voxels[this._active].worldCoordinates = intersects[0].point;
      }
    }

    // no geometry related updates
    // just colors for hover, etc.
    // and DOM
    this.updateVoxels();
  }

  updateVoxels() {
    let hover = -1;
    let closest = null;

    for (let i = 0; i < this._voxels.length; i++) {
      // update voxel content
      this._voxels[i].updateVoxelScreenCoordinates(this._camera, this._container);
      // update hover status
      this.hoverVoxel(this._voxels[i],
          this._mouse,
          this._current.voxel.dataCoordinates);
      this.updateColor(this._voxels[i]);

      // only works if slice is a frame...
      // should test intersection of voxel with target mesh (i.e. plane, box, sphere, etc...)
      // maybe use the raycasting somehow....
      this.showOfIntersectsFrame(this._voxels[i], this._showFrame);
      this._voxels[i].updateDom(this._container);

      // hovering?
      if (this._voxels[i].hover) {
        hover = i;
      }

      // closest pixel to the mouse?
      if (closest === null ||
        this._voxels[i].distance < this._voxels[closest].distance) {
        closest = i;
      }

      // show hide mesh
      this._voxels[i].showVoxel = this._showVoxel;
      // show/hide dom stuff
      this._voxels[i].showDomSVG = this._showDomSVG;
      this._voxels[i].showDomMeasurements = this._showDomMeasurements;
    }

    this._hover = hover;
    this._closest = closest;
  }

  hoverVoxel(helpersVoxel, mouseScreenCoordinates, currentDataCoordinates) {
    // update hover voxel
    if (helpersVoxel.voxel.dataCoordinates.x === currentDataCoordinates.x &&
        helpersVoxel.voxel.dataCoordinates.y === currentDataCoordinates.y &&
        helpersVoxel.voxel.dataCoordinates.z === currentDataCoordinates.z) {
      helpersVoxel.hover = true;
    } else {
      // update distance mouse/this._voxel
      let dx = mouseScreenCoordinates.screenX - helpersVoxel.voxel.screenCoordinates.x;
      let dy = mouseScreenCoordinates.screenY - helpersVoxel.voxel.screenCoordinates.y;
      let distance =  Math.sqrt(dx * dx + dy * dy);
      helpersVoxel.distance = distance;
      if (distance >= 0 && distance < 10) {
        helpersVoxel.hover = true;
      } else {
        helpersVoxel.hover = false;
      }
    }
  }

  showOfIntersectsFrame(voxelHelper, frameIndex) {
    if (frameIndex === voxelHelper.voxel.dataCoordinates.z ||
      frameIndex === -1) {
      voxelHelper._showDomSVG =  true;
      voxelHelper._showDomMeasurements =  true;
    } else {
      voxelHelper._showDomSVG =  false;
      voxelHelper._showDomMeasurements =  false;
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
