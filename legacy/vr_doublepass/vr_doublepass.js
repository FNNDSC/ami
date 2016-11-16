/* globals Stats, dat*/

import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersLut        from '../../src/helpers/helpers.lut';
import LoadersVolume     from '../../src/loaders/loaders.volume';
import ShadersRaycasting from '../../src/shaders/shaders.raycasting';

let glslify = require('glslify');

// standard global letiables
let controls, threeD, renderer, stats, camera, sceneRTT, sceneScreen, uniformsSecondPass;
let rtTexture;
let lut;
let ready = false;

let myStack = {
  lut: 'walking_dead',
  opacity: 'linear',
  steps: 256,
  alphaCorrection: 0.5,
  frequence: 0,
  amplitude: 0
};

function onMouseDown() {
  if (uniformsSecondPass) {
    uniformsSecondPass.uSteps.value = Math.floor(myStack.steps / 2);
  }
}

function onMouseUp() {
  if (uniformsSecondPass) {
    uniformsSecondPass.uSteps.value = myStack.steps;
  }
}

function onWindowResize() {
  // update the camera
  camera.aspect = threeD.offsetWidth / threeD.offsetHeight;
  camera.updateProjectionMatrix();

  // notify the renderer of the size change
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
}

function buildGUI() {
  let gui = new dat.GUI({
            autoPlace: false
          });

  let customContainer = document.getElementById('my-gui-container');
  customContainer.appendChild(gui.domElement);

  let stackFolder = gui.addFolder('Settings');
  let lutUpdate = stackFolder.add(myStack, 'lut', lut.lutsAvailable());
  lutUpdate.onChange(function(value) {
      lut.lut = value;
      uniformsSecondPass.uTextureLUT.value.dispose();
      uniformsSecondPass.uTextureLUT.value = lut.texture;
    });
  // init LUT
  lut.lut = myStack.lut;
  uniformsSecondPass.uTextureLUT.value.dispose();
  uniformsSecondPass.uTextureLUT.value = lut.texture;

  let opacityUpdate = stackFolder.add(myStack, 'opacity', lut.lutsAvailable('opacity'));
  opacityUpdate.onChange(function(value) {
      lut.lutO = value;
      uniformsSecondPass.uTextureLUT.value.dispose();
      uniformsSecondPass.uTextureLUT.value = lut.texture;
    });

  let stepsUpdate = stackFolder.add(myStack, 'steps', 0, 512).step(1);
  stepsUpdate.onChange(function(value) {
      if (uniformsSecondPass) {
        uniformsSecondPass.uSteps.value = value;
      }
    });

  let alphaCorrrectionUpdate = stackFolder.add(myStack, 'alphaCorrection', 0, 1).step(0.01);
  alphaCorrrectionUpdate.onChange(function(value) {
      if (uniformsSecondPass) {
        uniformsSecondPass.uAlphaCorrection.value = value;
      }
    });

  let frequenceUpdate = stackFolder.add(myStack, 'frequence', 0, 1).step(0.01);
  frequenceUpdate.onChange(function(value) {
      if (uniformsSecondPass) {
        uniformsSecondPass.uFrequence.value = value;
      }
    });

  let amplitudeUpdate = stackFolder.add(myStack, 'amplitude', 0, 0.5).step(0.01);
  amplitudeUpdate.onChange(function(value) {
      if (uniformsSecondPass) {
        uniformsSecondPass.uAmplitude.value = value;
      }
    });

  stackFolder.open();
}

function init() {

  // this function is executed on each animation frame
  function animate() {
    // render
    controls.update();

    if (ready) {
      renderer.render(sceneRTT, camera, rtTexture, true);
      renderer.render(sceneScreen, camera);
    }

    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    alpha: true
  });
  renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
  threeD.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  threeD.appendChild(stats.domElement);

  // camera
  camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 0.1, 100000);
  camera.position.x = 166;
  camera.position.y = -471;
  camera.position.z = 153;
  camera.up.set(-0.42, 0.86, 0.26);

  // controls
  controls = new ControlsTrackball(camera, threeD);
  controls.rotateSpeed = 5.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  threeD.addEventListener('mousedown', onMouseDown, false);
  threeD.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('resize', onWindowResize, false);

  // start rendering loop
  animate();
}

