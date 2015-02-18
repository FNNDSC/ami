'use strict';

var VJS = VJS || {};
VJS.Slice = VJS.Slice || {};

VJS.Slice.Core = function(origin, normal, volumeCore){
  this._Origin = origin;
  this._Normal = normal;
  this._VolumeCore = volumeCore;
  this._Width = -1;
  this._Height = -1;
  this._Transforms = {};

  this._IntersectionRASBBoxPlane = null;
};

VJS.Slice.Core.prototype.Slice = function(){
  // update all information according to Normal and Origin!

  // normalize slice direction
  this._Normal.normalize();

  // get intersection between RAS BBox and the slice plane
  this._IntersectionRASBBoxPlane = this.IntersectionRASBBoxPlane();

  // WE SHOULD JUST GENERATE GEOMETRY FROM THOSE POINTS, CONVEX POLYGON
  // NEXT STEP SO WE CAN SKIP THE FOLLOWING AND MA CODE MUCH CLEANER

  // transsform to 2D - shouldn't be needed...
  this.TransformXYRAS();

  // compute width and height as well...
  this.WidthHeight();

};

VJS.Slice.Core.prototype.WidthHeight = function(){

  var _xyBBox = [Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE,
   Number.MAX_VALUE, -Number.MAX_VALUE];

  // move all points to 2D, and compute BBox
  for(var i = 0; i<this._IntersectionRASBBoxPlane[0].length; i++){
    // clone and move to 2D space
    var tmp = this._IntersectionRASBBoxPlane[0][i].clone();
    tmp.applyMatrix4(this._Transforms.ras2xy);

    // update Bounding Box
    if(tmp.x < _xyBBox[0]) {
      _xyBBox[0] = tmp.x;
    }

    if(tmp.x > _xyBBox[1]) {
      _xyBBox[1] = tmp.x;
    }

    if(tmp.y < _xyBBox[2]) {
      _xyBBox[2] = tmp.y;
    }

    if(tmp.y > _xyBBox[3]) {
      _xyBBox[3] = tmp.y;
    }

    if(tmp.z < _xyBBox[4]) {
      _xyBBox[4] = tmp.z;
    }

    if(tmp.z > _xyBBox[5]) {
      _xyBBox[5] = tmp.z;
    }
  }

  //
  var _wmin =  Math.floor(_xyBBox[0]);
  var _wmax =  Math.ceil(_xyBBox[1]);
  if(_wmin === _wmax){
    _wmax++;
  }

  this._Width = _wmax - _wmin;

  var _hmin = Math.floor(_xyBBox[2]);
  var _hmax = Math.ceil(_xyBBox[3]);
  if(_hmin === _hmax){

    _hmax++;

  }

  this._Height = _hmax - _hmin;
};

VJS.Slice.Core.prototype.TransformXYRAS = function(){
  var xyNormal = new THREE.Vector3(0, 0, 1);

  this._Transforms.xy2ras = new THREE.Matrix4();
    // no rotation needed if we are in the z plane already
  if(! xyNormal.equals(this._Normal) ) {

    var _cp = this._Normal.z;
    var _teta = Math.acos(_cp);
    var _r = new THREE.Vector3();
    _r.crossVectors( this._Normal, xyNormal );
    _r.normalize();

    var a = Math.cos(_teta/2);
    var b = Math.sin(_teta/2)*_r.x;
    var c = Math.sin(_teta/2)*_r.y;
    var d = Math.sin(_teta/2)*_r.z;

    this._Transforms.xy2ras.set(
      (a*a+b*b-c*c-d*d), 2*(b*c+a*d)      , 2*(b*d-a*c)      , 0,
      2*(b*c-a*d)      , (a*a+c*c-b*b-d*d), 2*(c*d+a*b)      , 0,
      2*(b*d+a*c)      , 2*(c*d-a*b)      , (a*a+d*d-c*c-b*b), 0,
      0                , 0                , 0                , 1);
    }

    // create inverse transform as well
    this._Transforms.ras2xy = new THREE.Matrix4().getInverse ( this._Transforms.xy2ras );
};

// we should directly detect the intersectionm with the ORIENTED Bounding Box for performance reasons...
VJS.Slice.Core.prototype.IntersectionRASBBoxPlane = function(){
  var _solutionsIn = [];
  var _solutionsOut = [];

  //
  // DO NOT DO IT IN A LOOP (AT LEAST YET) TO MAKE IT MORE READABLE
  //
  //     +------+    
  //    /|     /|     
  //   +-+----+ |   
  //   | |    | |    
  //   | +----+-+    
  //   |/     |/     
  //   +------+     
  //
  // test each line which defines the RASBBox
  // compute intersection of each line with the plane, then test location of intersection
  // find Z which would interset
  // intersection when scalar product = 0
  // IF INTERSECTS ON LINE WHERE X= and Y=, WHAT IS Z?
  // IS Z IN?

  //
  // LOOKING FOR Z
  //

  // line 1
  // x= bbox.x min, y=bbox.y min
  var _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }

  // line 2
  // x= bbox.x max, y=bbox.y min
  _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }

  // line 3
  // x= bbox.x min, y=bbox.y max
  _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }

  // line 4
  // x= bbox.x max, y=bbox.y max
  _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }

  //
  // LOOKING FOR Y
  //

  // line 5
  // x= bbox.x min, z=bbox.z min
  var _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 6
  // x= bbox.x max, z=bbox.z min
  _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 7
  // x= bbox.x min, z=bbox.z max
  _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }

  // line 8
  // x= bbox.x max, z=bbox.z max
  _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }

  //
  // LOOKING FOR X
  //

  // line 9
  // y= bbox.y min, z=bbox.z min
  var _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 10
  // y= bbox.y max, z=bbox.z min
  _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 11
  // y= bbox.y min, z=bbox.z max
  _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[1].z));
  }

  // line 8
  // y= bbox.y max, z=bbox.z max
  _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[1].z));
  }

  return [_solutionsIn, _solutionsOut];
};