'use strict';

var VJS = VJS || {};

var Stats = Stats || {};
// standard global variables
var controls, renderer, stats, volume, plane, plane2, plane3, plane4, threeD;

// FUNCTIONS
function init(slice) {
    // this function is executed on each animation frame
    function animate() {

        // render
        controls.update();
        renderer.render(scene, camera);
        stats.update();

        // request new frame
        requestAnimationFrame(function() {
            animate();
        });
    }

    // renderer
    threeD = document.getElementById('r3d');
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
    var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
    camera.position.x = 400;
    camera.lookAt(scene.position);
    // controls
    controls = new THREE.OrbitControls2D(camera, renderer.domElement);


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
    plane = vjsSliceView.RASSlice(tSize, tNumber);
    scene.add(plane);

    // Create another Slice!
    var vjsSliceCore2 = new VJS.Slice.Core(normalorigin, VJS.Adaptor.Xtk2ThreejsVec3([1, 0, 1]), vjsVolumeCore);
    vjsSliceCore2.Slice();

    // Plane filled with volume's texture
    var vjsSliceView2 = new VJS.Slice.View(vjsSliceCore2);
    plane2 = vjsSliceView2.RASSlice(tSize, tNumber);
    scene.add(plane2);

    // Create another Slice!
    var vjsSliceCore3 = new VJS.Slice.Core(normalorigin, VJS.Adaptor.Xtk2ThreejsVec3([0, 0, 1]), vjsVolumeCore);
    vjsSliceCore3.Slice();

    // Plane filled with volume's texture
    var vjsSliceView3 = new VJS.Slice.View(vjsSliceCore3);
    plane3 = vjsSliceView3.RASSlice(tSize, tNumber);
    scene.add(plane3);

    // Create another Slice!
    var vjsSliceCore4 = new VJS.Slice.Core(normalorigin, VJS.Adaptor.Xtk2ThreejsVec3([-1, 0, 1]), vjsVolumeCore);
    vjsSliceCore4.Slice();

    // Plane filled with volume's texture
    var vjsSliceView4 = new VJS.Slice.View(vjsSliceCore4);
    plane4 = vjsSliceView4.RASSlice(tSize, tNumber);
    scene.add(plane4);

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
