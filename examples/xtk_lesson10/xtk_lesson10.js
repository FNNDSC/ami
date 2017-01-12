/* globals Stats*/

// XTK imports
import XRenderer3D from '../../src/helpers/x/helpers.x.renderer3d';
import XMesh from '../../src/helpers/x/helpers.x.mesh';
import XVolume from '../../src/helpers/x/helpers.x.volume';

window.onload = function() {

    // INIT THE RENDERER
    const renderer = new XRenderer3D();
    renderer.animate();


    // CREATE THE 3D MESH
    const mesh = new XMesh();
    mesh.file = 'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk';
    mesh.materialColor = 0xFFEB3B;

    // LOAD AND RENDER THE 3D MESH
    mesh.load().then( mesh => renderer.add(mesh) ).catch( error =>
      console.log('ERROR: something went wrong with the mesh load.', error) );


    // CREATE THE 3D VOLUME
    const t2 = [
        'avf_float_32.nii.gz'
    ];
    const files = t2.map(function(v) {
        return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/marc_avf/' + v;
    });
    const volume = new XVolume();
    volume.file = files;
    volume.progressbar_container = renderer._container;

    // LOAD AND RENDER THE 3D VOLUME
    volume.load().then( () => {
        renderer.add(volume);
        renderer.center(volume.centerLPS);
    }).catch( error =>
      console.log('ERROR: something went wrong with the volume load.', error) );
};
