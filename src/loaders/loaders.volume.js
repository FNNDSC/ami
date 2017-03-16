/** * Imports ***/
const PAKO = require('pako');
const URL = require('url');

import LoadersBase from './loaders.base';
import ModelsSeries from '../models/models.series';
import ModelsStack from '../models/models.stack';
import ModelsFrame from '../models/models.frame';
import ParsersDicom from '../parsers/parsers.dicom';
import ParsersNifti from '../parsers/parsers.nifti';
import ParsersNrrd from '../parsers/parsers.nrrd';

/**
 *
 * It is typically used to load a DICOM image. Use loading manager for
 * advanced usage, such as multiple files handling.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#loader_dicom}
 *
 * @module loaders/volumes
 * @extends LoadersBase
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
export default class LoadersVolumes extends LoadersBase {

  /**
   * Parse response.
   * response is formated as:
   *    {
   *      url: 'resource url',
   *      buffer: xmlresponse,
   *    }
   * @param {object} response - response
   * @return {promise} promise
   */
  parse(response) {
    // emit 'begin-parse' event
    this.emit('begin-parse', {
      file: response.url,
      time: new Date(),
    });
    // give a chance to the UI to update because
    // after the rendering will be blocked with intensive JS
    // will be removed after eventer set up
    if (this._progressBar) {
      this._progressBar.update(0, 100, 'parse');
    }

    return new Promise(
      (resolve, reject) => {
        window.setTimeout(
          () => {
            resolve(new Promise((resolve, reject) => {
              let data = response;
              data.gzcompressed = false;
              data.filename = '';
              data.extension = '';
              data.pathname = '';
              data.query = '';

              let parsedUrl = URL.parse(response.url);
              data.pathname = parsedUrl.pathname;
              data.query = parsedUrl.query;

              // get file name
              data.filename = data.pathname.split('/')
                .pop();
              data.gzcompressed = false;

              // find extension
              let splittedName = data.filename.split('.');
              if (splittedName.length <= 1) {
                data.extension = 'dicom';
              } else {
                data.extension = data.filename.split('.')
                  .pop();
              }

              if (!isNaN(data.extension)) {
                data.extension = 'dicom';
              }

              if (data.query &&
                data.query.includes('contentType=application%2Fdicom')) {
                data.extension = 'dicom';
              }

              // unzip if extension is '.gz'
              if (data.extension === 'gz') {
                data.gzcompressed = true;
                data.extension =
                  data.filename.split('.gz')
                  .shift()
                  .split('.')
                  .pop();
                let decompressedData = PAKO.inflate(data.buffer);
                data.buffer = decompressedData.buffer;
              }

              let Parser = this._parser(data.extension);
              if (!Parser) {
                reject(data.filename + ' can not be parsed.');
              }

              // check extension
              let volumeParser = null;
              try {
                volumeParser = new Parser(data, 0);
              } catch (e) {
                window.console.log(e);
                reject(e);
              }

              // create a series
              let series = new ModelsSeries();
              series.seriesInstanceUID = volumeParser.seriesInstanceUID();
              series.numberOfFrames = volumeParser.numberOfFrames();
              if (!series.numberOfFrames) {
                series.numberOfFrames = 1;
              }
              series.numberOfChannels = volumeParser.numberOfChannels();
              series.modality = volumeParser.modality();
              // if it is a segmentation, attach extra information
              if (series.modality === 'SEG') {
                // colors
                // labels
                // etc.
                series.segmentationType = volumeParser.segmentationType();
                series.segmentationSegments =
                  volumeParser.segmentationSegments();
              }

              // just create 1 dummy stack for now
              let stack = new ModelsStack();
              stack.numberOfChannels = volumeParser.numberOfChannels();
              stack.pixelRepresentation =
                volumeParser.pixelRepresentation();
              stack.pixelType = volumeParser.pixelType();
              stack.invert = volumeParser.invert();
              stack.spacingBetweenSlices =
                volumeParser.spacingBetweenSlices();
              stack.modality = series.modality;
              // if it is a segmentation, attach extra information
              if (stack.modality === 'SEG') {
                // colors
                // labels
                // etc.
                stack.segmentationType = series.segmentationType;
                stack.segmentationSegments = series.segmentationSegments;
              }
              series.stack.push(stack);
              // recursive call for each frame
              // better than for loop to be able
              // to update dom with "progress" callback
              setTimeout(
                this.parseFrame(
                  series, stack, response.url, 0,
                  volumeParser, resolve, reject), 0);
            }));
          }, 10);
      }
    );
  }

  /**
   * recursive parse frame
   * @param {ModelsSeries} series - data series
   * @param {ModelsStack} stack - data stack
   * @param {string} url - resource url
   * @param {number} i - frame index
   * @param {parser} dataParser - selected parser
   * @param {promise.resolve} resolve - promise resolve args
   * @param {promise.reject} reject - promise reject args
   */
  parseFrame(series, stack, url, i, dataParser, resolve, reject) {
    let frame = new ModelsFrame();
    frame.sopInstanceUID = dataParser.sopInstanceUID(i);
    frame.url = url;
    frame.index = i;
    frame.rows = dataParser.rows(i);
    frame.columns = dataParser.columns(i);
    frame.numberOfChannels = stack.numberOfChannels;
    frame.pixelRepresentation = stack.pixelRepresentation;
    frame.pixelType = stack.pixelType;
    frame.pixelData = dataParser.extractPixelData(i);
    frame.pixelSpacing = dataParser.pixelSpacing(i);
    frame.spacingBetweenSlices = dataParser.spacingBetweenSlices(i);
    frame.sliceThickness = dataParser.sliceThickness(i);
    frame.imageOrientation = dataParser.imageOrientation(i);
    frame.rightHanded = dataParser.rightHanded();
    stack.rightHanded = frame.rightHanded;
    if (frame.imageOrientation === null) {
      frame.imageOrientation = [1, 0, 0, 0, 1, 0];
    }
    frame.imagePosition = dataParser.imagePosition(i);
    if (frame.imagePosition === null) {
      frame.imagePosition = [0, 0, i];
    }
    frame.dimensionIndexValues = dataParser.dimensionIndexValues(i);
    frame.bitsAllocated = dataParser.bitsAllocated(i);
    frame.instanceNumber = dataParser.instanceNumber(i);
    frame.windowCenter = dataParser.windowCenter(i);
    frame.windowWidth = dataParser.windowWidth(i);
    frame.rescaleSlope = dataParser.rescaleSlope(i);
    frame.rescaleIntercept = dataParser.rescaleIntercept(i);
    // should pass frame index for consistency...
    frame.minMax = dataParser.minMaxPixelData(frame.pixelData);

    // if series.mo
    if (series.modality === 'SEG') {
      frame.referencedSegmentNumber = dataParser.referencedSegmentNumber(i);
    }

    stack.frame.push(frame);

    // update status
    this._parsed = i + 1;
    this._totalParsed = series.numberOfFrames;

    // will be removed after eventer set up
    if (this._progressBar) {
      this._progressBar.update(this._parsed, this._totalParsed, 'parse');
    }

    // emit 'parsing' event
    this.emit('parseing', {
      file: url,
      total: this._totalParsed,
      parsed: this._parsed,
      time: new Date(),
    });

    if (this._parsed === this._totalParsed) {
      // emit 'parse-success' event
      this.emit('parse-success', {
        file: url,
        total: this._totalParsed,
        parsed: this._parsed,
        time: new Date(),
      });

      resolve(series);
    } else {
      setTimeout(
        this.parseFrame(
          series, stack, url, this._parsed, dataParser, resolve, reject), 0
      );
    }
  }

  /**
   * Return parser given an extension
   * @param {string} extension - extension
   * @return {parser} selected parser
   */
  _parser(extension) {
    let Parser = null;

    switch (extension.toUpperCase()) {
      case 'NII':
      case 'NII_':
        Parser = ParsersNifti;
        break;
      case 'DCM':
      case 'DICOM':
      case 'IMA':
      case '':
        Parser = ParsersDicom;
        break;
      case 'NRRD':
        Parser = ParsersNrrd;
        break;
      default:
        window.console.log('unsupported extension: ' + extension);
        return false;
    }
    return Parser;
  }
}