window.onload = function() {

  // init threeJS
  init();

  let t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36444420', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242',
    '36748256'
  ];

  let files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  //   let data = [
  //  'scan-00109_rec-01a.nii_.gz'
  //   // '7002_t1_average_BRAINSABC.nii.gz'
  // ];

  // let files = data.map(function(v) {
  //   return '../../data/nii/' + v;
  // });

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  // hookup a progress bar....
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

  // load sequence for all files
  Promise
  .all(loadSequence)
  .then(() => {
    loader.free();
    loader = null;

    let series = seriesContainer[0].mergeSeries(seriesContainer)[0];
    // get first stack from series
    let stack = series.stack[0];
    // prepare and pack it
    stack.prepare();
    stack.pack();

    // box is centered on 0,0,0
    // we want first voxel of the box to be centered on 0,0,0
    // in IJK space
    let boxGeometry = new THREE.BoxGeometry(
      stack.dimensionsIJK.x - 1,
      stack.dimensionsIJK.y - 1,
      stack.dimensionsIJK.z - 1
      );

    // box is centered on 0,0,0
    // we want first voxel of the box to be centered on 0,0,0
    // in IJK space
    let offset = new THREE.Vector3(-0.5, -0.5, -0.5);
    boxGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      stack.halfDimensionsIJK.x + offset.x,
      stack.halfDimensionsIJK.y + offset.y,
      stack.halfDimensionsIJK.z + offset.z)
    );

    // slice material
    let textures = [];
    for (let m = 0; m < stack._rawData.length; m++) {
      let tex = new THREE.DataTexture(
        stack.rawData[m],
        stack.textureSize,
        stack.textureSize,
        stack.textureType,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter);
      tex.needsUpdate = true;
      tex.flipY = true;
      textures.push(tex);
    }

    // Create first pass mesh, scene, and textyre to be rendered to
    //

    // material
    let uniformsFirstPass = ShadersRaycasting.firstPassUniforms();
    uniformsFirstPass.uWorldBBox.value = stack.worldBoundingBox();
    let materialFirstPass = new THREE.ShaderMaterial({
          uniforms: uniformsFirstPass,
          vertexShader: glslify('../../src/shaders/shaders.data.vert'),
          fragmentShader: glslify('../../src/shaders/shaders.raycasting.firstPass.frag'),
          side: THREE.BackSide
        });

    // mesh
    let boxMeshFirstPass = new THREE.Mesh(boxGeometry, materialFirstPass);
    // go the LPS space
    boxMeshFirstPass.applyMatrix(stack._ijk2LPS);

    // scene
    sceneRTT = new THREE.Scene();
    sceneRTT.add(boxMeshFirstPass);

    // target texture
    rtTexture = new THREE.WebGLRenderTarget(window.innerWidth,
                                             window.innerHeight,
                                             {minFilter: THREE.LinearFilter,
                                               magFilter: THREE.NearestFilter,
                                               format: THREE.RGBFormat
                                             });

    // Create second pass mesh and scene
    //

    // material
    uniformsSecondPass = ShadersRaycasting.secondPassUniforms();
    uniformsSecondPass.uTextureSize.value = stack.textureSize;
    uniformsSecondPass.uTextureContainer.value = textures;
    uniformsSecondPass.uWorldToData.value = stack.lps2IJK;
    uniformsSecondPass.uNumberOfChannels.value = stack.numberOfChannels;
    uniformsSecondPass.uBitsAllocated.value = stack.bitsAllocated;
    uniformsSecondPass.uPackedPerPixel.value = stack.packedPerPixel;
    uniformsSecondPass.uWindowCenterWidth.value = [stack.windowCenter, stack.windowWidth * 0.8];
    uniformsSecondPass.uRescaleSlopeIntercept.value = [stack.rescaleSlope, stack.rescaleIntercept];
    uniformsSecondPass.uTextureBack.value = rtTexture;
    uniformsSecondPass.uWorldBBox.value = stack.worldBoundingBox();
    uniformsSecondPass.uDataDimensions.value = [stack.dimensionsIJK.x,
                                                stack.dimensionsIJK.y,
                                                stack.dimensionsIJK.z];
    uniformsSecondPass.uSteps.value = myStack.steps;

    // CREATE LUT
    lut = new HelpersLut('my-lut-canvases');
    lut.luts = HelpersLut.presetLuts();
    lut.lutsO = HelpersLut.presetLutsO();

    uniformsSecondPass.uTextureLUT.value = lut.texture;
    uniformsSecondPass.uLut.value = 1;
    uniformsSecondPass.uAlphaCorrection.value = myStack.alphaCorrection;

    let materialSecondPass = new THREE.ShaderMaterial({
      uniforms: uniformsSecondPass,
      vertexShader: glslify('../../src/shaders/shaders.raycasting.secondPass.vert'),
      fragmentShader: glslify('../../src/shaders/shaders.raycasting.secondPass.frag'),
      side: THREE.FrontSide,
      transparent: true
    });

    // mesh
    let boxMeshSecondPass = new THREE.Mesh(boxGeometry, materialSecondPass);
    // go the LPS space
    boxMeshSecondPass.applyMatrix(stack._ijk2LPS);

    // scene
    sceneScreen = new THREE.Scene();
    sceneScreen.add(boxMeshSecondPass);

    // update camrea's and interactor's target
    let centerLPS = stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    buildGUI();

    let screenshotElt = document.getElementById('screenshot');
    screenshotElt.addEventListener('click', function() {
      controls.update();

      if (ready) {
        renderer.render(sceneRTT, camera, rtTexture, true);
        renderer.render(sceneScreen, camera);
      }

      let screenshot = renderer.domElement.toDataURL();
      screenshotElt.download = 'VJS-' + Date.now() + '.png';
      screenshotElt.href = screenshot;
    });

    // good to go
    ready = true;
  })
  .catch((error) => window.console.log(error));

};
