var VJS = VJS || {};
VJS.Slice = VJS.Slice || {};

VJS.Slice.Core = function(origin, normal, volumeCore, width, height, center, transforms){
  this._Origin = origin;
  this._Normal = normal;
  this._VolumeCore = volumeCore;
  this._Width = width;
  this._Height = height;
  this._Center = center;
  this._Transforms = transforms;

  this._IntersectionRASBBoxPlane = null;
}

VJS.Slice.Core.prototype.Slice = function(){
  // update all information according to Normal and Origin!

  // normalize slice direction
  this._Normal.normalize();

  // get intersection between RAS BBox and the slice plane
  this._IntersectionRASBBoxPlane = this.IntersectionRASBBoxPlane();

  // ideally, we can create a geometry ftom those points
  // CONVEX POLYGON! Should just work!!! :)
  // http://stackoverflow.com/questions/15289418/are-there-any-native-methods-to-triangulate-ordered-list-of-points-exposed-in-th
  // use TRIANGLE FAN

}

VJS.Slice.Core.prototype.IntersectionRASBBoxPlane = function(){
  var _solutionsIn = new Array();
  var _solutionsOut = new Array();

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
  var _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, this._VolumeCore._RAS.boundingbox[0].y, _solutionZ));
  }

  // line 3
  // x= bbox.x min, y=bbox.y max
  var _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
  if(_solutionZ >= this._VolumeCore._RAS.boundingbox[0].z && _solutionZ <= this._VolumeCore._RAS.boundingbox[1].z){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, this._VolumeCore._RAS.boundingbox[1].y, _solutionZ));
  }

  // line 4
  // x= bbox.x max, y=bbox.y max
  var _solutionZ = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.y*( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) )/this._Normal.z + this._Origin.z;
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
  var _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[1].x, _solutionY, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 7
  // x= bbox.x min, z=bbox.z max
  var _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[0].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
  if(_solutionY >= this._VolumeCore._RAS.boundingbox[0].y && _solutionY <= this._VolumeCore._RAS.boundingbox[1].y){
    _solutionsIn.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(this._VolumeCore._RAS.boundingbox[0].x, _solutionY, this._VolumeCore._RAS.boundingbox[1].z));
  }

  // line 8
  // x= bbox.x max, z=bbox.z max
  var _solutionY = -( this._Normal.x * ( this._VolumeCore._RAS.boundingbox[1].x - this._Origin.x ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.y + this._Origin.y;
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
  var _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[0].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[0].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[0].z));
  }

  // line 11
  // y= bbox.y min, z=bbox.z max
  var _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[0].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[0].y, this._VolumeCore._RAS.boundingbox[1].z));
  }

  // line 8
  // y= bbox.y max, z=bbox.z max
  var _solutionX = -( this._Normal.y * ( this._VolumeCore._RAS.boundingbox[1].y - this._Origin.y ) + this._Normal.z*( this._VolumeCore._RAS.boundingbox[1].z - this._Origin.z ) )/this._Normal.x + this._Origin.x;
  if(_solutionX >= this._VolumeCore._RAS.boundingbox[0].x && _solutionX <= this._VolumeCore._RAS.boundingbox[1].x){
    _solutionsIn.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[1].z));
  }
  else{
    _solutionsOut.push(new THREE.Vector3(_solutionX, this._VolumeCore._RAS.boundingbox[1].y, this._VolumeCore._RAS.boundingbox[1].z));
  }

  return [_solutionsIn, _solutionsOut];
}