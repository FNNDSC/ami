import WidgetsHandle from '../../src/widgets/widgets.handle';

/**
 * @module widgets/handle
 * 
 */

export default class WidgetsRuler extends THREE.Object3D{
  constructor(targetMesh, controls, camera, container, connectAllEvents = true) {
    super();

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = camera;
    this._container = container;
    this._connectAllEvents = connectAllEvents;

    this._hovered = false;

    this._worldPosition = new THREE.Vector3();
    if(this._targetMesh !== null){
      this._worldPosition = this._targetMesh.position;
    }

    // DOM STUFF...
    // NEED 3D too...
    this._line = null;
    this._distance = null;

    // add handles
    this._handles = [];

    // first handle
    this._firstHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container, connectAllEvents);
    this._firstHandle.worldPosition = this._worldPosition;
    this._firstHandle.hovered = true;
    this.add(this._firstHandle);
 
    this._handles.push(this._firstHandle);

    this._secondHandle = new WidgetsHandle(this._targetMesh, this._controls, this._camera, this._container, connectAllEvents);
    this._secondHandle.worldPosition = this._worldPosition;
    this._secondHandle.hovered = true;
    this._secondHandle.active = true;
    this.add(this._secondHandle);
        
    this._handles.push(this._secondHandle);

    // DOM STUFF

    // add line!
    this._line = document.createElement('div');
    this._line.setAttribute('class', 'widgets handle line');
    this._line.style.backgroundColor = '#353535';
    this._line.style.position = 'absolute';
    this._line.style.transformOrigin = '0 100%';
    this._line.style.marginTop = '-1px';
    this._line.style.height = '2px';
    this._line.style.width = '3px';
    container.appendChild(this._line);

    // add distance!
    this._distance = document.createElement('div');
    this._distance.setAttribute('class', 'widgets handle distance');
    this._distance.style.border = '2px solid #353535';
    this._distance.style.backgroundColor = '#F9F9F9';
    this._distance.style.color = '#353535';
    this._distance.style.padding = '4px';
    this._distance.style.position = 'absolute';
    this._distance.style.transformOrigin = '0 100%';
    this._distance.innerHTML = 'Hello, world!';
    this._container.appendChild(this._distance);
  }

  onMove(evt){
    //?
    if(this._firstHandle.hovered){
      this._firstHandle.onMove(evt);
    }

    if(this._secondHandle.hovered){
      this._secondHandle.onMove(evt);
    }

    this._hovered = this._firstHandle.hovered || this._secondHandle.hovered;
    this.update();
  }

  onStart(evt){
    this._firstHandle.onStart(evt);
    this._secondHandle.onStart(evt);
  }

  update(){
    //update rulers lines and text!
    var x1 = this._firstHandle.screenPosition.x;
    var y1 = this._firstHandle.screenPosition.y; 
    var x2 = this._secondHandle.screenPosition.x;
    var y2 = this._secondHandle.screenPosition.y;

    var x0 = x1 + (x2 - x1)/2;
    var y0 = y1 + (y2 - y1)/2;

    var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    let posY = y1 - this._container.offsetHeight;

    // update line
    let transform = `translate3D(${x1}px,${posY}px, 0)`;
    transform += ` rotate(${angle}deg)`;

    this._line.style.transform = transform;
    this._line.style.width = length;

    // update distance
    let w0 = this._handles[0].worldPosition;
    let w1 = this._handles[1].worldPosition;

    this._distance.innerHTML = `${Math.sqrt((w0.x-w1.x)*(w0.x-w1.x) + (w0.y-w1.y)*(w0.y-w1.y) + (w0.z-w1.z)*(w0.z-w1.z)).toFixed(2)} mm`;
    let posY0 = y0 - this._container.offsetHeight - this._distance.offsetHeight/2;
    x0 -= this._distance.offsetWidth/2;

    var transform2 = `translate3D(${Math.round(x0)}px,${Math.round(posY0)}px, 0)`;
    this._distance.style.transform = transform2;
  }

  get hovered(){
        window.console.log('get hovered from ruler');

    return this._hovered;
  }

  set hovered(hovered){
    this._hovered = hovered;
  }

  get worldPosition(){
    return this._worldPosition;
  }

  set worldPosition(worldPosition){
    this._worldPosition = worldPosition;
    this._firstHandle.worldPosition = this._worldPosition;
    this._secondHandle.worldPosition = this._worldPosition;

    this.update();
  }

}
