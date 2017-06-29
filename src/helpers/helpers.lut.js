
/**
 * @module helpers/lut
 */

export default class HelpersLut {
  constructor(containerID,
              lut = 'default',
              lutO = 'linear',
              color = [[0, 0, 0, 0], [1, 1, 1, 1]],
              opacity = [[0, 0], [1, 1]],
              discrete = false) {
    // min/max (0-1 or real intensities)
    // show/hide
    // horizontal/vertical
    this._containerID = containerID;

    this._discrete = discrete;
    this._color = color;
    this._lut = lut;
    this._luts = {[lut]: color};

    this._opacity = opacity;
    this._lutO = lutO;
    this._lutsO = {[lutO]: opacity};

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

    // apply color
    if (!this._discrete) {
      let color = ctx.createLinearGradient(0, 0, this._canvas.width, this._canvas.height);
      for (let i = 0; i < this._color.length; i++) {
        color.addColorStop(this._color[i][0], `rgba( ${Math.round(this._color[i][1] * 255)}, ${Math.round(this._color[i][2] * 255)}, ${Math.round(this._color[i][3] * 255)}, 1)`);
      }

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      ctx.lineWidth=2*this._canvas.height;

      for (let i=0; i<this._color.length; i++) {
        let currentPos = this._color[i][0];
        let nextPos = 1;
        if (i < this._color.length - 1) {
          nextPos = this._color[i+1][0];
        }
        let previousPos = 0;
        if (i > 0) {
          previousPos = this._color[i-1][0];
        }

        let from = previousPos + (currentPos - previousPos)/2;
        let to = currentPos + (nextPos - currentPos)/2;
        let color = this._color[i];
        let opacity = this._opacity[i] ? this._opacity[i][1] : 1;

        ctx.beginPath();
        ctx.strokeStyle = `rgba( ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${Math.round(color[3] * 255)}, ${opacity})`;
        ctx.moveTo(from*this._canvas.width, 0);
        ctx.lineTo(to*this._canvas.width, 0);
        ctx.stroke();
        ctx.closePath();
      }
    }

    if (!this._discrete) {
      // if discrete, we already took care of the opacity.
      // setup context
      ctx.globalCompositeOperation = 'destination-in';

      // apply opacity
      let opacity = ctx.createLinearGradient(0, 0, this._canvas.width, this._canvas.height);
      for (let i = 0; i < this._opacity.length; i++) {
        opacity.addColorStop(this._opacity[i][0], 'rgba(255, 255, 255, ' + this._opacity[i][1] + ')');
      }
      ctx.fillStyle = opacity;
      ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
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

  set lutO(targetLUTO) {
    this._opacity = this._lutsO[targetLUTO];
    this._lutO = targetLUTO;

    this.paintCanvas();
  }

  get lutO() {
    return this._lutO;
  }

  set lutsO(newLutsO) {
    this._lutsO = newLutsO;
  }

  get lutsO() {
    return this._lutsO;
  }

  set discrete(discrete) {
    this._discrete = discrete;

    this.paintCanvas();
  }

  get discrete() {
    return this._discrete;
  }

  lutsAvailable(type = 'color') {
    let available = [];
    let luts = this._luts;

    if (type !== 'color') {
      luts = this._lutsO;
    }

    for (let i in luts) {
      available.push(i);
    }

    return available;
  }

  // add luts to class' lut (so a user can add its own as well)
  static presetLuts() {
    return {
      'default': [[0, 0, 0, 0], [1, 1, 1, 1]],
      'spectrum': [[0, 0, 0, 0], [0.1, 0, 0, 1], [0.33, 0, 1, 1], [0.5, 0, 1, 0], [0.66, 1, 1, 0], [0.9, 1, 0, 0], [1, 1, 1, 1]],
      'hot_and_cold': [[0, 0, 0, 1], [0.15, 0, 1, 1], [0.3, 0, 1, 0], [0.45, 0, 0, 0], [0.5, 0, 0, 0], [0.55, 0, 0, 0], [0.7, 1, 1, 0], [0.85, 1, 0, 0], [1, 1, 1, 1]],
      'gold': [[0, 0, 0, 0], [0.13, 0.19, 0.03, 0], [0.25, 0.39, 0.12, 0], [0.38, 0.59, 0.26, 0], [0.50, 0.80, 0.46, 0.08], [0.63, 0.99, 0.71, 0.21], [0.75, 0.99, 0.88, 0.34], [0.88, 0.99, 0.99, 0.48], [1, 0.90, 0.95, 0.61]],
      'red': [[0, 0.75, 0, 0], [0.5, 1, 0.5, 0], [0.95, 1, 1, 0], [1, 1, 1, 1]],
      'green': [[0, 0, 0.75, 0], [0.5, 0.5, 1, 0], [0.95, 1, 1, 0], [1, 1, 1, 1]],
      'blue': [[0, 0, 0, 1], [0.5, 0, 0.5, 1], [0.95, 0, 1, 1], [1, 1, 1, 1]],
      'walking_dead': [[0, 0.1, 1, 1], [1, 1, 1, 1]],
      'random': [[0, 0, 0, 0], [0.27, 0.18, 0.18, 0.18], [0.41, 1, 1, 1], [0.7, 1, 0, 0], [1, 1, 1, 1]],
    };
  }

  static presetLutsO() {
    return {
      'linear': [[0, 0], [1, 1]],
      'lowpass': [[0, 0.8], [0.2, 0.6], [0.3, 0.1], [1, 0]],
      'bandpass': [[0, 0], [0.4, 0.8], [0.6, 0.8], [1, 0]],
      'highpass': [[0, 0], [0.7, 0.1], [0.8, 0.6], [1, 0.8]],
      'flat': [[0, .7], [1, 1]],
      'random': [[0, 0.], [0.38, 0.], [0.55, 1.], [0.72, 1.], [1, 0.05]],
    };
  }

}
