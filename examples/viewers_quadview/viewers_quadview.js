/* globals Stats, dat*/

import CamerasOrthographic from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersStack from '../../src/helpers/helpers.stack';
import LoadersVolume from '../../src/loaders/loaders.volume';
import ModelsStack from '../../src/models/models.stack';

import ShadersLocalizerUniform from
  '../../src/shaders/shaders.localizer.uniform';
import ShadersLocalizerVertex from
  '../../src/shaders/shaders.localizer.vertex';
import ShadersLocalizerFragment from
  '../../src/shaders/shaders.localizer.fragment';

// standard global variables
// CREATE RENDERER 0
let r0 = {
  domId: 'r0',
  domElement: null,
  renderer: null,
  color: 0x212121,
  targetID: 0,
  camera: null,
  controls: null,
  scene: null,
  light: null,
};

let r1 = {
  domId: 'r1',
  domElement: null,
  renderer: null,
  color: 0x121212,
  targetID: 1,
  camera: null,
  controls: null,
  scene: null,
  light: null,
};

let r2 = {
  domId: 'r2',
  domElement: null,
  renderer: null,
  color: 0x121212,
  targetID: 2,
  camera: null,
  controls: null,
  scene: null,
  light: null,
};

let r3 = {
  domId: 'r3',
  domElement: null,
  renderer: null,
  color: 0x121212,
  targetID: 3,
  camera: null,
  controls: null,
  scene: null,
  light: null,
};

let stats;
let ready = false;
let stackHelper1;
let stackHelper2;
let stackHelper3;

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

function initRenderer3D(renderObj) {
  renderObj.domElement = document.getElementById(renderObj.domId);
  renderObj.renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderObj.renderer.setSize(
    renderObj.domElement.clientWidth, renderObj.domElement.clientHeight);
  renderObj.renderer.setClearColor(renderObj.color, 1);
  renderObj.renderer.domElement.id = renderObj.targetID;
  renderObj.domElement.appendChild(renderObj.renderer.domElement);

  // stats
  stats = new Stats();
  renderObj.domElement.appendChild(stats.domElement);

  // camera
  renderObj.camera = new THREE.PerspectiveCamera(
    45, renderObj.domElement.clientWidth / renderObj.domElement.clientHeight,
    0.1, 100000);
  renderObj.camera.position.x = 250;
  renderObj.camera.position.y = 250;
  renderObj.camera.position.z = 250;

  // scene 0
  renderObj.scene = new THREE.Scene();

  // light0
  renderObj.light = new THREE.DirectionalLight(0xffffff, 1);
  renderObj.light.position.copy(renderObj.camera.position);
  renderObj.scene.add(renderObj.light);

  // controls
  renderObj.controls = new ControlsTrackball(
    renderObj.camera, renderObj.domElement);
  renderObj.controls.rotateSpeed = 5.5;
  renderObj.controls.zoomSpeed = 1.2;
  renderObj.controls.panSpeed = 0.8;
  renderObj.controls.staticMoving = true;
  renderObj.controls.dynamicDampingFactor = 0.3;
}

function initRenderer2D(rendererObj) {
  //
  // CREATE RENDERER 1
  // RED
  rendererObj.domElement = document.getElementById(rendererObj.domId);
  rendererObj.renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  rendererObj.renderer.autoClear = false;
  rendererObj.renderer.localClippingEnabled = true;
  rendererObj.renderer.setSize(
    rendererObj.domElement.clientWidth, rendererObj.domElement.clientHeight);
  rendererObj.renderer.setClearColor(0x121212, 1);
  rendererObj.renderer.domElement.id = rendererObj.targetID;
  rendererObj.domElement.appendChild(rendererObj.renderer.domElement);
  // camera
  rendererObj.camera = new CamerasOrthographic(
    rendererObj.domElement.clientWidth / -2,
    rendererObj.domElement.clientWidth / 2,
    rendererObj.domElement.clientHeight / 2,
    rendererObj.domElement.clientHeight / -2,
    1, 1000);
  // scene 1
  rendererObj.scene = new THREE.Scene();
  // controls
  rendererObj.controls = new ControlsOrthographic(
    rendererObj.camera, rendererObj.domElement);
  rendererObj.controls.staticMoving = true;
  rendererObj.controls.noRotate = true;
  rendererObj.camera.controls = rendererObj.controls;
}

/**
 * Init the quadview
 */
