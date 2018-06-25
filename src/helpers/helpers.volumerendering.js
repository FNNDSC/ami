/** * Imports ***/
import ShadersUniform from '../shaders/shaders.vr.uniform';
import ShadersVertex from '../shaders/shaders.vr.vertex';
import ShadersFragment from '../shaders/shaders.vr.fragment';

import {helpersMaterialMixin} from '../helpers/helpers.material.mixin';

/**
 * @module helpers/volumerendering
 */

 const helpersVolumeRendering = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = helpersMaterialMixin(three);
  return class extends Constructor {
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
      this._mesh = null;

      this._algorithm = 0; // ray marching
      this._alphaCorrection = 0.5; // default
      this._interpolation = 1; // default to trilinear interpolation
      this._shading = 1; // shading is on by default
      this._shininess = 10.0;
      this._steps = 256; // default
      this._offset = 0.;
      this._windowCenter = 0.0;
      this._windowWidth = 1.0;

      this._create();
    }

    _create() {
      this._prepareStack();
      this._prepareTexture();
      this._prepareMaterial();
      this._prepareGeometry();

      this._mesh = new three.Mesh(this._geometry, this._material);
      this.add(this._mesh);
    }

    _prepareStack() {
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

    _prepareMaterial() {
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
      this._uniforms.uWindowCenterWidth.value = [this._windowCenter - this._offset, this._windowWidth];
      this._uniforms.uRescaleSlopeIntercept.value = [this._stack.rescaleSlope, this._stack.rescaleIntercept];
      this._uniforms.uDataDimensions.value = [this._stack.dimensionsIJK.x,
                                                  this._stack.dimensionsIJK.y,
                                                  this._stack.dimensionsIJK.z];
      this._uniforms.uAlphaCorrection.value = this._alphaCorrection;
      this._uniforms.uInterpolation.value = this._interpolation;
      this._uniforms.uShading.value = this._shading;
      this._uniforms.uShininess.value = this._shininess;
      this._uniforms.uSteps.value = this._steps;
      this._uniforms.uAlgorithm.value = this._algorithm;

      this._createMaterial({
        side: three.BackSide,
        transparent: true,
      });
    }

    _prepareGeometry() {
      let worldBBox = this._stack.worldBoundingBox();
      let centerLPS = this._stack.worldCenter();

      this._geometry = new three.BoxGeometry(
        worldBBox[1] - worldBBox[0],
        worldBBox[3] - worldBBox[2],
        worldBBox[5] - worldBBox[4]);
      this._geometry.applyMatrix(new three.Matrix4().makeTranslation(
        centerLPS.x, centerLPS.y, centerLPS.z));
    }

    get uniforms() {
      return this._uniforms;
    }

    set uniforms(uniforms) {
      this._uniforms = uniforms;
    }

    set mesh(mesh) {
      this._mesh = mesh;
    }

    get mesh() {
      return this._mesh;
    }

    get stack() {
      return this._stack;
    }

    set stack(stack) {
      this._stack = stack;
    }

    get windowCenter() {
      return this._windowCenter;
    }

    set windowCenter(windowCenter) {
      this._windowCenter = windowCenter;
      this._uniforms.uWindowCenterWidth.value[0] = this._windowCenter - this._offset;
    }

    get windowWidth() {
      return this._windowWidth;
    }

    set windowWidth(windowWidth) {
      this._windowWidth = Math.max(1, windowWidth);
      this._uniforms.uWindowCenterWidth.value[1] = this._windowWidth;
    }

    get steps() {
      return this._steps;
    }

    set steps(steps) {
      this._steps = steps;
      this._uniforms.uSteps.value = this._steps;
    }

    get alphaCorrection() {
      return this._alphaCorrection;
    }

    set alphaCorrection(alphaCorrection) {
      this._alphaCorrection = alphaCorrection;
      this._uniforms.uAlphaCorrection.value = this._alphaCorrection;
    }

    get interpolation() {
      return this._interpolation;
    }

    set interpolation(interpolation) {
      this._interpolation = interpolation;
      this._uniforms.uInterpolation.value = this._interpolation;
      this._updateMaterial();
    }

    get shading() {
      return this._shading;
    }

    set shading(shading) {
      this._shading = shading;
      this._uniforms.uShading.value = this._shading;
    }

    get shininess() {
      return this._shininess;
    }

    set shininess(shininess) {
      this._shininess = shininess;
      this._uniforms.uShininess.value = this._shininess;
    }

    get algorithm() {
      return this._algorithm;
    }

    set algorithm(algorithm) {
      this._algorithm = algorithm;
      this._uniforms.uAlgorithm.value = this._algorithm;
    }

    dispose() {
      // Release memory
      for (let j =0; j< this._textures.length; j++) {
        this._textures[j].dispose();
        this._textures[j] = null;
      }
      this._textures = null;
      this._shadersFragment = null;
      this._shadersVertex = null;

      this._uniforms.uTextureContainer = null;
      this._uniforms.uTextureLUT = null;
      this._uniforms = null;

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
  };
};

export {helpersVolumeRendering};
export default helpersVolumeRendering();
