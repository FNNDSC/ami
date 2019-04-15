const THREE = (window as any).THREE;

/**
 * @module helpers/dummy
 */
export default class DummyHelper extends THREE.Object3D {
  private _mesh: any;
  private _material: any;
  private _geometry: any;

  constructor() {
    super();

    this._material = null;
    this._geometry = null;
    this._mesh = null;

    this._create();
    window.console.log(this.uuid);
  }

  // private methods
  _create() {
    this._geometry = new THREE.SphereGeometry(5, 32, 32);
    this._material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this._mesh = new THREE.Mesh(this._geometry, this._material);

    this.add(this._mesh);
  }

  _update() {
    // update slice
    if (this._mesh) {
      this._mesh.uuid = null;
      this.remove(this._mesh);
      this.geometry.dispose();
      this.geometry = null;
      // we do not want to dispose the texture!
      this.material.dispose();
      this.material = null;
      this._mesh = null;
    }

    this._create();
  }
}
