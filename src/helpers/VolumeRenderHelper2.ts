import { BaseTHREEHelper } from "./BaseTHREEHelper";
import { Volume2Material } from "../shaders";

const THREE = (window as any).THREE;

/**
 * This variant of the VolumeRenderHelper uses WebGL 2
 */
export class VolumeRenderHelper2 extends BaseTHREEHelper {
  //#region Getters
  get textureLUT(): THREE.Texture {
    return this._material.uniforms.uLutTexture.value;
  }
  get windowWidth(): number {
    return this._material.uniforms.uClim.value.y
  }
  get windowCenter(): number {
    return this._material.uniforms.uClim.value.x
  }
  //#endregion

  //#region Setters 
  set textureLUT(value: THREE.Texture) {
    this._material.uniforms.uLutTexture.value = value;
  }
  set windowCenter(value: number) {
    //this._material.uniforms.uClim.value.x = value;
  }
  set windowWidth(value: number) {
    //this._material.uniforms.uClim.value.y = value;
  }
  //#endregion

  constructor(stack: any) {
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
  }

  private _prepareMaterial() {
    let length = this._stack.rawData[0].length;
    let f32A = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      f32A[i] = this._stack.rawData[0][i] / 255.0;
    }

    this._dataTexture = new THREE.DataTexture3D(
        f32A,
        this._stack.dimensionsIJK.x,
        this._stack.dimensionsIJK.y,
        this._stack.dimensionsIJK.z
    );				
    this._dataTexture.format = THREE.RedFormat;
    this._dataTexture.type = THREE.FloatType;
    this._dataTexture.minFilter = THREE.LinearFilter;
    this._dataTexture.magFilter = THREE.LinearFilter;
    this._dataTexture.unpackAlignment = 1;
    this._dataTexture.needsUpdate = true;

    this._material = Volume2Material.material;

    this._material.uniforms.uData.value = this._dataTexture;
    this._material.uniforms.uSize.value.copy(this._stack.dimensionsIJK.clone());
    this._material.uniforms.uClim.value.set(
      0.8,
      0.8
    );
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




