 
import { VolumeMaterial } from '../shaders';
import { BaseTHREEHelper } from './BaseTHREEHelper';

const THREE = (window as any).THREE;

export class VolumeRenderHelper extends BaseTHREEHelper {
  //#region Variables 
  // ray marching
  // private _algorithm: number = 0;
  private _alphaCorrection: number = 0.5;
  // shading is on by default
  // private _shading: number = 1;
  private _shininess: number = 10.0;
  private _steps: number = 32;
  private _offset: number = 0;
  // private _stepsPerFrame: number = 4;
  // private _stepsSinceChange: number = 0;


  private _textureLUT: THREE.Texture;
  //#endregion

  //#region Getters
  get windowCenter(): number {
    return this._windowCenter;
  }
  get windowWidth(): number {
    return this._windowWidth;
  }
  // get stepsSinceChange(): number {
  //   return this._stepsSinceChange;
  // }
  get textureLUT(): THREE.Texture {
    return this._textureLUT;
  }
  // get stepsPerFrame(): number {
  //   return this._stepsPerFrame;
  // }
  get steps() {
    return this._steps;
  }
  get alphaCorrection() {
    return this._alphaCorrection;
  }
  get interpolation() {
    return this._interpolation;
  }
  // get shading() {
  //   return this._shading;
  // }
  get shininess() {
    return this._shininess;
  }
  // get algorithm() {
  //   return this._algorithm;
  // }
  //#endregion

  // private resetStepsSinceChange() {
  //   this._stepsSinceChange = 0;
  //   // this._material.uniforms.uStepsSinceChange.value = this._stepsSinceChange;
  // }

  // private incrementStepsSinceChange() {
  //   this._stepsSinceChange += this._stepsPerFrame;
  //   this._material.uniforms.uStepsSinceChange.value = this._stepsSinceChange;
  // }

  //#region Setters 
  // set stepsSinceChange(value: number) {
  //   this._stepsSinceChange = value;
  //   this._material.uniforms.uStepsSinceChange.value = this._stepsSinceChange;
  // }
  set textureLUT(value: THREE.Texture) {
    this._textureLUT = value;
    this._material.uniforms.uTextureLUT.value = this._textureLUT;
    // this.resetStepsSinceChange()
  }
  set stepsPerFrame(value: number) {
    this._stepsPerFrame = value;
    this._material.uniforms.uStepsPerFrame.value = this._stepsPerFrame;
    // this.resetStepsSinceChange()
  }
  set windowCenter(value: number) {
    this._windowCenter = value;
    this._material.uniforms.uWindowCenterWidth.value = [
      this._windowCenter - this._offset,
      this._windowWidth,
    ];
    // this.resetStepsSinceChange()
  }
  set windowWidth(value: number) {
    this._windowWidth = value;
    this._material.uniforms.uWindowCenterWidth.value = [
      this._windowCenter - this._offset,
      this._windowWidth,
    ];
    // this.resetStepsSinceChange()
  }
  set steps(steps: number) {
    this._steps = steps;
    this._material.uniforms.uSteps.value = this._steps;
    // this.resetStepsSinceChange()
  }
  set alphaCorrection(alphaCorrection: number) {
    this._alphaCorrection = alphaCorrection;
    this._material.uniforms.uAlphaCorrection.value = this._alphaCorrection;
    // this.resetStepsSinceChange()
  }
  set interpolation(interpolation: number) {
    this._interpolation = interpolation;

    if (interpolation === 0) {
      this._material = VolumeMaterial.idnMaterial;
    }
    else {
      this._material = VolumeMaterial.triMaterial;
    }

    this._prepareMaterial();
  }
  // set shading(shading: number) {
  //   this._shading = shading;
  //   this._material.uniforms.uShading.value = this._shading;
  // }
  set shininess(shininess: number) {
    this._shininess = shininess;
    this._material.uniforms.uShininess.value = this._shininess;
    // this.resetStepsSinceChange()
  }
  // set algorithm(algorithm: number) {
  //   this._algorithm = algorithm;
  //   this._material.uniforms.uAlgorithm.value = this._algorithm;
  // }
  //#endregion

  // tslint:disable-next-line:typedef
  constructor(stack: any) {
    super(stack);
    this._init();
    this._create();
    // (this as unknown as THREE.Object3D).onAfterRender = ((r, s, c, g, m, gr) => {
    //   this.incrementStepsSinceChange();
    // })
  }

  protected _init() {
    this._material = VolumeMaterial.triMaterial;
    this._prepareStack();
    this._prepareTexture();
    this._prepareMaterial();
    this._prepareGeometry();
  }

  protected _create() {
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
    // if (this._stack.textureUnits > 8) {
    //   this._material.uniforms.uTextureContainer = { value: [
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture(),
    //         new THREE.Texture()
    //     ]};
    // }
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
    // this._material.uniforms.uInterpolation.value = this._interpolation;
    // this._material.uniforms.uShading.value = this._shading;
    this._material.uniforms.uShininess.value = this._shininess;
    // this._material.uniforms.uSteps.value = this._steps;
    // this._material.uniforms.uStepsPerFrame.value = this._stepsPerFrame;
    // // this.resetStepsSinceChange()
    // this._material.uniforms.uAlgorithm.value = this._algorithm;

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




