/* globals Stats, dat*/

import CamerasOrthographic from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersBoundingBox from '../../src/helpers/helpers.boundingbox';
import HelpersLocalizer from '../../src/helpers/helpers.localizer';
import HelpersStack from '../../src/helpers/helpers.stack';
import LoadersVolume from '../../src/loaders/loaders.volume';
import ModelsStack from '../../src/models/models.stack';

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
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
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
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
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
  stackHelper: null,
  localizerHelper: null,
  localizerScene: null,
};

let stats;
let ready = false;

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
  // renderer
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

  // controls
  renderObj.controls = new ControlsTrackball(
    renderObj.camera, renderObj.domElement);
  renderObj.controls.rotateSpeed = 5.5;
  renderObj.controls.zoomSpeed = 1.2;
  renderObj.controls.panSpeed = 0.8;
  renderObj.controls.staticMoving = true;
  renderObj.controls.dynamicDampingFactor = 0.3;

  // scene
  renderObj.scene = new THREE.Scene();

  // light
  renderObj.light = new THREE.DirectionalLight(0xffffff, 1);
  renderObj.light.position.copy(renderObj.camera.position);
  renderObj.scene.add(renderObj.light);
}

function initRenderer2D(rendererObj) {
  // renderer
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

  // controls
  rendererObj.controls = new ControlsOrthographic(
    rendererObj.camera, rendererObj.domElement);
  rendererObj.controls.staticMoving = true;
  rendererObj.controls.noRotate = true;
  rendererObj.camera.controls = rendererObj.controls;

  // scene
  rendererObj.scene = new THREE.Scene();
}

function initHelpersStack(rendererObj, stack, orientation, color, direction) {
    rendererObj.stackHelper = new HelpersStack(stack);
    rendererObj.stackHelper.orientation = orientation;
    rendererObj.stackHelper.bbox.visible = false;
    rendererObj.stackHelper.borderColor = color;
    rendererObj.stackHelper.slice.canvasWidth =
      rendererObj.domElement.clientWidth;
    rendererObj.stackHelper.slice.canvasHeight =
      rendererObj.domElement.clientHeight;

    rendererObj.scene.add(rendererObj.stackHelper);

    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );
    let bbox = {
      center: stack.worldCenter().clone(),
      halfDimensions:
        new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
    };

    // init and zoom
    let canvas = {
        width: rendererObj.domElement.clientWidth,
        height: rendererObj.domElement.clientHeight,
      };
    rendererObj.camera.directions = direction;
    rendererObj.camera.box = bbox;
    rendererObj.camera.canvas = canvas;
    rendererObj.camera.update();
    rendererObj.camera.fitBox(2);
}

