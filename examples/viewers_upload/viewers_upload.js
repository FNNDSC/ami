/* globals dat*/
import CoreUtils from '../../src/core/core.utils';
import LoadersVolume from '../../src/loaders/loaders.volume';
import HelpersVoxel from '../../src/helpers/helpers.voxel';
import HelpersStack from '../../src/helpers/helpers.stack';
import HelpersLut from '../../src/helpers/helpers.lut';
import WidgetsVoxelProbe from '../../src/widgets/widgets.voxelProbe';
import CamerasOrthographic from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';

// standard global variables
let controls,
  renderer,
  scene,
  camera,
  threeD,
  lut,
  helpersVoxel,
  probe,
  directions,
  bbox;

let ctrlDown = false;
let drag = {
  start: {
    x: null,
    y: null,
  },
};

// probe
let camUtils = {
  invertRows: false,
  invertColumns: false,
  rotate: false,
  orientation: 'default',
  convention: 'radio',
};

//voxels
let voxelsSettings = {
  color: '#00B0FF',
  showMesh: true,
  showMeasurements: true,
  showSVG: true,
};

let widgetSettings = {
  defaultColor: '#00B0FF',
  activeColor: '#FFEB3B',
  hoverColor: '#F50057',
  selectedColor: '#76FF03',
  showMesh: true,
  showMeasurements: true,
  showSVG: true,
};


/**
 * Init the scene
 */
