import WidgetsBase from './widgets.base';
import WidgetsHandle from './widgets.handle';

import {Vector3} from 'three';

/**
 * @module widgets/handle
 *
 */

export default class WidgetsAnnotation extends WidgetsBase {
  constructor(targetMesh, controls, camera, container) {
    super();

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;

    this._active = true;

    this._worldPosition = new Vector3();
    if (this._targetMesh !== null) {
      this._worldPosition = this._targetMesh.position;
    }

    // mesh stuff
    this._material = null;
    this._geometry = null;
    this._meshline = null;
    this._cone = null;

    // dom stuff
    this._line = null;
    this._dashline = null;
    this._label = null;
    this._labeltext = null;

    // booleans
    this._alreadycreated = null; // bool that turns true when the user enter the name of the label
    this._movinglabel = null; // bool that turns true when the label is moving with the mouse
    this._labelmoved = false; // bool that turns true once the label is moved by the user (at least once)

    this._labelhovered = false;
    this._hovered = true;
    this._manuallabeldisplay = false; // Make true to force the label to be displayed

    // var
    // position of label (top left corner)
    this._labelpositionx = null;
    this._labelpositiony = null;
    // difference between mouse position in the label and position of label (top left corner)
    this._differencemousecenterlabelx = 0;
    this._differencemousecenterlabely = 0;

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

    // Create annotation
    this.create();

    this.onEnd = this.onEnd.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onHoverlabel = this.onHoverlabel.bind(this);
    this.notonHoverlabel = this.notonHoverlabel.bind(this);
    this.changelabeltext = this.changelabeltext.bind(this);
    this.movelabel = this.movelabel.bind(this);
    this.notmovelabel = this.notmovelabel.bind(this);

    this.addEventListeners();
  }

  addEventListeners() {
    this._label.addEventListener('mouseenter', this.onHoverlabel);
    this._label.addEventListener('mouseleave', this.notonHoverlabel);
    this._label.addEventListener('dblclick', this.changelabeltext);
    this._label.addEventListener('mousedown', this.movelabel);

    this._container.addEventListener('mouseup', this.notmovelabel);

    this._container.addEventListener('wheel', this.onMove);
  }

  removeEventListeners() {
    this._label.removeEventListener('mouseenter', this.onHoverlabel);
    this._label.removeEventListener('mouseleave', this.notonHoverlabel);
    this._label.removeEventListener('dblclick', this.changelabeltext);
    this._label.removeEventListener('mousedown', this.movelabel);

    this._container.removeEventListener('mouseup', this.notmovelabel);

    this._container.removeEventListener('wheel', this.onMove);
  }

  movelabel() { // function called when mousedown
    if (this._labelhovered) { // if label hobered we will move the label
      this._movinglabel = true;
      this._labelmoved = true;
      let mousey = -(-event.clientY + this._container.offsetHeight);
      let mousex = event.clientX;
      // calculate difference between ref position of the label (top-left corner) and mouse position in the label
      this._differencemousecenterlabelx = Math.abs(Math.abs(mousex) - Math.abs(this._labelpositionx));
      this._differencemousecenterlabely = Math.abs(Math.abs(mousey) - Math.abs(this._labelpositiony));
    }
  }

  notmovelabel() {
    // this function is called when mouseup
    this._movinglabel = false;
    this._handles[0]._controls.enabled = true; // move the camera when mousedown and mousedown again
    this._handles[1]._controls.enabled = true;
    this._differencemousecenterlabelx = 0; // restart the value of differencemousecenterlabel. Necessary?
    this._differencemousecenterlabely = 0;
  }

  onHoverlabel() {
    // this function is called when mouse enters the label with "mouseenter" event
    this._labelhovered = true;
  }

  notonHoverlabel() {
    // this function is called when mouse leaves the label with "mouseleave" event
    this._labelhovered = false;
  }

  onStart(evt) {
    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active || this._labelhovered;

    this.update();
  }

  onMove(evt) {
    if (this._movinglabel) {
      this._handles[0]._controls.enabled = false;
      this._handles[1]._controls.enabled = false;
    }

    if (this._active) {
      this._dragged = true;
    }

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._labelhovered;

    this.update();
  }

  onEnd(evt) {
    // First Handle
    this._handles[0].onEnd(evt);

    // Second Handle
    if (this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    } else {
     this._handles[1].tracking = false;
    }

    if (!this._alreadycreated) {
      this.setlabeltext();
      this._alreadycreated = true;
    }

    // State of annotation widget
    if (!this._dragged && this._active) {
        this._selected = !this._selected; // change state if there was no dragging
        this._handles[0].selected = this._selected;
        this._handles[1].selected = this._selected;
    }
    this._active = this._handles[0].active || this._handles[1].active;
    this._dragged = false;
    this.update();
  }

