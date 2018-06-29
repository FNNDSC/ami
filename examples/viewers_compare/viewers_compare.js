/* globals Stats, dat*/

import CamerasOrthographic from 'base/cameras/cameras.orthographic';
import ControlsOrthographic from 'base/controls/controls.trackballortho';
import HelpersLut from 'base/helpers/helpers.lut';
import HelpersStack from 'base/helpers/helpers.stack';
import LoadersVolume from 'base/loaders/loaders.volume';

import ShadersLayerUniform from 'base/shaders/shaders.layer.uniform';
import ShadersLayerVertex from 'base/shaders/shaders.layer.vertex';
import ShadersLayerFragment from 'base/shaders/shaders.layer.fragment';
import ShadersUniform from 'base/shaders/shaders.data.uniform';
import ShadersVertex from 'base/shaders/shaders.data.vertex';
import ShadersFragment from 'base/shaders/shaders.data.fragment';

// standard global letiables
let controls;
let renderer;
let camera;
let statsyay;
let threeD;
//
let mouse = {
  x: 0,
  y: 0,
};

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / threeD.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / threeD.clientHeight) * 2 + 1;

  // push to shaders
  uniformsLayerMix.uMouse.value = new THREE.Vector2(mouse.x, mouse.y);
}

//
let sceneLayer0TextureTarget;
let sceneLayer1TextureTarget;
//
let sceneLayer0;
//
let lutLayer0;
let sceneLayer1;
let meshLayer1;
let uniformsLayer1;
let materialLayer1;
let lutLayer1;
let sceneLayerMix;
let meshLayerMix;
let uniformsLayerMix;
let materialLayerMix;

let layer1 = {
  opacity: 1.0,
  lut: null,
  interpolation: 1,
};

let layerMix = {
  opacity0: 1.0,
  opacity1: 1.0,
  type0: 0,
  type1: 1,
  trackMouse: true,
};

function render() {
  // render
  controls.update();
  // render first layer offscreen
  renderer.render(sceneLayer0, camera, sceneLayer0TextureTarget, true);
  // render second layer offscreen
  renderer.render(sceneLayer1, camera, sceneLayer1TextureTarget, true);
  // mix the layers and render it ON screen!
  renderer.render(sceneLayerMix, camera);
  statsyay.update();
}

// FUNCTIONS
function init() {
  // this function is executed on each animation frame
  function animate() {
    render();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  renderer.setClearColor(0x3F51B5, 1);

  threeD.appendChild(renderer.domElement);

  // stats
  statsyay = new Stats();
  threeD.appendChild(statsyay.domElement);

  // scene
  sceneLayer0 = new THREE.Scene();
  sceneLayer1 = new THREE.Scene();
  sceneLayerMix = new THREE.Scene();

  // render to texture!!!!
  sceneLayer0TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
  });

  sceneLayer1TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
     magFilter: THREE.NearestFilter,
     format: THREE.RGBAFormat,
  });

  // camera
  camera = new CamerasOrthographic(
    threeD.clientWidth / -2, threeD.clientWidth / 2,
    threeD.clientHeight / 2, threeD.clientHeight / -2,
    0.1, 10000);

  // controls
  controls = new ControlsOrthographic(camera, threeD);
  controls.staticMoving = true;
  controls.noRotate = true;
  camera.controls = controls;

  animate();
}

