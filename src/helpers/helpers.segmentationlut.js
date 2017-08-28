/**
 * @module helpers/segmentationlut
 */

export default class HelpersSegmentationLut {
  constructor(containerID, segID = 'Freesurfer', segObj){

    this._containerID = containerID;
    this._segObj = segObj;

    //A segmentation identifier so you can look it up on the segs and retrieve the segmentation object associated
    this._segID = segID; 

    /*The segmentation object contains the color,opacity, label and structures associated:  
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
    ctx.lineWidth = 1;

   for(i in this._segObj){  //i is the label number and specifies the coordinates inside the canvas

      let xCoord = i % this._canvas.width;
      let yCoord = Math.floor(i / this._canvas.width);
      let opacity = this._segObj[i]["opacity"] ? this._segObj[i]["opacity"] : 1;
      let color = this._segObj[i]["color"];

      ctx.beginPath();
      ctx.strokeStyle = `rgba( ${Math.round(color[1])}, ${Math.round(color[2])}, ${Math.round(color[3])}, ${opacity})`;
      ctx.moveTo(xCoord, yCoord);
      ctx.lineTo(xCoord + 1, yCoord + 1); //One pixel step
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

  set segID(targetSEG) {
    this._segObj = this._segs[targetSEG];
    this._segID = targetSEG;

    this.paintCanvas();
  }

  get segID() {
    return this._segID;
  }

  set segs(newSegs) {
    this._segs = newSegs;
  }

  get segs() {
    return this._segs;
  }

 
  segsAvailable(type = 'color') {
    let available = [];
    let segs = this._segs;

    for (let i in segs) {
      available.push(i);
    }

    return available;
  }

  // add segmentation objects to class' (so a user can add its own as well)
  static presetSegs() {
    return {
      'Freesurfer': []
    };
  }
}