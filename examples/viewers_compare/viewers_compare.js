/* globals Stats, dat*/

// promises polyfill from the babel team
import 'babel-polyfill';

import CamerasOrthographic  from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import HelpersLut           from '../../src/helpers/helpers.lut';
import HelpersStack         from '../../src/helpers/helpers.stack';
import LoadersVolume        from '../../src/loaders/loaders.volume';
import ShadersLayer         from '../../src/shaders/shaders.layer';

var glslify = require('glslify');

// standard global letiables
let controls, renderer, camera, statsyay, threeD;
//
let mouse = {
  x: 0,
  y: 0
};

function onMouseMove(event) {

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / threeD.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / threeD.clientHeight) * 2 + 1;

  // push to shaders
  uniformsLayer1.uMouse.value = new THREE.Vector2(mouse.x, mouse.y);
}

//
let sceneBaseTextureTarget;
//
let scene, sceneBase;
//
let lutLayer0;
let sceneLayer1, meshLayer1, uniformsLayer1, materialLayer1, lutLayer1;
//probe
// stack for zcosine access for camera...
let stack;

let camUtils = {
  invertRows: false,
  invertColumns: false,
  rotate: false
};

let layer1 = {
  opacity: 1.0,
  lut: null,
  mix: true,
  trackMouse: true
};

// FUNCTIONS
function init() {
  // this function is executed on each animation frame
  function animate() {
    // render
    controls.update();
    renderer.render(sceneBase, camera, sceneBaseTextureTarget, true);
    renderer.render(sceneLayer1, camera);
    statsyay.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  renderer.setClearColor(0x212121, 1);
  
  threeD.appendChild(renderer.domElement);

  // stats
  statsyay = new Stats();
  threeD.appendChild(statsyay.domElement);

  // scene
  scene = new THREE.Scene();
  sceneBase = new THREE.Scene();
  sceneLayer1 = new THREE.Scene();

  // render to texture!!!!
  sceneBaseTextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat
  });

  // camera
  camera = new CamerasOrthographic(threeD.clientWidth / -2, threeD.clientWidth / 2, threeD.clientHeight / 2, threeD.clientHeight / -2, 0.1, 10000);

  // controls
  controls = new ControlsOrthographic(camera, threeD);
  controls.staticMoving = true;
  controls.noRotate = true;

  animate();
}

