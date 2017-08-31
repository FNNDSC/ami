import {
  BoxHelper, BoxGeometry,
  Matrix4,
  Mesh, MeshBasicMaterial,
  Object3D, Vector3} from 'three';

/**
 * @module helpers/boundingbox
 */

export default class HelpersBoundingBox extends Object3D {
  constructor(stack) {
    //
    super();

    // private vars
    this._stack = stack;
    this._visible = true;
    this._color = 0xFFFFFF;
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // create object
    this._create();
  }

  // getters/setters
  set visible(visible) {
    this._visible = visible;
    if (this._mesh) {
      this._mesh.visible = this._visible;
    }
  }

  get visible() {
    return this._visible;
  }

  set color(color) {
    this._color = color;
    if (this._material) {
      this._material.color.set(this._color);
    }
  }

  get color() {
    return this._color;
  }

  // private methods
  _create() {
    // Convenience vars
    const dimensions = this._stack.dimensionsIJK;
    const halfDimensions = this._stack.halfDimensionsIJK;
    const offset = new Vector3(-0.5, -0.5, -0.5);

    // Geometry
    this._geometry = new BoxGeometry(
      dimensions.x, dimensions.y, dimensions.z);

    // Material
    this._material = new MeshBasicMaterial({
      wireframe: true,
    });

    const geometry = new BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
    geometry.applyMatrix(new Matrix4().makeTranslation(
      halfDimensions.x + offset.x,
      halfDimensions.y + offset.y,
      halfDimensions.z + offset.z));
    this._geometry = geometry;

    const mesh = new Mesh(this._geometry, this._material);
    mesh.applyMatrix(this._stack.ijk2LPS);
    mesh.visible = this._visible;
    this._mesh = mesh;

    this.add(this._mesh);
  }

  _update() {
    if (this._mesh) {
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.geometry = null;
      this._mesh.material.dispose();
      this._mesh.material = null;
      this._mesh = null;
    }

    this._create();
  }

  dispose() {
    this._mesh.material.dispose();
    this._mesh.material = null;
    this._geometry.dispose();
    this._geometry = null;
    this._material.dispose();
    this._material = null;
  }
}
