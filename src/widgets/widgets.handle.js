/**
 * @module widgets/handle
 * 
 */

export default class WidgetsHandle extends THREE.Object3D{
  constructor(targetMesh, controls, camera, container, worldPosition, active) {
    super();

    this._enabled = true;

    // array of meshes
    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;
    this._raycaster = new THREE.Raycaster();
    this._handle = null;

    this._firstRun = false;

    this._mouse = {
      x: 0,
      y: 0,
      screenX: 0,
      screenY: 0
    };

    // world (LPS) position
    this._worldPosition = {
      x: 0,
      y: 0,
      z: 0
    };

    // screen position
    this._screenPosition = {
      x: 0,
      y: 0
    };

    this._selected = false;
    this._hovered = false;
    this._dragged = false;
    this._hoverDistance = 100; // px
    this._hoverThreshold = 10; // px

    this._defaultColor = '0x00B0FF';
    this._activeColor = '0xFFEB3B';
    this._hoverColor = '0xF50057';
    this._selectedColor = '0x76FF03';

    this._visible = true;
    this._color = this._defaultColor;
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    this._dom = null;

    this._showVoxel = true;
    this._showDomSVG = true;
    this._showDomMeasurements = true;
    // dom circle and dom cross

    //
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);

    if(worldPosition){

        this._firstRun = true;

        this._worldPosition = worldPosition;
        this._screenPosition = this.worldToScreen(this._worldPosition, this._camera, this._container);
        this.createMesh();
        this.createDOM();

        this._active = true;
        this._controls.enabled = false;

        this.added = function(){};
    }

