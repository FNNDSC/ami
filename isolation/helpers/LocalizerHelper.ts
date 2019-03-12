import THREE from 'THREE';
import { LocalizerShader } from '../shaders/localizer/localizer';
import { BaseTHREEHelper } from "./BaseTHREEHelper";

export class LocalizerHelper extends BaseTHREEHelper {
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

  //#region Getters / Setters
  get referencePlane() {
    return this._referencePlane;
  }
  // tslint:disable-next-line:typedef
  set referencePlane(referencePlane) {
    this._referencePlane = referencePlane;
    this._shader._FragUniforms.uSlice.value = this._referencePlane;
  }
  get plane1() {
    return this._plane1;
  }
  // tslint:disable-next-line:typedef
  set plane1(plane1) {
    this._plane1 = plane1;
    this._shader._FragUniforms.uPlane1.value = this._plane1;
  }
  get color1() {
    return this._color1;
  }
  // tslint:disable-next-line:typedef
  set color1(color1) {
    this._color1 = color1;
    this._shader._FragUniforms.uPlaneColor1.value = this._color1;
  }
  get plane2() {
    return this._plane2;
  }
  // tslint:disable-next-line:typedef
  set plane2(plane2) {
    this._plane2 = plane2;
    this._shader._FragUniforms.uPlane2.value = this._plane2;
  }
  get color2() {
    return this._color2;
  }
  // tslint:disable-next-line:typedef
  set color2(color2) {
    this._color2 = color2;
    this._shader._FragUniforms.uPlaneColor2.value = this._color2;
  }
  get plane3() {
    return this._plane3;
  }
  // tslint:disable-next-line:typedef
  set plane3(plane3) {
    this._plane3 = plane3;
    this._shader._FragUniforms.uPlane3.value = this._plane3;
  }
  get color3() {
    return this._color3;
  }
  // tslint:disable-next-line:typedef
  set color3(color3) {
    this._color3 = color3;
    this._shader._FragUniforms.uPlaneColor3.value = this._color3;
  }
  get canvasWidth() {
    return this._canvasWidth;
  }
  // tslint:disable-next-line:typedef
  set canvasWidth(canvasWidth) {
    this._canvasWidth = canvasWidth;
    this._shader._FragUniforms.uCanvasWidth.value = this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
  }
  // tslint:disable-next-line:typedef
  set canvasHeight(canvasHeight) {
    this._canvasHeight = canvasHeight;
    this._shader._FragUniforms.uCanvasHeight.value = this._canvasHeight;
  }
  //#endregion

  // tslint:disable-next-line:typedef
  constructor(stack, geometry, referencePlane) {
    super(stack);

    this._referencePlane = referencePlane;
    this._geometry = geometry;

    this._init();
    this._create();
  }

  protected _init() {
    this._shader = new LocalizerShader();
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
      this._shader._FragUniforms.uSlice.value = this._referencePlane;

      // localizer planes
      if (this._plane1) {
        this._shader._FragUniforms.uPlane1.value = this._plane1;
        this._shader._FragUniforms.uPlaneColor1.value = this._color1;
      }

      if (this._plane2) {
        this._shader._FragUniforms.uPlane2.value = this._plane2;
        this._shader._FragUniforms.uPlaneColor2.value = this._color2;
      }

      if (this._plane3) {
        this._shader._FragUniforms.uPlane3.value = this._plane3;
        this._shader._FragUniforms.uPlaneColor3.value = this._color3;
      }

      //
      this._shader._FragUniforms.uCanvasWidth.value = this._canvasWidth;
      this._shader._FragUniforms.uCanvasHeight.value = this._canvasHeight;

      this._material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: this._shader._FragUniforms,
        vertexShader: this._shader.computeVertShader(),
        fragmentShader: this._shader.computeFragShader(),
      });
      this._material.transparent = true;
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

    this._shader = null;

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