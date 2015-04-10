'use strict';

var VJS = VJS || {};

var Stats = Stats || {};
// standard global variables
var controls, renderer, stats, volume;

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
    var threeD = document.getElementById('r3d');
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
    renderer.setClearColor(0xFFFFFF, 1);

    var maxTextureSize = renderer.context.getParameter(renderer.context.MAX_TEXTURE_SIZE);
    window.console.log(maxTextureSize);

    threeD.appendChild(renderer.domElement);

    // stats
    stats = new Stats();
    threeD.appendChild(stats.domElement);

    // scene
    var scene = new THREE.Scene();
    // camera
    var camera = new THREE.PerspectiveCamera(45, threeD.offsetWidth / threeD.offsetHeight, 1, 10000000);
    camera.position.x = 400;
    camera.position.y = 400;
    camera.position.z = 400;
    camera.lookAt(scene.position);
    // controls
    controls = new THREE.OrbitControls2D(camera, renderer.domElement);


    // create volume object

    var rasijk = VJS.adaptor.xtk2ThreejsMat4(volume.Qh);
    var ijkras = new THREE.Matrix4().getInverse(rasijk);
    var ijkdimensions = VJS.adaptor.xtk2ThreejsVec3(volume.ca);
    var rasdimensions = VJS.adaptor.xtk2ThreejsVec3(volume.gb);
    var rascenter = VJS.adaptor.xtk2ThreejsVec3(volume.s);
    var rasorigin = VJS.adaptor.xtk2ThreejsVec3(volume.Ea);

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
    var tSize = 4096.0;
    var tNumber = 4;
    var vjsVolumeCore = new VJS.volume.core(volume.J, volume.max, volume.min, transforms, ijk, ras, tNumber, tSize);
    vjsVolumeCore.createTexture();

    var vjsVolumeView = new VJS.volume.view(vjsVolumeCore);

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
    var normalorigin = VJS.adaptor.xtk2ThreejsVec3(slice.z);
    // var normaldirection = VJS.adaptor.xtk2ThreejsVec3(slice.ec);
    var normaldirection = VJS.adaptor.xtk2ThreejsVec3([1, 1, 1]);

    // Create VJS Slice Core and View
    var vjsSliceCore = new VJS.slice.core(normalorigin, normaldirection, vjsVolumeCore);
    vjsSliceCore.slice();


    for (var l = 0; l < vjsSliceCore._intersections.length; l++) {
        var sphereGeometry4 = new THREE.SphereGeometry(3);
        var materialIntersection4 = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, l / vjsSliceCore._intersections.length, 0)
        });
        var sphere4 = new THREE.Mesh(sphereGeometry4, materialIntersection4);
        sphere4.applyMatrix(new THREE.Matrix4().makeTranslation(vjsSliceCore._intersections[l].x, vjsSliceCore._intersections[l].y, vjsSliceCore._intersections[l].z));
        scene.add(sphere4);
    }

    var materialIntersection3 = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    var sphereGeometry3 = new THREE.SphereGeometry(3);
    var sphere3 = new THREE.Mesh(sphereGeometry3, materialIntersection3);
    sphere3.applyMatrix(new THREE.Matrix4().makeTranslation(vjsSliceCore._centerOfMass.x, vjsSliceCore._centerOfMass.y, vjsSliceCore._centerOfMass.z));
    scene.add(sphere3);


    // Plane filled with volume's texture
    // use this one as a plane
    var vjsSliceView = new VJS.slice.view(vjsSliceCore);
    var plane = vjsSliceView.RASSlice(tSize, tNumber);
    scene.add(plane);

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
