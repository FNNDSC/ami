/* globals Stats*/

// XTK imports
import XRenderer3D from '../../src/helpers/x/helpers.x.renderer3d';
import XMesh from '../../src/helpers/x/helpers.x.mesh';
import XVolume from '../../src/helpers/x/helpers.x.volume';

window.onload = function() {

    // init the renderer
    const renderer = new XRenderer3D();
    renderer.animate();

    // set the mesh, i.e. the 3D object
    const mesh      = new XMesh();
    mesh.file       = 'https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk';
    mesh.load().then( mesh => {
        renderer.add(mesh);
    }).catch( error => {
        window.console.log('ERROR: something went wrong with the mesh load.');
        window.console.log(error);
    });

    mesh._materialColor = 0xFFEB3B;
    // mesh._intoRenderer_load();

    // set the 3D volume
    const t2 = [
        'avf_float_32.nii.gz'
    ];
    const files = t2.map(function(v) {
        return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/marc_avf/' + v;
    });
    const volume    = new XVolume();
    volume.file     = files;
    volume.progressbar_container = renderer._container;

    volume.load().then( function() {
        renderer.add(volume);
        renderer.center(volume.centerLPS);
    }).catch( function(error) {
        window.console.log('ERROR: something went wrong with the vol load.');
        window.console.log(error);
    });
};
