/** * Imports ***/
import {geometriesSlice} from '../geometries/geometries.slice';
import ShadersUniform from '../shaders/shaders.data.uniform';
import ShadersVertex from '../shaders/shaders.data.vertex';
import ShadersFragment from '../shaders/shaders.data.fragment';

import {helpersMaterialMixin} from '../helpers/helpers.material.mixin';

/**
 * @module helpers/slice
 */

const helpersSlice = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = helpersMaterialMixin(three);
  return class extends Constructor {
    constructor(stack,
                index = 0,
                position = new three.Vector3(0, 0, 0),
                direction = new three.Vector3(0, 0, 1),
                aabbSpace = 'IJK') {
      //
      super();

      // private vars
      this._stack = stack;

      // image settings
      // index only used to grab window/level and intercept/slope
      this._invert = this._stack.invert;

      this._lut = 'none';
      this._lutTexture = null;
      // if auto === true, get from index
      // else from stack which holds the default values
      this._intensityAuto = true;
      this._interpolation = 1; // default to trilinear interpolation
      // starts at 0
      this._index = index;
      this._windowWidth = null;
      this._windowCenter = null;
      this._rescaleSlope = null;
      this._rescaleIntercept = null;
      this._spacing = 1.;
      this._thickness = 0.;
      this._thicknessMethod = 0; // default to MIP (Maximum Intensity Projection); 1 - Mean; 2 - MinIP

      // threshold
      this._lowerThreshold = null;
      this._upperThreshold = null;

      this._canvasWidth = 0;
      this._canvasHeight = 0;
      this._borderColor = null;

      // Object3D settings
      // shape
      this._planePosition = position;
      this._planeDirection = direction;
      // change aaBBSpace changes the box dimensions
      // also changes the transform
      // there is also a switch to move back mesh to LPS space automatically
      this._aaBBspace = aabbSpace; // or LPS -> different transforms, esp for the geometry/mesh
      this._material = null;
      this._textures = [];
      this._shadersFragment = ShadersFragment;
      this._shadersVertex = ShadersVertex;
      this._uniforms = ShadersUniform.uniforms();
      this._geometry = null;
      this._mesh = null;
      this._visible = true;

      // update dimensions, center, etc.
      // depending on aaBBSpace
      this._init();

      // update object
      this._create();
    }

    // getters/setters

    get stack() {
      return this._stack;
    }

    set stack(stack) {
      this._stack = stack;
    }

    get spacing() {
      return this._spacing;
    }

    set spacing(spacing) {
      this._spacing = spacing;
      this._uniforms.uSpacing.value = this._spacing;
    }

    get thickness() {
      return this._thickness;
    }

    set thickness(thickness) {
      this._thickness = thickness;
      this._uniforms.uThickness.value = this._thickness;
    }

    get thicknessMethod() {
      return this._thicknessMethod;
    }

    set thicknessMethod(thicknessMethod) {
      this._thicknessMethod = thicknessMethod;
      this._uniforms.uThicknessMethod.value = this._thicknessMethod;
    }
    get windowWidth() {
      return this._windowWidth;
    }

    set windowWidth(windowWidth) {
      this._windowWidth = windowWidth;
      this.updateIntensitySettingsUniforms();
    }

    get windowCenter() {
      return this._windowCenter;
    }

    set windowCenter(windowCenter) {
      this._windowCenter = windowCenter;
      this.updateIntensitySettingsUniforms();
    }

    // adding thresholding method
    get upperThreshold() {
      return this._upperThreshold;
    }

    set upperThreshold(upperThreshold) {
      this._upperThreshold = upperThreshold;
      this.updateIntensitySettingsUniforms();
    }

    get lowerThreshold() {
      return this._lowerThreshold;
    }

    set lowerThreshold(lowerThreshold) {
      this._lowerThreshold = lowerThreshold;
      this.updateIntensitySettingsUniforms();
    }
    get rescaleSlope() {
      return this._rescaleSlope;
    }

    set rescaleSlope(rescaleSlope) {
      this._rescaleSlope = rescaleSlope;
      this.updateIntensitySettingsUniforms();
    }

    get rescaleIntercept() {
      return this._rescaleIntercept;
    }

    set rescaleIntercept(rescaleIntercept) {
      this._rescaleIntercept = rescaleIntercept;
      this.updateIntensitySettingsUniforms();
    }

    get invert() {
      return this._invert;
    }

    set invert(invert) {
      this._invert = invert;
      this.updateIntensitySettingsUniforms();
    }

    get lut() {
      return this._lut;
    }

    set lut(lut) {
      this._lut = lut;
    }

    get lutTexture() {
      return this._lutTexture;
    }

    set lutTexture(lutTexture) {
      this._lutTexture = lutTexture;
      this.updateIntensitySettingsUniforms();
    }

    get intensityAuto() {
      return this._intensityAuto;
    }

    set intensityAuto(intensityAuto) {
      this._intensityAuto = intensityAuto;
      this.updateIntensitySettings();
      this.updateIntensitySettingsUniforms();
    }

    get interpolation() {
      return this._interpolation;
    }

    set interpolation(interpolation) {
      this._interpolation = interpolation;
      this.updateIntensitySettingsUniforms();
      this._updateMaterial();
    }

    get index() {
      return this._index;
    }

    set index(index) {
      this._index = index;
      this._update();
    }

    set planePosition(position) {
      this._planePosition = position;
      this._update();
    }

    get planePosition() {
      return this._planePosition;
    }

    set planeDirection(direction) {
      this._planeDirection = direction;
      this._update();
    }

    get planeDirection() {
      return this._planeDirection;
    }

    set halfDimensions(halfDimensions) {
      this._halfDimensions = halfDimensions;
    }

    get halfDimensions() {
      return this._halfDimensions;
    }

    set center(center) {
      this._center = center;
    }

    get center() {
      return this._center;
    }

    set aabbSpace(aabbSpace) {
      this._aaBBspace = aabbSpace;
      this._init();
    }

    get aabbSpace() {
      return this._aaBBspace;
    }

    set mesh(mesh) {
      this._mesh = mesh;
    }

    get mesh() {
      return this._mesh;
    }

    set geometry(geometry) {
      this._geometry = geometry;
    }

    get geometry() {
      return this._geometry;
    }

    set canvasWidth(canvasWidth) {
      this._canvasWidth = canvasWidth;
      this._uniforms.uCanvasWidth.value = this._canvasWidth;
    }

    get canvasWidth() {
      return this._canvasWidth;
    }

    set canvasHeight(canvasHeight) {
      this._canvasHeight = canvasHeight;
      this._uniforms.uCanvasHeight.value = this._canvasHeight;
    }

    get canvasHeight() {
      return this._canvasHeight;
    }

    set borderColor(borderColor) {
      this._borderColor = borderColor;
      this._uniforms.uBorderColor.value = new three.Color(borderColor);
    }

    get borderColor() {
      return this._borderColor;
    }

    _init() {
      if (!this._stack || !this._stack._prepared || !this._stack._packed) {
        return;
      }

      if (this._aaBBspace === 'IJK') {
        this._halfDimensions = this._stack.halfDimensionsIJK;
        this._center = new three.Vector3(
          this._stack.halfDimensionsIJK.x - 0.5,
          this._stack.halfDimensionsIJK.y - 0.5,
          this._stack.halfDimensionsIJK.z - 0.5);
        this._toAABB = new three.Matrix4();
      } else {
        // LPS
        let aaBBox = this._stack.AABBox();
        this._halfDimensions = aaBBox.clone().multiplyScalar(0.5);
        this._center = this._stack.centerAABBox();
        this._toAABB = this._stack.lps2AABB;
      }
    }

    // private methods
    _create() {
      if (!this._stack || !this._stack.prepared || !this._stack.packed) {
        return;
      }

      // Convenience vars
      try {
        const SliceGeometryContructor = geometriesSlice(three);
        this._geometry = new SliceGeometryContructor(
          this._halfDimensions,
          this._center,
          this._planePosition,
          this._planeDirection,
          this._toAABB);
      } catch (e) {
        window.console.log(e);
        window.console.log('invalid slice geometry - exiting...');
        return;
      }

      if (!this._geometry.vertices) {
        return;
      }

      if (!this._material) {
        //
        this._uniforms.uTextureSize.value = this._stack.textureSize;
        this._uniforms.uDataDimensions.value = [this._stack.dimensionsIJK.x,
                                                  this._stack.dimensionsIJK.y,
                                                  this._stack.dimensionsIJK.z];
        this._uniforms.uWorldToData.value = this._stack.lps2IJK;
        this._uniforms.uNumberOfChannels.value = this._stack.numberOfChannels;
        this._uniforms.uPixelType.value = this._stack.pixelType;
        this._uniforms.uBitsAllocated.value = this._stack.bitsAllocated;
        this._uniforms.uPackedPerPixel.value = this._stack.packedPerPixel;
        this._uniforms.uSpacing.value = this._spacing;
        this._uniforms.uThickness.value = this._thickness;
        this._uniforms.uThicknessMethod.value = this._thicknessMethod;
        // compute texture if material exist
        this._prepareTexture();
        this._uniforms.uTextureContainer.value = this._textures;

        this._createMaterial({
          side: three.DoubleSide,
        });
      }

      // update intensity related stuff
      this.updateIntensitySettings();
      this.updateIntensitySettingsUniforms();

      // create the mesh!
      this._mesh = new three.Mesh(this._geometry, this._material);
      if (this._aaBBspace === 'IJK') {
        this._mesh.applyMatrix(this._stack.ijk2LPS);
      }

      this._mesh.visible = this._visible;

      // and add it!
      this.add(this._mesh);
    }

    updateIntensitySettings() {
      // if auto, get from frame index
      if (this._intensityAuto) {
        this.updateIntensitySetting('windowCenter');
        this.updateIntensitySetting('windowWidth');
        this.updateIntensitySetting('rescaleSlope');
        this.updateIntensitySetting('rescaleIntercept');
      } else {
        if (this._windowCenter === null) {
          this._windowCenter = this._stack.windowCenter;
        }

        if (this._windowWidth === null) {
          this._windowWidth = this._stack.windowWidth;
        }

        if (this._rescaleSlope === null) {
          this._rescaleSlope = this._stack.rescaleSlope;
        }

        if (this._rescaleIntercept === null) {
          this._rescaleIntercept = this._stack.rescaleIntercept;
        }
      }

      // adding thresholding
      if (this._upperThreshold === null) {
        this._upperThreshold = this._stack._minMax[1];
      }

      if (this._lowerThreshold === null) {
        this._lowerThreshold = this._stack._minMax[0];
      }
    }

    updateIntensitySettingsUniforms() {
      // compensate for the offset to only pass > 0 values to shaders
      // models > models.stack.js : _packTo8Bits
      let offset = 0;
      if (this._stack._minMax[0] < 0) {
        offset -= this._stack._minMax[0];
      }

      // set slice window center and width
      this._uniforms.uRescaleSlopeIntercept.value =
        [this._rescaleSlope, this._rescaleIntercept];
      this._uniforms.uWindowCenterWidth.value =
        [offset + this._windowCenter, this._windowWidth];

      // set slice upper/lower threshold
      this._uniforms.uLowerUpperThreshold.value =
        [offset + this._lowerThreshold, offset + this._upperThreshold];

      // invert
      this._uniforms.uInvert.value = this._invert === true ? 1 : 0;

      // interpolation
      this._uniforms.uInterpolation.value = this._interpolation;

      // lut
      if (this._lut === 'none') {
        this._uniforms.uLut.value = 0;
      } else {
        this._uniforms.uLut.value = 1;
        this._uniforms.uTextureLUT.value = this._lutTexture;
      }
    }

    updateIntensitySetting(setting) {
      if (this._stack.frame[this._index] &&
          this._stack.frame[this._index][setting]) {
        this['_' + setting] = this._stack.frame[this._index][setting];
      } else {
        this['_' + setting] = this._stack[setting];
      }
    }

    _update() {
      // update slice
      if (this._mesh) {
        this.remove(this._mesh);
        this._mesh.geometry.dispose();
        this._mesh.geometry = null;
        // we do not want to dispose the texture!
        // this._mesh.material.dispose();
        // this._mesh.material = null;
        this._mesh = null;
      }

      this._create();
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

    cartesianEquation() {
      // Make sure we have a geometry
      if (!this._geometry ||
         !this._geometry.vertices ||
         this._geometry.vertices.length < 3) {
        return new three.Vector4();
      }

      let vertices = this._geometry.vertices;
      let dataToWorld = this._stack.ijk2LPS;
      let p1 = new three.Vector3(vertices[0].x, vertices[0].y, vertices[0].z)
        .applyMatrix4(dataToWorld);
      let p2 = new three.Vector3(vertices[1].x, vertices[1].y, vertices[1].z)
        .applyMatrix4(dataToWorld);
      let p3 = new three.Vector3(vertices[2].x, vertices[2].y, vertices[2].z)
        .applyMatrix4(dataToWorld);
      let v1 = new three.Vector3();
      let v2 = new three.Vector3();
      let normal = v1
        .subVectors(p3, p2)
        .cross(v2.subVectors(p1, p2))
        .normalize();

      return new three.Vector4(
        normal.x,
        normal.y,
        normal.z,
        - normal.dot(p1)
      );
    }
  };
};

export {helpersSlice};
export default helpersSlice();
