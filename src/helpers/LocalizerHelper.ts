import { LocalizerMaterial } from '../shaders';
import { WebGlHelper } from './WebGlHelper';

const THREE = (window as any).THREE;

export class LocalizerHelper extends WebGlHelper {
  //#region Variables
  private _referencePlane;
  private _plane1 = null;
  private _color1 = null;
  private _plane2 = null;
  private _color2 = null;
  private _plane3 = null;
  private _color3 = null;
  private _canvasWidth = 0;
  private _canvasHeight = 0;
  //#endregion

  //#region Getters
  get referencePlane() {
    return this._referencePlane;
  }
  get plane1() {
    return this._plane1;
  }
  get color1() {
    return this._color1;
  }
  get plane2() {
    return this._plane2;
  }
  get color2() {
    return this._color2;
  }
  get plane3() {
    return this._plane3;
  }
  get color3() {
    return this._color3;
  }
  get canvasWidth() {
    return this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
  }
  //#endregion

  //#region Getters / Setters
  set referencePlane(referencePlane: any) {
    this._referencePlane = referencePlane;
    this._material.uniforms.uSlice.value = this._referencePlane;
  }
  set plane1(plane1: any) {
    this._plane1 = plane1;
    this._material.uniforms.uPlane1.value = this._plane1;
  }
  set color1(color1: any) {
    this._color1 = color1;
    this._material.uniforms.uPlaneColor1.value = this._color1;
  }
  set plane2(plane2: any) {
    this._plane2 = plane2;
    this._material.uniforms.uPlane2.value = this._plane2;
  }
  set color2(color2: any) {
    this._color2 = color2;
    this._material.uniforms.uPlaneColor2.value = this._color2;
  }
  set plane3(plane3: any) {
    this._plane3 = plane3;
    this._material.uniforms.uPlane3.value = this._plane3;
  }
  set color3(color3: any) {
    this._color3 = color3;
    this._material.uniforms.uPlaneColor3.value = this._color3;
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

  constructor(stack: any, isWebGl2: boolean, geometry: any, referencePlane: any) {
    super(stack, isWebGl2);

    if (this._isWebgl2) {
      this._material = LocalizerMaterial.shaderMaterial2;
    }
    else {
      this._material = LocalizerMaterial.shaderMaterial1;
    }

    this._referencePlane = referencePlane;
    this._geometry = geometry;

    this._init();
    this._create();
  }

  protected _init() {
    this._prepareMaterial();
  }

  protected _create() {
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.applyMatrix(this._stack._ijk2LPS);
    this.add(this._mesh);
  }

  private _prepareMaterial() {
    if (!this._material) {
      // reference plane
      this._material.uniforms.uSlice.value = this._referencePlane;

      // localizer planes
      if (this._plane1) {
        this._material.uniforms.uPlane1.value = this._plane1;
        this._material.uniforms.uPlaneColor1.value = this._color1;
      }

      if (this._plane2) {
        this._material.uniforms.uPlane2.value = this._plane2;
        this._material.uniforms.uPlaneColor2.value = this._color2;
      }

      if (this._plane3) {
        this._material.uniforms.uPlane3.value = this._plane3;
        this._material.uniforms.uPlaneColor3.value = this._color3;
      }

      //
      this._material.uniforms.uCanvasWidth.value = this._canvasWidth;
      this._material.uniforms.uCanvasHeight.value = this._canvasHeight;

      this._material = LocalizerMaterial.shaderMaterial1;
    }
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
    this._referencePlane = null;
    this._plane1 = null;
    this._color1 = null;
    this._plane2 = null;
    this._color2 = null;
    this._plane3 = null;
    this._color3 = null;

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