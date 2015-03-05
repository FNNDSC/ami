'use strict';

var VJS = VJS || {};

var Stats = Stats || {};
// standard global variables
var renderer, stats, camera, volume;

var mouseX = 0,
    mouseY = 0;

var windowWidth, windowHeight;


var views = [{
    left: 0,
    bottom: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color().setRGB(0.5, 0.5, 0.7)
}, {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color().setRGB(0.7, 0.5, 0.5)
}, {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color().setRGB(0.5, 0.7, 0.7)
}];


// FUNCTIONS
function init(slice) {

    function onDocumentMouseMove(event) {

        mouseX = (event.clientX - windowWidth / 2);
        mouseY = (event.clientY - windowHeight / 2);

    }

    function updateSize() {

        if (windowWidth !== window.innerWidth || windowHeight !== window.innerHeight) {

            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;

            renderer.setSize(windowWidth, windowHeight);

        }

    }


    // this function is executed on each animation frame
    function animate() {

        updateSize();

        // render
        stats.update();

        for (var ii = 0; ii < views.length; ++ii) {

            view = views[ii];
            camera = view.camera;

            var left = Math.floor(windowWidth * view.left);
            var bottom = Math.floor(windowHeight * view.bottom);
            var width = Math.floor(windowWidth * view.width);
            var height = Math.floor(windowHeight * view.height);
            renderer.setViewport(left, bottom, width, height);
            renderer.setScissor(left, bottom, width, height);
            renderer.enableScissorTest(true);
            renderer.setClearColor(view.background);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.render(scene, camera);
        }


        // request new frame
        requestAnimationFrame(function() {
            animate();
        });
    }

    // renderer
    var threeD = document.getElementById('r3d');
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
    renderer.setClearColor(0xB0BEC5, 1);
    threeD.appendChild(renderer.domElement);

    // stats
    stats = new Stats();
    threeD.appendChild(stats.domElement);

    // scene
    var scene = new THREE.Scene();
    // camera

    var view = views[0];
    var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
    camera.position.x = 400;
    camera.lookAt(scene.position);
    view.camera = camera;

    view.controls = new THREE.OrbitControls2D(view.camera, renderer.domElement);

    var view2 = views[1];
    var position = new THREE.Vector3(400, 0, 0);
    var vjsCamera = new VJS.Cameras.Camera2D(threeD.offsetWidth / -2, threeD.offsetWidth / 2, threeD.offsetHeight / 2, threeD.offsetHeight / -2, 1, 10000000, position);
    vjsCamera.Orientation('SAGITTAL');
    view2.camera = vjsCamera.GetCamera();

    view2.controls = new THREE.OrbitControls2D(view2.camera, renderer.domElement);
    view2.controls.noRotate = true;

    var view3 = views[2];
    var position2 = new THREE.Vector3(400, 0, 0);
    var vjsCamera2 = new VJS.Cameras.Camera2D(threeD.offsetWidth / -2, threeD.offsetWidth / 2, threeD.offsetHeight / 2, threeD.offsetHeight / -2, 1, 10000000, position2);
    vjsCamera2.Orientation('AXIAL');
    view3.camera = vjsCamera2.GetCamera();

    view3.controls = new THREE.OrbitControls2D(view3.camera, renderer.domElement);
    view3.controls.noRotate = true;


    // create volume object

    var rasijk = VJS.Adaptor.Xtk2ThreejsMat4(volume.Qh);
    var ijkras = new THREE.Matrix4().getInverse(rasijk);
    var ijkdimensions = VJS.Adaptor.Xtk2ThreejsVec3(volume.ca);
    var rasdimensions = VJS.Adaptor.Xtk2ThreejsVec3(volume.gb);
    var rascenter = VJS.Adaptor.Xtk2ThreejsVec3(volume.s);
    var rasorigin = VJS.Adaptor.Xtk2ThreejsVec3(volume.Ea);

    // Create RAS object
    var ras = {
        'origin': rasorigin,
        'center': rascenter,
        'dimensions': rasdimensions,
        'spacing': null,
        'boundingbox': [
            new THREE.Vector3(rascenter.x - rasdimensions.x / 2, rascenter.y - rasdimensions.y / 2, rascenter.z - rasdimensions.z / 2),
            new THREE.Vector3(rascenter.x + rasdimensions.x / 2, rascenter.y + rasdimensions.y / 2, rascenter.z + rasdimensions.z / 2)
        ]
    };

    // need ijk object as well
    var ijk = {
        'origin': null,
        'center': null,
        'dimensions': ijkdimensions,
        'spacing': null
    };

    var transforms = {
        'ijk2ras': ijkras,
        'ras2ijk': rasijk
    };

    // Create VJS Volume Core and View
    var vjsVolumeCore = new VJS.Volume.Core(volume.J, volume.max, volume.min, transforms, ijk, ras);
    var vjsVolumeView = new VJS.Volume.View(vjsVolumeCore);

    // Get 2 Views fromt same volume!

    // IJK BBox Oriented in RAS Space volume
    var material = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x61F2F3
    });
    var IJKBBoxOriented = vjsVolumeView.IJKBBoxOriented(material);
    scene.add(IJKBBoxOriented);

    // RAS BBox
    var materialRASBBox = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x2196F3
    });
    var RASBBox = vjsVolumeView.RASBBox(materialRASBBox);
    scene.add(RASBBox);


    // Create Slice

    // get texture from object
    var tSize = 4096.0;
    var tNumber = 4;
    vjsVolumeCore.createTexture(tNumber, tSize);

    var normalorigin = VJS.Adaptor.Xtk2ThreejsVec3(slice.z);
    var normaldirection = VJS.Adaptor.Xtk2ThreejsVec3(slice.ec);

    // Create VJS Slice Core and View
    var vjsSliceCore = new VJS.Slice.Core(normalorigin, normaldirection, vjsVolumeCore);
    vjsSliceCore.Slice();

    // Plane filled with volume's texture
    var vjsSliceView = new VJS.Slice.View(vjsSliceCore);
    var plane = vjsSliceView.RASSlice(tSize, tNumber);
    scene.add(plane);

    // Create another Slice!
    var vjsSliceCore2 = new VJS.Slice.Core(normalorigin, VJS.Adaptor.Xtk2ThreejsVec3([0, 1, 0]), vjsVolumeCore);
    vjsSliceCore2.Slice();

    // Plane filled with volume's texture
    var vjsSliceView2 = new VJS.Slice.View(vjsSliceCore2);
    var plane2 = vjsSliceView2.RASSlice(tSize, tNumber);
    scene.add(plane2);

    // Create another Slice!
    var vjsSliceCore3 = new VJS.Slice.Core(normalorigin, VJS.Adaptor.Xtk2ThreejsVec3([0, 0, 1]), vjsVolumeCore);
    vjsSliceCore3.Slice();

    // Plane filled with volume's texture
    var vjsSliceView3 = new VJS.Slice.View(vjsSliceCore3);
    var plane3 = vjsSliceView3.RASSlice(tSize, tNumber);
    scene.add(plane3);

    document.addEventListener('mousemove', onDocumentMouseMove, false);


    // start animation
    animate();
}

window.onload = function() {
    // create the 2D renderers (just load tand parse the file...)
    var sliceX = new X.renderer2D();
    sliceX.container = 'sliceX';
    sliceX.orientation = 'X';
    sliceX.init();

    volume = new X.volume();
    volume.file = '../../data/lesson17_cropped.nii.gz';
    // volume.file = 'data/CT.nii.gz';
    volume.reslicing = true;
    sliceX.add(volume);

    sliceX.render();
    sliceX.onShowtime = function() {
        init(volume.children[0].c[volume.indexX]);
    };
};
