 
import { VolumeMaterial } from '../shaders';
import { BaseTHREEHelper } from "./BaseTHREEHelper";

const THREE = (window as any).THREE;

export class VolumeRenderHelper extends BaseTHREEHelper {
  //#region Variables 
  // ray marching
  private _algorithm: number = 0;
  private _alphaCorrection: number = 0.5;
  // shading is on by default
  private _shading: number = 1;
  private _shininess: number = 10.0;
  private _steps: number = 32;
  private _offset: number = 0;
  //#endregion

  //#region Getters / Setters 
  get steps() {
    return this._steps;
  }
  // tslint:disable-next-line:typedef
  set steps(steps) {
    this._steps = steps;
    this._material.uniforms.uSteps.value = this._steps;
  }
  get alphaCorrection() {
    return this._alphaCorrection;
  }
  // tslint:disable-next-line:typedef
  set alphaCorrection(alphaCorrection) {
    this._alphaCorrection = alphaCorrection;
    this._material.uniforms.uAlphaCorrection.value = this._alphaCorrection;
  }
  get interpolation() {
    return this._interpolation;
  }
  // tslint:disable-next-line:typedef
  set interpolation(interpolation) {
    this._interpolation = interpolation;
    this._material.uniforms.uInterpolation.value = this._interpolation;
    this._material.needsUpdate = true;
  }
  get shading() {
    return this._shading;
  }
  // tslint:disable-next-line:typedef
  set shading(shading) {
    this._shading = shading;
    this._material.uniforms.uShading.value = this._shading;
  }
  get shininess() {
    return this._shininess;
  }
  // tslint:disable-next-line:typedef
  set shininess(shininess) {
    this._shininess = shininess;
    this._material.uniforms.uShininess.value = this._shininess;
  }
  get algorithm() {
    return this._algorithm;
  }
  // tslint:disable-next-line:typedef
  set algorithm(algorithm) {
    this._algorithm = algorithm;
    this._material.uniforms.uAlgorithm.value = this._algorithm;
  }
  //#endregion
  // tslint:disable-next-line:typedef
  constructor(stack) {
    super(stack);
    this._init();
    this._create();
  }

  protected _init() {
    this._prepareStack();
    this._prepareTexture();
    this._prepareMaterial();
    this._prepareGeometry();
  }

  protected _create() {
    this._material = VolumeMaterial.shaderMaterial;
    this._material.needsUpdate = true;
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this.add(this._mesh);
  }

  private _prepareStack() {
    if (!this._stack.prepared) {
      this._stack.prepare();
    }

    if (!this._stack.packed) {
      this._stack.pack();
    }

    // compensate for the offset to only pass > 0 values to shaders
    // models > models.stack.js : _packTo8Bits
    this._offset = Math.min(0, this._stack._minMax[0]);
    this._windowCenter = this._stack.windowCenter;
    this._windowWidth = this._stack.windowWidth * 0.8; // multiply for better default visualization
  }

  private _prepareMaterial() {
    // uniforms
    this._material.uniforms.uWorldBBox.value = this._stack.worldBoundingBox();
    this._material.uniforms.uTextureSize.value = this._stack.textureSize;
    this._material.uniforms.uTextureContainer.value = this._textures;
    if (this._stack.textureUnits > 8) {
      this._material.uniforms.uTextureContainer = { value: [
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture(),
            new THREE.Texture()
        ]};
    }
    this._material.uniforms.uWorldToData.value = this._stack.lps2IJK;
    this._material.uniforms.uNumberOfChannels.value = this._stack.numberOfChannels;
    this._material.uniforms.uPixelType.value = this._stack.pixelType;
    this._material.uniforms.uBitsAllocated.value = this._stack.bitsAllocated;
    this._material.uniforms.uPackedPerPixel.value = this._stack.packedPerPixel;
    this._material.uniforms.uWindowCenterWidth.value = [
      this._windowCenter - this._offset,
      this._windowWidth,
    ];
    this._material.uniforms.uRescaleSlopeIntercept.value = [
      this._stack.rescaleSlope,
      this._stack.rescaleIntercept,
    ];
    this._material.uniforms.uDataDimensions.value = [
      this._stack.dimensionsIJK.x,
      this._stack.dimensionsIJK.y,
      this._stack.dimensionsIJK.z,
    ];
    this._material.uniforms.uAlphaCorrection.value = this._alphaCorrection;
    this._material.uniforms.uInterpolation.value = this._interpolation;
    this._material.uniforms.uShading.value = this._shading;
    this._material.uniforms.uShininess.value = this._shininess;
    this._material.uniforms.uSteps.value = this._steps;
    this._material.uniforms.uAlgorithm.value = this._algorithm;

    this._material.needsUpdate = true;
  }

  private _prepareGeometry() {
    const worldBBox = this._stack.worldBoundingBox();
    const centerLPS = this._stack.worldCenter();

    this._geometry = new THREE.BoxGeometry(
      worldBBox[1] - worldBBox[0],
      worldBBox[3] - worldBBox[2],
      worldBBox[5] - worldBBox[4]
    );
    this._geometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(centerLPS.x, centerLPS.y, centerLPS.z)
    );
  }

  // Release memory
  public dispose() {
    for (let j = 0; j < this._textures.length; j++) {
      this._textures[j].dispose();
      this._textures[j] = null;
    }
    this._textures = null;

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




