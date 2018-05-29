import CoreUtils from '../core/core.utils';

let defaultSegmentation = {
  0: {color: [0, 0, 0], opacity: 0, label: 'background'},
  1: {color: [255, 0, 0], opacity: 1, label: 'white matter'},
};

export default class HelpersSegmentationLut {
  constructor(domTarget, segmentation = defaultSegmentation) {
    if (CoreUtils.isString(domTarget)) {
      this._dom = document.getElementById(domTarget);
    } else {
      this._dom = domTarget;
    }

    this._segmentation = segmentation;

    /* The segmentation object contains the color, opacity, label and structures associated:
      e.g
      const freesurferSegmentation = {
      0: {color: [0, 0, 0],opacity: 0,label: 'background'},
      1: {color: [255, 0, 0],opacity: 1,label: 'white matter'},
      }
    */
    this.initCanvas();
    this.paintCanvas();
  }

  initCanvas() {
    // container
    this._canvasContainer = this.initCanvasContainer(this._dom);
    // background
    this._canvasBg = this.createCanvas();
    this._canvasContainer.appendChild(this._canvasBg);
    // foreground
    this._canvas = this.createCanvas();
    this._canvasContainer.appendChild(this._canvas);
  }

  initCanvasContainer(dom) {
    let canvasContainer = dom;
    canvasContainer.style.width = '256 px';
    canvasContainer.style.height = '128 px';
    canvasContainer.style.border = '1px solid #F9F9F9';
    return canvasContainer;
  }

  createCanvas() {
    let canvas = document.createElement('canvas');
    canvas.height = 128;
    canvas.width = 256;
    return canvas;
  }

  paintCanvas() {
    // setup context
    let ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 1;

    for (let i in this._segmentation) {
      // i is the label number and specifies the coordinates inside the canvas
      let xCoord = i % this._canvas.width;
      let yCoord = Math.floor(i / this._canvas.width);
      let opacity = (typeof this._segmentation[i]['opacity'] != 'undefined') ? this._segmentation[i]['opacity'] : 1;
      let color = this._segmentation[i]['color'];

      ctx.fillStyle = `rgba( ${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])}, ${opacity})`;
      ctx.fillRect(xCoord, yCoord, 1, 1);
    }
  }

  get texture() {
    let texture = new THREE.Texture(this._canvas);
    texture.mapping = THREE.UVMapping;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = texture.minFilter = THREE.NearestFilter;
    texture.premultiplyAlpha = true;
    texture.needsUpdate = true;

    return texture;
  }

  /**
   * Set and get the segmentation object
   * (you can create it or get it from the presets file)
   *
   * @param {*} segmentation
   */
  set segmentation(segmentation) {
    this._segmentation = segmentation;
    this.paintCanvas();
  }

  get segmentation() {
    return this._segmentation;
  }
}
