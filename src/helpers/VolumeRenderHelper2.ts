import { WebGlHelper } from "./WebGlHelper";

const THREE = (window as any).THREE;

interface THREEVolumeShaderUniforms {
    u_data: {value:THREE.DataTexture3D},          // Data Texture
    u_size: {value: THREE.Vector3},               // ivec3, stack sizes
    u_clim: {value: THREE.Vector2},               // ivec2, window width/height
    u_renderstyle: {value: number},               // MIP or ISO rendering
    u_renderthreshold: {value: number},           // render threshold for ISO
    u_cmdata: {value: THREE.Texture}              // LUT table
}

/**
 * This variant of the VolumeRenderHelper uses WebGL 2 - the following
 * scripts MUST be placed at the top of the index.html to work:
 * 
 * <script src="https://unpkg.com/three@0.102.1/examples/js/shaders/VolumeShader.js"></script>
 * <script src="https://unpkg.com/three@0.102.1/examples/js/Volume.js"></script>
 */
export class VolumeRenderHelper2 extends WebGlHelper {
  //#region Variables 
  private _volumeShader: any;
  private _dataTexture: THREE.DataTexture3D;
  //#endregion

  //#region Getters
  get textureLUT(): THREE.Texture {
    return this._textureLUT;
  }
  //#endregion

  //#region Setters 
  set textureLUT(value: THREE.Texture) {
    this._material.uniforms.u_cmdata.value = value;
  }
  set windowCenter(value: number) {
    this._material.uniforms.u_clim.value.y = value;
  }
  set windowWidth(value: number) {
    this._material.uniforms.u_clim.value.x = value;
  }
  //#endregion

  constructor(stack: any, isWebGl2: boolean) {
    super(stack, isWebGl2);
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

    (this._material.uniforms as unknown as THREEVolumeShaderUniforms).u_clim = new THREE.Vector2(this._stack.windowCenter, this._stack.windowWidth * 0.8); // multiply for better default visualization
  }

  private _prepareMaterial() {
    this._dataTexture = new THREE.DataTexture3D(
        this._stack.rawData,
        this._stack.dimensionsIJK.x,
        this._stack.dimensionsIJK.y,
        this._stack.dimensionsIJK.z
    );
    this._volumeShader = THREE.VolumeRenderShader;

    let uniforms = THREE.UniformsUtils.clone(this._volumeShader.uniforms);
    uniforms.u_data.value = this._dataTexture;
    uniforms.u_size.value.copy(this._stack.dimensionsIJK.clone());
    uniforms.u_clim.value = new THREE.Vector2(0.01, 0.01);
    uniforms.u_renderstyle.value = 1;
    uniforms.u_cmdata.value = new THREE.Texture;

    this._material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: this._volumeShader.vertexShader,
        fragmentShader: this._volumeShader.fragmentShader,
        side: THREE.BackSide // The volume shader uses the backface as its "reference point"
    } );


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




