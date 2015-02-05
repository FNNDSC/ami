// XTK includes for now...
goog.require('X.renderer3D');
goog.require('X.renderer2D');
goog.require('X.parserNII');

// standard global variables
var scene, camera, renderer;

// FUNCTIONS
function init(slice) {
  // this function is executed on each animation frame
  function animate(){
    // render
    renderer.render(scene, camera);
    controls.update(); 
    // request new frame
    requestAnimationFrame(function(){
    animate();
    });
  }

  // renderer
  var threeD = document.getElementById('3d');
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  renderer.setClearColor( 0xB0BEC5, 1);
  threeD.appendChild(renderer.domElement);

  // scene
  var scene = new THREE.Scene();
  // camera
  var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, .1, 10000000);
  // camera.position.y = 10;
  camera.position.x = 400;
  // camera.position.y = 200;
  // camera.position.z = 800;
  camera.lookAt(scene.position);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  // camera.rotation.y = -20 * (Math.PI / 180);

  // draw RAS bbox
  var dimensions = volume._RASDimensions;
  var center = volume._RASCenter;

  // DRAW CUBE RAS BBOX!
  // var cubeGeometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
  // //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  // var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
  //   wireframe: true,
  //   color: 'blue'
  // }));
  // cube.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  // scene.add(cube);

  var sliceWidth = slice._iWidth;
  var rasijk = volume._RASToIJK;
  var rasBBox = volume._BBox;
  var dimensions = volume._dimensions;
  var tDimensions = new THREE.Vector3( dimensions[0], dimensions[1], dimensions[2] );

  // IJK CENTERED!!!!! on (0, 0, 0)


  // DRAW CUBE IJK BBOX!
  var cubeGeometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
  //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 'green'
  }));
  // origin is (0,0,0)
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(dimensions[0]/2, dimensions[1]/2, dimensions[2]/2) );
  cube.matrixAutoUpdate = false;
  scene.add(cube);

  var tRASToIJK = new THREE.Matrix4().set(
                  rasijk[0], rasijk[4], rasijk[8], rasijk[12],
                  rasijk[1], rasijk[5], rasijk[9], rasijk[13],
                  rasijk[2], rasijk[6], rasijk[10], rasijk[14],
                  rasijk[3], rasijk[7], rasijk[11], rasijk[15]);

  var tIJKToRAS = new THREE.Matrix4().getInverse(tRASToIJK);

  // DRAW TRANSFORMED TO RAS CUBE IJK BBOX!
  var cubeGeometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
  //cubeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 'red'
  }));
  cube.applyMatrix( new THREE.Matrix4().makeTranslation(dimensions[0]/2, dimensions[1]/2, dimensions[2]/2) );
  cube.applyMatrix( tIJKToRAS );
  cube.matrixAutoUpdate = false;
  scene.add(cube);

  var sphereGeometry = new THREE.SphereGeometry(10);
  var material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
  var sphere = new THREE.Mesh( sphereGeometry, material );
  sphere.matrixAutoUpdate = false;
  scene.add( sphere );


  // DRAW CENTER SPHERE
  var sphereGeometry = new THREE.SphereGeometry(10);
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  var sphere = new THREE.Mesh( sphereGeometry, material );
  sphere.applyMatrix( new THREE.Matrix4().makeTranslation(dimensions[0]/2, dimensions[1]/2, dimensions[2]/2) );
  sphere.matrixAutoUpdate = false;
  scene.add( sphere );

  // DRAW CENTER SPHERE
  var sphereGeometry = new THREE.SphereGeometry(10);
  var material = new THREE.MeshBasicMaterial( {color: 0x2196F3} );
  var sphereA = new THREE.Mesh( sphereGeometry, material );
  sphereA.applyMatrix( new THREE.Matrix4().makeTranslation(dimensions[0]/2, dimensions[1]/2, dimensions[2]/2) );
  sphereA.applyMatrix( tIJKToRAS );
  sphereA.matrixAutoUpdate = false;
  scene.add( sphereA );


  // map center to IJK space:
  var _test1 = goog.vec.Vec4.createFromValues(center[0], center[1], center[2], 1);
  var _test2 = goog.vec.Vec4.createFloat32();
  goog.vec.Mat4.multVec4(volume._RASToIJK, _test1, _test2);

  var sphereGeometry = new THREE.SphereGeometry(10);
  var material = new THREE.MeshBasicMaterial( {color: 0x219600} );
  var sphereA = new THREE.Mesh( sphereGeometry, material );
  sphereA.applyMatrix( new THREE.Matrix4().makeTranslation(center[0], center[1], center[2]) );
  sphereA.matrixAutoUpdate = false;
  scene.add( sphereA );

  // draw intersections
  var solutions = slice._solutionsIn;
  for(var i=0; i<solutions.length; i++){
    var sphereGeometry = new THREE.SphereGeometry(10);
    var material = new THREE.MeshBasicMaterial( {color: 0xFFFF8D} );
    var sphere = new THREE.Mesh( sphereGeometry, material );
    sphere.applyMatrix( new THREE.Matrix4().makeTranslation(solutions[i][0], solutions[i][1], solutions[i][2]) );
    sphere.matrixAutoUpdate = false;
    scene.add( sphere );
  }

  // draw XYintersections
  var solutions = slice._solutionsXY;
  for(var i=0; i<solutions.length; i++){
    var sphereGeometry = new THREE.SphereGeometry(10);
    var material = new THREE.MeshBasicMaterial( {color: 0xFF8DFF} );
    var sphere = new THREE.Mesh( sphereGeometry, material );
    sphere.applyMatrix( new THREE.Matrix4().makeTranslation(solutions[i][0], solutions[i][1], solutions[i][2]) );
    scene.add( sphere );
  }

  // draw plane
  var sliceWidth = slice._width;
  var sliceHeight = slice._height;

  window.console.log('SLICE ' + sliceWidth + 'x' + sliceHeight);

  var geometry = new THREE.PlaneGeometry( sliceWidth, sliceHeight );
  // move back to RAS...
  // _XYToRAS
  var material = new THREE.MeshBasicMaterial( {color: 0xE91E63, side: THREE.DoubleSide} );
  // https://github.com/mrdoob/three.js/wiki/Uniforms-types
  // might consider texture compression...
  // http://blog.tojicode.com/2011/12/compressed-textures-in-webgl.html
  // convert texture to float somehow to handle more range


  // create a big texture....
  // ijkRGBADataTex = new THREE.DataTexture( volume._IJKVolumeRGBA, volume._IJKVolume[0][0].length, volume._IJKVolume.length * volume._IJKVolume[0].length, THREE.RGBAFormat );
  // ijkRGBADataTex.needsUpdate = true;

  //ijkRGBATex = new THREE.Texture(ijkRGBADataTex);
  // create 4RGBA textures to split the data

  // configuration: size of side of a texture (square tSize*tSize)
  var tSize = 2048.0;
  var tNumber = 4;

  //
  // 1) check if we have enough room in textures!!
  // 
  var requiredPixels = tDimensions[0] * tDimensions[1] * tDimensions[2] * 4;
  if(requiredPixels > tSize*tSize*4*4){
    window.console.log("Too many pixels to fit in shader, go for canvas 2D...");
    return;
  }

  //
  // 2) pack pixels into texture
  //
  
  // prepare raw data containers
  var rawData = [];
  for(var i=0; i<tNumber; i++){
    rawData.push(new Uint8Array(tSize * tSize * 4));
  }

  // fill texture containers
  var dummyRGBA = new Uint8Array(tSize * tSize * 4);
  for(var i=0; i < tSize * tSize * 4; i+=4){
    for(var j=0; j < tNumber; j++){
      // RGB
      rawData[j][i] = volume._IJKVolumeRGBA[i + j*tSize * tSize * 4];
      rawData[j][i + 1] = volume._IJKVolumeRGBA[i + j*tSize * tSize * 4];
      rawData[j][i + 2] = volume._IJKVolumeRGBA[i + j*tSize * tSize * 4];
      // OPACITY
      rawData[j][i + 3] = 255;
    }
  }

  // create threeJS textures
  var textures = [];
  for(var i=0; i<tNumber; i++){
    var tex = new THREE.DataTexture( rawData[i], tSize, tSize, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter );
    tex.needsUpdate = true;
    textures.push(tex);
  }

  // setup uniforms
  var shaderSlice = THREE.ShaderSlice;
  var uniforms = shaderSlice.slice.uniforms;
  uniforms.uTextureSize.value = tSize;
  uniforms.t00.value = textures[0];
  uniforms.t01.value = textures[1];
  uniforms.t02.value = textures[2];
  uniforms.t03.value = textures[3];
  uniforms.uIJKDims.value = tDimensions;
  uniforms.uRASToIJK.value = tRASToIJK;

  var mat = new THREE.ShaderMaterial({
          "side": THREE.DoubleSide,
          "transparency":true,
          "uniforms": uniforms,
          "vertexShader": shaderSlice.slice.vertexShader,
          "fragmentShader": shaderSlice.slice.fragmentShader,
  });

  var plane = new THREE.Mesh( geometry, mat );
  var xyras = slice._XYToRAS;
  var normalOrigin = slice._origin;
  plane.applyMatrix( new THREE.Matrix4().makeTranslation(normalOrigin[0], normalOrigin[1], normalOrigin[2]) );
  plane.applyMatrix( new THREE.Matrix4().set(xyras[0], xyras[4], xyras[8], xyras[12],
                                             xyras[1], xyras[5], xyras[9], xyras[13],
                                             xyras[2], xyras[6], xyras[10], xyras[14],
                                             xyras[3], xyras[7], xyras[11], xyras[15]));
  scene.add(plane);
 
  // start animation
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
  // create a X.volume
  volume = new X.volume();
  volume.file = 'data/lesson17.nii.gz';
  // get accurate IJK to RAS transform...
  volume.reslicing = true;

  // we also attach a label map to show segmentations on a slice-by-slice base
  //volume.labelmap.file = 'http://x.babymri.org/?seg.nrrd';
  // .. and use a color table to map the label map values to colors
  //volume.labelmap.colortable.file = 'http://x.babymri.org/?genericanatomy.txt';

  sliceX.add(volume);
  
  // start the loading/rendering
  sliceX.render();
    //
  // THE GUI
  //
  // the onShowtime method gets executed after all files were fully loaded and
  // just before the first rendering attempt
  sliceX.onShowtime = function() {
    // Thanks XTK for loading the files, let threeJS render it now...
    // now the real GUI
    // var gui = new dat.GUI();
    
    // // the following configures the gui for interacting with the X.volume
    // var volumegui = gui.addFolder('Volume');
    // // now we can configure controllers which..
    // // .. switch between slicing and volume rendering
    // var vrController = volumegui.add(volume, 'volumeRendering');
    // // .. configure the volume rendering opacity
    // var opacityController = volumegui.add(volume, 'opacity', 0, 1);
    // // .. and the threshold in the min..max range
    // var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
    //     volume.min, volume.max);
    // var upperThresholdController = volumegui.add(volume, 'upperThreshold',
    //     volume.min, volume.max);
    // var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,
    //     volume.max);
    // var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,
    //     volume.max);
    // // the indexX,Y,Z are the currently displayed slice indices in the range
    // // 0..dimensions-1
    // var sliceXController = volumegui.add(volume, 'indexX', 0,
    //     volume.range[0] - 1);
    // var sliceYController = volumegui.add(volume, 'indexY', 0,
    //     volume.range[1] - 1);
    // var sliceZController = volumegui.add(volume, 'indexZ', 0,
    //     volume.range[2] - 1);
    // volumegui.open();

    // go threeJS
    window.console.log(sliceX._slices);
    init(sliceX._slices[93]);
  };
};