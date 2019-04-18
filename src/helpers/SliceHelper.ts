import { SliceGeometry } from '../geometries';
import { DataMaterial } from '../shaders';
import { BaseTHREEHelper } from './BaseTHREEHelper';

const THREE = (window as any).THREE;

export class SliceHelper extends BaseTHREEHelper {
  //#region Variables
  // image settings
  // index only used to grab window/level and intercept/slope
  private _invert;
  private _lut = 'none';
  private _lutTexture = null;
  // if auto === true, get from index
  // else from stack which holds the default values
  private _intensityAuto = true;
  // starts at 0
  private _index;
  private _opacity = 1;
  private _rescaleSlope = null;
  private _rescaleIntercept = null;
  private _spacing = 1;
  private _thickness = 0;
  // default to MIP (Maximum Intensity Projection); 1 - Mean; 2 - MinIP
  private _thicknessMethod = 0;
  // threshold
  private _lowerThreshold = null;
  private _upperThreshold = null;
  private _canvasWidth = 0;
  private _canvasHeight = 0;
  private _borderColor = null;
  // Object3D settings
  // shape
  private _planePosition;
  private _planeDirection;
  // change aaBBSpace changes the box dimensions
  // also changes the transform
  // there is also a switch to move back mesh to LPS space automatically
  // or LPS -> different transforms, esp for the geometry/mesh
  private _aaBBspace;
  private _halfDimensions;
  private _center: THREE.Vector3;
  private _toAABB: THREE.Matrix4; 
  //#endregion

  //#region Getters
  get spacing() {
    return this._spacing;
  }
  get thickness() {
    return this._thickness;
  }
  get thicknessMethod() {
    return this._thicknessMethod;
  }
  get opacity() {
    return this._opacity;
  }
  get upperThreshold() {
    return this._upperThreshold;
  }
  get lowerThreshold() {
    return this._lowerThreshold;
  }
  get rescaleSlope() {
    return this._rescaleSlope;
  }
  get rescaleIntercept() {
    return this._rescaleIntercept;
  }
  get invert() {
    return this._invert;
  }
  get lut() {
    return this._lut;
  }
  get lutTexture() {
    return this._lutTexture;
  }
  get index() {
    return this._index;
  }
  get intensityAuto() {
    return this._intensityAuto;
  }
  get planePosition() {
    return this._planePosition;
  }
  get planeDirection() {
    return this._planeDirection;
  }
  get halfDimensions() {
    return this._halfDimensions;
  }
  get center() {
    return this._center;
  }
  get aabbSpace() {
    return this._aaBBspace;
  }
  get canvasWidth() {
    return this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
  }
  get borderColor() {
    return this._borderColor;
  }
  //#endregion