    // event listeners
    this.addEventListeners();
  }

  addEventListeners(){
    this._container.addEventListener('mousedown', this.onStart);
    this._container.addEventListener('mousemove', this.onMove);
    this._container.addEventListener('mouseup', this.onEnd);

    this._container.addEventListener('touchstart', this.onStart);
    this._container.addEventListener('touchmove', this.onMove);
    this._container.addEventListener('touchend', this.onEnd);

    this._container.addEventListener('mousewheel', this.onMove);
    this._container.addEventListener('DOMMouseScroll', this.onMove);
  }

  onStart(evt){
    //
    this._dragged = false;
    this._firstRun = false;

    // update raycaster
    this.updateRaycaster(this._raycaster, evt, this._container);
    let intersects = this._raycaster.intersectObject(this._targetMesh);

    // if intersects itself or 10px close
    // select + exit
    if(intersects){
      // if no mesh currently, create one!
      if(this._mesh === null){
        this._worldPosition = intersects[0].point;
        this._screenPosition = this.worldToScreen(this._worldPosition, this._camera, this._container);
        this.createMesh();
        this.createDOM();

        this.added();
        return;
      }
    }

    // if intersects one of the target mesh (from scene??)
    // if no handle, create it + exit
    let intersectsHandle = this._raycaster.intersectObject(this._mesh);
    if(intersectsHandle.length > 0 || this._hovered){
        this._active = true;
        this._controls.enabled = false;

        this.update();
        return;
    }


    evt.preventDefault();
  }

  onEnd(evt){

    // unselect if go up without moving
    if(!this._dragged && this._active){
      this._selected = !this._selected;
    }

    // stay active...
    if(this._firstRun === true){
      return;
    }

    this._active = false;
    this._controls.enabled = true;

    this.update();

    evt.preventDefault();
  }

  onMove(evt){
    // if nothing exists, exit
    if(this._mesh === null){
      return;
    }

    this._dragged = true;

    // update screen position of handle
    this._screenPosition = this.worldToScreen(this._worldPosition, this._camera, this._container);

    // update raycaster
    this.updateRaycaster(this._raycaster, evt, this._container);
    let intersectsTarget = this._raycaster.intersectObject(this._targetMesh);
    if(intersectsTarget.length > 0){
      if(this._active){
        // update position
        this._worldPosition = intersectsTarget[0].point;
        this.update();
        return;
      }

      // else hover stuff
      let worldPosition = intersectsTarget[0].point;
      let screenPosition = this.worldToScreen(worldPosition, this._camera, this._container);

      this.hoverVoxel(screenPosition);

    }

    this.update();

    evt.preventDefault();
  }

  update(){
    // mesh stuff
    this.updateMeshColor();
    this.updateMeshPosition();

    // DOM stuff
    this.updateDOMPosition();
  }

  //
  updateMeshColor(){
    if(this._active){
      this._color = this._activeColor;
    }
    else if(this._hovered){
      this._color = this._hoverColor;
    }
    else if(this._selected){
      this._color = this._selectedColor;
   }
   else{
      this._color = this._defaultColor;
   }

    if(this._material){
      this._material.color.setHex(this._color);
    }
  }

  updateMeshPosition(){
    if(this._mesh){
      this._mesh.position.x = this._worldPosition.x;
      this._mesh.position.y = this._worldPosition.y;
      this._mesh.position.z = this._worldPosition.z;
    }
  }

  hoverVoxel(screenPosition) {

    // check raycast intersection
    let intersectsHandle = this._raycaster.intersectObject(this._mesh);
    if(intersectsHandle.length > 0){
        this._dom.style.cursor='pointer';
        this._hovered = true;
        return;
    }

    // screen intersection
    let dx = screenPosition.x - this._screenPosition.x;
    let dy = screenPosition.y - this._screenPosition.y;
    let distance =  Math.sqrt(dx * dx + dy * dy);
    this._hoverDistance = distance;
    if (distance >= 0 && distance < this._hoverThreshold) {
      this._dom.style.cursor='pointer';
      this._hovered = true;
    } else {
      this._dom.style.cursor='default';
      this._hovered = false;
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

  worldToScreen(worldCoordinate, camera, canvas) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(camera);

    screenCoordinates.x = Math.round((screenCoordinates.x + 1) * canvas.offsetWidth / 2);
    screenCoordinates.y = Math.round((-screenCoordinates.y + 1) * canvas.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
  }

  createMesh() {
    // geometry
    this._geometry = new THREE.SphereGeometry( 2, 32, 32 );

    // material
    this._material = new THREE.MeshBasicMaterial({
        wireframe: true,
        wireframeLinewidth: 2
      });
    this._material.color.setHex(this._color);

    // mesh
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.position.x = this._worldPosition.x;
    this._mesh.position.y = this._worldPosition.y;
    this._mesh.position.z = this._worldPosition.z;
    this._mesh.visible = true;

    // add it!
    this.add(this._mesh);
  }


  createDOM() {

    // dom
    this._dom = document.createElement('div');
    this._dom.setAttribute('id', this.uuid);
    this._dom.setAttribute('class', 'widgets handle');
    this._dom.style.border = '2px solid #353535';
    this._dom.style.backgroundColor = '#F9F9F9';
    // this._dom.style.backgroundColor = 'rgba(230, 230, 230, 0.7)';
    this._dom.style.color = '#F9F9F9';
    this._dom.style.position = 'absolute';
    this._dom.style.width = '12px';
    this._dom.style.height = '12px';
    this._dom.style.margin = '-6px';
    this._dom.style.borderRadius =  '50%';
    this._dom.style.transformOrigin = '0 100%';

    let posY = this._screenPosition.y - this._container.offsetHeight;
    this._dom.style.transform = `translate3D(${this._screenPosition.x}px, ${posY}px, 0)`;

    // add it!
    this._container.appendChild(this._dom);
  }

  updateDOMPosition(){
    if(this._dom){

      let posY = this._screenPosition.y - this._container.offsetHeight;
      this._dom.style.transform = `translate3D(${this._screenPosition.x}px, ${posY}px, 0)`;
    }
  }

  updateDOMColor(){

  }
}
