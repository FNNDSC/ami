import { ContourMaterial } from "../shaders";
import { BaseTHREEHelper } from "./BaseTHREEHelper";

const THREE = (window as any).THREE;

export class ContourHelper extends BaseTHREEHelper {
  //#region Variables
  private _textureToFilter;
  private _contourOpacity;
  private _contourWidth;
  private _canvasWidth;
  private _canvasHeight;
  //#endregion


  //#region Getters / Setters
  get textureToFilter() {
    return this._textureToFilter;
  }
  // tslint:disable-next-line:typedef
  set textureToFilter(texture) {
    this._textureToFilter = texture;
    //this._shader._FragUniforms.uTextureFilled.value = texture;
    this._material.uniforms.uTextureFilled = texture;
    this._material.needsUpdate = true;
  }
  get contourOpacity() {
    return this._contourOpacity;
  }
  // tslint:disable-next-line:typedef
  set contourOpacity(contourOpacity) {
    this._contourOpacity = contourOpacity;
    this._material.uniforms.uOpacity = this._contourOpacity;
  }
  get contourWidth() {
    return this._contourWidth;
  }
  // tslint:disable-next-line:typedef
  set contourWidth(contourWidth) {
    this._contourWidth = contourWidth;
    this._material.uniforms.uWidth.value = this._contourWidth;
  }
  get canvasWidth() {
    return this._canvasWidth;
  }
  // tslint:disable-next-line:typedef
  set canvasWidth(canvasWidth) {
    this._canvasWidth = canvasWidth;
    this._material.uniforms.uCanvasWidth = this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
  }
  // tslint:disable-next-line:typedef
  set canvasHeight(canvasHeight) {
    this._canvasHeight = canvasHeight;
    this._material.uniforms.uCanvasHeight = this._canvasHeight;
  }
  //#endregion

  // tslint:disable-next-line:typedef
  constructor(stack, geometry, texture) {
    super(stack);

    this._textureToFilter = texture;
    this._contourWidth = 1;
    this._contourOpacity = 1;
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._material = null;
    this._geometry = geometry;

    this._init();
    this._create();
  }

  protected _init() {
    this._material = ContourMaterial.shaderMaterial;
    this._material.uniforms.uWidth = this._contourWidth;
    this._material.uniforms.uOpacity = this._contourOpacity;
    this._material.uniforms.uCanvasWidth = this._canvasWidth;
    this._material.uniforms.uCanvasHeight = this._canvasHeight;
    this._material.needsUpdate = true;
  }

  protected _create() {
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.applyMatrix(this._stack._ijk2LPS);
    this.add(this._mesh);
  }

  public update() {
    if (this._mesh) {
      this.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.geometry = null;
      this._mesh = null;
    }

    this._create();
  }

  public dispose() {
    //
    if (this._textureToFilter !== null) {
      this._textureToFilter.dispose();
      this._textureToFilter = null;
    }
    // material, geometry and mesh
    this.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._mesh.geometry = null;
    this._mesh.material.dispose();
    this._mesh.material = null;
    this._mesh = null;

    this._geometry.dispose();
    this._geometry = null;
    this._material.vertexShader = null;
    this._material.fragmentShader = null;
    this._material.uniforms = null;
    this._material.dispose();
    this._material = null;

    this._stack = null;
  }
}