  //#region Setters
  set windowWidth(windowWidth: number) {
    this._windowWidth = windowWidth;
    this.UpdateIntensitySettingsUniforms();
  }
  set windowCenter(windowCenter: number) {
    this._windowCenter = windowCenter;
    this.UpdateIntensitySettingsUniforms();
  }
  set interpolation(interpolation: number) {
    this._interpolation = interpolation;
    
    if (this._interpolation === 1) {
      this._material = DataMaterial.triMaterial;
    }
    else {
      this._material = DataMaterial.idnMaterial;
    }
    this.UpdateIntensitySettingsUniforms();
    this._prepareMaterial();
  }
  set spacing(spacing: number) {
    this._spacing = spacing;
    this._material.uniforms.uSpacing.value = this._spacing;
  }
  set thickness(thickness: number) {
    this._thickness = thickness;
    this._material.uniforms.uThickness.value = this._thickness;
  }
  set thicknessMethod(thicknessMethod: number) {
    this._thicknessMethod = thicknessMethod;
    this._material.uniforms.uThicknessMethod.value = this._thicknessMethod;
  }
  set opacity(opacity: number) {
    this._opacity = opacity;
    this.UpdateIntensitySettingsUniforms();
  }
  set upperThreshold(upperThreshold: number) {
    this._upperThreshold = upperThreshold;
    this.UpdateIntensitySettingsUniforms();
  }
  set lowerThreshold(lowerThreshold: number) {
    this._lowerThreshold = lowerThreshold;
    this.UpdateIntensitySettingsUniforms();
  }
  set rescaleSlope(rescaleSlope: any) {
    this._rescaleSlope = rescaleSlope;
    this.UpdateIntensitySettingsUniforms();
  }
  set rescaleIntercept(rescaleIntercept: any) {
    this._rescaleIntercept = rescaleIntercept;
    this.UpdateIntensitySettingsUniforms();
  }
  set invert(invert: number) {
    this._invert = invert;
    this.UpdateIntensitySettingsUniforms();
  }
  set lut(lut: string) {
    this._lut = lut;
  }
  set lutTexture(lutTexture: THREE.Texture) {
    this._lutTexture = lutTexture;
    this.UpdateIntensitySettingsUniforms();
  }
  set intensityAuto(intensityAuto: any) {
    this._intensityAuto = intensityAuto;
    this.UpdateIntensitySettings();
    this.UpdateIntensitySettingsUniforms();
  }
  set index(index: number) {
    this._index = index;
    this._update();
  }
  set planePosition(position: any) {
    this._planePosition = position;
    this._update();
  }
  set planeDirection(direction: any) {
    this._planeDirection = direction;
    this._update();
  }
  set halfDimensions(halfDimensions: any) {
    this._halfDimensions = halfDimensions;
  }
  set center(center: any) {
    this._center = center;
  }
  set aabbSpace(aabbSpace: any) {
    this._aaBBspace = aabbSpace;
    this._init();
  }
  set canvasWidth(canvasWidth: number) {
    this._canvasWidth = canvasWidth;
    this._material.uniforms.uCanvasWidth.value = this._canvasWidth;
  }
  set canvasHeight(canvasHeight: number) {
    this._canvasHeight = canvasHeight;
    this._material.uniforms.uCanvasHeight.value = this._canvasHeight;
  }
  set borderColor(borderColor: any) {
    this._borderColor = borderColor;
    this._material.uniforms.uBorderColor.value = new THREE.Color(borderColor);
  }
  //#endregion
  
