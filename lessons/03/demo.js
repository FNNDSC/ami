/* globals dat, AMI*/

// Setup renderer
var container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(0x353535, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Setup scene
var scene = new THREE.Scene();

// Setup camera
var camera = new AMI.OrthographicCamera(
    container.clientWidth / -2,
    container.clientWidth / 2,
    container.clientHeight / 2,
    container.clientHeight / -2,
    0.1,
    10000
);

// Setup controls
var controls = new AMI.TrackballOrthoControl(camera, container);
controls.staticMoving = true;
controls.noRotate = true;
camera.controls = controls;

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.canvas = {
        width: container.offsetWidth,
        height: container.offsetHeight,
    };
    camera.fitBox(2);

    renderer.setSize(container.offsetWidth, container.offsetHeight);
}
window.addEventListener('resize', onWindowResize, false);

/**
 * Build GUI
 */
function gui(stackHelper) {
    var gui = new dat.GUI({
        autoPlace: false
    });

    var customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    // only reason to use this object is to satusfy data.GUI
    var camUtils = {
        invertRows: false,
        invertColumns: false,
        rotate45: false,
        rotate: 0,
        orientation: 'default',
        convention: 'radio',
    };

    // camera
    var cameraFolder = gui.addFolder('Camera');
    var invertRows = cameraFolder.add(camUtils, 'invertRows');
    invertRows.onChange(function() {
        camera.invertRows();
    });

    var invertColumns = cameraFolder.add(camUtils, 'invertColumns');
    invertColumns.onChange(function() {
        camera.invertColumns();
    });

    var rotate45 = cameraFolder.add(camUtils, 'rotate45');
    rotate45.onChange(function() {
        camera.rotate();
    });

    cameraFolder
        .add(camera, 'angle', 0, 360)
        .step(1)
        .listen();

    let orientationUpdate = cameraFolder.add(camUtils, 'orientation', ['default', 'axial', 'coronal', 'sagittal']);
    orientationUpdate.onChange(function(value) {
        camera.orientation = value;
        camera.update();
        camera.fitBox(2);
        stackHelper.orientation = camera.stackOrientation;
    });

    let conventionUpdate = cameraFolder.add(camUtils, 'convention', ['radio', 'neuro']);
    conventionUpdate.onChange(function(value) {
        camera.convention = value;
        camera.update();
        camera.fitBox(2);
    });

    cameraFolder.open();

    // of course we can do everything from lesson 01!
    var stackFolder = gui.addFolder('Stack');
    stackFolder
        .add(stackHelper, 'index', 0, stackHelper.stack.dimensionsIJK.z - 1)
        .step(1)
        .listen();
    stackFolder
        .add(stackHelper.slice, 'interpolation', 0, 1)
        .step(1)
        .listen();
    stackFolder.open();
}

/**
 * Start animation loop
 */
function animate() {
    controls.update();
    renderer.render(scene, camera);

    // request new frame
    requestAnimationFrame(function() {
        animate();
    });
}
animate();

// Setup loader
var loader = new AMI.VolumeLoader(container);
var file = 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/adi_brain/adi_brain.nii.gz';

loader
    .load(file)
    .then(function() {
        // merge files into clean series/stack/frame structure
        var series = loader.data[0].mergeSeries(loader.data);
        var stack = series[0].stack[0];
        loader.free();
        loader = null;
        // be carefull that series and target stack exist!
        var stackHelper = new AMI.StackHelper(stack);
        // stackHelper.orientation = 2;
        // stackHelper.index = 56;

        // tune bounding box
        stackHelper.bbox.visible = false;

        // tune slice border
        stackHelper.border.color = 0xff9800;
        // stackHelper.border.visible = false;

        scene.add(stackHelper);

        // build the gui
        gui(stackHelper);

        // center camera and interactor to center of bouding box
        // for nicer experience
        // set camera
        var worldbb = stack.worldBoundingBox();
        var lpsDims = new THREE.Vector3(worldbb[1] - worldbb[0], worldbb[3] - worldbb[2], worldbb[5] - worldbb[4]);

        // box: {halfDimensions, center}
        var box = {
            center: stack.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
        };

        // init and zoom
        var canvas = {
            width: container.clientWidth,
            height: container.clientHeight,
        };

        camera.directions = [stack.xCosine, stack.yCosine, stack.zCosine];
        camera.box = box;
        camera.canvas = canvas;
        camera.update();
        camera.fitBox(2);
    })
    .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
    });