function initHelpersLocalizer(rendererObj, stack, referencePlane, localizers) {
    rendererObj.localizerHelper = new HelpersLocalizer(
      stack, rendererObj.stackHelper.slice.geometry, referencePlane);

    for(let i = 0; i < localizers.length; i++) {
      rendererObj.localizerHelper['plane' + (i + 1)] = localizers[i].plane;
      rendererObj.localizerHelper['color' + (i + 1)] = localizers[i].color;
    }

    rendererObj.localizerHelper.canvasWidth =
      rendererObj.domElement.clientWidth;
    rendererObj.localizerHelper.canvasHeight =
      rendererObj.domElement.clientHeight;

    rendererObj.localizerScene = new THREE.Scene();
    rendererObj.localizerScene.add(rendererObj.localizerHelper);
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
      r1.renderer.render(r1.localizerScene, r1.camera);

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
      r2.renderer.render(r2.localizerScene, r2.camera);

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
      r3.renderer.render(r3.localizerScene, r3.camera);
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

    // bouding box
    let boxHelper = new HelpersBoundingBox(stack);
    r0.scene.add(boxHelper);

    // red slice
    initHelpersStack(
      r1, stack, 2, 0xFF1744, [stack.zCosine, stack.xCosine, stack.yCosine]);
    r0.scene.add(r1.scene);

    // yellow slice
    initHelpersStack(
      r2, stack, 1, 0xFFEA00, [stack.zCosine, stack.yCosine, stack.xCosine]);
    r0.scene.add(r2.scene);

    // Fill renderer 4
    initHelpersStack(
      r3, stack, 0, 0x76FF03, [stack.xCosine, stack.yCosine, stack.zCosine]);
    r0.scene.add(r3.scene);

    // create new mesh with Localizer shaders
    let plane1 = r1.stackHelper.slice.cartesianEquation();
    let plane2 = r2.stackHelper.slice.cartesianEquation();
    let plane3 = r3.stackHelper.slice.cartesianEquation();

    // localizer 1
    initHelpersLocalizer(r1, stack, plane1, [
      {plane: plane2,
       color: new THREE.Color(r2.stackHelper.borderColor),
      },
      {plane: plane3,
       color: new THREE.Color(r3.stackHelper.borderColor),
      },
    ]);

    // localizer 2
    initHelpersLocalizer(r2, stack, plane2, [
      {plane: plane1,
       color: new THREE.Color(r1.stackHelper.borderColor),
      },
      {plane: plane3,
       color: new THREE.Color(r3.stackHelper.borderColor),
      },
    ]);

    // localizer 3
    initHelpersLocalizer(r3, stack, plane3, [
      {plane: plane1,
       color: new THREE.Color(r1.stackHelper.borderColor),
      },
      {plane: plane2,
       color: new THREE.Color(r2.stackHelper.borderColor),
      },
    ]);

    // update camrea's and interactor's target
    let centerLPS = stack.worldCenter();
    // update camera's target
    r0.camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    r0.camera.updateProjectionMatrix();
    r0.controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    let gui = new dat.GUI({
            autoPlace: false,
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    let stackFolder1 = gui.addFolder('Red');
    let redChanged = stackFolder1.add(
      r1.stackHelper, 'index', 0, stack.dimensionsIJK.y - 1).step(1);
    let stackFolder2 = gui.addFolder('Yellow');
    let yellowChanged = stackFolder2.add(
      r2.stackHelper, 'index', 0, stack.dimensionsIJK.x - 1).step(1);
    let stackFolder3 = gui.addFolder('Green');
    let greenChanged = stackFolder3.add(
      r3.stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1);


    /**
     * Update Layer Mix
     */
    function updateLocalizer(refObj, targetLocalizersHelpers) {
      let refHelper = refObj.stackHelper;
      let localizerHelper = refObj.localizerHelper;
      let plane = refHelper.slice.cartesianEquation();
      localizerHelper.referencePlane = plane;

      // bit of a hack... works fine for this application
      for(let i = 0; i < targetLocalizersHelpers.length; i++) {
        for(let j = 0; j < 4; j++) {
          let targetPlane = targetLocalizersHelpers[i]['plane' + (j + 1)];
          if(targetPlane &&
             plane.x === targetPlane.x &&
             plane.y === targetPlane.y &&
             plane.z === targetPlane.z) {
            targetLocalizersHelpers[i]['plane' + (j + 1)] = plane;
          }
        }
      }

      // update the geometry will create a new mesh
      localizerHelper.geometry = refHelper.slice.geometry;
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
      updateLocalizer(r2, [r1.localizerHelper, r3.localizerHelper]);
      updateClipPlane(r2.stackHelper, clipPlane2, r2.camera);
    }

    yellowChanged.onChange(onYellowChanged);

    function onRedChanged() {
      updateLocalizer(r1, [r2.localizerHelper, r3.localizerHelper]);
      updateClipPlane(r1.stackHelper, clipPlane1, r1.camera);
    }

    redChanged.onChange(onRedChanged);

    function onGreenChanged() {
      updateLocalizer(r3, [r1.localizerHelper, r2.localizerHelper]);
      updateClipPlane(r3.stackHelper, clipPlane3, r3.camera);
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
          stackHelper = r1.stackHelper;
          scene = r0.scene;
          break;
        case '1':
          camera = r1.camera;
          stackHelper = r1.stackHelper;
          scene = r1.scene;
          break;
        case '2':
          camera = r2.camera;
          stackHelper = r2.stackHelper;
          scene = r2.scene;
          break;
        case '3':
          camera = r3.camera;
          stackHelper = r3.stackHelper;
          scene = r3.scene;
          break;
      }

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if(intersects.length > 0) {
        let ijk =
          ModelsStack.worldToData(stackHelper.stack, intersects[0].point);
        r1.stackHelper.index = ijk.y;
        r2.stackHelper.index = ijk.x;
        r3.stackHelper.index = ijk.z;

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
