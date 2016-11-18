import Intersections from '../core/core.intersections';
import Validators    from '../core/core.validators';

/** 
 * Orthographic camera from THREE.JS with some extra convenience
 * functionalities.
 *
 * @example
 * //
 * //
 *
 * @module cameras/orthographic
 */
export default class CamerasOrthographic extends THREE.OrthographicCamera{
  constructor(left, right, top, bottom, near, far) {
    super(left, right, top, bottom, near, far);

    this._front = null;
    this._back = null;

    this._xCosine = null;
    this._yCosine = null;
    this._zCosine = null;

    this._controls = null;
    this._box = null;
    this._canvas = {
      width: null,
      height: null
    }

    this._fromFront = true;
    this._angle = 0;
  }

  /**
   * Initialize orthographic camera variables
   */
  init(xCosine, yCosine, zCosine, controls, box, canvas){
    //
    if(!(Validators.vector3(xCosine) &&
      Validators.vector3(yCosine) &&
      Validators.vector3(zCosine) &&
      Validators.box(box) &&
      controls)){
      window.console.log('Invalid input provided.');

      return false;
    }

    this._xCosine = this._positiveVector( xCosine );
    this._yCosine = this._positiveVector( yCosine );
    this._zCosine = new THREE.Vector3().cross( this._xCosine, this._yCosine );

    console.log( this._xCosine );
    console.log( this._yCosine );
    console.log( this._zCosine );

    this._controls = controls;
    this._box = box;
    this._canvas = canvas;

    let ray = {
      position: this._box.center,
      direction: this._zCosine
    }

    let intersections = Intersections.rayBox(ray, this._box);
    this._front = intersections[0];
    this._back = intersections[1];

    // set default values
    this.up.set(this._yCosine.x, this._yCosine.y, this._yCosine.z);
    this._updateCanvas();
    this._updatePositionAndTarget(this._front, this._back);
    this._updateMatrices();
  }

  /**
   * Invert rows in the current slice.
   * Inverting rows in 2 steps:
   *   * Flip the "up" vector
   *   * Look at the slice from the other side 
   */
  invertRows() {
    // flip "up" vector
    // we flip up first because invertColumns update projectio matrices
    this.up.multiplyScalar(-1);
    // this._angle -= 180;

    // Rotate the up vector around the "zCosine"
    // let rotation = new THREE.Matrix4().makeRotationAxis(
    //   this._zCosine, 
    //   Math.PI);
    // this.up.applyMatrix4(rotation);

    // this._updateMatrices();

    
    this.invertColumns();
  }

  /**
   * Invert rows in the current slice.
   * Inverting rows in 1 step:
   *   * Look at the slice from the other side 
   */
  invertColumns( ) {

    this.center();
    // rotate 180 degrees around the up vector...
    let oppositePosition = this._oppositePosition(this.position);

    // update posistion and target
    // clone is needed because this.position is overwritten in method
    this._updatePositionAndTarget(oppositePosition, this.position.clone());
    this._updateMatrices();
    this._fromFront = !this._fromFront;

    let clockwise = 1;
    if( !this._fromFront ){

      clockwise = -1;
      
    }

    this._angle %= 360;
    this._angle = 360 - this._angle;

  }

  /**
   * Center slice in the camera FOV.
   * It also updates the controllers properly.
   * We can center a camera from the front or from the back.
   */
  center(){
    if (this._fromFront) {
      this._updatePositionAndTarget(this._front, this._back);
    } else {
      this._updatePositionAndTarget(this._back, this._front);
    }

    this._updateMatrices();
  }

  /**
   * Pi/2 rotation around the zCosine axis.
   * Clock-wise rotation from the user point of view.
   */
  rotate( angle=null ) {

    this.center();

    var computedAngle = 90;

    let clockwise = 1;
    if( !this._fromFront ){

      clockwise = -1;
      
    }

    if( angle === null ){

      computedAngle *= -clockwise;
      this._angle += 90;

    }
    else{
      
      computedAngle = 360 - clockwise * (angle - this._angle);
      this._angle = angle;

    }

    this._angle %= 360;

    // Rotate the up vector around the "zCosine"
    let rotation = new THREE.Matrix4().makeRotationAxis(
      this._zCosine, 
      computedAngle * Math.PI/180);
    this.up.applyMatrix4(rotation);

    this._updateMatrices();
  }