  setlabeltext() { // this function is called when the user creates a new arrow
    this._labeltext = prompt('Please enter the name of the label', '');
    this.displaylabel();
  }

  changelabeltext() { // this function is called when the user does double click in the label
    this._labeltext = prompt('Please enter new name of the label', this._label.innerHTML);
    this.displaylabel();
  }

  displaylabel() {
    this._label.innerHTML = typeof this._labeltext === 'string' && this._labeltext.length > 0 // avoid error
      ? this._labeltext
      : ''; // empty string is passed or Cancel is pressed
    // show the label (in css an empty string is used to revert display=none)
    this._label.style.display = '';
    this._dashline.style.display = '';
    this._label.style.transform = `translate3D(${this._labelpositionx}px,${this._labelpositiony}px, 0)`;
  }

  create() {
    this.createMesh();
    this.createDOM();
  }

  update() {
    this.updateColor();

    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMColor();
    this.updateDOMPosition();
  }

  createMesh() {
    // geometry
    this._geometry = new THREE.Geometry();
    this._geometry.vertices.push(this._handles[0].worldPosition);
    this._geometry.vertices.push(this._handles[1].worldPosition);

    // material
    this._material = new THREE.LineBasicMaterial();
    this.updateMeshColor();

    // mesh
    this._meshline = new THREE.Line(this._geometry, this._material);
    this._meshline.visible = true;

    // add it!
    this.add(this._meshline);

    // create cone and add it
    this._conegeometry = new THREE.CylinderGeometry(0, 2, 10);
    this._conegeometry.translate(0, -5, 0);
    this._conegeometry.rotateX(- Math.PI / 2);
    this._cone = new THREE.Mesh(this._conegeometry, this._material);
    this._cone.visible = true;
    this.add(this._cone);
  }

