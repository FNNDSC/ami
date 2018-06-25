/** * Imports ***/
import ShadersUniform from '../shaders/shaders.contour.uniform';
import ShadersVertex from '../shaders/shaders.contour.vertex';
import ShadersFragment from '../shaders/shaders.contour.fragment';

/**
* @module helpers/contour
*/
const helpersContour = (three = window.THREE) => {
  if (three === undefined || three.Object3D === undefined) {
    return null;
  }

  const Constructor = three.Object3D;
  return class extends Constructor {
    constructor(stack, geometry, texture) {
      //
      super();

      this._stack = stack;
      this._textureToFilter = texture;
      this._contourWidth = 1;
      this._contourOpacity = 1;
      this._canvasWidth = 0;
      this._canvasHeight = 0;
      this._shadersFragment = ShadersFragment;
      this._shadersVertex = ShadersVertex;
      this._uniforms = ShadersUniform.uniforms();
      this._material = null;
      this._geometry = geometry;

      this._create();
    }

    _create() {
      this._prepareMaterial();
      this._mesh = new three.Mesh(this._geometry, this._material);
      this._mesh.applyMatrix(this._stack._ijk2LPS);
      this.add(this._mesh);
    }

    _prepareMaterial() {
      if (!this._material) {
        // contour default width
        this._uniforms.uWidth.value = this._contourWidth;
        this._uniforms.uOpacity.value = this._contourOpacity;

        //
        this._uniforms.uCanvasWidth.value = this._canvasWidth;
        this._uniforms.uCanvasHeight.value = this._canvasHeight;

       // generate material
        let fs = new ShadersFragment(this._uniforms);
        let vs = new ShadersVertex();
        this._material = new three.ShaderMaterial(
          {
            side: three.DoubleSide,
            uniforms: this._uniforms,
            vertexShader: vs.compute(),
            fragmentShader: fs.compute(),
            transparent: true,
          }
        );
      }
    }

    update() {
      if (this._mesh) {
        this.remove(this._mesh);
        this._mesh.geometry.dispose();
        this._mesh.geometry = null;
        this._mesh = null;
      }

      this._create();
    }

    dispose() {
      //
      if (this._textureToFilter !== null) {
        this._textureToFilter.dispose();
        this._textureToFilter = null;
      }

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

    get geometry() {
      return this._geometry;
    }

    set geometry(geometry) {
      if (this._mesh) {
        this.remove(this._mesh);
        this._mesh.geometry.dispose();
        this._mesh.geometry = null;
        this._mesh = null;

        this._geometry.dispose();
        this._geometry = null;
      }

      this._geometry = geometry;

      this._create();
    }

    get textureToFilter() {
      return this._textureToFilter;
    }

    set textureToFilter(texture) {
      this._textureToFilter = texture;
      this._uniforms.uTextureFilled.value = texture;
      this._material.needsUpdate = true;
    }

    get contourOpacity() {
      return this._contourOpacity;
    }

    set contourOpacity(contourOpacity) {
      this._contourOpacity = contourOpacity;
      this._uniforms.uOpacity.value = this._contourOpacity;
    }

    get contourWidth() {
      return this._contourWidth;
    }

    set contourWidth(contourWidth) {
      this._contourWidth = contourWidth;
      this._uniforms.uWidth.value = this._contourWidth;
    }

    get canvasWidth() {
      return this._canvasWidth;
    }

    set canvasWidth(canvasWidth) {
      this._canvasWidth = canvasWidth;
      this._uniforms.uCanvasWidth.value = this._canvasWidth;
    }

    get canvasHeight() {
      return this._canvasHeight;
    }

    set canvasHeight(canvasHeight) {
      this._canvasHeight = canvasHeight;
      this._uniforms.uCanvasHeight.value = this._canvasHeight;
    }
  };
};

// export factory
export {helpersContour};
// default export to
export default helpersContour();
