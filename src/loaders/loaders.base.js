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
    this._data = [];
    this._container = null;
    // this._helpersProgressBar = null;

    if (this._progressBar) {
      this._progressBar.free();
      this._progressBar = null;
    }
  }

  /**
   * load the resource by url.
   * @param {string} url - resource url.
   * @param {Map} requests - used for cancellation.
   * @return {promise} promise.
   */
  fetch(url, requests) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', url);
      request.crossOrigin = true;
      request.responseType = 'arraybuffer';

      request.onloadstart = (event) => {
        // emit 'fetch-start' event
        this.emit('fetch-start', {
          file: url,
          time: new Date(),
        });
      };

      request.onload = (event) => {
        if (request.status === 200 || request.status === 0) {
          this._loaded = event.loaded;
          this._totalLoaded = event.total;

          // will be removed after eventer set up
          if (this._progressBar) {
            this._progressBar.update(this._loaded, this._totalLoaded, 'load', url);
          }

          let buffer = request.response;
          let response = {
            url,
            buffer,
          };

          // emit 'fetch-success' event
          this.emit('fetch-success', {
            file: url,
            time: new Date(),
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
          time: new Date(),
        });

        reject(request.statusText);
      };

      request.onabort = (event) => {
        // emit 'fetch-abort' event
        this.emit('fetch-abort', {
          file: url,
          time: new Date(),
        });

        reject(request.statusText || 'Aborted');
      };

      request.ontimeout = () => {
        // emit 'fetch-timeout' event
        this.emit('fetch-timeout', {
          file: url,
          time: new Date(),
        });

        reject(request.statusText);
      };

      request.onprogress = (event) => {
        this._loaded = event.loaded;
        this._totalLoaded = event.total;
        // emit 'fetch-progress' event
        this.emit('fetch-progress', {
          file: url,
          total: event.total,
          loaded: event.loaded,
          time: new Date(),
        });
        // will be removed after eventer set up
        if (this._progressBar) {
          this._progressBar.update(this._loaded, this._totalLoaded, 'load', url);
        }
      };

      request.onloadend = (event) => {
        // emit 'fetch-end' event
        this.emit('fetch-end', {
          file: url,
          time: new Date(),
        });
        // just use onload when success and onerror when failure, etc onabort
        // reject(request.statusText);
      };

      if (requests instanceof Map) {
        requests.set(url, request);
      }

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
   * default load sequence group promise.
   * @param {array} url - resource url.
   * @param {Map} requests - used for cancellation.
   * @return {promise} promise.
   */
  loadSequenceGroup(url, requests) {
    const fetchSequence = [];

    url.forEach((file) => {
      fetchSequence.push(
        this.fetch(file, requests)
      );
    });

    return Promise.all(fetchSequence)
      .then((rawdata) => {
        return this.parse(rawdata);
      })
      .then((data) => {
        this._data.push(data);
        return data;
      })
      .catch(function(error) {
        if (error === 'Aborted') {
            return;
        }
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }

  /**
   * default load sequence promise.
   * @param {string} url - resource url.
   * @param {Map} requests - used for cancellation.
   * @return {promise} promise.
   */
  loadSequence(url, requests) {
    return this.fetch(url, requests)
      .then((rawdata) => {
        return this.parse(rawdata);
      })
      .then((data) => {
        this._data.push(data);
        return data;
      })
      .catch(function(error) {
        if (error === 'Aborted') {
          return;
        }
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      });
  }

  /**
   * load the data by url(urls)
   * @param {string|array} url - resource url.
   * @param {Map} requests - used for cancellation.
   * @return {promise} promise
   */
  load(url, requests) {
    // if we load a single file, convert it to an array
    if (!Array.isArray(url)) {
      url = [url];
    }

    if (this._progressBar) {
      this._progressBar.totalFiles = url.length;
      this._progressBar.requests = requests;
    }

    // emit 'load-start' event
    this.emit('load-start', {
      files: url,
      time: new Date(),
    });

    const loadSequences = [];
    url.forEach((file) => {
      if (!Array.isArray(file)) {
        loadSequences.push(
          this.loadSequence(file, requests)
        );
      } else {
        loadSequences.push(
          this.loadSequenceGroup(file, requests)
        );
      }
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
