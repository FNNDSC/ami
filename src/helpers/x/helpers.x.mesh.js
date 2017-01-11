/**
 * @module helpers/x/mesh
 */
export default class {
  constructor(){

    this._renderer      = null;
    this._file          = null;

    this._3jsVTK_loader = new THREE.VTKLoader();
    this._mesh          = null;
    this._file          = null;
    this._materialColor = 0xE91E63;
    this._RAStoLPS      = null;
    this._material      = new THREE.MeshLambertMaterial( {
                                  shading:  THREE.SmoothShading,
                                  color:    this._materialColor,
                                  side:     THREE.DoubleSide}
                                );
    this._b_loaded       = false;

    console.log('Leaving mesh constructor...');
//    this._mesh_load();
  }


  // private methods
  _intoRenderer_load() {
    // load vtk file
    self  = this;

    console.log('about to call asynchronous load...');

    // Remember the callback is asynchronous!
    this._3jsVTK_loader.load('https://cdn.rawgit.com/FNNDSC/data/master/vtk/marc_avf/avf.vtk',
                            function ( geometry ) {
      geometry.computeVertexNormals();
      console.log('in _mesh_load ' + self);
      self._mesh      = new THREE.Mesh( geometry, self._material );
      self._RAStoLPS  = new THREE.Matrix4();
      self._RAStoLPS.set(-1,   0,    0,   0,
                          0,  -1,    0,   0,
                          0,   0,    1,   0,
                          0,   0,    0,   1);
      self._mesh.applyMatrix(self._RAStoLPS);
      self._renderer._scene.add(self._mesh);

      self._mesh_loaded();
    } );

    console.log('after asynchronous call.. the mesh load probably has not happened yet...');
  }

  _mesh_loaded() {
    // This function is called when the callback is done...

    console.log('load callback seems done...');
    self._b_loaded  = true;
    console.log(this);
  }

  _create(){
  }

  _update(){
  }

}