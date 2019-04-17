const THREE = (window as any).THREE;

export abstract class BaseTHREEHelper extends THREE.Object3D {
  //#region Variables
  protected _stack;
  // default to trilinear interpolation
  protected _interpolation = 1;
  protected _windowWidth = 0.0;
  protected _windowCenter = 1.0;
  protected _material: THREE.ShaderMaterial = null;
  protected _textures = [];
  protected _geometry = null;
  protected _mesh = null;
  protected _visible = true;

  protected _isWebgl2 = false;
  //#endregion

  //#region Getters / Setters
  get windowCenter() {
    return this._windowCenter;
  }
  get windowWidth() {
    return this._windowWidth;
  }
  get interpolation() {
    return this._interpolation;
  }
  get stack() {
    return this._stack;
  }
  // tslint:disable-next-line:typedef
  set stack(stack) {
    this._stack = stack;
  }

  get mesh() {
    return this._mesh;
  }
  // tslint:disable-next-line:typedef
  set mesh(mesh) {
    this._mesh = mesh;
  }
  get geometry() {
    return this._geometry;
  }
  // tslint:disable-next-line:typedef
  set geometry(geometry) {
    this._geometry = geometry;
  }
  //#endregion

  // tslint:disable-next-line:typedef
  constructor(stack, isWebgl2) {
    super();

    this._stack = stack;
    this._isWebgl2 = isWebgl2;
  }

  public hasUniforms() {
    return this._material.uniforms;
  }

  protected _prepareTexture() {
    this._textures = [];
    for (let m = 0; m < this._stack._rawData.length; m++) {
      const tex = new THREE.DataTexture(
        this._stack.rawData[m],
        this._stack.textureSize,
        this._stack.textureSize,
        this._stack.textureType,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.ClampToEdgeWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
      );
      tex.needsUpdate = true;
      tex.flipY = true;
      this._textures.push(tex);
    }
  }

  protected abstract _init();
  protected abstract _create();
}