function init() {
  /**
   * Animation loop
   */
  function animate() {

    if (helpersVoxel) {
      for (let i = 0; i < 10; i++) {
        // update world coordinates
        if (helpersVoxel[i].voxel.dataCoordinates.x >= bbox.x) {
          directions[i].x = -1;
        } else if (helpersVoxel[i].voxel.dataCoordinates.x <= 0) {
          directions[i].x = 1;
        }

        if (helpersVoxel[i].voxel.dataCoordinates.y >= bbox.y) {
          directions[i].y = -1;
        } else if (helpersVoxel[i].voxel.dataCoordinates.y <= 0) {
          directions[i].y = 1;
        }

        // update world coordinates coordinates
        let nextWorldCoordinate = new THREE.Vector3(
          helpersVoxel[i].voxel.dataCoordinates.x + directions[i].x,
          helpersVoxel[i].voxel.dataCoordinates.y + directions[i].y,
          helpersVoxel[i].voxel.dataCoordinates.z
        );
        nextWorldCoordinate.applyMatrix4(helpersVoxel[i]._stack.ijk2LPS);

        helpersVoxel[i].worldCoordinates = nextWorldCoordinate;

        // then screen stuff
        helpersVoxel[i].updateVoxelScreenCoordinates(camera, threeD);
        helpersVoxel[i].updateDom(threeD);
      }
    }

    // render
    controls.update();
    renderer.render(scene, camera);

    // request new frame
    requestAnimationFrame(function () {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  renderer.setClearColor(0x212121, 1);

  threeD.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();
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

window.onload = function () {
  // hookup load button
  document.getElementById('buttoninput').onclick = function () {
    document.getElementById('filesinput').click();
  };

  // init threeJS...
  init();

  function updateLabels(labels, modality) {
    if (modality === 'CR' || modality === 'DX') return;

    let top = document.getElementById('top');
    top.innerHTML = labels[0];

    let bottom = document.getElementById('bottom');
    bottom.innerHTML = labels[1];

    let right = document.getElementById('right');
    right.innerHTML = labels[2];

    let left = document.getElementById('left');
    left.innerHTML = labels[3];
  }

  function buildGUI(stackHelper) {
    let stack = stackHelper._stack;

    let gui = new dat.GUI({
      autoPlace: false,
    });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let stackFolder = gui.addFolder('Stack');
    stackFolder.add(
        stackHelper.slice, 'windowWidth', 1, stack.minMax[1] - stack.minMax[0])
      .step(1).listen();
    stackFolder.add(
        stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1])
      .step(1).listen();
    stackFolder.add(stackHelper.slice, 'intensityAuto').listen();
    stackFolder.add(stackHelper.slice, 'invert');
    stackFolder.add(stackHelper.slice, 'interpolation', 0, 1).step(1).listen();

    // CREATE LUT
    lut = new HelpersLut(
      'my-lut-canvases',
      'default',
      'linear', [[0, 0, 0, 0], [1, 1, 1, 1]], [[0, 1], [1, 1]]);
    lut.luts = HelpersLut.presetLuts();

    let lutUpdate = stackFolder.add(
      stackHelper.slice, 'lut', lut.lutsAvailable());
    lutUpdate.onChange(function (value) {
      lut.lut = value;
      stackHelper.slice.lutTexture = lut.texture;
    });
    let lutDiscrete = stackFolder.add(lut, 'discrete', false);
    lutDiscrete.onChange(function (value) {
      lut.discrete = value;
      stackHelper.slice.lutTexture = lut.texture;
    });

    let index = stackFolder.add(
      stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();

    index.onChange(function (value) {
      probe._targetMesh = stackHelper.slice.mesh;
      changeVoxelSlice(stackHelper);
      probe.update();
    });
    stackFolder.open();

    // camera
    let cameraFolder = gui.addFolder('Camera');
    let invertRows = cameraFolder.add(camUtils, 'invertRows');
    invertRows.onChange(function () {
      camera.invertRows();
      updateLabels(camera.directionsLabel, stack.modality);
    });

    let invertColumns = cameraFolder.add(camUtils, 'invertColumns');
    invertColumns.onChange(function () {
      camera.invertColumns();
      updateLabels(camera.directionsLabel, stack.modality);
    });

    let angle = cameraFolder.add(camera, 'angle', 0, 360).step(1).listen();
    angle.onChange(function () {
      updateLabels(camera.directionsLabel, stack.modality);
    });

    let rotate = cameraFolder.add(camUtils, 'rotate');
    rotate.onChange(function () {
      camera.rotate();
      updateLabels(camera.directionsLabel, stack.modality);
    });

    let orientationUpdate = cameraFolder.add(
      camUtils, 'orientation', ['default', 'axial', 'coronal', 'sagittal']);
    orientationUpdate.onChange(function (value) {
      camera.orientation = value;
      camera.update();
      camera.fitBox(2);
      stackHelper.orientation = camera.stackOrientation;
      updateLabels(camera.directionsLabel, stack.modality);

      index.__max = stackHelper.orientationMaxIndex;
      stackHelper.index = Math.floor(index.__max / 2);
    });

    let conventionUpdate = cameraFolder.add(
      camUtils, 'convention', ['radio', 'neuro']);
    conventionUpdate.onChange(function (value) {
      camera.convention = value;
      camera.update();
      camera.fitBox(2);
      updateLabels(camera.directionsLabel, stack.modality);
    });

    let voxelFolder = gui.addFolder('Voxels');
    let color = voxelFolder.addColor(voxelsSettings, 'color');
    color.onChange(function (value) {
      // update all colors...
      for (let i = 0; i < 10; i++) {
        helpersVoxel[i].color = value;
      }
    });
    let showMesh = voxelFolder.add(voxelsSettings, 'showMesh');
    showMesh.onChange(function (value) {
      // update all colors...
      for (let i = 0; i < 10; i++) {
        helpersVoxel[i].showVoxel = value;
      }
    });

    let showMeasurements = voxelFolder.add(voxelsSettings, 'showMeasurements');
    showMeasurements.onChange(function (value) {
      // update all colors...
      for (let i = 0; i < 10; i++) {
        helpersVoxel[i].showDomMeasurements = value;
      }
    });

    let showSVG = voxelFolder.add(voxelsSettings, 'showSVG');
    showSVG.onChange(function (value) {
      // update all colors...
      for (let i = 0; i < 10; i++) {
        helpersVoxel[i].showDomSVG = value;
      }
    });

    let widgetFolder = gui.addFolder('Widget');
    let dColorW = widgetFolder.addColor(widgetSettings, 'defaultColor');
    dColorW.onChange(function (value) {
      probe.defaultColor = value;
    });
    let aColorW = widgetFolder.addColor(widgetSettings, 'activeColor');
    aColorW.onChange(function (value) {
      probe.activeColor = value;
    });
    let hColorW = widgetFolder.addColor(widgetSettings, 'hoverColor');
    hColorW.onChange(function (value) {
      probe.hoverColor = value;
    });
    let sColorW = widgetFolder.addColor(widgetSettings, 'selectedColor');
    sColorW.onChange(function (value) {
      probe.selectedColor = value;
    });

    let showMeshW = widgetFolder.add(widgetSettings, 'showMesh');
    showMeshW.onChange(function (value) {
      probe._voxels[0].showVoxel = value;
    });

    let showMeasurementsW = widgetFolder.add(widgetSettings, 'showMeasurements');
    showMeasurementsW.onChange(function (value) {
      probe._voxels[0].showDomMeasurements = value;
    });

    let showSVGW = widgetFolder.add(widgetSettings, 'showSVG');
    showSVGW.onChange(function (value) {
      probe._voxels[0].showDomSVG = value;
    });
  }

  function changeVoxelSlice(stackHelper) {
    for (let i = 0; i < 10; i++) {
      // update world coordinates
      helpersVoxel[i].voxel.dataCoordinates.z = stackHelper.index;
    }
  }

  /**
   * Connect all callbevent observesrs
   */
  function hookCallbacks(stackHelper) {
    let stack = stackHelper._stack;
    // hook up callbacks
    controls.addEventListener('OnScroll', function (e) {
      if (e.delta > 0) {
        if (stackHelper.index > stackHelper.orientationMaxIndex - 1) {
          return false;
        }
        stackHelper.index += 1;
        probe._targetMesh = stackHelper.slice.mesh;
        changeVoxelSlice(stackHelper);
      } else {
        if (stackHelper.index <= 0) {
          return false;
        }
        stackHelper.index -= 1;
        probe._targetMesh = stackHelper.slice.mesh;
        changeVoxelSlice(stackHelper);
      }
    });

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

      // update info to draw borders properly
      stackHelper.slice.canvasWidth = threeD.clientWidth;
      stackHelper.slice.canvasHeight = threeD.clientHeight;
    }

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    /**
     * On key pressed callback
     */
    function onWindowKeyPressed(event) {
      ctrlDown = event.ctrlKey;
      if (!ctrlDown) {
        drag.start.x = null;
        drag.start.y = null;
      }
    }
    document.addEventListener('keydown', onWindowKeyPressed, false);
    document.addEventListener('keyup', onWindowKeyPressed, false);

    /**
     * On mouse move callback
     */
    function onMouseMove(event) {
      if (ctrlDown) {
        if (drag.start.x === null) {
          drag.start.x = event.clientX;
          drag.start.y = event.clientY;
        }
        let threshold = 15;

        stackHelper.slice.intensityAuto = false;

        let dynamicRange = stack.minMax[1] - stack.minMax[0];
        dynamicRange /= threeD.clientWidth;

        if (Math.abs(event.clientX - drag.start.x) > threshold) {
          // window width
          stackHelper.slice.windowWidth +=
            dynamicRange * (event.clientX - drag.start.x);
          drag.start.x = event.clientX;
        }

        if (Math.abs(event.clientY - drag.start.y) > threshold) {
          // window center
          stackHelper.slice.windowCenter -=
            dynamicRange * (event.clientY - drag.start.y);
          drag.start.y = event.clientY;
        }
      }
    }
    document.addEventListener('mousemove', onMouseMove);
  }

  /**
   * Visulaize incoming data
   */
  function handleSeries(seriesContainer) {
    // cleanup the loader and its progress bar
    loader.free();
    loader = null;
    // prepare for slice visualization
    // first stack of first series
    let stack = seriesContainer[0].mergeSeries(seriesContainer)[0].stack[0];

    let stackHelper = new HelpersStack(stack);
    stackHelper.bbox.visible = false;
    stackHelper.borderColor = '#2196F3';
    stackHelper.border.visible = false;
    scene.add(stackHelper);

    probe = new WidgetsVoxelProbe(stack,
      stackHelper.slice.mesh,
      controls,
      camera,
      threeD);
    probe._stackHelper = stackHelper;
    probe._current._showVoxel = true;
    probe._current._showDomSVG = true;
    probe._current._showDomMeasurements = true;
    scene.add(probe);

    let centerLPS = stack.worldCenter();
    // voxelHelpers
    helpersVoxel = [];
    directions = [];
    for (let i = 0; i < 10; i++) {
      let voxel = new HelpersVoxel(centerLPS, stackHelper.stack);
      voxel.color = voxelsSettings.color;
      voxel.updateVoxelScreenCoordinates(camera, threeD);
      voxel.updateDom(threeD);
      helpersVoxel.push(voxel);

      // voxel direction
      let direction = new THREE.Vector3(
        Math.random() < 0.33 ? -1 : (Math.random() < 0.5 ? 0 : 1),
        Math.random() < 0.33 ? -1 : (Math.random() < 0.5 ? 0 : 1),
        0);
      directions.push(direction);

      // add voxles to the scene
      scene.add(helpersVoxel[i]);
    }

    bbox = stack.dimensionsIJK;
    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new THREE.Vector3(
      (worldbb[1] - worldbb[0]) / 2, (worldbb[3] - worldbb[2]) / 2, (worldbb[5] - worldbb[4]) / 2
    );

    // box: {halfDimensions, center}
    let box = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10),
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

    updateLabels(camera.directionsLabel, stack.modality);
    buildGUI(stackHelper);
    hookCallbacks(stackHelper);
  }

  let loader = new LoadersVolume(threeD);
  let seriesContainer = [];

  /**
   * Filter array of data by extension
   * extension {String}
   * item {Object}
   * @return {Boolean}
   */
  function _filterByExtension(extension, item) {
    if (item.extension.toUpperCase() === extension.toUpperCase()) {
      return true;
    }
    return false;
  }

  /**
   * Parse incoming files
   */
  function readMultipleFiles(evt) {
    // hide the upload button
    if (evt.target.files.length) {
      document.getElementById('home-container').style.display = 'none';
    }

    /**
     * Load sequence
     */
    function loadSequence(index, files) {
      return Promise.resolve()
        // load the file
        .then(function () {
          return new Promise(function (resolve, reject) {
            let myReader = new FileReader();
            // should handle errors too...
            myReader.addEventListener('load', function (e) {
              resolve(e.target.result);
            });
            myReader.readAsArrayBuffer(files[index]);
          });
        })
        .then(function (buffer) {
          return loader.parse({
            url: files[index].name,
            buffer
          });
        })
        .then(function (series) {
          seriesContainer.push(series);
        })
        .catch(function (error) {
          window.console.log('oops... something went wrong...');
          window.console.log(error);
        });
    }

    /**
     * Load group sequence
     */
    function loadSequenceGroup(files) {
      const fetchSequence = [];

      for (let i = 0; i < files.length; i++) {
        fetchSequence.push(
          new Promise((resolve, reject) => {
            const myReader = new FileReader();
            // should handle errors too...
            myReader.addEventListener('load', function (e) {
              resolve(e.target.result);
            });
            myReader.readAsArrayBuffer(files[i].file);
          })
          .then(function (buffer) {
            return {
              url: files[i].file.name,
              buffer
            };
          })
        );
      }

      return Promise.all(fetchSequence)
        .then((rawdata) => {
          return loader.parse(rawdata);
        })
        .then(function (series) {
          seriesContainer.push(series);
        })
        .catch(function (error) {
          window.console.log('oops... something went wrong...');
          window.console.log(error);
        });
    }

    const loadSequenceContainer = [];

    const data = [];
    const dataGroups = [];
    // convert object into array
    for (let i = 0; i < evt.target.files.length; i++) {
      let dataUrl = CoreUtils.parseUrl(evt.target.files[i].name);
      if (dataUrl.extension.toUpperCase() === 'MHD' ||
        dataUrl.extension.toUpperCase() === 'RAW') {
        dataGroups.push({
          file: evt.target.files[i],
          extension: dataUrl.extension.toUpperCase(),
        });
      } else {
        data.push(evt.target.files[i]);
      }
    }

    // check if some files must be loaded together
    if (dataGroups.length === 2) {
      // if raw/mhd pair
      const mhdFile = dataGroups.filter(_filterByExtension.bind(null, 'MHD'));
      const rawFile = dataGroups.filter(_filterByExtension.bind(null, 'RAW'));
      if (mhdFile.length === 1 &&
        rawFile.length === 1) {
        loadSequenceContainer.push(
          loadSequenceGroup(dataGroups)
        );
      }
    }

    // load the rest of the files
    for (let i = 0; i < data.length; i++) {
      loadSequenceContainer.push(
        loadSequence(i, data)
      );
    }

    // run the load sequence
    // load sequence for all files
    Promise
      .all(loadSequenceContainer)
      .then(function () {
        handleSeries(seriesContainer);
      })
      .catch(function (error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }
  // hook up file input listener
  document.getElementById('filesinput')
    .addEventListener('change', readMultipleFiles, false);
};