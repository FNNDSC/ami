/* globals Stats, dat*/

import CamerasOrthographic from 'base/cameras/cameras.orthographic';
import ControlsOrthographic from 'base/controls/controls.trackballortho';
import HelpersLut from 'base/helpers/helpers.lut';
import HelpersStack from 'base/helpers/helpers.stack';
import LoadersVolume from 'base/loaders/loaders.volume';


import ShadersLayerUniform from 'base/shaders/shaders.layer.uniform';
import ShadersLayerVertex from 'base/shaders/shaders.layer.vertex';
import ShadersLayerFragment from 'base/shaders/shaders.layer.fragment';
import ShadersDataUniform from 'base/shaders/shaders.data.uniform';
import ShadersDataVertex from 'base/shaders/shaders.data.vertex';
import ShadersDataFragment from 'base/shaders/shaders.data.fragment';

// standard global letiables
let controls;
let renderer;
let camera;
let statsyay;
let threeD;
//
let sceneLayer0TextureTarget;
let sceneLayer1TextureTarget;
//
let sceneLayer0;
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

let layerMix = {
  opacity1: 1.0,
  lut: null,
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

/**
 * Init the labelmap app
 */
function init() {
  /**
   * Function is executed on each animation frame
   */
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
  renderer.setClearColor(0x607D8B, 1);

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

  let filenames = [
    '000000.dcm', '000001.dcm', '000002.dcm', '000003.dcm', '000004.dcm',
    '000005.dcm', '000006.dcm', '000007.dcm', '000008.dcm', '000009.dcm',
    '000010.dcm',
    '000011.dcm', '000012.dcm', '000013.dcm', '000014.dcm', '000015.dcm',
    '000016.dcm', '000017.dcm', '000018.dcm', '000019.dcm', '000020.dcm',
    '000021.dcm',
    '000022.dcm', '000023.dcm', '000024.dcm', '000025.dcm', '000026.dcm',
    '000027.dcm', '000028.dcm', '000029.dcm', '000030.dcm', '000031.dcm',
    '000032.dcm',
    '000033.dcm', '000034.dcm', '000035.dcm', '000036.dcm', '000037.dcm',
    '000038.dcm', '000039.dcm', '000040.dcm', '000041.dcm', '000042.dcm',
    '000043.dcm',
    '000044.dcm', '000045.dcm', '000046.dcm', '000047.dcm', '000048.dcm',
    '000049.dcm', '000050.dcm', '000051.dcm', '000052.dcm', '000053.dcm',
    '000054.dcm',
    '000055.dcm', '000056.dcm', '000057.dcm', '000058.dcm', '000059.dcm',
    '000060.dcm', '000061.dcm', '000062.dcm', '000063.dcm', '000064.dcm',
    '000065.dcm',
    '000066.dcm', '000067.dcm', '000068.dcm', '000069.dcm', '000070.dcm',
    '000071.dcm', '000072.dcm', '000073.dcm', '000074.dcm', '000075.dcm',
    '000076.dcm',
    '000077.dcm', '000078.dcm', '000079.dcm', '000080.dcm', '000081.dcm',
    '000082.dcm', '000083.dcm', '000084.dcm', '000085.dcm', '000086.dcm',
    '000087.dcm',
    '000088.dcm', '000089.dcm', '000090.dcm', '000091.dcm', '000092.dcm',
    '000093.dcm', '000094.dcm', '000095.dcm', '000096.dcm', '000097.dcm',
    '000098.dcm',
    '000099.dcm', '000100.dcm', '000101.dcm', '000102.dcm', '000103.dcm',
    '000104.dcm', '000105.dcm', '000106.dcm', '000107.dcm', '000108.dcm',
    '000109.dcm',
    '000110.dcm', '000111.dcm', '000112.dcm', '000113.dcm', '000114.dcm',
    '000115.dcm', '000116.dcm', '000117.dcm', '000118.dcm', '000119.dcm',
    '000120.dcm',
    '000121.dcm', '000122.dcm', '000123.dcm', '000124.dcm', '000125.dcm',
    '000126.dcm', '000127.dcm', '000128.dcm', '000129.dcm', '000130.dcm',
    '000131.dcm',
    '000132.dcm', '000133.dcm', '000134.dcm', '000135.dcm', '000136.dcm',
    '000137.dcm', '000138.dcm', '000139.dcm', '000140.dcm', '000141.dcm',
    '000142.dcm',
    '000143.dcm', '000144.dcm', '000145.dcm', '000146.dcm', '000147.dcm',
    '000148.dcm', '000149.dcm', '000150.dcm', '000151.dcm', '000152.dcm',
    '000153.dcm',
    '000154.dcm', '000155.dcm', '000156.dcm', '000157.dcm', '000158.dcm',
    '000159.dcm', '000160.dcm', '000161.dcm', '000162.dcm', '000163.dcm',
    '000164.dcm',
    '000165.dcm', '000166.dcm', '000167.dcm', '000168.dcm', '000169.dcm',
    '000170.dcm', '000171.dcm', '000172.dcm', '000173.dcm', '000174.dcm',
    '000175.dcm',
    '000176.dcm', '000177.dcm', '000178.dcm', '000179.dcm', '000180.dcm',
    '000181.dcm', '000182.dcm', '000183.dcm', '000184.dcm', '000185.dcm',
    '000186.dcm',
    '000187.dcm', '000188.dcm', '000189.dcm', '000190.dcm', '000191.dcm',
    '000192.dcm', '000193.dcm', '000194.dcm', '000195.dcm', '000196.dcm',
    '000197.dcm',
    '000198.dcm', '000199.dcm', '000200.dcm', '000201.dcm', '000202.dcm',
    '000203.dcm', '000204.dcm', '000205.dcm', '000206.dcm', '000207.dcm',
    '000208.dcm',
    '000209.dcm', '000210.dcm', '000211.dcm', '000212.dcm', '000213.dcm',
    '000214.dcm', '000215.dcm', '000216.dcm', '000217.dcm', '000218.dcm',
    '000219.dcm',
    '000220.dcm', '000221.dcm', '000222.dcm', '000223.dcm', '000224.dcm',
    '000225.dcm', '000226.dcm', '000227.dcm', '000228.dcm', '000229.dcm',
    '000230.dcm',
    '000231.dcm', '000232.dcm', '000233.dcm', '000234.dcm', '000235.dcm',
    '000236.dcm', '000237.dcm', '000238.dcm', '000239.dcm', '000240.dcm',
    '000241.dcm',
    '000242.dcm', '000243.dcm', '000244.dcm', '000245.dcm', '000246.dcm',
    '000247.dcm', '000248.dcm', '000249.dcm', '000250.dcm', '000251.dcm',
    '000252.dcm',
    '000253.dcm', '000254.dcm', '000255.dcm', '000256.dcm', '000257.dcm',
    '000258.dcm', '000259.dcm', '000260.dcm', '000261.dcm', '000262.dcm',
    '000263.dcm',
    '000264.dcm', '000265.dcm', '000266.dcm', '000267.dcm', '000268.dcm',
    '000269.dcm', '000270.dcm', '000271.dcm', '000272.dcm', '000273.dcm',
    '000274.dcm',
    '000275.dcm', '000276.dcm', '000277.dcm', '000278.dcm', '000279.dcm',
    '000280.dcm', '000281.dcm', '000282.dcm', '000283.dcm', '000284.dcm',
    '000285.dcm',
    '000286.dcm', '000287.dcm', '000288.dcm', '000289.dcm', '000290.dcm',
    '000291.dcm', '000292.dcm', '000293.dcm', '000294.dcm', '000295.dcm',
    '000296.dcm',
    '000297.dcm', '000298.dcm',
  ];

  let files = filenames.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/rsna_2/PET/' + v;
  });

  files.push(
    'https://cdn.rawgit.com/FNNDSC/data/master/dicom/rsna_2/SEG/3DSlicer/tumor_User1_Manual_Trial1.dcm');

  // load sequence for each file
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);

  /**
   * Build the GUI
   */
  function buildGUI(stackHelper) {
    /**
     * Update Layer 1
     */
    function updateLayer1() {
      // update layer1 geometry...
      if (meshLayer1) {
        meshLayer1.geometry.dispose();
        meshLayer1.geometry = stackHelper.slice.geometry;
        meshLayer1.geometry.verticesNeedUpdate = true;
      }
    }

    /**
     * Update Layer Mix
     */
    function updateLayerMix() {
      // update layer1 geometry...
      if (meshLayerMix) {
        sceneLayerMix.remove(meshLayerMix);
        meshLayerMix.material.dispose();
        meshLayerMix.material = null;
        meshLayerMix.geometry.dispose();
        meshLayerMix.geometry = null;

        // add mesh in this scene with right shaders...
        meshLayerMix = new THREE.Mesh(
          stackHelper.slice.geometry, materialLayerMix);
        // go the LPS space
        meshLayerMix.applyMatrix(stackHelper.stack._ijk2LPS);

        sceneLayerMix.add(meshLayerMix);
      }
    }

    let stack = stackHelper.stack;

    let gui = new dat.GUI({
            autoPlace: false,
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let layer0Folder = gui.addFolder('PET');
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

    layer0Folder.add(
      stackHelper.slice, 'interpolation', 0, 1).step(1).listen();

    layer0Folder.open();

    // layer mix folder
    let layerMixFolder = gui.addFolder('Segmentation');
    let opacityLayerMix1 = layerMixFolder.add(
      layerMix, 'opacity1', 0, 1).step(0.01);
    opacityLayerMix1.onChange(function(value) {
      uniformsLayerMix.uOpacity1.value = value;
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

    /**
     * On window resize callback
     */
    function onWindowResize() {
      let threeD = document.getElementById('r3d');
      camera.canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight,
      };
      camera.fitBox(2);

      renderer.setSize(threeD.clientWidth, threeD.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
  }

  /**
   * Handle series
   */
  function handleSeries() {
    //
    //
    // first stack of first series
    let mergedSeries = loader.data[0].mergeSeries(loader.data);
    loader.free();
    loader = null;

    let stack = mergedSeries[0].stack[0];
    let stack2 = mergedSeries[1].stack[0];

    if (stack.modality === 'SEG') {
      stack = mergedSeries[0].stack[0];
      stack2 = mergedSeries[1].stack[0];
    }

    let stackHelper = new HelpersStack(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.visible = false;
    stackHelper.index = 247;

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
    uniformsLayer1 = ShadersDataUniform.uniforms();
    uniformsLayer1.uTextureSize.value = stack2.textureSize;
    uniformsLayer1.uTextureContainer.value = textures2;
    uniformsLayer1.uWorldToData.value = stack2.lps2IJK;
    uniformsLayer1.uNumberOfChannels.value = stack2.numberOfChannels;
    uniformsLayer1.uPixelType.value = stack2.pixelType;
    uniformsLayer1.uPackedPerPixel.value = stack2.packedPerPixel;
    uniformsLayer1.uBitsAllocated.value = stack2.bitsAllocated;
    uniformsLayer1.uWindowCenterWidth.value =
      [stack2.windowCenter, stack2.windowWidth];
    uniformsLayer1.uRescaleSlopeIntercept.value =
      [stack2.rescaleSlope, stack2.rescaleIntercept];
    uniformsLayer1.uDataDimensions.value = [stack2.dimensionsIJK.x,
                                            stack2.dimensionsIJK.y,
                                            stack2.dimensionsIJK.z];
    uniformsLayer1.uInterpolation.value = 0;
    uniformsLayer1.uLowerUpperThreshold.value = [...stack2.minMax];

    // generate shaders on-demand!
    let fs = new ShadersDataFragment(uniformsLayer1);
    let vs = new ShadersDataVertex();
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

    // Create the Mix layer
    uniformsLayerMix = ShadersLayerUniform.uniforms();
    uniformsLayerMix.uTextureBackTest0.value = sceneLayer0TextureTarget.texture;
    uniformsLayerMix.uTextureBackTest1.value = sceneLayer1TextureTarget.texture;

    let fls = new ShadersLayerFragment(uniformsLayerMix);
    let vls = new ShadersLayerVertex();
    materialLayerMix = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
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

    //
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
      new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
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
    lutLayer0.lut = 'random';
    stackHelper.slice.lut = 1;
    stackHelper.slice.lutTexture = lutLayer0.texture;

    lutLayer1 = new HelpersLut(
      'my-lut-canvases-l1',
      'default',
      'linear',
      stack2.segmentationLUT,
      stack2.segmentationLUTO,
      true);
    uniformsLayer1.uLut.value = 1;
    uniformsLayer1.uTextureLUT.value = lutLayer1.texture;

    buildGUI(stackHelper);
  }

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
