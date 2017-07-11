import WidgetsBase from '../widgets/widgets.base';
import WidgetsHandle from '../widgets/widgets.handle';

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
    this._label = null;
    this._cone = null;
    this._labeltext = null;

    //booleans
    this._alreadycreated = null; //bool that turns true when the user enter the name of the label
    this._movinglabel = null; //bool that turns true when the label is moving with the mouse
    this._labelmoved = false; //bool that turns true once the label is moved by the user (at least once)

    this._labelhovered = false;
    this._domHovered = false;
    this._hovered = true;

    //var
    this._labelpositionx = null; //position of label (top left corner)
    this._labelpositiony = null; //position of label (top left corner)
    this._differencemousecenterlabelx = 0; //difference between mouse position in the label and position of label (top left corner)
    this._differencemousecenterlabely = 0; //difference between mouse position in the label and position of label (top left corner)

    // add handles
    this._handles = [];

    self = this;

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

    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);
  }

  movelabel() { //function called when mousedown
    if (this._labelhovered = true){ //if label hobered we will move the label
        this._movinglabel = true;
        this._labelmoved = true;
        let mousey =  - (-event.clientY + this._container.offsetHeight);
        let mousex = event.clientX;
        //calculate differencemousecenterlabel (difference between ref position of the label (top-left corner) and mouse position in the label)
        this._differencemousecenterlabelx = Math.abs(Math.abs(mousex) - Math.abs(this._labelpositionx));
        this._differencemousecenterlabely = Math.abs(Math.abs(mousey) - Math.abs(this._labelpositiony));
    }
  }

  notmovelabel() { //this function is called when mouseup
    this._movinglabel = false;
    this._handles[0]._controls.enabled = true; //move the camera when mousedown and mousedown again
    this._handles[1]._controls.enabled = true; 
    this._differencemousecenterlabelx = 0; //restart the value of differencemousecenterlabel. Necessary?
    this._differencemousecenterlabely = 0;
  }

  onHoverlabel() { //this function is called when mouse enters the label with "mouseenter" event
    this._labelhovered = true;
  }
 
  notonHoverlabel() { //this function is called when mouse leaves the label with "mouseleave" event
    this._labelhovered = false;
  }

  onMove(evt) {

    if (this._movinglabel == true){
        this._handles[0]._controls.enabled = false;
        this._handles[1]._controls.enabled = false; 
    }

    this._dragged = true;

    this._handles[0].onMove(evt);
    this._handles[1].onMove(evt);

    this._hovered = this._handles[0].hovered || this._handles[1].hovered || this._labelhovered;

    this.update();

  }


  onStart(evt) {

    this._dragged = false;

    this._handles[0].onStart(evt);
    this._handles[1].onStart(evt);

    this._active = this._handles[0].active || this._handles[1].active;

    this.update();
  }


  setlabeltext() {
    this._labeltext = prompt("Please enter the name of the label", ""); //this function is called when the user creates a new arrow
    if (typeof this._labeltext == 'string'){ //avoid error
        if (this._labeltext.length > 0){
            this._label.innerHTML = this._labeltext;
            this._label.style.display = ''; //in css an empty string is used to revert display=none. Show the label once we know the content
            this._dashline.style.display = ''; //in css an empty string is used to revert display=none. Show the label once we know the content
        }else{
            this._label.innerHTML = this._labeltext;
            this._label.style.display = 'none'; //hide the label
            this._dashline.style.display = 'none'; //hide the label
        }
    }
  }

  changelabeltext() { //this function is called when the user does double click in the label
    this._labeltext = prompt("Please enter new name of the label", this._label.innerHTML);
    if (typeof this._labeltext == 'string'){ //avoid error
        if (this._labeltext.length > 0){ 
            this._label.innerHTML = this._labeltext;
            this._label.style.display = ''; //in css an empty string is used to revert display=none. Show the label
            this._dashline.style.display = ''; //in css an empty string is used to revert display=none. Show the label
        }else{ // if the length is 0 the user pressed Cancel
            this._label.innerHTML = this._labeltext;
            this._label.style.display = 'none'; //hide the label
            this._dashline.style.display = 'none'; //hide the label
        }
    }
  }

  onEnd(evt) {
    // First Handle
    this._handles[0].onEnd(evt);

    // Second Handle
    if(this._dragged || !this._handles[1].tracking) {
      this._handles[1].tracking = false;
      this._handles[1].onEnd(evt);
    }else{
      this._handles[1].tracking = false;
    }

    if (self._alreadycreated != true){
      this.setlabeltext();
      self._alreadycreated = true;
    }

    // State of annotation widget
    this._active = this._handles[0].active || this._handles[1].active;
    this.update();

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
    this.updateDOMPosition();
    this.updateDOMColor();
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

    //create cone and add it
    this._conegeometry = new THREE.CylinderGeometry( 0, 2, 10 );
    this._conegeometry.translate( 0, -5, 0 );
    this._conegeometry.rotateX( - Math.PI / 2 );
    this._cone = new THREE.Mesh( this._conegeometry, this._material );
    this._cone.visible = true;
    this.add(this._cone);

  }

  updateMeshColor() {
    if(this._material) {
      this._material.color.set(this._color);
    }
  }

  updateMeshPosition() {
    if(this._geometry) {
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
    this._line.style.height = '2px';//2
    this._line.style.width = '3px';//3
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

    console.log('function updateDOMPosition');
    // update annotation lines and text!
    let x1 = this._handles[0].screenPosition.x;
    let y1 = this._handles[0].screenPosition.y;
    let x2 = this._handles[1].screenPosition.x;
    let y2 = this._handles[1].screenPosition.y;

    let x0 = x1 + (x2 - x1)/2;
    let y0 = y1 + (y2 - y1)/2;

    let length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; //result in deg

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    this._line.style.transform = transform;
    this._line.style.width = length + 'px';


    // update label position
    var mousex = 0;
    var mousey = 0;

    let posY0;

    posY0 = y0 - this._container.offsetHeight - this._label.offsetHeight/2;
    x0 -= this._label.offsetWidth/2;

    var x;
    var y;

    if (this._labelmoved == false){ //if the user hasnt moved the label, the position is defined by the position of the arrow
        let transform2 = `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
        this._label.style.transform = transform2;
        this._labelpositionx = Math.round(x0);
        this._labelpositiony = Math.round(posY0);
    }


    if (this._movinglabel) { //if the user has moved the label, the position is defined by the mouse
        mousex = event.clientX;
        mousey =  -(-event.clientY + this._container.offsetHeight);
        this._label.style.transform = `translate3D(${mousex - this._differencemousecenterlabelx}px,${mousey - this._differencemousecenterlabely}px, 0)`; 
        //we use differencemousecenterlabel to check the difference between the position of the mouse in the label and the reference position of the label (top-left corner)
        this._labelpositionx = mousex - this._differencemousecenterlabelx;
        this._labelpositiony = mousey - this._differencemousecenterlabely;
    }

    //update cone
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    //position and rotation of cone
    this._cone.position.set(w1.x,w1.y,w1.z);
    this._cone.lookAt(w0);

    // update dash line

    //calculate the place in the label: center of the label
    x1 = this._handles[0].screenPosition.x;
    y1 = this._handles[0].screenPosition.y;
    x2 = this._labelpositionx;
    y2 = this._labelpositiony + this._container.offsetHeight; //revert the operation in 'mousey' to get the previous eventY

    //get the size of the label so we can place the dashed line in the center of it
    var labelheight = this._label.offsetHeight;
    var labelwidth = this._label.offsetWidth;

    var centerlabelx = 0;
    var centerlabely = 0;

    if (isFinite(labelwidth) && isFinite(labelheight)){ //if the extraction has been succesfull, we calculate the center of the label with total size
        centerlabelx = labelwidth/2;
        centerlabely = labelheight/2;
    }

    x2 += centerlabelx;
    y2 += centerlabely;

    //calculate the place in the arrow: closest part of the line to place the dashed line
    var x1_tail = this._handles[0].screenPosition.x; //first position: tail of arrow
    var y1_tail = this._handles[0].screenPosition.y;
    var x1_body = (this._handles[0].screenPosition.x + this._handles[1].screenPosition.x)/2; //second position: center of arrow
    var y1_body = (this._handles[0].screenPosition.y + this._handles[1].screenPosition.y)/2;
    var x1_nose = this._handles[1].screenPosition.x; //third position: peak of arrow
    var y1_nose = this._handles[1].screenPosition.y;

    //calculate all the lengths to the label, so we can choose the min
    var lengthtaillabel = Math.sqrt((x1_tail-x2)*(x1_tail-x2) + (y1_tail-y2)*(y1_tail-y2));
    var lengthbodylabel = Math.sqrt((x1_body-x2)*(x1_body-x2) + (y1_body-y2)*(y1_body-y2));
    var lengthnoselabel = Math.sqrt((x1_nose-x2)*(x1_nose-x2) + (y1_nose-y2)*(y1_nose-y2));

    var lengths = [lengthtaillabel, lengthbodylabel, lengthnoselabel];
    var minlength = Math.min(lengthtaillabel, lengthbodylabel, lengthnoselabel);
    var minlengthindex = lengths.indexOf(minlength);

    if (minlengthindex == 0){
        x1 = x1_tail;
        y1 = y1_tail;
    }
    if (minlengthindex == 1){
        x1 = x1_body;
        y1 = y1_body;
    }
    if (minlengthindex == 2){
        x1 = x1_nose;
        y1 = y1_nose;
    }

    // Once we found the closest point to the label, we create the dashed line from that point
    let lengthdashline = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    let angledashline = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; //result in deg

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
  }

  showDOM() {
    this._line.style.display = '';
    this._dashline.style.display = '';
    this._label.style.display = '';
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
