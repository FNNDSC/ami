/*** Imports ***/
let pako = require('pako');

import LoadersBase  from './loaders.base';
import ModelsSeries from '../../src/models/models.series';
import ModelsStack  from '../../src/models/models.stack';
import ModelsFrame  from '../../src/models/models.frame';
import ParsersDicom from '../../src/parsers/parsers.dicom';
import ParsersNifti from '../../src/parsers/parsers.nifti';
import ParsersNrrd  from '../../src/parsers/parsers.nrrd';


/**
 *
 * It is typically used to load a DICOM image. Use loading manager for
 * advanced usage, such as multiple files handling.
 *
 * Demo: {@link https://fnndsc.github.io/vjs#loader_dicom}
 *
 * @module loaders/volumes
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
export default class LoadersVolumes extends LoadersBase{

  parse(response) {

    // give a chance to the UI to update because after the rendering will be blocked with intensive JS
    this._progressBar.update(0, 100, 'parse');

    return new Promise(
        (resolve, reject) => {
            window.setTimeout(
              () => {
                resolve(new Promise((resolve, reject) => {

                  let data = response;
                  data.gzcompressed = false;
                  data.filename = '';
                  data.extension = '';

                  // uncompress?
                  data.filename = response.url.split('/').pop();
                  data.gzcompressed = false;

                  // find extension
                  let splittedName = data.filename.split('.');
                  if(splittedName.length <= 1){
                    data.extension = '';
                  }
                  else{
                    data.extension = data.filename.split('.').pop();
                  }

                  // unzip if extension is '.gz'
                  if (data.extension === 'gz') {
                    data.gzcompressed = true;
                    data.extension = data.filename.split('.gz').shift().split('.').pop();
                    let decompressedData = pako.inflate(data.buffer);
                    data.buffer = decompressedData.buffer;
                  }

                  let parser = this._parser(data.extension);
                  if (!parser) {
                    reject(data.filename + ' can not be parsed.');
                  }

                  // check extension
                  let volumeParser = null;
                  try {
                    volumeParser = new parser(data, 0);
                  }
                  catch (e) {
                    window.console.log(e);
                    reject(e);
                  }

                  // create a series
                  let series = new ModelsSeries();
                  series.seriesInstanceUID = volumeParser.seriesInstanceUID();
                  series.numberOfFrames    = volumeParser.numberOfFrames();
                  if (!series.numberOfFrames) {
                    series.numberOfFrames = 1;
                  }
                  series.numberOfChannels  = volumeParser.numberOfChannels();
                  series.modality          = volumeParser.modality();
                  // if it is a segmentation, attach extra information
                  if(series.modality === 'SEG'){
                    // colors
                    // labels
                    // etc.
                    series.segmentationType     = volumeParser.segmentationType();
                    series.segmentationSegments = volumeParser.segmentationSegments();
                  }

                  // just create 1 dummy stack for now
                  let stack = new ModelsStack();
                  stack.numberOfChannels = volumeParser.numberOfChannels();
                  stack.pixelType        = volumeParser.pixelType();
                  stack.invert           = volumeParser.invert();
                  stack.modality         = series.modality;
                  // if it is a segmentation, attach extra information
                  if(stack.modality === 'SEG'){
                    // colors
                    // labels
                    // etc.
                    stack.segmentationType     = series.segmentationType;
                    stack.segmentationSegments = series.segmentationSegments;
                  }
                  series.stack.push(stack);
                  // recursive call for each frame
                  // better than for loop to be able to update dom with "progress" callback
                  setTimeout(this.parseFrame(series, stack, response.url, 0, volumeParser, resolve, reject), 0);
                }));
             },10);
           }
        );
  }

  parseFrame(series, stack, url, i, dataParser, resolve, reject) {
    let frame = new ModelsFrame();
    frame.sopInstanceUID   = dataParser.sopInstanceUID(i);
    frame.url              = url;
    frame.rows             = dataParser.rows(i);
    frame.columns          = dataParser.columns(i);
    frame.numberOfChannels = stack.numberOfChannels;
    frame.pixelType        = stack.pixelType;
    frame.pixelData        = dataParser.extractPixelData(i);
    frame.pixelSpacing     = dataParser.pixelSpacing(i);
    frame.sliceThickness   = dataParser.sliceThickness(i);
    frame.imageOrientation = dataParser.imageOrientation(i);
    frame.rightHanded      = dataParser.rightHanded();
    stack.rightHanded      = frame.rightHanded;
    if (frame.imageOrientation === null) {
      frame.imageOrientation = [1, 0, 0, 0, 1, 0];
    }
    frame.imagePosition = dataParser.imagePosition(i);
    if (frame.imagePosition === null) {
      frame.imagePosition = [0, 0, i];
    }
    frame.dimensionIndexValues = dataParser.dimensionIndexValues(i);
    frame.bitsAllocated        = dataParser.bitsAllocated(i);
    frame.instanceNumber       = dataParser.instanceNumber(i);
    frame.windowCenter         = dataParser.windowCenter(i);
    frame.windowWidth          = dataParser.windowWidth(i);
    frame.rescaleSlope         = dataParser.rescaleSlope(i);
    frame.rescaleIntercept     = dataParser.rescaleIntercept(i);
    // should pass frame index for consistency...
    frame.minMax = dataParser.minMaxPixelData(frame.pixelData);

    // if series.mo
    if(series.modality === 'SEG'){
      frame.referencedSegmentNumber = dataParser.referencedSegmentNumber(i);
    }

    stack.frame.push(frame);

    // update status
    this._parsed = i + 1;
    this._totalParsed = series.numberOfFrames;
    if(this._progressBar){
      this._progressBar.update(this._parsed, this._totalParsed, 'parse');
    }

    if (this._parsed === this._totalParsed) {
      resolve(series);
    } else {
      setTimeout(this.parseFrame(series, stack, url, this._parsed, dataParser, resolve, reject), 0);
    }
  }

  _parser(extension) {

    let parser = null;

    switch (extension.toUpperCase()){
      case 'NII':
      case 'NII_':
        parser = ParsersNifti;
        break;
      case 'DCM':
      case 'DICOM':
      case 'IMA':
      case '':
        parser = ParsersDicom;
        break;
      case 'NRRD':
        parser = ParsersNrrd;
        break;
      default:
        window.console.log('unsupported extension: ' + extension);
        return false;
    }
    return parser;
  }
}
