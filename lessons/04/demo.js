/* globals Stats, dat, AMI*/

var LoadersVolume         = AMI.default.Loaders.Volume;
var CamerasOrthographic   = AMI.default.Cameras.Orthographic;
var ControlsOrthographic  = AMI.default.Controls.TrackballOrtho;
var HelpersLut            = AMI.default.Helpers.Lut;
var HelpersStack          = AMI.default.Helpers.Stack;
var ShadersDataUniforms   = AMI.default.Shaders.DataUniforms;
var ShadersDataFragment   = AMI.default.Shaders.DataFragment;
var ShadersDataVertex     = AMI.default.Shaders.DataVertex;
var ShadersLayerUniforms  = AMI.default.Shaders.LayerUniforms;
var ShadersLayerFragment  = AMI.default.Shaders.LayerFragment;
var ShadersCSPVertex      = AMI.default.Shaders.RaycastingSecondpassVertex;

// standard global letiables
var controls, renderer, camera, statsyay, threeD;
//
var sceneLayer0TextureTarget, sceneLayer1TextureTarget;
//
var scene, sceneLayer0;
//
var lutLayer0;
var sceneLayer1, meshLayer1, uniformsLayer1, materialLayer1, lutLayer1;
var sceneLayerMix, meshLayerMix, uniformsLayerMix, materialLayerMix, lutLayerMix;

var layer1 = {
  interpolation: 1
};

var layerMix = {
  opacity1: 1.0,
  type0: 0,
  type1: 1
};

