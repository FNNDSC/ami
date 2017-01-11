/* globals dat*/

import XRenderer3D        from '../../src/helpers/x/helpers.x.renderer3d';
import XRenderer2D        from '../../src/helpers/x/helpers.x.renderer2d';
import HelpersBoundingBox from '../../src/helpers/helpers.boundingbox';

import HelpersStack         from '../../src/helpers/helpers.stack';
import LoadersVolume        from '../../src/loaders/loaders.volume';

// standard global variables
let renderer0, renderer1, renderer2, renderer3;
let stackHelper1, stackHelper2, stackHelper3;

function init() {

  // CREATE RENDERER 3D
  renderer0 = new XRenderer3D('r0');
  renderer0.animate();

  // CREATE RENDERER 2D
  renderer1 = new XRenderer2D('r1', 'sagittal');
  renderer1.animate();

  // CREATE RENDERER 2D
  renderer2 = new XRenderer2D('r2', 'axial');
  renderer2.animate();

  // CREATE RENDERER 2D
  renderer3 = new XRenderer2D('r3', 'coronal');
  renderer3.animate();
}

window.onload = function() {

  // init threeJS
  init();

  var t2 = [
    '36444280', '36444294', '36444308', '36444322', '36444336',
    '36444350', '36444364', '36444378', '36444392', '36444406',
    '36748256', '36444434', '36444448', '36444462', '36444476',
    '36444490', '36444504', '36444518', '36444532', '36746856',
    '36746870', '36746884', '36746898', '36746912', '36746926',
    '36746940', '36746954', '36746968', '36746982', '36746996',
    '36747010', '36747024', '36748200', '36748214', '36748228',
    '36748270', '36748284', '36748298', '36748312', '36748326',
    '36748340', '36748354', '36748368', '36748382', '36748396',
    '36748410', '36748424', '36748438', '36748452', '36748466',
    '36748480', '36748494', '36748508', '36748522', '36748242'
  ];
  var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  var loader = new LoadersVolume();
  var seriesContainer = [];
  var loadSequence = [];
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
    var series = seriesContainer[0].mergeSeries(seriesContainer)[0];
    // get first stack from series
    var stack = series.stack[0];
    // prepare it
    // * ijk2LPS transforms
    // * Z spacing
    // * etc.
    //
    stack.prepare();
    // pixels packing for the fragment shaders now happens there
    stack.pack();
    renderer0.center( stack.worldCenter() );

    var box = new HelpersBoundingBox( stack );
    renderer0.add(box);

    // fill second renderer
    stackHelper1 = new HelpersStack(stack);
    stackHelper1.bbox.visible = false;
    stackHelper1.border.color = 0xF44336;
    // scene
    renderer1.add(stackHelper1);
    renderer0.add(renderer1._scene);

    // fill third renderer
    stackHelper2 = new HelpersStack(stack);
    stackHelper2.bbox.visible = false;
    stackHelper2.border.color = 0xFFEB3B;
    // scene
    renderer2.add(stackHelper2);
    renderer0.add(renderer2._scene);

    //Fill fourth renderer
    stackHelper3 = new HelpersStack(stack);
    stackHelper3.bbox.visible = false;
    stackHelper3.border.color = 0x8BC34A;
    // scene
    renderer3.add(stackHelper3);
    renderer0.add(renderer3._scene);

    let gui = new dat.GUI({
            autoPlace: false
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let stackFolder1 = gui.addFolder('Sagittal');
    stackFolder1.add(stackHelper1, 'index', 0, stackHelper1.orientationMaxIndex).step(1).listen();
    stackHelper1.index = Math.floor(stackHelper1.orientationMaxIndex/2);

    let stackFolder2 = gui.addFolder('Axial');
    stackFolder2.add(stackHelper2, 'index', 0, stackHelper2.orientationMaxIndex).step(1).listen();
    stackFolder2.index = Math.floor(stackHelper2.orientationMaxIndex/2);

    let stackFolder3 = gui.addFolder('Coronal');
    stackFolder3.add(stackHelper3, 'index', 0, stackHelper3.orientationMaxIndex).step(1).listen();
    stackHelper3.index = Math.floor(stackHelper3.orientationMaxIndex/2);
  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

};