  updateMeshColor() {
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if (this._geometry) {
      this._geometry.verticesNeedUpdate = true;
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

    // add dash line
    this._dashline = document.createElement('div');
    this._dashline.setAttribute('class', 'widgets handle dashline');
    this._dashline.style.position = 'absolute';
    this._dashline.style.border = 'none';
    this._dashline.style.borderTop = '2.5px dashed #F9F9F9';
    this._dashline.style.transformOrigin = '0 100%';
    this._dashline.style.height = '1px';
    this._dashline.style.width = '50%';
    this._dashline.style.display = 'none';
    this._container.appendChild(this._dashline);

    // add label!
    this._label = document.createElement('div');
    this._label.setAttribute('id', this.uuid);
    this._label.setAttribute('class', 'widgets handle label');
    this._label.style.border = '2px solid #F9F9F9';
    this._label.style.backgroundColor = '#F9F9F9';
    // this._label.style.opacity = '0.5';
    this._label.style.color = '#353535';
    this._label.style.padding = '4px';
    this._label.style.position = 'absolute';
    this._label.style.transformOrigin = '0 100%';
    this._label.innerHTML = 'Hello, world!';
    this._label.style.display = 'none';
    this._container.appendChild(this._label);

    this.updateDOMColor();
  }

  updateDOMPosition() {
    // update annotation lines and text!
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    let x0 = x1 + (x2 - x1)/2;
    let y0 = y1 + (y2 - y1)/2;

    let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; // result in deg

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    this._line.style.transform = transform;
    this._line.style.width = length + 'px';


    // update label position
    let mousex = 0;
    let mousey = 0;

    x0 -= this._label.offsetWidth/2;
    y0 -= this._container.offsetHeight - this._label.offsetHeight/2;

    if (!this._labelmoved) { // if the user hasnt moved the label, the position is defined by the position of the arrow
        this._label.style.transform = `translate3D(${Math.round(x0)}px,${Math.round(y0)}px, 0)`;
        this._labelpositionx = Math.round(x0);
        this._labelpositiony = Math.round(y0);
    }


    if (this._movinglabel) { // if the user has moved the label, the position is defined by the mouse
        mousex = event.clientX;
        mousey = -(-event.clientY + this._container.offsetHeight);
        this._label.style.transform = `translate3D(${mousex - this._differencemousecenterlabelx}px,`
          + `${mousey - this._differencemousecenterlabely}px, 0)`;
        // we use differencemousecenterlabel to check the difference between the position of the mouse in the label
        // and the reference position of the label (top-left corner)
        this._labelpositionx = mousex - this._differencemousecenterlabelx;
        this._labelpositiony = mousey - this._differencemousecenterlabely;
    }

    // create the label without the interaction of the user. Useful when we need to create the label manually.
    if (this._manuallabeldisplay) {
        this.displaylabel();
    }

    // update cone
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    // position and rotation of cone
    this._cone.position.set(w1.x, w1.y, w1.z);
    this._cone.lookAt(w0);

    // update dash line

    // calculate the place in the label: center of the label
    x1 = this._handles[0].screenPosition.x;
    y1 = this._handles[0].screenPosition.y;
    x2 = this._labelpositionx;
    // revert the operation in 'mousey' to get the previous eventY
    y2 = this._labelpositiony + this._container.offsetHeight;

    // get the size of the label so we can place the dashed line in the center of it
    let labelheight = this._label.offsetHeight;
    let labelwidth = this._label.offsetWidth;

    let centerlabelx = 0;
    let centerlabely = 0;

    if (isFinite(labelwidth) && isFinite(labelheight)) {
      // if the extraction has been succesfull, we calculate the center of the label with total size
      centerlabelx = labelwidth/2;
      centerlabely = labelheight/2;
    }

    x2 += centerlabelx;
    y2 += centerlabely;

    // calculate the place in the arrow: closest part of the line to place the dashed line
    let x1_tail = this._handles[0].screenPosition.x; // first position: tail of arrow
    let y1_tail = this._handles[0].screenPosition.y;
    // second position: center of arrow
    let x1_body = (this._handles[0].screenPosition.x + this._handles[1].screenPosition.x)/2;
    let y1_body = (this._handles[0].screenPosition.y + this._handles[1].screenPosition.y)/2;
    let x1_nose = this._handles[1].screenPosition.x; // third position: peak of arrow
    let y1_nose = this._handles[1].screenPosition.y;

    // calculate all the lengths to the label, so we can choose the min
    let lengthtaillabel = Math.sqrt((x1_tail-x2)*(x1_tail-x2) + (y1_tail-y2)*(y1_tail-y2));
    let lengthbodylabel = Math.sqrt((x1_body-x2)*(x1_body-x2) + (y1_body-y2)*(y1_body-y2));
    let lengthnoselabel = Math.sqrt((x1_nose-x2)*(x1_nose-x2) + (y1_nose-y2)*(y1_nose-y2));

    let lengths = [lengthtaillabel, lengthbodylabel, lengthnoselabel];
    let minlength = Math.min(lengthtaillabel, lengthbodylabel, lengthnoselabel);
    let minlengthindex = lengths.indexOf(minlength);

    if (minlengthindex === 0) {
      x1 = x1_tail;
      y1 = y1_tail;
    }
    if (minlengthindex === 1) {
      x1 = x1_body;
      y1 = y1_body;
    }
    if (minlengthindex === 2) {
      x1 = x1_nose;
      y1 = y1_nose;
    }

    // Once we found the closest point to the label, we create the dashed line from that point
    let lengthdashline = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angledashline = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; // result in deg

    let posYdashline = y1 - this._container.offsetHeight;

    // update dashed line
    let transformdashline = `translate3D(${x1}px,${posYdashline}px, 0)`;
    transformdashline += ` rotate(${angledashline}deg)`;

    this._dashline.style.transform = transformdashline;
    this._dashline.style.width = lengthdashline + 'px';
  }

  updateDOMColor() {
    this._line.style.backgroundColor = `${this._color}`;
    this._dashline.style.borderTop = '2.5px dashed ' + `${this._color}`;
    this._label.style.borderColor = `${this._color}`;
  }

  free() {
    this.removeEventListeners();

    this._handles.forEach((h) => {
      this.remove(h);
      h.free();
    });
    this._handles = [];

    this._container.removeChild(this._line);
    this._container.removeChild(this._dashline);
    this._container.removeChild(this._label);

    // mesh, geometry, material
    this.remove(this._meshline);
    this._meshline.geometry.dispose();
    this._meshline.geometry = null;
    this._meshline.material.dispose();
    this._meshline.material = null;
    this._meshline = null;
    this._geometry.dispose();
    this._geometry = null;
    this._material.vertexShader = null;
    this._material.fragmentShader = null;
    this._material.uniforms = null;
    this._material.dispose();
    this._material = null;
    this.remove(this._cone);
    this._cone.geometry.dispose();
    this._cone.geometry = null;
    this._cone.material.dispose();
    this._cone.material = null;
    this._cone = null;
    this._conegeometry.dispose();
    this._conegeometry = null;

    super.free();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._worldPosition = worldPosition;
    this._handles[0].worldPosition = this._worldPosition;
    this._handles[1].worldPosition = this._worldPosition;

    this.update();
  }

  hideDOM() {
    this._line.style.display = 'none';
    this._dashline.style.display = 'none';
    this._label.style.display = 'none';
    this._handles.forEach(function(elem) {
      elem.hideDOM();
    });
  }

  showDOM() {
    this._line.style.display = '';
    this._dashline.style.display = '';
    this._label.style.display = '';
    this._handles.forEach(function(elem) {
      elem.showDOM();
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
}