// FUNCTIONS
function init() {
  // this function is executed on each animation frame
  function animate() {

    // render
    controls.update();
    // render first layer offscreen
    renderer.render(sceneLayer0, camera, sceneLayer0TextureTarget, true);
    // render second layer offscreen
    renderer.render(sceneLayer1, camera, sceneLayer1TextureTarget, true);
    // mix the layers and render it ON screen!
    renderer.render(sceneLayerMix, camera);
    statsyay.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('container');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  renderer.setClearColor(0x607D8B, 1);

  threeD.appendChild(renderer.domElement);

  // stats
  statsyay = new Stats();
  threeD.appendChild(statsyay.domElement);

  // scene
  scene = new THREE.Scene();
  sceneLayer0 = new THREE.Scene();
  sceneLayer1 = new THREE.Scene();
  sceneLayerMix = new THREE.Scene();

  // render to texture!!!!
  sceneLayer0TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
     magFilter: THREE.NearestFilter,
     format: THREE.RGBAFormat
  });

  sceneLayer1TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
     magFilter: THREE.NearestFilter,
     format: THREE.RGBAFormat
  });

  // camera
  camera = new CamerasOrthographic(threeD.clientWidth / -2, threeD.clientWidth / 2, threeD.clientHeight / 2, threeD.clientHeight / -2, 0.1, 10000);

  // controls
  controls = new ControlsOrthographic(camera, threeD);
  controls.staticMoving = true;
  controls.noRotate = true;

  animate();
}

  // init threeJS...
  init();

  let data = [
    '000183.dcm', '000219.dcm', '000117.dcm',
    '000240.dcm', '000033.dcm', '000060.dcm',
    '000211.dcm', '000081.dcm', '000054.dcm',
    '000090.dcm', '000042.dcm', '000029.dcm',
    '000239.dcm', '000226.dcm', '000008.dcm',
    '000128.dcm', '000089.dcm', '000254.dcm',
    '000208.dcm', '000047.dcm', '000067.dcm'
    ];

  let dataFullPath = data.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/andrei_abdomen/data/' + v;
  });

  let labelmap = [
    '000000.dcm'
  ];

  let labelmapFullPath = labelmap.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/andrei_abdomen/segmentation/' + v;
  });

 let files = dataFullPath.concat(labelmapFullPath);

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);
  let seriesContainer = [];
  let loadSequence = [];
  files.forEach((url) => {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(() => loader.fetch(url))
      .then((data) => loader.parse(data))
      .then((series) => {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

function buildGUI(stackHelper) {
  function updateLayer1(){
    // update layer1 geometry...
    if (meshLayer1) {

      sceneLayer1.remove(meshLayer1);
      meshLayer1.material.dispose();
      meshLayer1.material = null;
      meshLayer1.geometry.dispose();
      meshLayer1.geometry = null;

      // add mesh in this scene with right shaders...
      meshLayer1 = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
      // go the LPS space
      meshLayer1.applyMatrix(stackHelper.stack._ijk2LPS);

      sceneLayer1.add(meshLayer1);
    }
  }

  function updateLayerMix(){
    // update layer1 geometry...
    if (meshLayerMix) {

      sceneLayerMix.remove(meshLayerMix);
      meshLayerMix.material.dispose();
      meshLayerMix.material = null;
      meshLayerMix.geometry.dispose();
      meshLayerMix.geometry = null;

      // add mesh in this scene with right shaders...
      meshLayerMix = new THREE.Mesh(stackHelper.slice.geometry, materialLayerMix);
      // go the LPS space
      meshLayerMix.applyMatrix(stackHelper.stack._ijk2LPS);

      sceneLayerMix.add(meshLayerMix);
    }
  }

  let stack = stackHelper.stack;

  let gui = new dat.GUI({
          autoPlace: false
        });

  let customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);

  let layer0Folder = gui.addFolder('Layer 0 (Base)');
  layer0Folder.add(stackHelper.slice, 'invert');

  let lutUpdate = layer0Folder.add(stackHelper.slice, 'lut', lutLayer0.lutsAvailable());
  lutUpdate.onChange(function(value) {
    lutLayer0.lut = value;
    stackHelper.slice.lutTexture = lutLayer0.texture;
  });

  let indexUpdate = layer0Folder.add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();
  indexUpdate.onChange(function(){
    updateLayer1();
    updateLayerMix();
  });

  layer0Folder.add(stackHelper.slice, 'interpolation', 0, 1 ).step( 1 ).listen();

  layer0Folder.open();


  // layer 1 folder
  let layer1Folder = gui.addFolder('Layer 1');
  let interpolationLayer1 = layer1Folder.add(layer1, 'interpolation', 0, 1 ).step( 1 ).listen();
  interpolationLayer1.onChange(function(value){
    uniformsLayer1.uInterpolation.value = value;
  });

  layer1Folder.open();

  // layer mix folder
  let layerMixFolder = gui.addFolder('Layer Mix');
  let opacityLayerMix1 = layerMixFolder.add(layerMix, 'opacity1', 0, 1).step(0.01);
  opacityLayerMix1.onChange(function(value){
    uniformsLayerMix.uOpacity1.value = value;
  });
  let typeLayerMix1 = layerMixFolder.add(layerMix, 'type1', 0, 1).step( 1 );
  typeLayerMix1.onChange(function(value){
    uniformsLayerMix.uType1.value = value;
  });

  layerMixFolder.open();

  // hook up callbacks
  controls.addEventListener('OnScroll', function(e) {
    if (e.delta > 0) {
      if (stackHelper.index >= stack.dimensionsIJK.z - 1) {
        return false;
      }
      stackHelper.index += 1;
    } else {
      if (stackHelper.index <= 0) {
        return false;
      }
      stackHelper.index -= 1;
    }

    updateLayer1();
    updateLayerMix();
  });

  updateLayer1();
  updateLayerMix();

  // set default view
  camera.invertColumns();
  camera.invertRows();

  function onWindowResize() {
    let threeD = document.getElementById('container');
    camera.canvas = {
      width: threeD.clientWidth,
      height: threeD.clientHeight
    };
    camera.fitBox(2);

    renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  }
  window.addEventListener('resize', onWindowResize, false);
  onWindowResize();
}

function handleSeries() {
  loader.free();
  loader = null;
  //
  //
  // first stack of first series
  let mergedSeries = seriesContainer[0].mergeSeries(seriesContainer);
  let stack  = mergedSeries[1].stack[0];
  let stack2 = mergedSeries[0].stack[0];
  if(stack.windowWidth < 2){
    stack  = mergedSeries[0].stack[0];
    stack2 = mergedSeries[1].stack[0];
  }

  let stackHelper = new HelpersStack(stack);
  stackHelper.bbox.visible = false;
  stackHelper.border.visible = false;
  stackHelper.index = 10;

  sceneLayer0.add(stackHelper);

  //
  //
  // create labelmap....
  // we only care about the geometry....
  // get first stack from series
  // prepare it
  // * ijk2LPS transforms
  // * Z spacing
  // * etc.
  //
  stack2.prepare();
  // pixels packing for the fragment shaders now happens there
  stack2.pack();

  let textures2 = [];
  for (let m = 0; m < stack2._rawData.length; m++) {
    let tex = new THREE.DataTexture(
          stack2.rawData[m],
          stack2.textureSize,
          stack2.textureSize,
          stack2.textureType,
          THREE.UnsignedByteType,
          THREE.UVMapping,
          THREE.ClampToEdgeWrapping,
          THREE.ClampToEdgeWrapping,
          THREE.NearestFilter,
          THREE.NearestFilter);
    tex.needsUpdate = true;
    tex.flipY = true;
    textures2.push(tex);
  }

  // create material && mesh then add it to sceneLayer1
  uniformsLayer1 = ShadersDataUniforms.uniforms();
  uniformsLayer1.uTextureSize.value = stack2.textureSize;
  uniformsLayer1.uTextureContainer.value = textures2;
  uniformsLayer1.uWorldToData.value = stack2.lps2IJK;
  uniformsLayer1.uNumberOfChannels.value = stack2.numberOfChannels;
  uniformsLayer1.uPixelType.value = stack2.pixelType;
  uniformsLayer1.uBitsAllocated.value = stack2.bitsAllocated;
  uniformsLayer1.uWindowCenterWidth.value = [stack2.windowCenter, stack2.windowWidth];
  uniformsLayer1.uRescaleSlopeIntercept.value = [stack2.rescaleSlope, stack2.rescaleIntercept];
  uniformsLayer1.uDataDimensions.value = [stack2.dimensionsIJK.x,
                                              stack2.dimensionsIJK.y,
                                              stack2.dimensionsIJK.z];

  materialLayer1 = new THREE.ShaderMaterial(
    {side: THREE.DoubleSide,
    uniforms: uniformsLayer1,
    vertexShader: ShadersDataVertex,
    fragmentShader: ShadersDataFragment
  });

  // add mesh in this scene with right shaders...
  meshLayer1 = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
  // go the LPS space
  meshLayer1.applyMatrix(stack2._ijk2LPS);
  sceneLayer1.add(meshLayer1);

  // Create the Mix layer
  uniformsLayerMix = ShadersLayerUniforms.uniforms();
  uniformsLayerMix.uTextureBackTest0.value = sceneLayer0TextureTarget.texture;
  uniformsLayerMix.uTextureBackTest1.value = sceneLayer1TextureTarget.texture;

  materialLayerMix = new THREE.ShaderMaterial(
    {side: THREE.DoubleSide,
    uniforms: uniformsLayerMix,
    vertexShader: ShadersCSPVertex,
    fragmentShader: ShadersLayerFragment,
    transparent: true
  });

  // add mesh in this scene with right shaders...
  meshLayerMix = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
  // go the LPS space
  meshLayerMix.applyMatrix(stack2._ijk2LPS);
  sceneLayerMix.add(meshLayerMix);

  //
  // set camera
  let worldbb = stack.worldBoundingBox();
  let lpsDims = new THREE.Vector3(
    worldbb[1] - worldbb[0],
    worldbb[3] - worldbb[2],
    worldbb[5] - worldbb[4]
  );

  // box: {halfDimensions, center}
  let bbox = {
    center: stack.worldCenter().clone(),
    halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
  };

  // init and zoom
  let canvas = {
      width: threeD.clientWidth,
      height: threeD.clientHeight
    };
  camera.init(stack.xCosine, stack.yCosine, stack.zCosine, controls, bbox, canvas);
  camera.fitBox(2);

  // CREATE LUT
  lutLayer0 = new HelpersLut(
    'my-lut-canvases-l0',
    'default',
    'linear',
    [[0, 0, 0, 0], [1, 1, 1, 1]],
    [[0, 1], [1, 1]]);
  lutLayer0.luts = HelpersLut.presetLuts();

  lutLayer1 = new HelpersLut(
    'my-lut-canvases-l1',
    'default',
    'linear',
    [[0, 0, 0, 0], [1, 0.913, 0.117, 0.388]],
    [[0, 0], [1, 1]]);
  uniformsLayer1.uLut.value = 1;
  uniformsLayer1.uTextureLUT.value = lutLayer1.texture;

  buildGUI(stackHelper);
}

Promise
  .all(loadSequence)
  .then(function() {
    handleSeries();
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
