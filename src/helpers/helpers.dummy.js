/**
 * @module helpers/dummy
 */
export default class HelpersDummy extends THREE.Object3D {
  constructor() {
    //
    super();

    // this._material = null;
    // this._geometry = null;
    this._mesh = null;

    // update object
    this._create();
    window.console.log(this.uuid);
  }

  // private methods
  _create() {
    let geometry = new THREE.SphereGeometry(5, 32, 32);
    let material = new THREE.MeshBasicMaterial({color: 0xffff00});
    this._mesh = new THREE.Mesh(geometry, material);

    // and add it!
    this.add(this._mesh);
    // this.remove(this._mesh);
  }

  _update() {
    // update slice
    if (this._mesh) {
      this._mesh.uuid = null;
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.geometry = null;
      // we do not want to dispose the texture!
      this._mesh.material.dispose();
      this._mesh.material = null;
      this._mesh = null;
    }

    this._create();
  }
}
