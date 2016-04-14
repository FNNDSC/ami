
/**
 * @module helpers/progressBar
 */

export default class HelpersProgressBar{
  constructor(container) {
    this._container = container;
    this._modes = {
      'load': {
        'name' : 'load',
        'color': '#FFF56F'
      },
      'parse': {
        'name' : 'parse',
        'color': '#2196F3'
      }
    }

    this.init();
  }

  free() {
    let progressContainers = this._container.getElementsByClassName('progress container');
    if(progressContainers.length > 0){
      progressContainers[0].parentNode.removeChild(progressContainers[0]);
    }
    progressContainers = null;
  }

  init() {
    var progressContainer = this._domContainer();

    for (let mode in this._modes) {
      if (this._modes.hasOwnProperty(mode)) {
        var bar = this._domBar(this._modes[mode]);
        progressContainer.appendChild(bar);
        bar = null;
      }
    }

    this._container.appendChild(progressContainer);
    progressContainer = null;
  }

  update(value, total, mode) {
    requestAnimationFrame(() => {
      if (!(this._modes.hasOwnProperty(mode) &&
        this._modes[mode].hasOwnProperty('name') &&
        this._modes[mode].hasOwnProperty('color'))) {
        window.console.log('Invalid mode provided.');
        window.console.log(mode);

        return false;
      }

      let message = '';
      let progress = Math.round((value / total) * 100);
      let color = this._modes[mode].color;

      let progressBar = this._container.getElementsByClassName('progress ' + this._modes[mode].name);
      if(progressBar.length > 0){
        progressBar[0].style.borderColor = color;
        progressBar[0].style.width = progress + '%';
      }
      progressBar = null;

    });
  }

  _domContainer(){
    let container = document.createElement('div');

    // class it
    container.classList.add('progress');
    container.classList.add('container');

    // style it
    container.style.width = '100%';
    container.style.height = '8px';
    container.style.position = 'absolute';
    container.style.backgroundColor = 'rgba(158, 158, 158, 0.5)';
    container.style.top = '0';
    container.style.zIndex = '1';

    return container;
  }

  _domBar(mode){

    if (!(mode.hasOwnProperty('name') &&
      (mode.hasOwnProperty('color')))) {
      window.console.log('Invalid mode provided.');
      window.console.log(mode);

      return false;
    }

    let bar = document.createElement('div');

    // class it
    bar.classList.add(mode.name);
    bar.classList.add('progress');

    // style it
    bar.style.border = '2px solid ' + mode.color;
    bar.style.width = '0%';

    return bar;
  }

}