/*** Imports ***/
import HelpersProgressBar from '../../src/helpers/helpers.progressbar';
import ModelsSeries       from '../../src/models/models.series';
import ModelsStack        from '../../src/models/models.stack';
import ModelsFrame        from '../../src/models/models.frame';


/**
 *
 * It is typically used to load a DICOM image. Use loading manager for
 * advanced usage, such as multiple files handling.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#loader_dicom}
 *
 * @module loaders/base
 *
 * @example
 * var files = ['/data/dcm/fruit'];
 *
 * // Instantiate a dicom loader
 * var lDicomoader = new dicom();
 *
 * // load a resource
 * loader.load(
 *   // resource URL
 *   files[0],
 *   // Function when resource is loaded
 *   function(object) {
 *     //scene.add( object );
 *     window.console.log(object);
 *   }
 * );
 */
export default class LoadersBase{
  constructor(container=document.body, helpersProgress=HelpersProgressBar) {
    this._loaded = -1;
    this._totalLoaded = -1;
    this._parsed = -1;
    this._totalParsed = -1;

    this._container = container;
    this._helpersProgressBar = helpersProgress;
    this._progressBar = null;
    if(this._container && this._helpersProgressBar){
      this._progressBar = new helpersProgress(this._container);
    }
  }

  /**
   *
   */
  free(){
    this._container = null;
    this._helpersProgressBar = null;

    if(this._progressBar){
      this._progressBar.free();
      this._progressBar = null;
    }
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('GET', url);
      request.crossOrigin = true;
      request.responseType = 'arraybuffer';

      request.onload = (event) => {
        if (request.status === 200) {
          this._loaded = event.loaded;
          this._totalLoaded = event.total;
          if(this._progressBar){
            this._progressBar.update(this._loaded, this._totalLoaded, 'load');
          }

          let buffer = request.response;
          let response = {
            url,
            buffer
          };

          resolve(response);
        } else {
          reject(request.statusText);
        }
      };
      request.onerror = () => {
        reject(request.statusText);
      };

      request.onprogress = (event) => {
        this._loaded = event.loaded;
        this._totalLoaded = event.total;
        if(this._progressBar){
          this._progressBar.update(this._loaded, this._totalLoaded, 'load');
        }
      };

      request.send();
    });
  }
}
