/* globals Stats*/

// XTK imports
import XRenderer3D from '../../src/helpers/x/helpers.x.renderer3d';

// all the code below is a THREEJS/AMI mix that should be removed

import HelpersStack      from '../../src/helpers/helpers.stack';
import LoadersVolume     from '../../src/loaders/loaders.volume';

// standard global variables
let controls, renderer, stats, scene, camera, stackHelper, threeD;


window.onload = function() {

  // init the renderer
  renderer = new XRenderer3D();
  renderer.animate();

  // load vtk file
  var loader1 = new THREE.VTKLoader();
  loader1.load( 'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk', function ( geometry ) {
    geometry.computeVertexNormals();
    var material = new THREE.MeshLambertMaterial( {
      shading: THREE.SmoothShading,
      color: 0xE91E63,
      side: THREE.DoubleSide} );
    var mesh = new THREE.Mesh( geometry, material );
    var RASToLPS = new THREE.Matrix4();
    RASToLPS.set(-1, 0, 0, 0,
                0, -1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
    mesh.applyMatrix(RASToLPS);
    renderer._scene.add( mesh );
  } );

  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);

  var t2 = [
    'avf_float_32.nii.gz'
  ];

  var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/marc_avf/' + v;
  });

  // load sequence for each file
  let seriesContainer = [];
  let loadSequence = [];
  files.forEach(function(url) {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(function() {
        return loader.fetch(url);
      })
      .then(function(data) {
        return loader.parse(data);
      })
      .then(function(series) {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

  // load sequence for all files
  Promise
  .all(loadSequence)
  .then(function() {
    loader.free();
    loader = null;
    // make a proper function for this guy...
    let series = seriesContainer[0].mergeSeries(seriesContainer)[0];
    let stack = series.stack[0];
    stackHelper = new HelpersStack(stack);
    stackHelper.bbox.color = 0xF9F9F9;
    stackHelper.border.color = 0xF9F9F9;
    renderer._scene.add(stackHelper);

    // update camrea's and control's target
    let centerLPS = stackHelper.stack.worldCenter();
    renderer._camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
    renderer._camera.updateProjectionMatrix();
    renderer._controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);

    function onWindowResize() {

      renderer._camera.aspect = window.innerWidth / window.innerHeight;
      renderer._camera.updateProjectionMatrix();

      renderer._renderer.setSize(window.innerWidth, window.innerHeight);

    }

    window.addEventListener('resize', onWindowResize, false);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
};
