/* globals Stats, dat, AMI*/

import ControlsTrackball from '../../src/controls/controls.trackball';
import HelpersStack      from '../../src/helpers/helpers.stack';
import LoadersVolume     from '../../src/loaders/loaders.volume';

// standard global letiables
let controls, renderer, stats, scene, camera, stackHelper, particleLight, line, threeD;

function componentToHex( c ) {

  var hex = c.toString( 16 );
  return hex.length === 1 ? '0' + hex : hex;

}

function rgbToHex( r, g, b ) {

  return '#' + componentToHex( r ) + componentToHex( g ) + componentToHex( b );

}


function updateGeometries() {

  if ( stackHelper ) {

    // move the "light"
    // update light position
    let timer = Date.now() * 0.00025;
    particleLight.position.x = Math.sin(timer * 7) * 70;
    particleLight.position.y = Math.cos(timer * 5) * 80;
    particleLight.position.z = Math.cos(timer * 3) * 90;

    // re-draw the line
    line.geometry.vertices[0] = stackHelper.slice.planePosition;
    line.geometry.vertices[1] = particleLight.position;
    line.geometry.verticesNeedUpdate = true;

    // update plane direction...
    let dirLPS = new THREE.Vector3(
      particleLight.position.x - stackHelper.slice.planePosition.x,
      particleLight.position.y - stackHelper.slice.planePosition.y,
      particleLight.position.z - stackHelper.slice.planePosition.z
    ).normalize();

    // update slice and THEN its border
    stackHelper.slice.planeDirection = dirLPS;
    // update border with new slice
    stackHelper.border.helpersSlice = stackHelper.slice;


    // update colors based on planeDirection
    let color = rgbToHex(
      Math.round( Math.abs( 255*dirLPS.x ) ),
      Math.round( Math.abs( 255*dirLPS.y ) ),
      Math.round( Math.abs( 255*dirLPS.z) ) );
    stackHelper.bbox.color = color;
    stackHelper.border.color = color;
    particleLight.material.color.set( color );
    line.material.color.set( color );

  }

}

function init() {

  // this function is executed on each animation frame
  function animate() {

    updateGeometries();

    controls.update();
    renderer.render( scene, camera );
    stats.update();

    // request new frame
    requestAnimationFrame( function() {

      animate();

    } );
  }

  // renderer
  threeD = document.getElementById( 'r3d' );
  renderer = new THREE.WebGLRenderer( {
    antialias: true
  } );
  renderer.setSize( threeD.offsetWidth, threeD.offsetHeight );
  renderer.setClearColor( 0x353535, 1 );
  renderer.setPixelRatio( window.devicePixelRatio );
  threeD.appendChild( renderer.domElement );

  // stats
  stats = new Stats();
  threeD.appendChild( stats.domElement );

  // scene
  scene = new THREE.Scene();

  // camera
  camera = new THREE.PerspectiveCamera( 45, threeD.offsetWidth / threeD.offsetHeight, 0.01, 10000000 );
  camera.position.x = 150;
  camera.position.y = 150;
  camera.position.z = 100;

  // controls
  controls = new ControlsTrackball( camera, threeD );
  controls.rotateSpeed = 1.4;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.dynamicDampingFactor = 0.3;

  particleLight = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({color: 0xFFF336}));
  scene.add(particleLight);

  animate();
}

window.onload = function() {

  // init threeJS...
  init();

  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume( threeD );

  var t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36444420', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242',
    '36748256'
  ];

  var files = t2.map( function( v ) {

    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;

  });

  // load sequence for each file
  let seriesContainer = [];
  let loadSequence = [];
  files.forEach( function( url ) {

    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then (function() {

        return loader.fetch( url );

      } )
      .then( function( data ) {

        return loader.parse( data );

      } )
      .then( function( series) {

        seriesContainer.push(series);

      } )
      .catch( function( error ) {

        window.console.log( 'oops... something went wrong...' );
        window.console.log( error );

      } )
    );
  });

  // load sequence for all files
  Promise
  .all( loadSequence )
  .then( function() {

    loader.free();
    loader = null;

    let series = seriesContainer[0].mergeSeries( seriesContainer )[0];
    let stack = series.stack[0];
    stackHelper = new HelpersStack( stack );
    let centerLPS = stackHelper.stack.worldCenter();
    stackHelper.slice.aabbSpace = 'LPS';
    stackHelper.slice.planePosition.x = centerLPS.x;
    stackHelper.slice.planePosition.y = centerLPS.y;
    stackHelper.slice.planePosition.z = centerLPS.z;
    scene.add( stackHelper );

    // LINE STUFF
    var materialLine = new THREE.LineBasicMaterial();
    var geometryLine = new THREE.Geometry();
    stackHelper.slice.updateMatrixWorld();
    geometryLine.vertices.push( stackHelper.slice.position );
    geometryLine.vertices.push( particleLight.position );
    geometryLine.verticesNeedUpdate = true;
    line = new THREE.Line( geometryLine, materialLine );
    scene.add( line );

    // update camrea's and control's target
    camera.lookAt( centerLPS.x, centerLPS.y, centerLPS.z );
    camera.updateProjectionMatrix();
    controls.target.set( centerLPS.x, centerLPS.y, centerLPS.z );

    // create GUI
    let gui = new dat.GUI({
      autoPlace: false
    });

    let customContainer = document.getElementById( 'my-gui-container' );
    customContainer.appendChild( gui.domElement );
    customContainer = null;

    let positionFolder = gui.addFolder( 'Plane position' );
    let worldBBox = stackHelper.stack.worldBoundingBox();
    let frameIndexControllerOriginI = positionFolder.add( stackHelper.slice.planePosition, 'x',
      worldBBox[0], worldBBox[1] ).step( 0.01 ).listen();
    let frameIndexControllerOriginJ = positionFolder.add( stackHelper.slice.planePosition, 'y',
      worldBBox[2], worldBBox[3] ).step( 0.01 ).listen();
    let frameIndexControllerOriginK = positionFolder.add( stackHelper.slice.planePosition, 'z',
      worldBBox[4], worldBBox[5] ).step( 0.01 ).listen();
    let interpolation = positionFolder.add( stackHelper.slice, 'interpolation',
      0, 1 ).step( 1 ).listen();
    positionFolder.open();


    frameIndexControllerOriginI.onChange( updateGeometries );
    frameIndexControllerOriginJ.onChange( updateGeometries );
    frameIndexControllerOriginK.onChange( updateGeometries );

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

    window.addEventListener( 'resize', onWindowResize, false );
  })
  .catch(function(error) {
    window.console.log( 'oops... something went wrong...' );
    window.console.log( error );
  });
};


