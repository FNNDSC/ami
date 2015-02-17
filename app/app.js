// XTK includes for now...
goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.parserNII');

// standard global variables
var scene, camera, renderer;

// FUNCTIONS
function init(slice) {
  function onDocumentMouseMove( event ) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = ( event.clientX / threeD.offsetWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / threeD.offsetHeight ) * 2 + 1;

  // if ( SELECTED ) {

  //         var intersects = raycaster.intersectObject( plane );
  //         SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
  //         return;

  //       }

  if(typeof SELECTED === 'undefined' || !SELECTED){
    return;
  }

        var intersects = raycaster.intersectObjects( scene.children );

        for ( var intersect in intersects ) {
          var ras = new THREE.Vector3().copy(intersects[intersect].point);
          // hit plane !
          if(plane.uuid == intersects[intersect].object.uuid){
            // change selected object position..!
            window.console.log(SELECTED);
            SELECTED.position.x = ras.x;
            SELECTED.position.y = ras.y;
            SELECTED.position.z = ras.z;

            // draw ellipse if 2 handles!
            if(HANDLES.length == 2){

              // need to compute it properly
              geometry = new THREE.Geometry();
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[0].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[1].position.y, HANDLES[0].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[1].position.y, HANDLES[1].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[1].position.z));
              geometry.vertices.push(new THREE.Vector3(HANDLES[0].position.x, HANDLES[0].position.y, HANDLES[0].position.z));
              geometry.verticesNeedUpdate = true;

            if(typeof line == "undefined" || !line){

              material = new THREE.LineBasicMaterial(
                { color: 0xff00f0,
                  linewidth: 2} );
              material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
        material.polygonOffsetUnits = 1;
              line = new THREE.Line(geometry, material);
              scene.add(line);
              }

              else{
line.geometry = geometry;
// compute stats

// need to compute 4 points of the box from 2 points in diagonal!
var h1 = HANDLES[0].position;
var h2 = HANDLES[1].position;

// computer center (might be used to drag it later)
var center = new THREE.Vector3(h1.x + (h2.x - h1.x)/2,
                                  h1.y + (h2.y - h1.y)/2,
                                  h1.z + (h2.z - h1.z)/2);
// draw center for fun
// var sphereGeometry = new THREE.SphereGeometry(1);
// var material3 = new THREE.MeshBasicMaterial( {color: 0x00fff0} );
// material3.transparent= true;
// material3.opacity = .5;
// var sphere = new THREE.Mesh( sphereGeometry, material3 );
// sphere.applyMatrix( new THREE.Matrix4().makeTranslation(center.x, center.y, center.z) );
// sphere.name = 'center';
// scene.add( sphere );

// box's sides length
var dx = Math.sqrt((h2.x - h1.x)*(h2.x - h1.x))/2;
var dy = Math.sqrt((h2.y - h1.y)*(h2.y - h1.y))/2;
var dz = Math.sqrt((h2.z - h1.z)*(h2.z - h1.z))/2;

// 8 RAS corners
var c0 = new THREE.Vector3(center.x - dx, center.y - dy, center.z - dz);
var c1 = new THREE.Vector3(center.x - dx, center.y - dy, center.z + dz);
var c2 = new THREE.Vector3(center.x - dx, center.y + dy, center.z - dz);
var c3 = new THREE.Vector3(center.x - dx, center.y + dy, center.z + dz);
var c4 = new THREE.Vector3(center.x + dx, center.y - dy, center.z - dz);
var c5 = new THREE.Vector3(center.x + dx, center.y - dy, center.z + dz);
var c6 = new THREE.Vector3(center.x + dx, center.y + dy, center.z - dz);
var c7 = new THREE.Vector3(center.x + dx, center.y + dy, center.z + dz);

// 8 IJK corners
var ijk0 = new THREE.Vector3(c0.x, c0.y, c0.z).applyMatrix4(tRASToIJK);
ijk0.x = Math.floor(ijk0.x + .5); 
ijk0.y = Math.floor(ijk0.y + .5); 
ijk0.z = Math.floor(ijk0.z + .5);

var ijk1 = new THREE.Vector3(c1.x, c1.y, c1.z).applyMatrix4(tRASToIJK);
ijk1.x = Math.floor(ijk1.x + .5); 
ijk1.y = Math.floor(ijk1.y + .5); 
ijk1.z = Math.floor(ijk1.z + .5);

var ijk2 = new THREE.Vector3(c2.x, c2.y, c2.z).applyMatrix4(tRASToIJK);
ijk2.x = Math.floor(ijk2.x + .5); 
ijk2.y = Math.floor(ijk2.y + .5); 
ijk2.z = Math.floor(ijk2.z + .5);

var ijk3 = new THREE.Vector3(c3.x, c3.y, c3.z).applyMatrix4(tRASToIJK);
ijk3.x = Math.floor(ijk3.x + .5); 
ijk3.y = Math.floor(ijk3.y + .5); 
ijk3.z = Math.floor(ijk3.z + .5);

var ijk4 = new THREE.Vector3(c4.x, c4.y, c4.z).applyMatrix4(tRASToIJK);
ijk4.x = Math.floor(ijk4.x + .5); 
ijk4.y = Math.floor(ijk4.y + .5); 
ijk4.z = Math.floor(ijk4.z + .5);

var ijk5 = new THREE.Vector3(c5.x, c5.y, c5.z).applyMatrix4(tRASToIJK);
ijk5.x = Math.floor(ijk5.x + .5); 
ijk5.y = Math.floor(ijk5.y + .5); 
ijk5.z = Math.floor(ijk5.z + .5);

var ijk6 = new THREE.Vector3(c6.x, c6.y, c6.z).applyMatrix4(tRASToIJK);
ijk6.x = Math.floor(ijk6.x + .5); 
ijk6.y = Math.floor(ijk6.y + .5); 
ijk6.z = Math.floor(ijk6.z + .5);

var ijk7 = new THREE.Vector3(c7.x, c7.y, c7.z).applyMatrix4(tRASToIJK);
ijk7.x = Math.floor(ijk7.x + .5); 
ijk7.y = Math.floor(ijk7.y + .5); 
ijk7.z = Math.floor(ijk7.z + .5);

// get IJK BBox and look + test each
var ijkMin = new THREE.Vector3(Math.min(ijk0.x, ijk1.x, ijk2.x, ijk3.x, ijk4.x, ijk5.x, ijk5.x, ijk7.x),
                               Math.min(ijk0.y, ijk1.y, ijk2.y, ijk3.y, ijk4.y, ijk5.y, ijk5.y, ijk7.y),
                               Math.min(ijk0.z, ijk1.z, ijk2.z, ijk3.z, ijk4.z, ijk5.z, ijk5.z, ijk7.z));

var ijkMax = new THREE.Vector3(Math.max(ijk0.x, ijk1.x, ijk2.x, ijk3.x, ijk4.x, ijk5.x, ijk5.x, ijk7.x),
                               Math.max(ijk0.y, ijk1.y, ijk2.y, ijk3.y, ijk4.y, ijk5.y, ijk5.y, ijk7.y),
                               Math.max(ijk0.z, ijk1.z, ijk2.z, ijk3.z, ijk4.z, ijk5.z, ijk5.z, ijk7.z));

// fix ijk out of range
if(ijkMin.x < 0){
  ijkMin.x = 0;
}
if(ijkMin.x >= tDimensions.x){
  ijkMin.x = tDimensions.x - 1;
}
if(ijkMin.y < 0){
  ijkMin.y = 0;
}
if(ijkMin.y >= tDimensions.y){
  ijkMin.y = tDimensions.y - 1;
}
if(ijkMin.z < 0){
  ijkMin.z = 0;
}
if(ijkMin.z >= tDimensions.z){
  ijkMin.z = tDimensions.z - 1;
}
if(ijkMax.x < 0){
  ijkMax.x = 0;
}
if(ijkMax.x >= tDimensions.x){
  ijkMax.x = tDimensions.x - 1;
}
if(ijkMax.y < 0){
  ijkMax.y = 0;
}
if(ijkMax.y >= tDimensions.y){
  ijkMax.y = tDimensions.y - 1;
}
if(ijkMax.z < 0){
  ijkMax.z = 0;
}
if(ijkMax.z >= tDimensions.z){
  ijkMax.z = tDimensions.z - 1;
}

var  iLog = {};
var  jLog = {};
var  kLog = {};

// window.console.log(bbox);
var roiStats = {
  points: [],
  max:  -Number.MAX_VALUE,
  min:  Number.MAX_VALUE
};
var nbVoxels = 0;
var sum = 0;
var epsilon = .001;


        roiBox = new THREE.Box3(
          c0,
          c7
        );


for(var i = ijkMin.x; i <= ijkMax.x; i++){
  for(var j = ijkMin.y; j <= ijkMax.y; j++){
      for(var k = ijkMin.z; k <= ijkMax.z; k++){
        // get voxel bbox
        // draw it as a test...
        // .5 offset?
        voxelBox = new THREE.Box3(
          new THREE.Vector3(i, j, k),
          new THREE.Vector3(i+1, j+1, k+1)
        );
        voxelBox.applyMatrix4(tIJKToRAS);


        window.console.log("ijk", i, j, k);
        window.console.log("voxel", voxelBox);
        window.console.log("roi", roiBox);

        //need to test oriented BBox interesection for accuracy...
        // BEST:
        // If you're looking to roll your own, I'd recommend reading Separating Axis Theorem for Oriented Bounding Boxes by Johnny Huynh.
        // http://www.geometrictools.com/Source/Mathematics.html
        // http://www.geometrictools.com/GTEngine/Include/GteIntrOrientedBox3OrientedBox3.h
        // https://github.com/juj/MathGeoLib/blob/master/src/Geometry/OBB.cpp
        // http://www.wildbunny.co.uk/blog/2011/04/20/collision-detection-for-dummies/

          // DRAW TRANSFORMED RAS CUBE
          // right location

  // var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  // //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  // var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
  //   wireframe: true,
  //   color: 0x61F2F3
  // }));
  // // center IJK cube
  // cube.applyMatrix( new THREE.Matrix4().makeTranslation( i, j, k) );
  // // move to RAS
  // cube.applyMatrix( tIJKToRAS );
  // scene.add(cube);



        // test intersection with ROI bbox...
        // window.console.log(i,j,k);
        // ras of 8 corners
        // if any match, good... but so slow....
        // var ras = new THREE.Vector3(i, j, k).applyMatrix4(tIJKToRAS);
        // // ras center of voxel, now see if it intersects ROI
        // // window.console.log(ras);

        // // rule out case where there is no collision
        //  if(ras.x - volume._RASSpacing[0]/2 - c7.x > epsilon ||
        //     ras.y - volume._RASSpacing[1]/2 - c7.y > epsilon ||
        //     ras.z - volume._RASSpacing[2]/2 - c7.z > epsilon ||
        //     ras.x + volume._RASSpacing[0]/2 - c0.x < -epsilon ||
        //     ras.y + volume._RASSpacing[1]/2 - c0.y < -epsilon ||
        //     ras.z + volume._RASSpacing[2]/2 - c0.z < -epsilon)
        //   {
        //     // no collision
        //     // why?
        //     // window.console.log(ras.x - volume._RASSpacing[0]/2 - c7.x);
        //     // window.console.log(ras.y - volume._RASSpacing[1]/2 - c7.y);
        //     // window.console.log(ras.z - volume._RASSpacing[2]/2 - c7.z);
        //     // window.console.log(ras.x + volume._RASSpacing[0]/2 - c0.x);
        //     // window.console.log(ras.y + volume._RASSpacing[1]/2 - c0.y);
        //     // window.console.log(ras.z + volume._RASSpacing[2]/2 - c0.z);
          // }
          if(voxelBox.intersect(roiBox)){
          var point = {
            "ijk": [i, j, k],
            "value": volume._IJKVolume[k][j][i]
          };
          roiStats.points.push(point);
          // compute as much as possible here to avoid having to loop through points again alter...
          // sum += value;
          // nbVoxels += 1;
          roiStats.min = (point.value < roiStats.min )? point.value : roiStats.min;
          roiStats.max = (point.value > roiStats.max )? point.value : roiStats.max;

        }

        
}
}
}

window.console.log("update ROI");
// window.console.log(c0);
// window.console.log(c7);
// // window.console.log(ijkMin);
// // window.console.log(ijkMax);
window.console.log(roiStats.points);

// in a web worker... so ui doesn't block the rest

// var worker = new Worker('doWork.js');

// worker.addEventListener('message', function(e) {
//   console.log('Worker said: ', e.data);
// }, false);

// worker.postMessage('Hello World');

// workerself.addEventListener('message', function(e) {
//   self.postMessage(e.data);
// }, false);

// probeROI.update(roiStats);
//(get IJK then?)

              }

              // window.console.log(XYRASTransform);
             



// line.applyMatrix( new THREE.Matrix4().makeTranslation(ras.x, ras.y, ras.z) );
            scene.add( line );

            }


          }

        }

}