  // dimensions[0] // width
  // dimensions[1] // height
  // direction= 0 width, 1 height, 2 best
  // factor
  fitBox(direction = 0, factor=1.5) {
    //
    // if (!(dimensions && dimensions.length >= 2)) {
    //   window.console.log('Invalid dimensions container.');
    //   window.console.log(dimensions);

    //   return false;
    // }

    //
    let zoom = 1;

    // update zoom
    switch (direction){
      case 0:
        zoom = factor * this._computeZoom(this._canvas.width, this._xCosine);
        break;
      case 1:
        zoom = factor * this._computeZoom(this._canvas.height, this._yCosine);
        break;
      case 2:
        zoom = factor * (Math.min(
          this._computeZoom(this._canvas.width, this._xCosine),
          this._computeZoom(this._canvas.height, this._yCosine)
        ));
        break;
      default:
        break;
    }

    if(!zoom){
      return false
    }

    this.zoom = zoom;

    this.center();
  }

  _positiveVector( vector ){

    let rounded = new THREE.Vector3( vector.x, vector.y, vector.z ).round();
    let max = Math.max( Math.max(rounded.x, rounded.y), rounded.z);

    if( max === 0 ){

      return vector.negate();

    }
    else{

      return vector;
      
    }

  }

  _updateCanvas(){
    var camFactor = 2;
    this.left = -this._canvas.width / camFactor;
    this.right = this._canvas.width / camFactor;
    this.top = this._canvas.height / camFactor;
    this.bottom = -this._canvas.height / camFactor;

    this._updateMatrices();
    this.controls.handleResize();
  }

  _oppositePosition(position){
    let oppositePosition = position.clone();
    // center world postion around box center
    oppositePosition.sub(this._box.center);
    // rotate
    let rotation = new THREE.Matrix4().makeRotationAxis(
      this.up, 
      Math.PI);

    oppositePosition.applyMatrix4(rotation);
    // translate back to world position
    oppositePosition.add(this._box.center);
    return oppositePosition;
  }

  _computeZoom(dimension, direction) {

    if(!(dimension && dimension > 0)){
      window.console.log('Invalid dimension provided.');
      window.console.log(dimension);
      return false;
    }

    // ray
    let ray = {
      position: this._box.center.clone(),
      direction: direction
    };

    let intersections = Intersections.rayBox(ray, this._box);
    if (intersections.length < 2) {
      window.console.log('Can not adjust the camera ( < 2 intersections).');
      window.console.log(ray);
      window.console.log(this._box);
      return false;
    }

    return dimension / intersections[0].distanceTo(intersections[1]);
  }

  _updatePositionAndTarget(position, target){
      // position
      this.position.set(position.x, position.y, position.z);

      // targets
      this.lookAt(target.x, target.y, target.z);
      this._controls.target.set(target.x, target.y, target.z);
  }

  _updateMatrices() {
    this._controls.update();
    // THEN camera
    this.updateProjectionMatrix();
    this.updateMatrixWorld();
  }

  set xCosine(xCosine) {
    this._xCosine = xCosine;
  }

  get xCosine() {
    return this._xCosine;
  }

  set yCosine(yCosine) {
    this._yCosine = yCosine;
  }

  get yCosine() {
    return this._yCosine;
  }

  set zCosine(zCosine) {
    this._zCosine = zCosine;
  }

  get zCosine() {
    return this._zCosine;
  }

  set controls(controls) {
    this._controls = controls;
  }

  get controls() {
    return this._controls;
  }

  set box(box) {
    this._box = box;
  }

  get box() {
    return this._box;
  }

  set canvas(canvas){
    this._canvas = canvas;
    this._updateCanvas();
  }

  get canvas(){
    return this._canvas;
  }

  set angle(angle){
    this.rotate(angle);
  }

  get angle(){
    return this._angle;
  }

}
