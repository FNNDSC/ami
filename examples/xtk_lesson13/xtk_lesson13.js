/* globals dat*/

import XRenderer3D from 'base/helpers/x/helpers.x.renderer3d';
import XRenderer2D from 'base/helpers/x/helpers.x.renderer2d';
import XVolume from 'base/helpers/x/helpers.x.volume';

import HelpersBoundingBox from 'base/helpers/helpers.boundingbox';

// files to be loaded
const t2 = [
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
  '36748480', '36748494', '36748508', '36748522', '36748242',
];
const files = t2.map(function(v) {
  return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
});

window.onload = function() {
  // CREATE RENDERER 3D
  const renderer0 = new XRenderer3D('r0');
  renderer0.animate();

  // CREATE RENDERER 2D
  const renderer1 = new XRenderer2D('r1', 'sagittal');
  renderer1.animate();

  // CREATE RENDERER 2D
  const renderer2 = new XRenderer2D('r2', 'axial');
  renderer2.animate();

  // CREATE RENDERER 2D
  const renderer3 = new XRenderer2D('r3', 'coronal');
  renderer3.animate();

  // CREATE THE 3D VOLUME
  const xVolume = new XVolume();
  xVolume.file = files;
  xVolume.progressbarContainer = renderer0.container;

  // LOAD AND RENDER THE 3D VOLUME
  xVolume.load().then((volume) => {
    // white BBox
    let box = new HelpersBoundingBox(volume.stack);
    renderer0.add(box);
    renderer0.center(volume.centerLPS);

    // sagittal view
    volume._xSlice.bbox.visible = false;
    volume._xSlice.borderColor = 0xF44336;
    renderer1.add(volume._xSlice);
    renderer0.add(renderer1._scene);

    // axial view
    volume._ySlice.bbox.visible = false;
    volume._ySlice.borderColor = 0xFFEB3B;
    renderer2.add(volume._ySlice);
    renderer0.add(renderer2._scene);

    // coronal view
    volume._zSlice.bbox.visible = false;
    volume._zSlice.borderColor = 0x8BC34A;
    renderer3.add(volume._zSlice);
    renderer0.add(renderer3._scene);

    // build the GUI
    let gui = new dat.GUI({
      autoPlace: false,
    });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let stackFolder1 = gui.addFolder('Sagittal');
    stackFolder1.add(
      volume._xSlice, 'index', 0, volume._xSlice.orientationMaxIndex)
      .step(1).listen();
    volume._xSlice.index = Math.floor(volume._xSlice.orientationMaxIndex/2);

    let stackFolder2 = gui.addFolder('Axial');
    stackFolder2.add(
      volume._ySlice, 'index', 0, volume._ySlice.orientationMaxIndex)
      .step(1).listen();
    volume._ySlice.index = Math.floor(volume._ySlice.orientationMaxIndex/2);

    let stackFolder3 = gui.addFolder('Coronal');
    stackFolder3.add(
      volume._zSlice, 'index', 0, volume._zSlice.orientationMaxIndex)
      .step(1).listen();
    volume._zSlice.index = Math.floor(volume._zSlice.orientationMaxIndex/2);

    // notify puppeteer to take screenshot
    const puppetDiv = document.createElement('div');
    puppetDiv.setAttribute('id', 'puppeteer');
    document.body.appendChild(puppetDiv);
  }).catch((error) => {
    console.log('ERROR: something went wrong with the volume load.', error);
  });
};
