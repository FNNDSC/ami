'use strict';

var Stats = Stats || {};
var Detector = Detector || {};
var VJS = VJS || {};

if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}
var container, stats;

var camera, controls, scene, renderer;

var group, groupTrk;
var flength = 0;
var direction = 1;

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();

}

function filter() {
    if (typeof(groupTrk) === 'undefined') {
        return;
    }

    if (flength >= 150) {
        direction = -1;
    } else if (flength <= 0) {
        direction = 1;
    }
    flength = flength + direction * 0.5;

    for (var j = 0; j < groupTrk.length; j++) {
        if (groupTrk[j].xProperties.length < flength) {
            group.children[j].visible = false;
        } else {
            group.children[j].visible = true;
        }
    }
}

function animate() {

    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);

    filter();

    stats.update();

}

function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1e10);
    camera.position.z = 150;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls = new THREE.TrackballControls(camera);

    scene = new THREE.Scene();

    scene.add(camera);

    // light

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();

    camera.add(dirLight);
    camera.add(dirLight.target);

    var material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 1,
        linewidth: 2,
        vertexColors: THREE.VertexColors
    });

    var loader = new VJS.Trk.Loader();
    loader.load('../../data/trk/cctracks.trk', function(geometryObjs) {
        var nbTracks = geometryObjs.length;
        groupTrk = geometryObjs;
        group = new THREE.Group();
        for (var i = 0; i < nbTracks; i++) {
            var geometryObj = geometryObjs[i];
            var mesh = new THREE.Line(geometryObj.geometry, material);
            group.add(mesh);
        }
        var bbox = new THREE.Box3().setFromObject(group);
        group.translateX(-(bbox.max.x + bbox.min.x) / 2);
        group.translateY(-(bbox.max.y + bbox.min.y) / 2);
        group.translateZ(-(bbox.max.z + bbox.min.z) / 2);
        scene.add(group);
        var hex = 0xffffff;
        var bbox2 = new THREE.BoundingBoxHelper(group, hex);
        bbox2.update();
        scene.add(bbox2);
    });

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x607D8B, 0);

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    //

    window.addEventListener('resize', onWindowResize, false);

}


init();
animate();