function init() {
  /**
   * Called on each animation frame
   */
  function animate() {
    if (ready) {
      // render
      r0.controls.update();
      r1.controls.update();
      r2.controls.update();
      r3.controls.update();

      r0.light.position.copy(r0.camera.position);
      r0.renderer.render(r0.scene, r0.camera);

      // r1
      r1.renderer.clear();
      r1.renderer.render(r1.scene, r1.camera);
      // mesh
      r1.renderer.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane1];
        object.materialBack.clippingPlanes = [clipPlane1];
      });
      r1.renderer.render(sceneClip, r1.camera);
      // localizer
      r1.renderer.clearDepth();
      r1.renderer.render(localizer1Scene, r1.camera);

      // r2
      r2.renderer.clear();
      r2.renderer.render(r2.scene, r2.camera);
      // mesh
      r2.renderer.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane2];
        object.materialBack.clippingPlanes = [clipPlane2];
      });
      r2.renderer.render(sceneClip, r2.camera);
      // localizer
      r2.renderer.clearDepth();
      r2.renderer.render(localizer2Scene, r2.camera);

      // r3
      r3.renderer.clear();
      r3.renderer.render(r3.scene, r3.camera);
      // mesh
      r3.renderer.clearDepth();
      data.forEach(function(object, key) {
        object.materialFront.clippingPlanes = [clipPlane3];
        object.materialBack.clippingPlanes = [clipPlane3];
      });
      r3.renderer.render(sceneClip, r3.camera);
      // localizer
      r3.renderer.clearDepth();
      r3.renderer.render(localizer3Scene, r3.camera);
    }

    stats.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderers
  initRenderer3D(r0);
  initRenderer2D(r1);
  initRenderer2D(r2);
  initRenderer2D(r3);

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
    r0.scene.add(boxHelper);

    // update camrea's and interactor's target
    let centerLPS = stack.worldCenter();
    // update camera's target
    r0.camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    r0.camera.updateProjectionMatrix();
    r0.controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    // Fill renderer 2
    // RED
    stackHelper1 = new HelpersStack(stack);
    stackHelper1.orientation = 2;
    stackHelper1.bbox.visible = false;
    stackHelper1.borderColor = 0xFF1744;
    stackHelper1.slice.canvasWidth = r1.domElement.clientWidth;
    stackHelper1.slice.canvasHeight = r1.domElement.clientHeight;
    // scene
    r1.scene.add(stackHelper1);
    r0.scene.add(r1.scene);

    // Fill renderer 3
    stackHelper2 = new HelpersStack(stack);
    stackHelper2.orientation = 1;
    stackHelper2.bbox.visible = false;
    stackHelper2.borderColor = 0xFFEA00;
    stackHelper2.slice.canvasWidth = r2.domElement.clientWidth;
    stackHelper2.slice.canvasHeight = r2.domElement.clientHeight;
    // scene
    r2.scene.add(stackHelper2);
    r0.scene.add(r2.scene);

    // Fill renderer 4
    stackHelper3 = new HelpersStack(stack);
    stackHelper3.orientation = 0;
    stackHelper3.bbox.visible = false;
    stackHelper3.borderColor = 0x76FF03;
    stackHelper3.slice.canvasWidth = r3.domElement.clientWidth;
    stackHelper3.slice.canvasHeight = r3.domElement.clientHeight;
    // scene
    r3.scene.add(stackHelper3);
    r0.scene.add(r3.scene);

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
    localizer1Uniforms.uCanvasWidth.value = r1.domElement.clientWidth;
    localizer1Uniforms.uCanvasHeight.value = r1.domElement.clientHeight;
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
    localizer2Uniforms.uCanvasWidth.value = r2.domElement.clientWidth;
    localizer2Uniforms.uCanvasHeight.value = r2.domElement.clientHeight;
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
    localizer3Uniforms.uCanvasWidth.value = r3.domElement.clientWidth;
    localizer3Uniforms.uCanvasHeight.value = r3.domElement.clientHeight;
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
        width: r1.domElement.clientWidth,
        height: r1.domElement.clientHeight,
      };
    r1.camera.directions = [stack.zCosine, stack.xCosine, stack.yCosine];
    r1.camera.box = bbox;
    r1.camera.canvas = canvas1;
    r1.camera.update();
    r1.camera.fitBox(2);

    let canvas2 = {
        width: r2.domElement.clientWidth,
        height: r2.domElement.clientHeight,
      };
    r2.camera.directions = [stack.zCosine, stack.yCosine, stack.xCosine];
    r2.camera.box = bbox;
    r2.camera.canvas = canvas2;
    r2.camera.update();
    r2.camera.fitBox(2);

    let canvas3 = {
        width: r3.domElement.clientWidth,
        height: r3.domElement.clientHeight,
      };
    r3.camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
    r3.camera.box = bbox;
    r3.camera.canvas = canvas3;
    r3.camera.update();
    r3.camera.fitBox(2);

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
      updateClipPlane(stackHelper2, clipPlane2, r2.camera);
    }

    yellowChanged.onChange(onYellowChanged);

    function onRedChanged() {
      updateLocalizer(stackHelper1, localizer1Uniforms,
      1,
      [localizer2Uniforms, localizer3Uniforms]);
      updateClipPlane(stackHelper1, clipPlane1, r1.camera);
    }

    redChanged.onChange(onRedChanged);

    function onGreenChanged() {
      updateLocalizer(stackHelper3, localizer3Uniforms,
      3,
      [localizer1Uniforms, localizer2Uniforms]);
      updateClipPlane(stackHelper3, clipPlane3, r3.camera);
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
          camera = r0.camera;
          stackHelper = stackHelper1;
          scene = r0.scene;
          break;
        case '1':
          camera = r1.camera;
          stackHelper = stackHelper1;
          scene = r1.scene;
          break;
        case '2':
          camera = r2.camera;
          stackHelper = stackHelper2;
          scene = r2.scene;
          break;
        case '3':
          camera = r3.camera;
          stackHelper = stackHelper3;
          scene = r3.scene;
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
    r0.domElement.addEventListener('dblclick', onDoubleClick);
    r1.domElement.addEventListener('dblclick', onDoubleClick);
    r2.domElement.addEventListener('dblclick', onDoubleClick);
    r3.domElement.addEventListener('dblclick', onDoubleClick);

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
          r0.scene.add(object.mesh);

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
