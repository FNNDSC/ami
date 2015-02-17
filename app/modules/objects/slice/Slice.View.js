var VJS = VJS || {};
VJS.Slice = VJS.Slice || {};

VJS.Slice.View = function(sliceCore){
  this._SliceCore = sliceCore;
}

VJS.Slice.View.prototype.RASSlice = function(tSize, tNumber){
  //
  // create material from target Volume
  // setup uniforms
  var shaderSlice = VJS.Slice.Shader;
  var uniforms = shaderSlice.slice.uniforms;
  uniforms.uTextureSize.value = tSize;
  var textures = this._SliceCore._VolumeCore._Textures;
  uniforms.t00.value = textures[0];
  uniforms.t01.value = textures[1];
  uniforms.t02.value = textures[2];
  uniforms.t03.value = textures[3];
  uniforms.uIJKDims.value = this._SliceCore._VolumeCore._IJK.dimensions;
  uniforms.uRASToIJK.value = this._SliceCore._VolumeCore._Transforms.ras2ijk;

  var mat = new THREE.ShaderMaterial({
          "side": THREE.DoubleSide,
          "transparency":true,
          "uniforms": uniforms,
          "vertexShader": shaderSlice.slice.vertexShader,
          "fragmentShader": shaderSlice.slice.fragmentShader,
  });

  // create geometry
  var geometry = new THREE.PlaneGeometry( this._SliceCore._Width , this._SliceCore._Height );
  geometry.verticesNeedUpdate = true;

  var plane = new THREE.Mesh( geometry, mat );
  // move to RAS Space
  plane.applyMatrix( this._SliceCore._Transforms.xy2ras );
  plane.applyMatrix( new THREE.Matrix4().makeTranslation(this._SliceCore._Center.x, this._SliceCore._Center.y, this._SliceCore._Center.z));

  return plane;
}

VJS.Slice.View.prototype.updateRASSlice = function(slice, width, height, center, transforms){
  // Should get all information from there or from the Core...!
  // update slice geometry
  var geometry = new THREE.PlaneGeometry( width, height );
  geometry.verticesNeedUpdate = true;
  slice.geometry = geometry;

  // update transform matrix
  slice.matrix = transforms.xy2ras;
  slice.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z));
}

VJS.Slice.View.prototype.SliceRASBBoxIntersection = function(material){
  var spheres = [];
  var solutions = this._SliceCore._IntersectionRASBBoxPlane[0];
  for(var i=0; i<solutions.length; i++){
    var sphereGeometry = new THREE.SphereGeometry(1);
    var sphere = new THREE.Mesh( sphereGeometry, material );
    sphere.applyMatrix( new THREE.Matrix4().makeTranslation(solutions[i].x, solutions[i].y, solutions[i].z) );
    spheres.push( sphere );
  }

  return spheres;
}