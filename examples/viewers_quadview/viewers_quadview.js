/* globals Stats, dat*/

import CamerasOrthographic from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersStack from '../../src/helpers/helpers.stack';
import LoadersVolume from '../../src/loaders/loaders.volume';
import ModelsStack from '../../src/models/models.stack';

import ShadersLocalizerUniform from '../../src/shaders/shaders.localizer.uniform';
import ShadersLocalizerVertex from '../../src/shaders/shaders.localizer.vertex';
import ShadersLocalizerFragment from '../../src/shaders/shaders.localizer.fragment';

// standard global variables
let controls0;
let controls1;
let controls2;
let controls3;
let renderer0;
let renderer1;
let renderer2;
let renderer3;
let stats;
let camera0;
let camera1;
let camera2;
let camera3;
let sceneScreen0;
let sceneScreen1;
let sceneScreen2;
let sceneScreen3;
let ready = false;
let stackHelper1;
let stackHelper2;
let stackHelper3;
let threeD0;
let threeD1;
let threeD2;
let threeD3;
let light0;

let localizer3Material;
let localizer3Mesh;
let localizer3Scene;
let localizer3Uniforms;

let localizer1Material;
let localizer1Mesh;
let localizer1Scene;
let localizer1Uniforms;

let localizer2Material;
let localizer2Mesh;
let localizer2Scene;
let localizer2Uniforms;


let dataInfo = [
    ['adi1', {
        location:
          'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/mesh.stl',
        label: 'Left',
        loaded: false,
        material: null,
        materialFront: null,
        materialBack: null,
        mesh: null,
        meshFront: null,
        meshBack: null,
        color: 0xe91e63,
        opacity: 0.7,
    }],
    ['adi2', {
        location:
          'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/mesh2.stl',
        label: 'Right',
        loaded: false,
        material: null,
        materialFront: null,
        materialBack: null,
        mesh: null,
        meshFront: null,
        meshBack: null,
        color: 0x03a9f4,
        opacity: 1,
    }],
];
let data = new Map(dataInfo);

let sceneClip = new THREE.Scene();
let clipPlane1 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
let clipPlane2 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
let clipPlane3 = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);

/**
 * Init the quadview
 */
