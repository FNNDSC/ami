import {Matrix4} from 'three';

/**
 * @module helpers/x/mesh
 */

export default class {
  constructor() {
    this._file = null;

    this._3jsVTK_loader = new THREE.VTKLoader();
    this._mesh = null;
    this._materialColor = 0xE91E63;
    this._RAStoLPS = null;
    this._material = new THREE.MeshLambertMaterial({
      shading: THREE.SmoothShading,
      color: this._materialColor,
      side: THREE.DoubleSide,
    });
  }

  // accessor properties
  get file() {
    return this._file;
  }

  set file(fname) {
    this._file = fname;
  }

  get materialColor() {
    return this._materialColor;
  }

  set materialColor(color) {
    this._materialColor = color;
  }

  // load function
  load() {
    if (this.file) {
      return new Promise((resolve, reject) => {
        this._3jsVTK_loader.load(this.file,
          (geometry) => {
              geometry.computeVertexNormals();
              this._mesh = new THREE.Mesh(geometry, this._material);
              this._RAStoLPS = new Matrix4();
              this._RAStoLPS.set(-1, 0, 0, 0,
                                  0, -1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1);
              this._mesh.applyMatrix(this._RAStoLPS);
              // resolve the promise and return the mesh
              resolve(this._mesh);
          },
          () => {},
          (error) => {
            console.log(error);
            reject({
              message: `Couldn't load file: ${this.file}.`,
              error,
            });
        });
      });
    }

    return Promise.reject({message: `File is not defined: ${this.file}.`});
  }
}
