import GeometriesVoxel from '../geometries/geometries.voxel';
import ModelsStack from '../models/models.stack';
import ModelsVoxel from '../models/models.voxel';

/**
 * @module helpers/voxel
 */

export default class HelpersVoxel extends THREE.Object3D {
  constructor(worldCoordinates = null, stack = null) {
    super();

    this._stack = stack;
    this._worldCoordinates = worldCoordinates;

    this._voxel = new ModelsVoxel();
    this._voxel.id = this.id;
    this._voxel.worldCoordinates = this._worldCoordinates;

    // if stack provided, compute IJK and value
    if (this._stack && this._stack.prepared && this._worldCoordinates) {
      this.updateVoxel(this._worldCoordinates);
    }

    // part of the helper...?
    this._mesh = null;
    this._geometry = null;
    this._material = null;
    // 3 next purpose is just to change the color: at widget level
    this._selected = false;
    this._active = false;
    this._hover = false;
    this._distance = null;

    this._showVoxel = true;
    this._showDomSVG = true;
    this._showDomMeasurements = true;
    this._color = '#00B0FF';
    // just visualization
    // this._svgPointer = '<svg width="40" height="40" \
    //      viewBox="0 0 140 140" version="1.1" \
    //      xmlns="http://www.w3.org/2000/svg"> \
    //   \
    //     <polyline points="10,70 \
    //                       70,10 \
    //                       130,70" />\
    //   \
    //   </svg>';
    /* jshint multistr: true */
    this._svgPointer = '<svg width="40" height="40" \
                      viewBox="0 0 140 140" version="1.1" \
                      xmlns="http://www.w3.org/2000/svg"> \
                      \
                      <path d="M70,70 \
                               L30,30 \
                               A10,10 0 1 1 10,10\
                               A10,10 0 1 1 30,30" />\
                      \
                      </svg>';


    this.createMesh();
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

  updateVoxelScreenCoordinates(camera, container) {
    this._voxel.screenCoordinates = HelpersVoxel.worldToScreen(
      this._worldCoordinates,
      camera,
      container);
  }

  createMesh() {
    let dataCoordinates = ModelsStack.worldToData(
      this._stack,
      this._worldCoordinates);

    this._geometry = new GeometriesVoxel(dataCoordinates);
    this._material = new THREE.MeshBasicMaterial({
        wireframe: true,
        wireframeLinewidth: 2,
      });
    this._material.color.set(this._color);
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.applyMatrix(this._stack.ijk2LPS);

    this._mesh.visible = this._showVoxel;

    this.add(this._mesh);
  }

  createDom() {
    // that could be a web-component!
    let measurementsContainer = this._createDiv('VJSVoxelMeasurements', this.id, 'VJSVoxelMeasurements');
    // RAS
    let rasContainer = this._createDiv('VJSVoxelProbeWorld', this.id, 'VJSVoxelProbeWorld');
    measurementsContainer.appendChild(rasContainer);
    // IJK
    let ijkContainer = this._createDiv('VJSVoxelProbeData', this.id, 'VJSVoxelProbeData');
    measurementsContainer.appendChild(ijkContainer);
    // Value
    let valueContainer = this._createDiv('VJSVoxelProbeValue', this.id, 'VJSVoxelProbeValue');
    measurementsContainer.appendChild(valueContainer);

    // SVG
    let svgContainer = this._createDiv('VJSVoxelProbeSVG', this.id, 'VJSVoxelProbeSVG');
    svgContainer.innerHTML = this._svgPointer;

    // Package everything
    let domElement = this._createDiv('VJSWidgetVoxelProbe', this.id, 'VJSWidgetVoxelProbe');
    domElement.appendChild(svgContainer);
    domElement.appendChild(measurementsContainer);

    return domElement;
  }

  updateDom(container) {
    if (document.getElementById('VJSVoxelProbeWorld' + this.id) === null) {
      container.appendChild(this.createDom());
    }

    // update content
    let rasContainer = document.getElementById('VJSVoxelProbeWorld' + this.id);
    let rasContent = this._voxel.worldCoordinates.x.toFixed(2) + ' : ' +
                     this._voxel.worldCoordinates.y.toFixed(2) + ' : ' +
                     this._voxel.worldCoordinates.z.toFixed(2);
    rasContainer.innerHTML = 'LPS: ' + rasContent;

    let ijkContainer = document.getElementById('VJSVoxelProbeData' + this.id);
    let ijkContent = this._voxel.dataCoordinates.x + ' : ' +
                     this._voxel.dataCoordinates.y + ' : ' +
                     this._voxel.dataCoordinates.z;
    ijkContainer.innerHTML = 'IJK: ' + ijkContent;

    let valueContainer = document.getElementById('VJSVoxelProbeValue' + this.id);
    let valueContent = this._voxel.value;
    valueContainer.innerHTML = 'Value: ' + valueContent;

    // update div position
    let selectedElement = document.getElementById('VJSWidgetVoxelProbe' + this.id);
    selectedElement.style.top = this._voxel.screenCoordinates.y + 'px';
    selectedElement.style.left = this._voxel.screenCoordinates.x + 'px';
    // window.console.log(this._voxel);
    // selectedElement.style['transform-origin'] = 'top left';
    // selectedElement.style['transform'] = 'translate(' + this._voxel.screenCoordinates.x + 'px, ' + this._voxel.screenCoordinates.y + 'px)';

    this.updateDomClass(selectedElement);
  }

  updateDomClass() {
    let element = document.getElementById('VJSWidgetVoxelProbe' + this.id);
    if (this._active === true) {
      element.classList.add('VJSVoxelProbeActive');
    } else {
      element.classList.remove('VJSVoxelProbeActive');
    }

    if (this._hover === true) {
      element.classList.add('VJSVoxelProbeHover');
    } else {
      element.classList.remove('VJSVoxelProbeHover');
    }

    if (this._selected === true) {
      element.classList.add('VJSVoxelProbeSelect');
    } else {
      element.classList.remove('VJSVoxelProbeSelect');
    }

    this.updateDomElementDisplay('VJSVoxelMeasurements' + this.id, this._showDomMeasurements);
    this.updateDomElementDisplay('VJSVoxelProbeSVG' + this.id, this._showDomSVG);
  }

  updateDomElementDisplay(id, show) {
    if (show) {
      document.getElementById(id).style.display = 'block';
    } else {
      document.getElementById(id).style.display = 'none';
    }
  }

  removeTest() {
    // remove voxelDom
    let node = document.getElementById('VJSWidgetVoxelProbe' + this.id);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    // remove voxelMesh
    this.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._mesh.material.dispose();
    this._mesh = null;
  }

  static worldToScreen(worldCoordinate, camera, canvas) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(camera);

    screenCoordinates.x = Math.round((screenCoordinates.x + 1) * canvas.offsetWidth / 2);
    screenCoordinates.y = Math.round((-screenCoordinates.y + 1) * canvas.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
  }

  _createDiv(idPrefix, idSuffix, className) {
    let divContainer = document.createElement('div');
    divContainer.setAttribute('id', idPrefix + idSuffix);
    divContainer.setAttribute('class', className);

    return divContainer;
  }

  set color(color) {
    this._color = color;
    if (this._material) {
      this._material.color.set(this._color);
    }

    // also update the dom
    let selectedElement = document.getElementById('VJSVoxelMeasurements' + this.id);
    if (selectedElement) {
      selectedElement.style.borderColor = this._color.replace('0x', '#');
    }

    selectedElement = document.querySelector('#VJSVoxelProbeSVG' + this.id + '> svg > path');
    if (selectedElement) {
      selectedElement.style.stroke = this._color.replace('0x', '#');
    }
  }

  get color() {
    return this._color;
  }

  set worldCoordinates(worldCoordinates) {
    this._worldCoordinates = worldCoordinates;
    this._voxel._worldCoordinates = worldCoordinates;

    // set data coordinates && value
    this.updateVoxel(this._worldCoordinates);

    if (this._mesh && this._mesh.geometry) {
      this._mesh.geometry.location = this._voxel.dataCoordinates;
    }
  }

  get worldCoordinates() {
    return this._worldCoordinates;
  }

  get voxel() {
    return this._voxel;
  }

  set voxel(voxel) {
    this._voxel = voxel;
  }

  set showVoxel(showVoxel) {
    this._showVoxel = showVoxel;

    if (this._mesh) {
      this._mesh.visible = this._showVoxel;
    }
  }
  get showVoxel() {
    return this._showVoxel;
  }

  set showDomSVG(showDomSVG) {
    this._showDomSVG = showDomSVG;
    this.updateDomClass();
  }
  get showDomSVG() {
    return this._showDomSVG;
  }

  set showDomMeasurements(showDomMeasurements) {
    this._showDomMeasurements = showDomMeasurements;
    this.updateDomClass();
  }
  get showDomMeasurements() {
    return this._showDomMeasurements;
  }

  set distance(distance) {
    this._distance = distance;
  }

  get distance() {
    return this._distance;
  }

  set selected(selected) {
    this._selected = selected;
  }

  get selected() {
    return this._selected;
  }

  set hover(hover) {
    this._hover = hover;
  }

  get hover() {
    return this._hover;
  }

  set active(active) {
    this._active = active;
  }

  get active() {
    return this._active;
  }
}