function init() {
  /**
   * Called on each animation frame
   */
  function animate() {
    // render
    controls0.update();
    controls1.update();
    controls2.update();
    controls3.update();

    if (ready) {
      light0.position.copy(camera0.position);
      renderer0.render(sceneScreen0, camera0);

      // r1
      renderer1.clear();
      renderer1.render(sceneScreen1, camera1);
      // mesh
      renderer1.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane1];
        object.materialBack.clippingPlanes = [clipPlane1];
      });
      renderer1.render(sceneClip, camera1);
      // localizer
      renderer1.clearDepth();
      renderer1.render(localizer1Scene, camera1);

      // r2
      renderer2.clear();
      renderer2.render(sceneScreen2, camera2);
      // mesh
      renderer2.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane2];
        object.materialBack.clippingPlanes = [clipPlane2];
      });
      renderer2.render(sceneClip, camera2);
      // localizer
      renderer2.clearDepth();
      renderer2.render(localizer2Scene, camera2);

      // r3
      renderer3.clear();
      renderer3.render(sceneScreen3, camera3);
      // mesh
      renderer3.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane3];
        object.materialBack.clippingPlanes = [clipPlane3];
      });
      renderer3.render(sceneClip, camera3);
      // localizer
      renderer3.clearDepth();
      renderer3.render(localizer3Scene, camera3);
    }

    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // CREATE RENDERER 0

  // renderer
  threeD0 = document.getElementById('r0');
  renderer0 = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer0.setSize(threeD0.clientWidth, threeD0.clientHeight);
  renderer0.setClearColor(0x212121, 1);
  renderer0.domElement.id = 0;
  threeD0.appendChild(renderer0.domElement);

  // stats
  stats = new Stats();
  threeD0.appendChild(stats.domElement);

  // camera
  camera0 = new THREE.PerspectiveCamera(
    45, threeD0.clientWidth / threeD0.clientHeight, 0.1, 100000);
  camera0.position.x = 250;
  camera0.position.y = 250;
  camera0.position.z = 250;

  // scene 0
  sceneScreen0 = new THREE.Scene();

  // light0
  light0 = new THREE.DirectionalLight(0xffffff, 1);
  light0.position.copy(camera0.position);
  sceneScreen0.add(light0);

  // controls
  controls0 = new ControlsTrackball(camera0, threeD0);
  controls0.rotateSpeed = 5.5;
  controls0.zoomSpeed = 1.2;
  controls0.panSpeed = 0.8;
  controls0.staticMoving = true;
  controls0.dynamicDampingFactor = 0.3;

  // CREATE RENDERER 1
  // RED
  threeD1 = document.getElementById('r1');
  renderer1 = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer1.autoClear = false;
  renderer1.localClippingEnabled = true;
  renderer1.setSize(threeD1.clientWidth, threeD1.clientHeight);
  renderer1.setClearColor(0x121212, 1);
  renderer1.domElement.id = 1;
  threeD1.appendChild(renderer1.domElement);
  // camera
  camera1 = new CamerasOrthographic(
    threeD1.clientWidth / -2, threeD1.clientWidth / 2,
    threeD1.clientHeight / 2, threeD1.clientHeight / -2,
    1, 1000);
  // scene 1
  sceneScreen1 = new THREE.Scene();
  // controls
  controls1 = new ControlsOrthographic(camera1, threeD1);
  controls1.staticMoving = true;
  controls1.noRotate = true;
  camera1.controls = controls1;

  // CREATE RENDERER 2
  // YELLOW
  threeD2 = document.getElementById('r2');
  renderer2 = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer2.autoClear = false;
  renderer2.localClippingEnabled = true;
  renderer2.setSize(threeD2.clientWidth, threeD2.clientHeight);
  renderer2.setClearColor(0x121212, 1);
  renderer2.domElement.id = 2;
  threeD2.appendChild(renderer2.domElement);
  // camera
  camera2 = new CamerasOrthographic(
    threeD2.clientWidth / -2, threeD2.clientWidth / 2,
    threeD2.clientHeight / 2, threeD2.clientHeight / -2,
    1, 1000);
  // scene 2
  sceneScreen2 = new THREE.Scene();
  // controls
  controls2 = new ControlsOrthographic(camera2, threeD2);
  controls2.staticMoving = true;
  controls2.noRotate = true;
  camera2.controls = controls2;

  // CREATE RENDERER 3
  // GREEN
  threeD3 = document.getElementById('r3');
  renderer3 = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer3.autoClear = false;
  renderer3.localClippingEnabled = true;
  renderer3.setSize(threeD3.clientWidth, threeD3.clientHeight);
  renderer3.setClearColor(0x121212, 1);
  renderer3.domElement.id = 3;
  threeD3.appendChild(renderer3.domElement);
  // camera
  camera3 = new CamerasOrthographic(
    threeD3.clientWidth / -2, threeD3.clientWidth / 2,
    threeD3.clientHeight / 2, threeD3.clientHeight / -2,
    1, 1000);
  // scene 3
  sceneScreen3 = new THREE.Scene();
  // controls
  controls3 = new ControlsOrthographic(camera3, threeD3);
  controls3.staticMoving = true;
  controls3.noRotate = true;
  camera3.controls = controls3;

  // start rendering loop
  animate();
}

