/** Imports **/
import HelpersProgressBar from '../../src/helpers/helpers.progressbar';

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
export default class LoadersBase {
  /**
   * Some text
   */
  constructor(container=null, ProgressBar=HelpersProgressBar) {
    this._loaded = -1;
    this._totalLoaded = -1;
    this._parsed = -1;
    this._totalParsed = -1;

    this._data = [1, 2];

    this._container = container;
    this._progressBar = null;
    if(this._container && ProgressBar) {
      this._progressBar = new ProgressBar(this._container);
    }
  }

  /**
   *
   */
  free() {
    this._container = null;
    this._helpersProgressBar = null;

    if(this._progressBar) {
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
        if(request.status === 200) {
          this._loaded = event.loaded;
          this._totalLoaded = event.total;
          if(this._progressBar) {
            this._progressBar.update(this._loaded, this._totalLoaded, 'load');
          }

          let buffer = request.response;
          let response = {
            url,
            buffer,
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
        if(this._progressBar) {
          this._progressBar.update(this._loaded, this._totalLoaded, 'load');
        }
      };

      request.send();
    });
  }

  parse(response) {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }

  // default load sequence promise
  loadSequence(url) {
    return this.fetch(url)
      .then((rawdata) => {
        return this.parse(rawdata);
      })
      .then((data) => {
        this._data.push(data);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }

  load(url) {
    // if we load a single file, convert it to an array
    if(!Array.isArray(url)) {
      url = [url];
    }

    let loadSequences = [];
    url.forEach((file) => {
     loadSequences.push(
       this.loadSequence(file)
      );
    });

    return Promise.all(loadSequences);
  }

  set data(data) {
    this._data = data;
  }

  get data() {
    return this._data;
  }


}
