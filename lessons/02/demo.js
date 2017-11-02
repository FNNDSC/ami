/* globals AMI*/

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
var camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.01, 10000000);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 100;

// Setup controls
var controls = new AMI.TrackballControl(camera, container);

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
}
window.addEventListener('resize', onWindowResize, false);

// Setup lights
var particleLight = new THREE.Mesh(
    new THREE.SphereBufferGeometry(4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
);
scene.add(particleLight);

scene.add(new THREE.AmbientLight(0x222222));

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

var pointLight = new THREE.PointLight(0xffffff, 2, 800);
particleLight.add(pointLight);

// Load STL model
var loaderSTL = new THREE.STLLoader();
loaderSTL.load('https://cdn.rawgit.com/FNNDSC/data/master/stl/adi_brain/WM.stl', function(geometry) {
    var material = new THREE.MeshPhongMaterial({ color: 0xf44336, specular: 0x111111, shininess: 200 });
    var mesh = new THREE.Mesh(geometry, material);
    // to LPS space
    var RASToLPS = new THREE.Matrix4();
    RASToLPS.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    mesh.applyMatrix(RASToLPS);
    scene.add(mesh);
});

// Setup loader
var loader = new AMI.VolumeLoader(container);

var t1 = [
    '36747136',
    '36747150',
    '36747164',
    '36747178',
    '36747192',
    '36747206',
    '36747220',
    '36747234',
    '36747248',
    '36747262',
    '36747276',
    '36747290',
    '36747304',
    '36747318',
    '36747332',
    '36747346',
    '36747360',
    '36747374',
    '36747388',
    '36747402',
    '36747416',
    '36747430',
    '36747444',
    '36747458',
    '36747472',
    '36747486',
    '36747500',
    '36747514',
    '36747528',
    '36747542',
    '36747556',
    '36747570',
    '36747584',
    '36747598',
    '36747612',
    '36747626',
    '36747640',
    '36747654',
    '36747668',
    '36747682',
    '36747696',
    '36747710',
    '36747724',
    '36747738',
    '36747752',
    '36747766',
    '36747780',
    '36747794',
    '36747808',
    '36747822',
    '36747836',
    '36747850',
    '36747864',
    '36747878',
    '36747892',
    '36747906',
    '36747920',
    '36747934',
    '36747948',
    '36747962',
    '36747976',
    '36747990',
    '36748004',
    '36748018',
    '36748032',
    '36748046',
    '36748060',
    '36748074',
    '36748088',
    '36748102',
    '36748116',
    '36748130',
    '36748144',
    '36748158',
    '36748172',
    '36748186',
    '36748578',
    '36748592',
    '36748606',
    '36748620',
    '36748634',
    '36748648',
    '36748662',
    '36748676',
    '36748690',
    '36748704',
    '36748718',
    '36748732',
    '36748746',
    '36748760',
    '36748774',
    '36748788',
    '36748802',
    '36748816',
    '36748830',
    '36748844',
    '36748858',
    '36748872',
    '36748886',
    '36748900',
    '36748914',
    '36748928',
    '36748942',
    '36748956',
    '36748970',
    '36748984',
    '36748998',
    '36749012',
    '36749026',
    '36749040',
    '36749054',
    '36749068',
    '36749082',
    '36749096',
    '36749110',
    '36749124',
    '36749138',
    '36749152',
    '36749166',
    '36749180',
    '36749194',
    '36749208',
    '36749222',
    '36749236',
    '36749250',
    '36749264',
    '36749278',
    '36749292',
    '36749306',
    '36749320',
    '36749334',
    '36749348',
    '36749362',
    '36749376',
    '36749390',
    '36749404',
    '36749418',
    '36749446',
    '36749460',
    '36749474',
    '36749488',
    '36749502',
    '36749516',
    '36749530',
    '36749544',
    '36749558',
    '36749572',
    '36749586',
    '36749600',
    '36749614',
    '36749628',
    '36749642',
    '36749656',
    '36749670',
    '36749684',
    '36749698',
    '36749712',
    '36749726',
    '36749740',
    '36749754',
    '36749768',
    '36749782',
    '36749796',
    '36749810',
    '36749824',
    '36749838',
    '36749852',
    '36749866',
    '36749880',
    '36749894',
    '36749908',
    '36749922',
    '36749936',
    '36749950',
    '36749964'
];

var files = t1.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
});

loader
    .load(files)
    .then(function() {
        // merge files into clean series/stack/frame structure
        var series = loader.data[0].mergeSeries(loader.data);
        loader.free();
        loader = null;

        // be carefull that series and target stack exist!
        var stackHelper = new AMI.StackHelper(series[0].stack[0]);
        stackHelper.border.color = 0xffeb3b;

        scene.add(stackHelper);

        // center camera and interactor to center of bouding box
        // for nicer experience
        var centerLPS = stackHelper.stack.worldCenter();
        camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
        camera.updateProjectionMatrix();
        controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    })
    .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
    });

/**
 * Start animation loop
 */
function animate() {
    var timer = Date.now() * 0.00025;

    particleLight.position.x = Math.sin(timer * 7) * 100;
    particleLight.position.y = Math.cos(timer * 5) * 120;
    particleLight.position.z = Math.cos(timer * 3) * 140;

    controls.update();
    renderer.render(scene, camera);

    // request new frame
    requestAnimationFrame(function() {
        animate();
    });
}
animate();