window.onload = function() {
  // init threeJS
  init();

  let t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242',
    '36748256', '36444434', '36444448', '36444462', '36444476',
  ];

  let files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume();
  loader.load(files)
  .then(function() {
    let series = loader.data[0].mergeSeries(loader.data)[0];
    loader.free();
    loader = null;
    // get first stack from series
    let stack = series.stack[0];
    stack.prepare();

    //
    // CREATE THE BOUNDING BOX
    //

    // box geometry
    let boxGeometry = new THREE.BoxGeometry(
      stack.dimensionsIJK.x,
      stack.dimensionsIJK.y,
      stack.dimensionsIJK.z
      );

    // we use this offsect to center the first voxel on (0, 0, 0)
    // in IJK space (is it correct?)
    let offset = new THREE.Vector3(-0.5, -0.5, -0.5);

    // box is centered on 0,0,0
    // we want first voxel of the box to be centered on 0,0,0
    // in IJK space
    boxGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      stack.halfDimensionsIJK.x + offset.x,
      stack.halfDimensionsIJK.y + offset.y,
      stack.halfDimensionsIJK.z + offset.z)
    );

    // scene
    let boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
    });
    let boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.applyMatrix(stack.ijk2LPS);
    let boxHelper = new THREE.BoxHelper(boxMesh, 0xffffff);
    sceneScreen0.add(boxHelper);

    // update camrea's and interactor's target
    let centerLPS = stack.worldCenter();
    // update camera's target
    camera0.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera0.updateProjectionMatrix();
    controls0.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    // Fill renderer 2
    // RED
    stackHelper1 = new HelpersStack(stack);
    stackHelper1.orientation = 2;
    stackHelper1.bbox.visible = false;
    stackHelper1.borderColor = 0xFF1744;
    stackHelper1.slice.canvasWidth = threeD1.clientWidth;
    stackHelper1.slice.canvasHeight = threeD1.clientHeight;
    // scene
    sceneScreen1.add(stackHelper1);
    sceneScreen0.add(sceneScreen1);

    // Fill renderer 3
    stackHelper2 = new HelpersStack(stack);
    stackHelper2.orientation = 1;
    stackHelper2.bbox.visible = false;
    stackHelper2.borderColor = 0xFFEA00;
    stackHelper2.slice.canvasWidth = threeD2.clientWidth;
    stackHelper2.slice.canvasHeight = threeD2.clientHeight;
    // scene
    sceneScreen2.add(stackHelper2);
    sceneScreen0.add(sceneScreen2);

    // Fill renderer 4
    stackHelper3 = new HelpersStack(stack);
    stackHelper3.orientation = 0;
    stackHelper3.bbox.visible = false;
    stackHelper3.borderColor = 0x76FF03;
    stackHelper3.slice.canvasWidth = threeD3.clientWidth;
    stackHelper3.slice.canvasHeight = threeD3.clientHeight;
    // scene
    sceneScreen3.add(stackHelper3);
    sceneScreen0.add(sceneScreen3);

    // create new mesh with Localizer shaders
    let plane1 = stackHelper1.slice.cartesianEquation();
    let plane2 = stackHelper2.slice.cartesianEquation();
    let plane3 = stackHelper3.slice.cartesianEquation();

    // localizer material
    localizer1Uniforms = ShadersLocalizerUniform.uniforms();
    // l2
    localizer1Uniforms.uPlane2.value = plane2;
    localizer1Uniforms.uPlaneColor2.value =
      new THREE.Color(stackHelper2.borderColor);
    // l3
    localizer1Uniforms.uPlane3.value = plane3;
    localizer1Uniforms.uPlaneColor3.value =
      new THREE.Color(stackHelper3.borderColor);
    // ref
    localizer1Uniforms.uSlice.value = plane1;
    // update info to draw borders properly
    localizer1Uniforms.uCanvasWidth.value = threeD1.clientWidth;
    localizer1Uniforms.uCanvasHeight.value = threeD1.clientHeight;
    // generate shaders on-demand!
    let fs1 = new ShadersLocalizerFragment(localizer1Uniforms);
    let vs1 = new ShadersLocalizerVertex();
    localizer1Material = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: localizer1Uniforms,
      vertexShader: vs1.compute(),
      fragmentShader: fs1.compute(),
    });
    localizer1Material.transparent = true;
    localizer1Mesh = new THREE.Mesh(
      stackHelper1.slice.geometry, localizer1Material);
    localizer1Mesh.applyMatrix(stackHelper1.stack._ijk2LPS);
    localizer1Scene = new THREE.Scene();
    localizer1Scene.add(localizer1Mesh);

    // localizer material
    localizer2Uniforms = ShadersLocalizerUniform.uniforms();
    // l1
    localizer2Uniforms.uPlane1.value = plane1;
    localizer2Uniforms.uPlaneColor1.value =
      new THREE.Color(stackHelper1.borderColor);
    // l2
    localizer2Uniforms.uPlane3.value = plane3;
    localizer2Uniforms.uPlaneColor3.value =
      new THREE.Color(stackHelper3.borderColor);
    // ref
    localizer2Uniforms.uSlice.value = plane1;
    // update info to draw borders properly
    localizer2Uniforms.uCanvasWidth.value = threeD2.clientWidth;
    localizer2Uniforms.uCanvasHeight.value = threeD2.clientHeight;
    // generate shaders on-demand!
    let fs2 = new ShadersLocalizerFragment(localizer2Uniforms);
    let vs2 = new ShadersLocalizerVertex();
    localizer2Material = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: localizer2Uniforms,
      vertexShader: vs2.compute(),
      fragmentShader: fs2.compute(),
    });
    localizer2Material.transparent = true;
    localizer2Mesh = new THREE.Mesh(
      stackHelper2.slice.geometry, localizer2Material);
    localizer2Mesh.applyMatrix(stackHelper2.stack._ijk2LPS);
    localizer2Scene = new THREE.Scene();
    localizer2Scene.add(localizer2Mesh);

    // localizer material
    localizer3Uniforms = ShadersLocalizerUniform.uniforms();
    // l1
    localizer3Uniforms.uPlane1.value = plane1;
    localizer3Uniforms.uPlaneColor1.value =
      new THREE.Color(stackHelper1.borderColor);
    // l2
    localizer3Uniforms.uPlane2.value = plane2;
    localizer3Uniforms.uPlaneColor2.value =
      new THREE.Color(stackHelper2.borderColor);
    // ref
    localizer3Uniforms.uSlice.value = plane3;
    // update info to draw borders properly
    localizer3Uniforms.uCanvasWidth.value = threeD3.clientWidth;
    localizer3Uniforms.uCanvasHeight.value = threeD3.clientHeight;
    // generate shaders on-demand!
    let fs3 = new ShadersLocalizerFragment(localizer3Uniforms);
    let vs3 = new ShadersLocalizerVertex();
    localizer3Material = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: localizer3Uniforms,
      vertexShader: vs3.compute(),
      fragmentShader: fs3.compute(),
    });
    localizer3Material.transparent = true;
    localizer3Mesh = new THREE.Mesh(
      stackHelper3.slice.geometry, localizer3Material);
    localizer3Mesh.applyMatrix(stackHelper3.stack._ijk2LPS);
    localizer3Scene = new THREE.Scene();
    localizer3Scene.add(localizer3Mesh);

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
      halfDimensions:
        new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
    };

    // init and zoom
    let canvas1 = {
        width: threeD1.clientWidth,
        height: threeD1.clientHeight,
      };
    camera1.directions = [stack.zCosine, stack.xCosine, stack.yCosine];
    camera1.box = bbox;
    camera1.canvas = canvas1;
    camera1.update();
    camera1.fitBox(2);

    let canvas2 = {
        width: threeD2.clientWidth,
        height: threeD2.clientHeight,
      };
    camera2.directions = [stack.zCosine, stack.yCosine, stack.xCosine];
    camera2.box = bbox;
    camera2.canvas = canvas2;
    camera2.update();
    camera2.fitBox(2);

    let canvas3 = {
        width: threeD3.clientWidth,
        height: threeD3.clientHeight,
      };
    camera3.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    camera3.box = bbox;
    camera3.canvas = canvas3;
    camera3.update();
    camera3.fitBox(2);

    let gui = new dat.GUI({
            autoPlace: false,
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    let stackFolder1 = gui.addFolder('Red');
    let redChanged = stackFolder1.add(
      stackHelper1, 'index', 0, stack.dimensionsIJK.y - 1).step(1);
    let stackFolder2 = gui.addFolder('Yellow');
    let yellowChanged = stackFolder2.add(
      stackHelper2, 'index', 0, stack.dimensionsIJK.x - 1).step(1);
    let stackFolder3 = gui.addFolder('Green');
    let greenChanged = stackFolder3.add(
      stackHelper3, 'index', 0, stack.dimensionsIJK.z - 1).step(1);


    /**
     * Update Layer Mix
     */
    function updateLocalizer(
      refHelper, refLocalizerUniforms, index, targetLocalizersUniforms) {
      let plane = refHelper.slice.cartesianEquation();
      refLocalizerUniforms.uSlice.value = plane;

      // update targets
      for(let i = 0; i < targetLocalizersUniforms.length; i++) {
        targetLocalizersUniforms[i]['uPlane' + index].value = plane;
      }

      // mesh geometry should be updated too...
    }

    function updateClipPlane(stackH, clipPlane, camera) {
      let vertices = stackH.slice.geometry.vertices;
      let p1 = new THREE.Vector3(vertices[0].x, vertices[0].y, vertices[0].z)
        .applyMatrix4(stackH._stack.ijk2LPS);
      let p2 = new THREE.Vector3(vertices[1].x, vertices[1].y, vertices[1].z)
        .applyMatrix4(stackH._stack.ijk2LPS);
      let p3 = new THREE.Vector3(vertices[2].x, vertices[2].y, vertices[2].z)
        .applyMatrix4(stackH._stack.ijk2LPS);

      clipPlane.setFromCoplanarPoints(p1, p2, p3);

      let cameraDirection = new THREE.Vector3(1, 1, 1);
      cameraDirection.applyQuaternion(camera.quaternion);

      if(cameraDirection.dot(clipPlane.normal) > 0) {
        clipPlane.negate();
      }
    }

    function onYellowChanged() {
      updateLocalizer(stackHelper2, localizer2Uniforms,
      2,
      [localizer1Uniforms, localizer3Uniforms]);
      updateClipPlane(stackHelper2, clipPlane2, camera2);
    }

    yellowChanged.onChange(onYellowChanged);

    function onRedChanged() {
      updateLocalizer(stackHelper1, localizer1Uniforms,
      1,
      [localizer2Uniforms, localizer3Uniforms]);
      updateClipPlane(stackHelper1, clipPlane1, camera1);
    }

    redChanged.onChange(onRedChanged);

    function onGreenChanged() {
      updateLocalizer(stackHelper3, localizer3Uniforms,
      3,
      [localizer1Uniforms, localizer2Uniforms]);
      updateClipPlane(stackHelper3, clipPlane3, camera3);
    }

    greenChanged.onChange(onGreenChanged);

    function onDoubleClick(event) {
      const canvas = event.srcElement.parentElement;
      const id = event.target.id;
      const mouse = {
        x: ((event.clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1,
        y: - ((event.clientY - canvas.offsetTop) / canvas.clientHeight) * 2 + 1,
      };
      //
      let camera = null;
      let stackHelper = null;
      let scene = null;
      switch(id) {
        case '0':
          camera = camera0;
          stackHelper = stackHelper1;
          scene = sceneScreen0;
          break;
        case '1':
          camera = camera1;
          stackHelper = stackHelper1;
          scene = sceneScreen1;
          break;
        case '2':
          camera = camera2;
          stackHelper = stackHelper2;
          scene = sceneScreen2;
          break;
        case '3':
          camera = camera3;
          stackHelper = stackHelper3;
          scene = sceneScreen3;
          break;
      }

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if(intersects.length > 0) {
        let ijk =
          ModelsStack.worldToData(stackHelper.stack, intersects[0].point);
        stackHelper1.index = ijk.y;
        stackHelper2.index = ijk.x;
        stackHelper3.index = ijk.z;

        onGreenChanged();
        onRedChanged();
        onYellowChanged();
      }
    }

    // event listeners
    threeD0.addEventListener('dblclick', onDoubleClick);
    threeD1.addEventListener('dblclick', onDoubleClick);
    threeD2.addEventListener('dblclick', onDoubleClick);
    threeD3.addEventListener('dblclick', onDoubleClick);

    let meshesLoaded = 0;
    function loadSTLObject(object) {
      const stlLoader = new THREE.STLLoader();
      stlLoader.load(object.location, function(geometry) {

          // 3D mesh
          object.material = new THREE.MeshLambertMaterial({
            opacity: object.opacity,
            color: object.color,
            clippingPlanes: [],
            side: THREE.DoubleSide,
            transparent: true,
          });
          object.mesh = new THREE.Mesh(geometry, object.material);
          const RASToLPS = new THREE.Matrix4();
          RASToLPS.set(-1, 0, 0, 0,
                        0, -1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1);
          object.mesh.applyMatrix(RASToLPS);
          sceneScreen0.add(object.mesh);

          // front
          object.materialFront = new THREE.MeshBasicMaterial({
                  color: object.color,
                  side: THREE.FrontSide,
                  depthWrite: true,
                  opacity: 0,
                  transparent: true,
                  clippingPlanes: [],
          });

          object.meshFront = new THREE.Mesh(geometry, object.materialFront);
          object.meshFront.applyMatrix(RASToLPS);
          sceneClip.add(object.meshFront);

          // back
          object.materialBack = new THREE.MeshBasicMaterial({
                  color: object.color,
                  side: THREE.BackSide,
                  depthWrite: true,
                  opacity: object.opacity,
                  transparent: true,
                  clippingPlanes: [],
          });

          object.meshBack = new THREE.Mesh(geometry, object.materialBack);
          object.meshBack.applyMatrix(RASToLPS);
          sceneClip.add(object.meshBack);

          meshesLoaded++;

          onGreenChanged();
          onRedChanged();
          onYellowChanged();

          // good to go
          if (meshesLoaded === data.size) {
            ready = true;
          }
        });
    }

    data.forEach(function(object, key) {
      loadSTLObject(object);
    });
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
};