function onDocumentMouseDown( event ) {


        event.preventDefault();

        raycaster.setFromCamera( mouse, camera ); 

        var intersects = raycaster.intersectObjects( scene.children );

        for ( var intersect in intersects ) {
          var ras = new THREE.Vector3().copy(intersects[intersect].point);
          // hit handler!
          window.console.log(intersects[intersect].object);
          if('handle'== intersects[intersect].object.name){
            // select it, disable controls!
            SELECTED = intersects[intersect].object;
            controls.enabled = false;
            // container.style.cursor = 'move';

            window.console.log('clicked on EllipsePicker');
            

            break;
          }
          // hit plane !
          if(plane.uuid == intersects[intersect].object.uuid && HANDLES.length < 2){
            // create a sphere...
            // var sphereGeometry = new THREE.SphereGeometry(1);
            // var material = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
            // var handle1 = new THREE.Mesh( sphereGeometry, material );
            // handle1.name = 'handle';
            // scene.add( handle1 );

            var sphereGeometry = new THREE.SphereGeometry(1);
            var material3 = new THREE.MeshBasicMaterial( {color: 0xff00f0} );
            material3.transparent= true;
            material3.opacity = .5;
            var sphere = new THREE.Mesh( sphereGeometry, material3 );
            sphere.applyMatrix( new THREE.Matrix4().makeTranslation(ras.x, ras.y, ras.z) );
            sphere.name = 'handle';
            scene.add( sphere );

            HANDLES.push(sphere);
            // create ellipse picker
            // var ellipsePicker = new VJS.EllipsePicker();
            // ellipsePicker.update(ras, ras);
            // scene.add( ellipsePicker.widget );
            // break;
          }
      }

        // if ( intersects.length > 0 ) {

        //   controls.enabled = false;

        //   SELECTED = intersects[ 0 ].object;

        //   var intersects = raycaster.intersectObject( plane );
        //   offset.copy( intersects[ 0 ].point ).sub( plane.position );

        //   container.style.cursor = 'move';

        // }

}

