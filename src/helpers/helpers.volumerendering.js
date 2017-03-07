/** * Imports ***/
import ShadersUniform from '../shaders/shaders.vr.uniform';
import ShadersVertex from '../shaders/shaders.vr.vertex';
import ShadersFragment from '../shaders/shaders.vr.fragment';

import HelpersMaterialMixin from '../helpers/helpers.material.mixin';


/**
 * @module helpers/volumerendering
 */

export default class HelpersVolumeRendering extends HelpersMaterialMixin(THREE.Object3D) {
  constructor(stack) {
    //
    super();

    this._stack = stack;
    this._textures = [];
    this._shadersFragment = ShadersFragment;
    this._shadersVertex = ShadersVertex;
    this._uniforms = ShadersUniform.uniforms();
    this._material = null;
    this._geometry = null;

    this._interpolation = 1; // default to trilinear interpolation

    this._create();
  }

  _create() {
    this._prepareStack();
    this._prepareTexture();
    this._prepareMaterial();
    this._prepareGeometry();

    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this.add(this._mesh);
  }

  _prepareStack() {
    if (!this._stack.prepared) {
      this._stack.prepare();
    }

    if (!this._stack.packed) {
      this._stack.pack();
    }
  }

  _prepareMaterial() {
    // compensate for the offset to only pass > 0 values to shaders
    // models > models.stack.js : _packTo8Bits
    let offset = 0;
    if (this._stack._minMax[0] < 0) {
      offset = this._stack._minMax[0];
    }

    // uniforms
    this._uniforms = ShadersUniform.uniforms();
    this._uniforms.uWorldBBox.value = this._stack.worldBoundingBox();
    this._uniforms.uTextureSize.value = this._stack.textureSize;
    this._uniforms.uTextureContainer.value = this._textures;
    this._uniforms.uWorldToData.value = this._stack.lps2IJK;
    this._uniforms.uNumberOfChannels.value = this._stack.numberOfChannels;
    this._uniforms.uPixelType.value = this._stack.pixelType;
    this._uniforms.uBitsAllocated.value = this._stack.bitsAllocated;
    this._uniforms.uPackedPerPixel.value = this._stack.packedPerPixel;
    this._uniforms.uWindowCenterWidth.value = [offset + this._stack.windowCenter, this._stack.windowWidth * 0.8];
    this._uniforms.uRescaleSlopeIntercept.value = [this._stack.rescaleSlope, this._stack.rescaleIntercept];
    this._uniforms.uDataDimensions.value = [this._stack.dimensionsIJK.x,
                                                this._stack.dimensionsIJK.y,
                                                this._stack.dimensionsIJK.z];
    this._uniforms.uInterpolation.value = this._interpolation;

    this._createMaterial({
      side: THREE.FrontSide,
      transparent: true,
    });
  }

  _prepareGeometry() {
    let worldBBox = this._stack.worldBoundingBox();
    let centerLPS = this._stack.worldCenter();

    this._geometry = new THREE.BoxGeometry(
      worldBBox[1] - worldBBox[0],
      worldBBox[3] - worldBBox[2],
      worldBBox[5] - worldBBox[4]);
    this._geometry.applyMatrix(new THREE.Matrix4().makeTranslation(
      centerLPS.x, centerLPS.y, centerLPS.z));
  }

  get uniforms() {
    return this._uniforms;
  }

  set uniforms(uniforms) {
    this._uniforms = uniforms;
  }

  get stack() {
    return this._stack;
  }

  set stack(stack) {
    this._stack = stack;
  }

  get interpolation() {
    return this._interpolation;
  }

  set interpolation(interpolation) {
    this._interpolation = interpolation;
    this._uniforms.uInterpolation.value = this._interpolation;
    this._updateMaterial();
  }
}
