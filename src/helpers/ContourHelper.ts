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

  //#region Getters 
  get textureToFilter() {
    return this._textureToFilter;
  }
  get contourOpacity() {
    return this._contourOpacity;
  }
  get contourWidth() {
    return this._contourWidth;
  }
  get canvasWidth() {
    return this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
  }
  //#endregion

  //#region Setters
  set textureToFilter(texture: THREE.Texture) {
    this._textureToFilter = texture;
    this._material.uniforms.uTextureFilled.value = texture;
  }
  set contourOpacity(contourOpacity: number) {
    this._contourOpacity = contourOpacity;
    this._material.uniforms.uOpacity.value = this._contourOpacity;
  }
  set contourWidth(contourWidth: number) {
    this._contourWidth = contourWidth;
    this._material.uniforms.uWidth.value = this._contourWidth;
  }
  set canvasWidth(canvasWidth: number) {
    this._canvasWidth = canvasWidth;
    this._material.uniforms.uCanvasWidth.value = this._canvasWidth;
  }
  set canvasHeight(canvasHeight: number) {
    this._canvasHeight = canvasHeight;
    this._material.uniforms.uCanvasHeight.value = this._canvasHeight;
  }
  //#endregion

  constructor(stack: any, geometry: any, texture: THREE.Texture) {
    super(stack);

    this._material = ContourMaterial.material;

    this._textureToFilter = texture;
    this._contourWidth = 1;
    this._contourOpacity = 1;
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._geometry = geometry;

    this._init();
    this._create();
  }

  protected _init() {
    this._material.uniforms.uWidth.value = this._contourWidth;
    this._material.uniforms.uOpacity.value = this._contourOpacity;
    this._material.uniforms.uCanvasWidth.value = this._canvasWidth;
    this._material.uniforms.uCanvasHeight.value = this._canvasHeight;
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
    this._material.dispose();
    this._material = null;

    this._stack = null;
  }
}