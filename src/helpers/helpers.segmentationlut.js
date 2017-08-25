/**
 * @module helpers/segmentationlut
 */

export default class HelpersSegmentationLut {
  constructor(containerID, lut = 'Freesurfer', color = [[1, 140, 120, 80], [2, 120, 60, 170]], opacity = [[0, 0], [1, 1]], dict = ["Air","Bone"]) {

    this._containerID = containerID;
    this._dict = dict; //Dictionary that maps labels to strings
    this._color = color;
    this._opacity = opacity;
    this._lut = lut;
    this._luts = {[lut]: color};

    this.initCanvas();
    this.paintCanvas();
  }

  initCanvas() {
    // container
    this._canvasContainer = this.initCanvasContainer(this._containerID);
    // background
    this._canvasBg = this.createCanvas();
    this._canvasContainer.appendChild(this._canvasBg);
    // foreground
    this._canvas = this.createCanvas();
    this._canvasContainer.appendChild(this._canvas);
  }

  initCanvasContainer(canvasContainerId) {
    let canvasContainer = document.getElementById(canvasContainerId);
    canvasContainer.style.width = '256 px';
    canvasContainer.style.height = '128 px';
    canvasContainer.style.border = '1px solid #F9F9F9';
    return canvasContainer;
  }

  createCanvas() {
    let canvas = document.createElement('canvas');
    canvas.height = 16;
    canvas.width = 256;
    return canvas;
  }

  paintCanvas() {
    // setup context
    let ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth=1;

      for (let i=0; i<this._color.length; i++) {
        //The first component of the color is the label and the 3 others depict the color of the label in RGB (from 0 to 255)
        let labelPos = this._color[i][0];
        let xCoord = labelPos % this._canvas.width;
        let yCoord =  Math.floor(labelPos/this._canvas.width);
        let opacity = this._opacity[i] ? this._opacity[i][1] : 1;

        ctx.beginPath();
        ctx.strokeStyle =  `rgba( ${Math.round(this._color[i][1])}, ${Math.round(this._color[i][2])}, ${Math.round(this._color[i][3])}, ${opacity})`;
        ctx.moveTo(xCoord, yCoord);
        ctx.lineTo(xCoord+1, yCoord+1); //One pixel step
        ctx.stroke();
        ctx.closePath();

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

  set lut(targetLUT) {
    this._color = this._luts[targetLUT];
    this._lut = targetLUT;

    this.paintCanvas();
  }

  get lut() {
    return this._lut;
  }

  set luts(newLuts) {
    this._luts = newLuts;
  }

  get luts() {
    return this._luts;
  }

  set dict(newDict) {
    this._dict = newDict;
  }

  get dict() {
    return this._dict;
  }

  lutsAvailable(type = 'color') {
    let available = [];
    let luts = this._luts;

    for (let i in luts) {
      available.push(i);
    }

    return available;
  }

  // add luts to class' lut (so a user can add its own as well)
  static presetLuts() {
    return {
      'Freesurfer': [[1, 140, 120, 80], [2, 120, 60, 170]],
    };
  }

  static presetDicts() {
    return {
      'Freesurfer': ["Air", "Bone"],
    };
  }

}
