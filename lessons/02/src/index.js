import { files, stlModel, colors } from './utils';

// Classic ThreeJS setup
const container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(colors.darkGrey, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.offsetWidth / container.offsetHeight,
  0.1,
  1000
);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 100;

const controls = new AMI.TrackballControl(camera, container);

const onWindowResize = () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.offsetWidth, container.offsetHeight);
};
window.addEventListener('resize', onWindowResize, false);

const particleLight = new THREE.Mesh(
  new THREE.SphereBufferGeometry(4, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
scene.add(particleLight);

scene.add(new THREE.AmbientLight(0x222222));

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 800);
particleLight.add(pointLight);

// Load model and transform to LPS space
const loaderSTL = new THREE.STLLoader();
loaderSTL.load(stlModel, geometry => {
  const material = new THREE.MeshPhongMaterial({
    color: 0xf44336,
    specular: 0x111111,
    shininess: 200,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // to LPS space
  const RASToLPS = new THREE.Matrix4();
  RASToLPS.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  mesh.applyMatrix(RASToLPS);
  scene.add(mesh);
});

// Load DICOM data and setup the stack helper
var loader = new AMI.VolumeLoader(container);
loader
  .load(files)
  .then(function() {
    const series = loader.data[0].mergeSeries(loader.data);
    const stack = series[0].stack[0];
    loader.free();

    const stackHelper = new AMI.StackHelper(stack);
    stackHelper.border.color = colors.red;
    scene.add(stackHelper);

    const centerLPS = stackHelper.stack.worldCenter();
    camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    camera.updateProjectionMatrix();
    controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

const animate = () => {
  var timer = Date.now() * 0.00025;

  particleLight.position.x = Math.sin(timer * 7) * 100;
  particleLight.position.y = Math.cos(timer * 5) * 120;
  particleLight.position.z = Math.cos(timer * 3) * 140;

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(function() {
    animate();
  });
};
animate();
