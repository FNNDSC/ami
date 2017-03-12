/** Imports **/
import HelpersProgressBar from '../helpers/helpers.progressbar';
import EventEmitter from 'events';


/**
 *
 * It is typically used to load a DICOM image. Use loading manager for
 * advanced usage, such as multiple files handling.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#loader_dicom}
 *
 * @module loaders/base
 * @extends EventEmitter
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
export default class LoadersBase extends EventEmitter {
  /**
   * Create a Loader.
   * @param {dom} container - The dom container of loader.
   * @param {object} ProgressBar - The progressbar of loader.
   */
  constructor(container = null, ProgressBar = HelpersProgressBar) {
    super();
    this._loaded = -1;
    this._totalLoaded = -1;
    this._parsed = -1;
    this._totalParsed = -1;

    this._data = [];

    this._container = container;
    this._progressBar = null;
    if (this._container && ProgressBar) {
      this._progressBar = new ProgressBar(this._container);
    }
  }

  /**
   * free the reference.
   */
  free() {
    this._container = null;
    this._helpersProgressBar = null;

    if (this._progressBar) {
      this._progressBar.free();
      this._progressBar = null;
    }
  }

  /**
   * load the resource by url.
   * @param {string} url - resource url.
   * @return {promise} promise.
   */
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

          // will be removed after eventer set up
          if (this._progressBar) {
            this._progressBar.update(this._loaded, this._totalLoaded,
              'load');
          }

          let buffer = request.response;
          let response = {
            url,
            buffer,
          };

          // emit 'fetch-success' event
          this.emit('fetch-success', {
            file: url,
            curTime: new Date(),
            totalLoaded: event.total,
          });

          resolve(response);
        } else {
          reject(request.statusText);
        }
      };

      request.onerror = () => {
        // emit 'fetch-error' event
        this.emit('fetch-error', {
          file: url,
          curTime: new Date(),
        });

        reject(request.statusText);
      };

      request.onprogress = (event) => {
        this._loaded = event.loaded;
        this._totalLoaded = event.total;
        // emit 'fetching' event
        this.emit('fetching', {
          file: url,
          total: event.total,
          loaded: event.loaded,
          curTime: new Date(),
        });
        // will be removed after eventer set up
        if (this._progressBar) {
          this._progressBar.update(this._loaded, this._totalLoaded,
            'load');
        }
      };

      // emit 'begin-fetch' event
      this.emit('begin-fetch', {
        file: url,
        curTime: new Date(),
      });

      request.send();
    });
  }

  /**
   * parse the data loaded
   * SHOULD BE implementd by detail loader.
   * @param {object} response - loaded data.
   * @return {promise} promise.
   */
  parse(response) {
    return new Promise((resolve, reject) => {
      resolve(response);
    });
  }

  /**
   * default load sequence promise.
   * @param {string} url - resource url.
   * @return {promise} promise.
   */
  loadSequence(url) {
    return this.fetch(url)
      .then((rawdata) => {
        return this.parse(rawdata);
      })
      .then((data) => {
        this._data.push(data);
        return data;
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }

  /**
   * load the data by url(urls)
   * @param {string|array} url - resource url.
   * @return {promise} promise
   */
  load(url) {
    // if we load a single file, convert it to an array
    if (!Array.isArray(url)) {
      url = [url];
    }

    // emit 'before-loader' event
    this.emit('begin-load', {
      totalFiles: url.length,
      files: url,
      curTime: new Date(),
    });

    let loadSequences = [];
    url.forEach((file) => {
      loadSequences.push(
        this.loadSequence(file)
      );
    });
    return Promise.all(loadSequences);
  }

  /**
   * Set data
   * @param {array} data
   */
  set data(data) {
    this._data = data;
  }

  /**
   * Get data
   * @return {array} data loaded
   */
  get data() {
    return this._data;
  }

}
