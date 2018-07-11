/**
 * @module helpers/boundingbox
 */

 const helpersBoundingBox = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

   const Constructor = three.Object3D;
   return class extends Constructor {
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
      this._meshStack = null;

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
      const offset = new three.Vector3(-0.5, -0.5, -0.5);

      // Geometry
      const geometry = new three.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
      geometry.applyMatrix(new three.Matrix4().makeTranslation(
        halfDimensions.x + offset.x,
        halfDimensions.y + offset.y,
        halfDimensions.z + offset.z));
      this._geometry = geometry;

      // Material
      this._material = new three.MeshBasicMaterial({
        wireframe: true,
      });

      const mesh = new three.Mesh(this._geometry, null);
      mesh.applyMatrix(this._stack.ijk2LPS);
      mesh.visible = this._visible;
      this._meshStack = mesh;

      this._mesh = new three.BoxHelper(this._meshStack, this._color);
      this._material = this._mesh.material;

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
  };
 };

// export factory
export {helpersBoundingBox};
// default export too
export default helpersBoundingBox();
