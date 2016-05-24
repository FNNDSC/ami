
/**
 * @module helpers/boundingbox
 */

export default class HelpersBoundingBox extends THREE.Object3D{
  constructor(stack){
    //
    super();

    // private vars
    this._stack = stack;
    this._visible = true;
    this._color = 0x61F2F3;
    this._material = null;
    this._geometry = null;
    this._mesh = null;

    // create object
    this._create();
  }

  // getters/setters
  set visible(visible){
    this._visible = visible;
    if(this._mesh){
      this._mesh.visible = this._visible;
    }
  }

  get visible(){
    return this._visible;
  }

  set color(color){
    this._color = color;
    if(this._material){
      this._material.color.set(this._color);
    }
  }

  get color(){
    return this._color;
  }

  // private methods
  _create(){
    // Convenience vars
    var dimensions = this._stack.dimensionsIJK;
    var halfDimensions = this._stack.halfDimensionsIJK;
    var offset = new THREE.Vector3(-0.5, -0.5, -0.5);

    // Geometry
    this._geometry = new THREE.BoxGeometry(
      dimensions.x, dimensions.y, dimensions.z);
    // position bbox in image space
    this._geometry .applyMatrix(new THREE.Matrix4().makeTranslation(
      halfDimensions.x + offset.x, halfDimensions.y + offset.y, halfDimensions.z + offset.z));

    // Material
    this._material = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: this._color
    });

    // mesh
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    // position bbox in world space
    this._mesh.applyMatrix(this._stack.ijk2LPS);
    this._mesh.visible = this._visible;

    // and add it!
    this.add(this._mesh);
  }

  _update(){
    // update slice
    if(this._mesh){
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.geometry = null;
      this._mesh.material.dispose();
      this._mesh.material = null;
      this._mesh = null;
    }

    this._create();
  }
}