window.onload = function() {

  // init threeJS...
  init();

  let data = [
    'patient1/7001_t1_average_BRAINSABC.nii.gz',
    'patient2/7002_t1_average_BRAINSABC.nii.gz'
  ];

  let files = data.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/' + v;
  });

  //  let files = dataFullPath.concat(labelmapFullPath);

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
    function updateLayer1() {
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

    let stack = stackHelper._stack;

    let gui = new dat.GUI({
            autoPlace: false
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let layer0Folder = gui.addFolder('Layer 0 (Base)');
    layer0Folder.add(stackHelper.slice, 'windowWidth', 1, stack.minMax[1]).step(1).listen();
    layer0Folder.add(stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1]).step(1).listen();
    layer0Folder.add(stackHelper.slice, 'intensityAuto');
    layer0Folder.add(stackHelper.slice, 'invert');

    let lutUpdate = layer0Folder.add(stackHelper.slice, 'lut', lutLayer0.lutsAvailable());
    lutUpdate.onChange(function(value) {
      lutLayer0.lut = value;
      stackHelper.slice.lutTexture = lutLayer0.texture;
    });

    let indexUpdate = layer0Folder.add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();
    indexUpdate.onChange(function() {
      updateLayer1();
    });

    layer0Folder.open();

    // layer 1 folder
    let layer1Folder = gui.addFolder('Layer 1');
    let opacityLayer1 = layer1Folder.add(layer1, 'opacity', 0, 1).step(0.01).listen();
    opacityLayer1.onChange(function(value) {
      uniformsLayer1.uOpacity.value = value;
    });

    let layer1LutUpdate = layer1Folder.add(layer1, 'lut', lutLayer1.lutsAvailable());
    layer1LutUpdate.onChange(function(value) {
      window.console.log(value);
      lutLayer1.lut = value;
      // propagate to shaders
      uniformsLayer1.uLut.value = 1;
      uniformsLayer1.uTextureLUT.value = lutLayer1.texture;
    });

    let layer1MixUpdate = layer1Folder.add(layer1, 'mix');
    layer1MixUpdate.onChange(function(value) {
      if (value) {
        uniformsLayer1.uMix.value = 1;
      } else {
        uniformsLayer1.uMix.value = 0;
      }
    });

    let layer1TrackMouseUpdate = layer1Folder.add(layer1, 'trackMouse');
    layer1TrackMouseUpdate.onChange(function(value) {
      if (value) {
        uniformsLayer1.uTrackMouse.value = 1;
      } else {
        uniformsLayer1.uTrackMouse.value = 0;
      }
    });

    layer1Folder.open();

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
    });

    // camera
    let cameraFolder = gui.addFolder('Camera');
    let invertRows = cameraFolder.add(camUtils, 'invertRows');
    invertRows.onChange(function() {
      camera.invertRows();
    });

    let invertColumns = cameraFolder.add(camUtils, 'invertColumns');
    invertColumns.onChange(function() {
      camera.invertColumns();
    });

    let rotate = cameraFolder.add(camUtils, 'rotate');
    rotate.onChange(function() {
      camera.rotate();
    });

    cameraFolder.open();
    // set default view
    camera.invertColumns();
    camera.invertRows();

    function onWindowResize() {
      let threeD = document.getElementById('r3d');
      camera.canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight
      };
      camera.fitBox(2);

      renderer.setSize(threeD.clientWidth, threeD.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    // mouse move cb
    window.addEventListener('mousemove', onMouseMove, false);
  }

  function handleSeries() {
    // cleanup the loader and its progress bar
    loader.free();
    loader = null;
    //
    // first stack of first series
    let mergedSeries = seriesContainer[0].mergeSeries(seriesContainer);
    let stack2 = null;
    if (mergedSeries[0].seriesInstanceUID === 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/patient1/7001_t1_average_BRAINSABC.nii.gz') {
      stack  = mergedSeries[1].stack[0];
      stack2 = mergedSeries[0]._stack[0];
    } else {
      stack  = mergedSeries[0].stack[0];
      stack2 = mergedSeries[1]._stack[0];
    }
    stack  = mergedSeries[1].stack[0];
    let stackHelper = new HelpersStack(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.visible = false;

    sceneBase.add(stackHelper);

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
    uniformsLayer1 = ShadersLayer.uniforms();
    uniformsLayer1.uTextureSize.value = stack2.textureSize;
    uniformsLayer1.uTextureContainer.value = textures2;
    uniformsLayer1.uWorldToData.value = stack2.lps2IJK;
    uniformsLayer1.uNumberOfChannels.value = stack2.numberOfChannels;
    uniformsLayer1.uBitsAllocated.value = stack2.bitsAllocated;
    uniformsLayer1.uWindowCenterWidth.value = [stack2.windowCenter, stack2.windowWidth];
    uniformsLayer1.uRescaleSlopeIntercept.value = [stack2.rescaleSlope, stack2.rescaleIntercept];
    uniformsLayer1.uTextureBackTest.value = sceneBaseTextureTarget.texture;
    uniformsLayer1.uDataDimensions.value = [stack2.dimensionsIJK.x,
                                                stack2.dimensionsIJK.y,
                                                stack2.dimensionsIJK.z];
    uniformsLayer1.uMix.value = 1;
    uniformsLayer1.uTrackMouse.value = 1;
    uniformsLayer1.uMouse.value = new THREE.Vector2(0, 0);
    uniformsLayer1.uMinMax.value = stack2.minMax;

    window.console.log(uniformsLayer1);

    materialLayer1 = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: uniformsLayer1,
      vertexShader: glslify('../../src/shaders/shaders.raycasting.secondPass.vert'),
      fragmentShader: glslify('../../src/shaders/shaders.layer.frag')
    });

    // add mesh in this scene with right shaders...
    meshLayer1 = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
    // go the LPS space
    meshLayer1.applyMatrix(stack2._ijk2LPS);
    sceneLayer1.add(meshLayer1);

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
      [[0, 0, 0, 0], [1, 1, 1, 1]],
      [[0, 1], [1, 1]]);
    lutLayer1.luts = HelpersLut.presetLuts();
    layer1.lut = lutLayer1;

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
};
