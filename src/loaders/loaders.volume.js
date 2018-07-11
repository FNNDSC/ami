/** * Imports ***/
const PAKO = require('pako');

import LoadersBase from './loaders.base';
import CoreUtils from '../core/core.utils';
import ModelsSeries from '../models/models.series';
import ModelsStack from '../models/models.stack';
import ModelsFrame from '../models/models.frame';
import ParsersDicom from '../parsers/parsers.dicom';
import ParsersMhd from '../parsers/parsers.mhd';
import ParsersNifti from '../parsers/parsers.nifti';
import ParsersNrrd from '../parsers/parsers.nrrd';
import ParsersMgh from '../parsers/parsers.mgh';

/**
 *
 * It is typically used to load a DICOM image. Use loading manager for
 * advanced usage, such as multiple files handling.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#loader_dicom}
 *
 * @module loaders/volumes
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
    // emit 'parse-start' event
    this.emit('parse-start', {
      file: response.url,
      time: new Date(),
    });
    // give a chance to the UI to update because
    // after the rendering will be blocked with intensive JS
    // will be removed after eventer set up
    if (this._progressBar) {
      this._progressBar.update(0, 100, 'parse', response.url);
    }

    return new Promise(
      (resolve, reject) => {
        window.setTimeout(
          () => {
            resolve(new Promise((resolve, reject) => {
              let data = response;

              if (!Array.isArray(data)) {
                data = [data];
              }

              data.forEach((dataset) => {
                this._preprocess(dataset);
              });

              if (data.length === 1) {
                data = data[0];
              } else {
                // if raw/mhd pair
                let mhdFile =
                  data.filter(this._filterByExtension.bind(null, 'MHD'));
                let rawFile =
                  data.filter(this._filterByExtension.bind(null, 'RAW'));
                if (data.length === 2 &&
                    mhdFile.length === 1 &&
                    rawFile.length === 1) {
                  data.url = mhdFile[0].url;
                  data.extension = mhdFile[0].extension;
                  data.mhdBuffer = mhdFile[0].buffer;
                  data.rawBuffer = rawFile[0].buffer;
                }
              }

              let Parser = this._parser(data.extension);
              if (!Parser) {
                // emit 'parse-error' event
                this.emit('parse-error', {
                  file: response.url,
                  time: new Date(),
                  error: data.filename + 'can not be parsed.',
                });
                reject(data.filename + ' can not be parsed.');
              }

              // check extension
              let volumeParser = null;
              try {
                volumeParser = new Parser(data, 0);
              } catch (e) {
                window.console.log(e);
                // emit 'parse-error' event
                this.emit('parse-error', {
                  file: response.url,
                  time: new Date(),
                  error: e,
                });
                reject(e);
              }

              // create a series
              let series = new ModelsSeries();
              // global information
              series.seriesInstanceUID = volumeParser.seriesInstanceUID();
              series.transferSyntaxUID = volumeParser.transferSyntaxUID();
              series.seriesDate = volumeParser.seriesDate();
              series.seriesDescription = volumeParser.seriesDescription();
              series.studyDate = volumeParser.studyDate();
              series.studyDescription = volumeParser.studyDescription();
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
              // patient information
              series.patientID = volumeParser.patientID();
              series.patientName = volumeParser.patientName();
              series.patientAge = volumeParser.patientAge();
              series.patientBirthdate = volumeParser.patientBirthdate();
              series.patientSex = volumeParser.patientSex();

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
    frame.invert = stack.invert;
    frame.frameTime = dataParser.frameTime(i);
    frame.rows = dataParser.rows(i);
    frame.columns = dataParser.columns(i);
    frame.numberOfChannels = stack.numberOfChannels;
    frame.pixelPaddingValue = dataParser.pixelPaddingValue(i);
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
    /*
    null ImagePosition should not be handle here
    if (frame.imagePosition === null) {
      frame.imagePosition = [0, 0, i];
    }*/
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
      this._progressBar.update(this._parsed, this._totalParsed, 'parse', url);
    }

    // emit 'parsing' event
    this.emit('parsing', {
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
      case 'MHD':
        Parser = ParsersMhd;
        break;
      case 'NRRD':
        Parser = ParsersNrrd;
        break;
      case 'MGH':
      case 'MGZ':
        Parser = ParsersMgh;
        break;
      default:
        window.console.log('unsupported extension: ' + extension);
        return false;
    }
    return Parser;
  }


  /**
   * Pre-process data to be parsed (find data type and de-compress)
   * @param {*} data
   */
  _preprocess(data) {
    const parsedUrl = CoreUtils.parseUrl(data.url);
    // update data
    data.filename = parsedUrl.filename;
    data.extension = parsedUrl.extension;
    data.pathname = parsedUrl.pathname;
    data.query = parsedUrl.query;

    // unzip if extension is '.gz'
    if (data.extension === 'gz') {
      data.gzcompressed = true;
      data.extension =
        data.filename.split('.gz').shift().split('.').pop();
    } else if (data.extension === 'mgz') {
      data.gzcompressed = true;
      data.extension = 'mgh';
    } else if (data.extension === 'zraw') {
      data.gzcompressed = true;
      data.extension = 'raw';
    } else {
      data.gzcompressed = false;
    }

    if (data.gzcompressed) {
      let decompressedData = PAKO.inflate(data.buffer);
      data.buffer = decompressedData.buffer;
    }
  }

  /**
   * Filter data by extension
   * @param {*} extension
   * @param {*} item
   * @returns Boolean
   */
  _filterByExtension(extension, item) {
    if (item.extension.toUpperCase() === extension.toUpperCase()) {
      return true;
    }
    return false;
  }
}
