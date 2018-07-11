/**
 *
 * @module geometries/voxel
 */

 const geometriesVoxel = (three = window.THREE) => {
  if (three === undefined || three.BoxGeometry === undefined) {
    return null;
  }

   const Constructor = three.BoxGeometry;
   return class extends Constructor {
    constructor(dataPosition) {
      super(1, 1, 1);

      this._location = dataPosition;

      this.applyMatrix(new three.Matrix4().makeTranslation(
        this._location.x,
        this._location.y,
        this._location.z));

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
      this.vertices[0].set(+ 0.5, + 0.5, + 0.5);
      this.vertices[1].set(+ 0.5, + 0.5, - 0.5);
      this.vertices[2].set(+ 0.5, - 0.5, + 0.5);
      this.vertices[3].set(+ 0.5, - 0.5, - 0.5);
      this.vertices[4].set(- 0.5, + 0.5, - 0.5);
      this.vertices[5].set(- 0.5, + 0.5, + 0.5);
      this.vertices[6].set(- 0.5, - 0.5, - 0.5);
      this.vertices[7].set(- 0.5, - 0.5, + 0.5);

      this.applyMatrix(
        new three.Matrix4().makeTranslation(
          this._location.x,
          this._location.y,
          this._location.z));

      this.verticesNeedUpdate = true;
    }

    get location() {
      return this._location;
    }
  };
 };

// export factory
export {geometriesVoxel};
// default export to
export default geometriesVoxel();
