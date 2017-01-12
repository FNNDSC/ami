/**
 * @module helpers/x/volume
 */

import HelpersStack from '../helpers.stack';
import LoadersVolume from '../../loaders/loaders.volume';

export default class {

  constructor() {
    this._file = null;
    this._progressbar_container = null
    this._stack = null
    this._centerLPS = null
    this.XSlice = null
    this.YSlice = null
    this.ZSlice = null
  }

  // accessor properties
  get file() {
    return this._file;
  }

  set file(fname) {
    this._file = fname;
  }

  set progressbar_container(container) {
    this._progressbar_container = container;
  }

  get centerLPS() {
    return this._centerLPS;
  }

  // private methods
  _createSlice(orientation) {

    if (this._stack) {
      const stackHelper = new HelpersStack(this._stack);
      stackHelper.orientation = orientation;

      if (orientation===0) {
        stackHelper.border.color = 0xF44336;
        this.XSlice = stackHelper;
      } else if (orientation===1) {
        stackHelper.bbox.visible = false;
        stackHelper.border.color = 0x4CAF50;
        this.YSlice = stackHelper;

      } else{
        stackHelper.bbox.visible = false;
        stackHelper.border.color = 0x4CAF50;
        this.ZSlice = stackHelper;
      }
      this._centerLPS = stackHelper.stack.worldCenter();
    }
  }

  // public methods
  load() {
    const self = this;

    if (self.file) {
      // instantiate the loader
      // it loads and parses the dicom image
      let loader = new LoadersVolume(self._progressbar_container);
      const seriesContainer = [];
      const loadSequence = [];

      // create the array of promises, a promise for each file to be loaded
      self.file.forEach( function(url) {

        loadSequence.push(
          Promise.resolve()
          // fetch the file
          .then( function() {
            return loader.fetch(url);
          })
          .then( function(data) {
            return loader.parse(data);
          })
          .then( function(series) {
            seriesContainer.push(series);
          })
          .catch( function(error) {
            window.console.log('oops... something went wrong loading the volume...');
            window.console.log(error);
          })
        );
      });

      return Promise.all(loadSequence).then( function() {
        // create the three slices when all files have been loaded

        loader.free();
        const series = seriesContainer[0].mergeSeries(seriesContainer)[0];
        self._stack = series.stack[0];
        self._createSlice(0);
        self._createSlice(1);
        self._createSlice(2);

      }).catch( function(error) {

        loader.free();
        window.console.log('oops... something went wrong loading the volume...');
        window.console.log(error);
      });
    }

    return Promise.reject( {message: `Couldn't load files: ${self.file}.`} );
  }
}
