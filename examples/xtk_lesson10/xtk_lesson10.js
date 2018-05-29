// XTK imports
import XRenderer3D from 'base/helpers/x/helpers.x.renderer3d';
import XMesh from 'base/helpers/x/helpers.x.mesh';
import XVolume from 'base/helpers/x/helpers.x.volume';

window.onload = function() {
    // INIT THE RENDERER
    const renderer = new XRenderer3D();
    renderer.animate();

    // CREATE THE 3D MESH
    const xMesh = new XMesh();
    xMesh.file =
      'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk';
    xMesh.materialColor = 0xFFEB3B;

    // LOAD AND RENDER THE 3D MESH
    xMesh.load().then((mesh) => {
      renderer.add(mesh);
    }).catch((error) =>
      console.log('ERROR: something went wrong with the mesh load.', error));

    // CREATE THE 3D VOLUME
    const xVolume = new XVolume();
    xVolume.file =
      'https://cdn.rawgit.com/FNNDSC/data/master/nifti/marc_avf/avf_float_32.nii.gz';
    xVolume.progressbarContainer = renderer.container;

    // LOAD AND RENDER THE 3D VOLUME
    xVolume.load().then((volume) => {
        renderer.add(volume);
        renderer.center(volume.centerLPS);

        // force first render
        renderer.render();
        // notify puppeteer to take screenshot
        const puppetDiv = document.createElement('div');
        puppetDiv.setAttribute('id', 'puppeteer');
        document.body.appendChild(puppetDiv);
    }).catch((error) =>
      console.log('ERROR: something went wrong with the volume load.', error));
};
