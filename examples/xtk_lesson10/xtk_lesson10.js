/* globals Stats*/

// XTK imports
import XRenderer3D from '../../src/helpers/x/helpers.x.renderer3d';
import XMesh       from '../../src/helpers/x/helpers.x.mesh';

// all the code below is a THREEJS/AMI mix that should be removed
import HelpersStack      from '../../src/helpers/helpers.stack';
import LoadersVolume     from '../../src/loaders/loaders.volume';

// standard global variables
let controls, renderer, stackHelper, stackHelper2, stackHelper3;

window.onload = function() {

  // init the renderer
  renderer = new XRenderer3D();
  renderer.animate();

  // set the mesh, i.e. the 3D object
  mesh                  = new XMesh();
  mesh._renderer        = renderer;
  mesh._file            = 'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk';
  mesh._materialColor   = 0xE91E63;
  mesh._intoRenderer_load();

  // load vtk file
  var loader1 = new THREE.VTKLoader();
  loader1.load( 'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk', function ( geometry ) {
    geometry.computeVertexNormals();
    var material = new THREE.MeshLambertMaterial( {
      shading: THREE.SmoothShading,
      color: 0xFFEB3B,
      side: THREE.DoubleSide} );
    var mesh = new THREE.Mesh( geometry, material );
    var RASToLPS = new THREE.Matrix4();
    RASToLPS.set(-1, 0, 0, 0,
                0, -1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
    mesh.applyMatrix(RASToLPS);
    renderer.add( mesh );
  } );

  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(renderer._container);

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

    // slice orientation 0
    stackHelper = new HelpersStack(stack);
    stackHelper.border.color = 0xF44336;
    renderer.add(stackHelper);

    // slice orientation 1
    stackHelper2 = new HelpersStack(stack);
    stackHelper2.orientation = 1;
    stackHelper2.bbox.visible = false;
    stackHelper2.border.color = 0x4CAF50;
    renderer.add(stackHelper2);

    // slice orientation 2
    stackHelper3 = new HelpersStack(stack);
    stackHelper3.orientation = 2;
    stackHelper3.bbox.visible = false;
    stackHelper3.border.color = 0x2196F3;
    renderer.add(stackHelper3);

    let centerLPS = stackHelper.stack.worldCenter();
    renderer.center(centerLPS);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });
};