function onDocumentMouseUp( event ) {

        event.preventDefault();

        controls.enabled = true;

        // if ( INTERSECTED ) {

        //   plane.position.copy( INTERSECTED.position );

          SELECTED = null;

        // }

        // container.style.cursor = 'auto';

}

  // this function is executed on each animation frame
  function animate(){
    // update plane geomtry if needed
    if(currentIndex != volume._indexX){
      currentSlice = sliceX._slices[volume._indexX];

      //
      // convert from XTK to THREEJS
      //
      var xyras = currentSlice._XYToRAS;
      XYRASTransform = new THREE.Matrix4().set(xyras[0], xyras[4], xyras[8], xyras[12],
                                             xyras[1], xyras[5], xyras[9], xyras[13],
                                             xyras[2], xyras[6], xyras[10], xyras[14],
                                             xyras[3], xyras[7], xyras[11], xyras[15]);
      var transforms = {
        "xy2ras": XYRASTransform
      }

      var width = currentSlice._width;
      var height = currentSlice._height;
      var normalOrigin = currentSlice._center;
      var center = new THREE.Vector3( normalOrigin[0], normalOrigin[1], normalOrigin[2] );
      //
      //
      //

      // update slice geomtry
      vjsSliceView.updateRASSlice(plane, width, height, center, transforms);
      currentIndex = volume._indexX;
    }
    //
    // update the picking ray with the camera and mouse position  
    raycaster.setFromCamera( mouse, camera ); 

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects( scene.children );

    //window.console.log(intersects);

    for ( var intersect in intersects ) {
      var ras = new THREE.Vector3().copy(intersects[intersect].point);
      if(plane.uuid == intersects[intersect].object.uuid){
        // convert point to IJK
        var ijk = intersects[intersect].point.applyMatrix4(tRASToIJK);
        ijk.x += .5;
        ijk.y += .5;
        ijk.z += .5;
        // get value!
        if(ijk.x >= 0 && ijk.y >= 0 && ijk.z >= 0 &&
          ijk.x <= tDimensions.x &&
          ijk.y <= tDimensions.y &&
          ijk.z <= tDimensions.z ){
        
          var value = vjsVolumeCore.getValue(Math.floor(ijk.x), Math.floor(ijk.y), Math.floor(ijk.z), 0, false);
          probe.update(ras, ijk, value);
        }

        break;
      }
    }
    // render
    renderer.render(scene, camera);
    stats.update();
    controls.update(); 

    // connect zoom for orthographic...
    // window.console.log(controls);
    // request new frame
    requestAnimationFrame(function(){
    animate();
    });
  }

  // renderer
  threeD = document.getElementById('3d');
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor( 0xB0BEC5, 1);
  threeD.appendChild(renderer.domElement);

    // stats
  stats = new Stats();
  threeD.appendChild( stats.domElement );

  probe = new VJS.Probe();
  threeD.appendChild( probe.domElement );

  probeROI = new VJS.ProbeROI();
  threeD.appendChild( probeROI.domElement );

  // scene
  var scene = new THREE.Scene();
  // camera
  var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, .1, 10000000);
  // camera = new THREE.OrthographicCamera(threeD.offsetWidth/-2, threeD.offsetWidth/2, threeD.offsetHeight/-2, threeD.offsetHeight/2, .1, 10000000);
  // camera.position.y = 10;
  camera.position.x = 400;
  // camera.position.y = 200;
  // camera.position.z = 800;
  camera.lookAt(scene.position);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  // camera.rotation.y = -20 * (Math.PI / 180);

  //
  //
  //
  // convert to ThreeJS format from XTK
  //
  //
  //
  var rasijk = volume._RASToIJK;
  tRASToIJK = new THREE.Matrix4().set(
                  rasijk[0], rasijk[4], rasijk[8], rasijk[12],
                  rasijk[1], rasijk[5], rasijk[9], rasijk[13],
                  rasijk[2], rasijk[6], rasijk[10], rasijk[14],
                  rasijk[3], rasijk[7], rasijk[11], rasijk[15]);
  tIJKToRAS = new THREE.Matrix4().getInverse(tRASToIJK);

  var ijkDims = volume._dimensions;
  tDimensions = new THREE.Vector3( ijkDims[0], ijkDims[1], ijkDims[2] );

  var dimensions = volume._RASDimensions;
  tRASDimensions = new THREE.Vector3( dimensions[0], dimensions[1], dimensions[2] );

  var center = volume._RASCenter;
  tRASCenter = new THREE.Vector3( center[0], center[1], center[2] );

  var  origin = volume._RASOrigin;
  tOrigin = new THREE.Vector3( origin[0], origin[1], origin[2] );

  // create volume core object and its view
  // Create RAS object
  var ras = {
    "origin": tOrigin,
    "center": tRASCenter,
    "dimensions": tRASDimensions,
    "spacing": null,
    "boundingbox": [
      new THREE.Vector3( tRASCenter.x - tRASDimensions.x/2, tRASCenter.y - tRASDimensions.y/2, tRASCenter.z - tRASDimensions.z/2 ),
      new THREE.Vector3( tRASCenter.x + tRASDimensions.x/2, tRASCenter.y + tRASDimensions.y/2, tRASCenter.z+ tRASDimensions.z/2 )
    ]
  }

  // need ijk object as well
  var ijk = {
    "origin": null,
    "center": null,
    "dimensions": tDimensions,
    "spacing": null
  }

  var transforms = {
    "ijk2ras": tIJKToRAS,
    "ras2ijk": tRASToIJK
  }

    // draw RAS bbox
  var dimensions = volume._RASDimensions;
  var spacing = volume._RASSpacing;
  var ijkSpac = volume._spacing;
  var sliceWidth = slice._iWidth;
  var rasijk = volume._RASToIJK;
  var rasBBox = volume._BBox;
  //
  //
  //
  //

  // Create VJS Volume
  vjsVolumeCore = new VJS.Volume.Core(volume._data, volume.max, volume.min, transforms, ijk, ras);
  vjsVolumeView = new VJS.Volume.View(vjsVolumeCore);

  //
  //
  // IJK BBox Oriented in RAS Space volume
  //
  //
  var material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x61F2F3
  });
  var IJKBBoxOriented = vjsVolumeView.IJKBBoxOriented(material);
  scene.add(IJKBBoxOriented);

  // RAS BBox
  var material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x2196F3
  });
  var RASBBox = vjsVolumeView.RASBBox(material);
  scene.add(RASBBox);


  //
  // CONVERT XTK TO THREEJS FORMAT
  //
  var xyras = slice._XYToRAS;
  XYRASTransform = new THREE.Matrix4().set(xyras[0], xyras[4], xyras[8], xyras[12],
                                             xyras[1], xyras[5], xyras[9], xyras[13],
                                             xyras[2], xyras[6], xyras[10], xyras[14],
                                             xyras[3], xyras[7], xyras[11], xyras[15]);
  var transforms = {
    "xy2ras": XYRASTransform
  }

  var width = slice._width;
  var height = slice._height;
  var normalOrigin = slice._center;
  var center = new THREE.Vector3( normalOrigin[0], normalOrigin[1], normalOrigin[2] );
  //
  //
  //

  // Create Slice
  //

  //
  var sliceNormal = new THREE.Vector3( 1, 0, 0);
  var sliceOrigin = vjsVolumeCore._RAS.center;
  // get texture from object
  var tSize = 4096.0;
  var tNumber = 4;
  vjsVolumeCore.createTexture(tNumber, tSize);

  // height, width, center and transform should not be there (Slice.Core should compute it.)
  vjsSliceCore = new VJS.Slice.Core(sliceOrigin, sliceNormal, vjsVolumeCore, width, height, center, transforms);
  vjsSliceCore.Slice();
  // create a view for the slice (for debugging)
  var intersectionRASBBoxSlice = new VJS.Slice.View(vjsSliceCore);
  var material = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
  var intersections = intersectionRASBBoxSlice.SliceRASBBoxIntersection(material);
  for(var i=0; i<intersections.length; i++){
    scene.add(intersections[i]);
  }

  // create another view of the same slice
  vjsSliceView = new VJS.Slice.View(vjsSliceCore);
  plane  = vjsSliceView.RASSlice(tSize, tNumber);
  scene.add(plane);

  // mouse callbacks
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
  // start animation
  window.console.log('start animate...');
  HANDLES = [];
  animate();
}

window.onload = function() {
  // create the 2D renderers (just load tand parse the file...)
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();
  //
  // THE VOLUME DATA
  //
  // create a X.volumehttps://www.google.es/url?sa=t&rct=j&q=&esrc=s&source=web&cd=12&ved=0CCcQFjABOAo&url=http%3A%2F%2Fcharmianswers.org%2Fwordpress%2Fyeakel%2F2014%2F12%2F16%2Fwhy-orthographic-projection-not-working-exactly-while-using-combinedcamera-js-using-three-js%2F&ei=acPYVJzqH47KaMP4ghg&usg=AFQjCNF1rWDi5zBe5-Abh0qBSkifTtDSew&sig2=gLgGnS6sOjhjRBdxmATsgg
  volume = new X.volume();
  volume.file = 'data/lesson17_cropped.nii.gz';
  // volume.file = 'data/CT.nii.gz';
  // compute IJK to RAS transform...
  volume.reslicing = true;
  sliceX.add(volume);
  
  // start the loading/rendering
  sliceX.render();
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  sliceX.onShowtime = function() {
    currentIndex = volume._indexX;
    init(sliceX._slices[63]);
  };
};