window.onload = function() {
  // init threeJS...
  init();

  let data = [
    'patient1/7001_t1_average_BRAINSABC.nii.gz',
    'patient2/7002_t1_average_BRAINSABC.nii.gz',
  ];

  let files = data.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/' + v;
  });

  function buildGUI(stackHelper) {
    function updateLayer1() {
      // update layer1 geometry...
      if (meshLayer1) {
        meshLayer1.geometry.dispose();
        meshLayer1.geometry = stackHelper.slice.geometry;
        meshLayer1.geometry.verticesNeedUpdate = true;
      }
    }

    function updateLayerMix() {
      // update layer1 geometry...
      if (meshLayerMix) {
        sceneLayerMix.remove(meshLayerMix);
        meshLayerMix.material.dispose();
        // meshLayerMix.material = null;
        meshLayerMix.geometry.dispose();
        // meshLayerMix.geometry = null;

        // add mesh in this scene with right shaders...
        meshLayerMix =
          new THREE.Mesh(stackHelper.slice.geometry, materialLayerMix);
        // go the LPS space
        meshLayerMix.applyMatrix(stackHelper.stack._ijk2LPS);

        sceneLayerMix.add(meshLayerMix);
      }
    }

    let stack = stackHelper._stack;

    let gui = new dat.GUI({
            autoPlace: false,
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    //
    // layer 0 folder
    //
    let layer0Folder = gui.addFolder('Layer 0 (Base)');
    layer0Folder.add(
      stackHelper.slice, 'windowWidth', 1, stack.minMax[1]).step(1).listen();
    layer0Folder.add(
      stackHelper.slice, 'windowCenter',
      stack.minMax[0], stack.minMax[1]).step(1).listen();
    layer0Folder.add(stackHelper.slice, 'intensityAuto');
    layer0Folder.add(stackHelper.slice, 'invert');

    let lutUpdate = layer0Folder.add(
      stackHelper.slice, 'lut', lutLayer0.lutsAvailable());
    lutUpdate.onChange(function(value) {
      lutLayer0.lut = value;
      stackHelper.slice.lutTexture = lutLayer0.texture;
    });

    let indexUpdate = layer0Folder.add(
      stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();
    indexUpdate.onChange(function() {
      updateLayer1();
      updateLayerMix();
    });

    layer0Folder.add(stackHelper.slice, 'interpolation', 0, 1).step(1).listen();

    layer0Folder.open();

    //
    // layer 1 folder
    //
    let layer1Folder = gui.addFolder('Layer 1');
    let interpolationLayer1 =
      layer1Folder.add(layer1, 'interpolation', 0, 1).step(1).listen();
    interpolationLayer1.onChange(function(value) {
      uniformsLayer1.uInterpolation.value = value;
      // re-compute shaders
      let fs = new ShadersFragment(uniformsLayer1);
      materialLayer1.fragmentShader = fs.compute();
      materialLayer1.needsUpdate = true;
    });
    let layer1LutUpdate =
      layer1Folder.add(layer1, 'lut', lutLayer1.lutsAvailable());
    layer1LutUpdate.onChange(function(value) {
      lutLayer1.lut = value;
      // propagate to shaders
      uniformsLayer1.uLut.value = 1;
      uniformsLayer1.uTextureLUT.value = lutLayer1.texture;
    });

    layer1Folder.open();

    //
    // layer mix folder
    //
    let layerMixFolder = gui.addFolder('Layer Mix');
    let opacityLayerMix = layerMixFolder.add(layerMix, 'opacity1', 0, 1).step(0.01).listen();
    opacityLayerMix.onChange(function(value) {
      uniformsLayerMix.uOpacity1.value = value;
    });

    let layerMixTrackMouseUpdate = layerMixFolder.add(layerMix, 'trackMouse');
    layerMixTrackMouseUpdate.onChange(function(value) {
      if (value) {
        uniformsLayerMix.uTrackMouse.value = 1;
      } else {
        uniformsLayerMix.uTrackMouse.value = 0;
      }
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

    function onWindowResize() {
      let threeD = document.getElementById('r3d');
      camera.canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight,
      };
      camera.fitBox(2);

      sceneLayer0TextureTarget.setSize(threeD.clientWidth, threeD.clientHeight);
      sceneLayer1TextureTarget.setSize(threeD.clientWidth, threeD.clientHeight);

      renderer.setSize(threeD.clientWidth, threeD.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    // mouse move cb
    window.addEventListener('mousemove', onMouseMove, false);
  }

  let loader = new LoadersVolume(threeD);
  function handleSeries() {
    //
    // first stack of first series
    let mergedSeries = loader.data[0].mergeSeries(loader.data);
    loader.free();
    loader = null;

    let stack = null;
    let stack2 = null;

    if (mergedSeries[0].seriesInstanceUID !== 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/slicer_brain/patient1/7001_t1_average_BRAINSABC.nii.gz') {
      stack = mergedSeries[1].stack[0];
      stack2 = mergedSeries[0].stack[0];
    } else {
      stack = mergedSeries[0].stack[0];
      stack2 = mergedSeries[1].stack[0];
    }

    stack = mergedSeries[0].stack[0];
    stack2 = mergedSeries[1].stack[0];

    let stackHelper = new HelpersStack(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.visible = false;

    sceneLayer0.add(stackHelper);

    //
    // create layer 1....

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

    //
    // create material && mesh then add it to sceneLayer1
    uniformsLayer1 = ShadersUniform.uniforms();
    uniformsLayer1.uTextureSize.value = stack2.textureSize;
    uniformsLayer1.uTextureContainer.value = textures2;
    uniformsLayer1.uWorldToData.value = stack2.lps2IJK;
    uniformsLayer1.uNumberOfChannels.value = stack2.numberOfChannels;
    uniformsLayer1.uBitsAllocated.value = stack2.bitsAllocated;
    uniformsLayer1.uPackedPerPixel.value = stack2.packedPerPixel;
    uniformsLayer1.uWindowCenterWidth.value = [stack2.windowCenter, stack2.windowWidth];
    uniformsLayer1.uRescaleSlopeIntercept.value = [stack2.rescaleSlope, stack2.rescaleIntercept];
    uniformsLayer1.uDataDimensions.value = [stack2.dimensionsIJK.x,
                                                stack2.dimensionsIJK.y,
                                                stack2.dimensionsIJK.z];
    uniformsLayer1.uLowerUpperThreshold.value = [...stack2.minMax];

    // generate shaders on-demand!
    let fs = new ShadersFragment(uniformsLayer1);
    let vs = new ShadersVertex();
    materialLayer1 = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: uniformsLayer1,
      vertexShader: vs.compute(),
      fragmentShader: fs.compute(),
    });

    // add mesh in this scene with right shaders...
    meshLayer1 = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
    // go the LPS space
    meshLayer1.applyMatrix(stack._ijk2LPS);
    sceneLayer1.add(meshLayer1);

    //
    // Create the Mix layer
    uniformsLayerMix = ShadersLayerUniform.uniforms();
    uniformsLayerMix.uTextureBackTest0.value = sceneLayer0TextureTarget.texture;
    uniformsLayerMix.uTextureBackTest1.value = sceneLayer1TextureTarget.texture;
    uniformsLayerMix.uTrackMouse.value = 1;
    uniformsLayerMix.uMouse.value = new THREE.Vector2(0, 0);

    // generate shaders on-demand!
    let fls = new ShadersLayerFragment(uniformsLayerMix);
    let vls = new ShadersLayerVertex();
    materialLayerMix = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: uniformsLayerMix,
      vertexShader: vls.compute(),
      fragmentShader: fls.compute(),
      transparent: true,
    });

    // add mesh in this scene with right shaders...
    meshLayerMix = new THREE.Mesh(stackHelper.slice.geometry, materialLayerMix);
    // go the LPS space
    meshLayerMix.applyMatrix(stack._ijk2LPS);
    sceneLayerMix.add(meshLayerMix);

    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    // box: {halfDimensions, center}
    let box = {
      center: stack.worldCenter().clone(),
      halfDimensions:
        new THREE.Vector3(lpsDims.x + 50, lpsDims.y + 50, lpsDims.z + 50),
    };

    // init and zoom
    let canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight,
      };

    camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    camera.box = box;
    camera.canvas = canvas;
    camera.update();
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

  // load sequence for each file
  loader.load(files)
  .then(function() {
    handleSeries();
    // force 1st render
    render();
    // notify puppeteer to take screenshot
    const puppetDiv = document.createElement('div');
    puppetDiv.setAttribute('id', 'puppeteer');
    document.body.appendChild(puppetDiv);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
};
