'use strict';

var VJS = VJS || {};

VJS.EllipsePicker = function(){
  this.init();
};

VJS.EllipsePicker.prototype.init = function(){
   this.widget = new THREE.Object3D();
   this.widget.name = 'EllipsePicker';

  // handles
  var sphereGeometry = new THREE.SphereGeometry(1);
  var material1 = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
  var handle1 = new THREE.Mesh( sphereGeometry, material1 );
  handle1.name = 'EllipsePickerHandle';
  this.widget.add(handle1); 

  var material2 = new THREE.MeshBasicMaterial( {color: 0x96F321} );
  var handle2 = new THREE.Mesh( sphereGeometry, material2 );
  handle2.name = 'EllipsePickerHandle';
  this.widget.add(handle2);

  // sphere.applyMatrix( new THREE.Matrix4().makeTranslation(ras.x, ras.y, ras.z) );
  //           scene.add( sphere );

  // handle 2
};

VJS.EllipsePicker.prototype.update = function(handle1, handle2){
  this.widget.children[0].applyMatrix( new THREE.Matrix4().makeTranslation(handle1.x, handle1.y, handle1.z) );
  this.widget.children[1].applyMatrix( new THREE.Matrix4().makeTranslation(handle2.x, handle2.y, handle2.z) );
};