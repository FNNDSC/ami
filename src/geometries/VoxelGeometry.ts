import THREE from "three";

/**
 * @module geometries/voxel
 */

 export default class VoxelGeometry extends THREE.BoxGeometry {
   private _location: THREE.Vector3;

   constructor(dataPosition: THREE.Vector3) {
    super(1, 1, 1);

    this._location = new THREE.Vector3();
    this._location.copy(dataPosition);

    this.applyMatrix(
      new THREE.Matrix4().makeTranslation(this._location.x, this._location.y, this._location.z)
    );

    this.verticesNeedUpdate = true;
   }

   resetVertices() {
    this.vertices[0].set(0.5, 0.5, 0.5);
    this.vertices[1].set(0.5, 0.5, -0.5);
    this.vertices[2].set(0.5, -0.5, 0.5);
    this.vertices[3].set(0.5, -0.5, -0.5);
    this.vertices[4].set(-0.5, 0.5, -0.5);
    this.vertices[5].set(-0.5, 0.5, 0.5);
    this.vertices[6].set(-0.5, -0.5, -0.5);
    this.vertices[7].set(-0.5, -0.5, 0.5);
  }

  set location(location) {
    this._location = location;

    // update vertices from location
    this.vertices[0].set(+0.5, +0.5, +0.5);
    this.vertices[1].set(+0.5, +0.5, -0.5);
    this.vertices[2].set(+0.5, -0.5, +0.5);
    this.vertices[3].set(+0.5, -0.5, -0.5);
    this.vertices[4].set(-0.5, +0.5, -0.5);
    this.vertices[5].set(-0.5, +0.5, +0.5);
    this.vertices[6].set(-0.5, -0.5, -0.5);
    this.vertices[7].set(-0.5, -0.5, +0.5);

    this.applyMatrix(
      new THREE.Matrix4().makeTranslation(this._location.x, this._location.y, this._location.z)
    );

    this.verticesNeedUpdate = true;
  }

  get location() {
    return this._location;
  }
 }