  constructor(
    stack: any, 
    index: number = 0, 
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), 
    direction: THREE.Vector3 = new THREE.Vector3(0, 0, 1),
    aabbSpace: string = 'IJK'
  ) {
    super(stack);
    
    this._material = DataMaterial.triMaterial;

    this._invert = this._stack.invert;
    this._index = index;
    this._planePosition = position;
    this._planeDirection = direction;
    // change aaBBSpace changes the box dimensions
    // also changes the transform
    // there is also a switch to move back mesh to LPS space automatically
    this._aaBBspace = aabbSpace; // or LPS -> different transforms, esp for the geometry/mesh
    // update dimensions, center, etc.
    // depending on aaBBSpace
    this._init();
    // update object
    this._create();
  }

  protected _init() {
    if (!this._stack || !this._stack._prepared || !this._stack._packed) {
      return;
    }
    if (this._aaBBspace === 'IJK') {
      this._halfDimensions = this._stack.halfDimensionsIJK;
      this._center = new THREE.Vector3(this._stack.halfDimensionsIJK.x - 0.5, this._stack.halfDimensionsIJK.y - 0.5, this._stack.halfDimensionsIJK.z - 0.5);
      this._toAABB = new THREE.Matrix4();
    }
    else {
      // LPS
      const aaBBox = this._stack.AABBox();
      this._halfDimensions = aaBBox.clone().multiplyScalar(0.5);
      this._center = this._stack.centerAABBox();
      this._toAABB = this._stack.lps2AABB;
    }

    this._prepareMaterial();
  }

  protected _prepareMaterial() {
    this._material.uniforms.uTextureSize.value = this._stack.textureSize;
    this._material.uniforms.uDataDimensions.value = [
      this._stack.dimensionsIJK.x,
      this._stack.dimensionsIJK.y,
      this._stack.dimensionsIJK.z,
    ];
    this._material.uniforms.uWorldToData.value = this._stack.lps2IJK;
    this._material.uniforms.uNumberOfChannels.value = this._stack.numberOfChannels;
    this._material.uniforms.uPixelType.value = this._stack.pixelType;
    this._material.uniforms.uBitsAllocated.value = this._stack.bitsAllocated;
    this._material.uniforms.uPackedPerPixel.value = this._stack.packedPerPixel;
    this._material.uniforms.uSpacing.value = this._spacing;
    this._material.uniforms.uThickness.value = this._thickness;
    this._material.uniforms.uThicknessMethod.value = this._thicknessMethod;
    // compute texture if material exist
    this._prepareTexture();
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

    //   this._material.needsUpdate = true;
    // }
  }

  protected _create() {
    if (!this._stack || !this._stack.prepared || !this._stack.packed) {
      return;
    }
    // Convenience vars
    try {
      this._geometry = new SliceGeometry(this._halfDimensions, this._center, this._planePosition, this._planeDirection, this._toAABB);
    }
    catch (e) {
      window.console.log(e);
      window.console.log('invalid slice geometry - exiting...');
      return;
    }
    if (!(this._geometry as THREE.BufferGeometry).attributes) {
      return;
    }
    // update intensity related stuff
    this.UpdateIntensitySettings();
    this.UpdateIntensitySettingsUniforms();
    // create the mesh!
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    if (this._aaBBspace === 'IJK') {
      this._mesh.applyMatrix(this._stack.ijk2LPS);
    }
    this._mesh.visible = this._visible;
    // and add it!
    this.add(this._mesh);
  }
  public UpdateIntensitySettings() {
    // if auto, get from frame index
    if (this._intensityAuto) {
      this.UpdateIntensitySetting('windowCenter');
      this.UpdateIntensitySetting('windowWidth');
      this.UpdateIntensitySetting('rescaleSlope');
      this.UpdateIntensitySetting('rescaleIntercept');
    }
    else {
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
  public UpdateIntensitySettingsUniforms() {
    // compensate for the offset to only pass > 0 values to shaders
    // models > models.stack.js : _packTo8Bits
    let offset = 0;
    if (this._stack._minMax[0] < 0) {
      offset -= this._stack._minMax[0];
    }
    // set slice window center and width
    this._material.uniforms.uRescaleSlopeIntercept.value = [this._rescaleSlope, this._rescaleIntercept];
    this._material.uniforms.uWindowCenterWidth.value = [offset + this._windowCenter, this._windowWidth];
    // set slice opacity
    this._material.uniforms.uOpacity.value = this._opacity;
    // set slice upper/lower threshold
    this._material.uniforms.uLowerUpperThreshold.value = [
      offset + this._lowerThreshold,
      offset + this._upperThreshold,
    ];
    // invert
    this._material.uniforms.uInvert.value = this._invert === true ? 1 : 0;
    // interpolation
    // this._material.uniforms.uInterpolation.value = this._interpolation;
    // lut
    if (this._lut === 'none') {
      this._material.uniforms.uLut.value = 0;
    }
    else {
      this._material.uniforms.uLut.value = 1;
      this._material.uniforms.uTextureLUT.value = this._lutTexture;
    }
  }
  public UpdateIntensitySetting(setting: any) {
    if (this._stack.frame[this._index] && this._stack.frame[this._index][setting]) {
      this['_' + setting] = this._stack.frame[this._index][setting];
    }
    else {
      this['_' + setting] = this._stack[setting];
    }
  }
  protected _update() {
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
  public dispose() {
    // Release memory
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
  public CartesianEquation() {
    // Make sure we have a geometry
    if (!this._geometry || !this._geometry.vertices || this._geometry.vertices.length < 3) {
      return new THREE.Vector4();
    }
    const vertices = this._geometry.vertices;
    const dataToWorld = this._stack.ijk2LPS;
    const p1 = new THREE.Vector3(vertices[0].x, vertices[0].y, vertices[0].z).applyMatrix4(dataToWorld);
    const p2 = new THREE.Vector3(vertices[1].x, vertices[1].y, vertices[1].z).applyMatrix4(dataToWorld);
    const p3 = new THREE.Vector3(vertices[2].x, vertices[2].y, vertices[2].z).applyMatrix4(dataToWorld);
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const normal = v1
      .subVectors(p3, p2)
      .cross(v2.subVectors(p1, p2))
      .normalize();
    return new THREE.Vector4(normal.x, normal.y, normal.z, -normal.dot(p1));
  }
}
