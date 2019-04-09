import THREE from "three";

/**
 * @module helpers/border
 */

export default class BorderHelper extends THREE.Object3D {
  private _mesh: THREE.Line;
  private _geometry: THREE.BufferGeometry;
  private _material: THREE.LineBasicMaterial;
  private _helpersSlice: any;

  constructor(helpersSlice) {
    super();

    this._helpersSlice = helpersSlice;

    this.visible = true;
    this.color = 0xff0000;
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    this._create();
  }

  set helpersSlice(helpersSlice) {
    this._helpersSlice = helpersSlice;
    this._update();
  }

  get helpersSlice() {
    return this._helpersSlice;
  }

  set visible(visible) {
    this.visible = visible;
    if (this._mesh) {
      this._mesh.visible = this.visible;
    }
  }

  get visible() {
    return this.visible;
  }

  set color(color) {
    this.color = color;
    if (this._material) {
      this._material.color.set(this.color);
    }
  }

  get color() {
    return this.color;
  }

  _create() {
    if (!this._material) {
      this._material = new THREE.LineBasicMaterial({
        color: this.color,
        linewidth: 1,
      });
    }

    if (!this._helpersSlice.geometry.vertices) {
      return;
    }

    this._geometry = new THREE.BufferGeometry();

    // set vertices positions
    const nbOfVertices = this._helpersSlice.geometry.vertices.length;
    const positions = new Float32Array((nbOfVertices + 1) * 3);
    positions.set(this._helpersSlice.geometry.attributes.position.array, 0);
    positions.set(this._helpersSlice.geometry.vertices[0].toArray(), nbOfVertices * 3);
    this._geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

    this._mesh = new THREE.Line(this._geometry, this._material);
    if (this._helpersSlice.aabbSpace === 'IJK') {
      this._mesh.applyMatrix(this._helpersSlice.stack.ijk2LPS);
    }
    this._mesh.visible = this.visible;

    // and add it!
    this.add(this._mesh);
  }

  _update() {
    // update slice
    if (this._mesh) {
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh = null;
    }

    this._create();
  }

  dispose() {
    //this._mesh.material.dispose();
    this._mesh.material = null;
    this._geometry.dispose();
    this._geometry = null;
    this._material.dispose();
    this._material = null;
  }
}