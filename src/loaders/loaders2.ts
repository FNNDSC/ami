import { EventDispatcher } from 'three';
import CoreUtils from '../core/core.utils';
import ModelsFrame from '../models/models.frame';
import ModelsSeries from '../models/models.series';
import ModelsStack from '../models/models.stack';
import DicomWorker from './dicom.worker';
import DicomFetcherWorker from './dicomFetcher.worker';
import FetcherWorker from './fetcher.worker';
import MGHWorker from './mgh.worker';


const PAKO = require('pako');

/**
 * Load = fetch over network and parse
 * 
 * Load file: loadInstance(brain.dcm) => return a series
 * Load file with definition => loadInstance(brain.raw, definition.mdh) => return a series
 * Load group of files => load([f1, f2.dcm, {file.dcm, definition}, file.mgh]) => return array of series
 * 
 * Dispatch events, do not manage progress bars
 * Event: filename, progress, total, timeout, etc. all regular erros
 * 
 * Fetch and parse happen in a web worker! :D
 * 
 * typedef File: string;
 * interface FileWithDefinition {
 *   file: File,
 *   definition: string,
 * }
 * 
 * return model or series! using extension of file type or sth etc.
 * 
 * 1 worker per data type to have each worker as small as possible
 * 
 * dicomLoader.worker.ts -> obj + data in buffer -> need to support multiple frames
 * // that is what we do in the loaders.volume
 * niftiLoader.woker.ts -> obj + data in buffer
 * mghLoader.worker.ts -> obj + data in buffer
 * stlLoader.worker.ts -> obj + data in buffer // not geometry of mesh since it can not be passed through web workers
 * gltfLoader.worker.ts -> obj + data in buffer
 * trkLoader.worker.ts -> obj + data in buffer
 *
 * const loadFileInstance = (File) => {
 *  // send information to web worker
 *  // get progress result
 *  // reconstruct results
 * // in obj return we have a flag per obj type ? mesh or lines or series?
 * // return constructMeshFromWorker();
 *  // return constructSeriesFromWorker(); // that is what we do in the loaders.volume
 *  // return constructLinesFromWorker();
 * }
 * 
 * const loadFileWithDefinitionInstance = (FileWithDefinition) => {
 *  // send information to web worker
 *  // get progress result
 *  // reconstruct results
 * }
 * 
 * const loadInstance = async (File | FileWithDefinition ) => {
 *  if (isFileWithDefinition) {
 *   // fetch definition
 * }
 * 
 * // fetch the data
 * 
 * // parse the data
 * }
 * 
 * const load = async (File[] | FileWithDefinition[]) => {
 *
 * // multiple promise wait for all
 * // load instance
 * // loadInstace(file);
 * }
 * 
 * const loadMultiple
 * 
 * Streaming support ?
 * How do we listen to progress ?
 */

export interface File {
  file: string;
  definition?: string;
}

export interface FileMeta {
    filename: string,
    extension: string,
    pathname: string,
    query: string,
    gzCompressed: boolean,
}

// general events
const startEvent = { type: 'start', file: '', definition: '' };
const endEvent = { type: 'end', file: '', definition: '' };

// fetch events
const fetchStartEvent = { type: 'fetchstart', file: '', definition: '' };
const fetchEvent = { type: 'fetch', file: '', definition: '' };
const fetchEndEvent = { type: 'fetchend', file: '', definition: '' };
const fetchProgressEvent = { type: 'fetchprogress', file: '', definition: '', loaded: -1, total: -1};
const fetchErrorEvent = { type: 'fetcherror', file: '', definition: '' };
const fetchAbortEvent = { type: 'fetchabort', file: '', definition: '' };

// parse events
const parseStartEvent = { type: 'parsestart', file: '', definition: '' };
const parseEvent = { type: 'parse', file: '', definition: '' };
const parseErrorEvent = { type: 'parseerror', file: '', definition: '' };
const parseEndEvent = { type: 'parseend', file: '', definition: '' };

export default class WorkerLoader extends EventDispatcher {

 private fetch = async (file: string) => {
  const fetcherWorker = new FetcherWorker();
  let arrayBuffer : ArrayBuffer;
  let fetchSuccess = false;
  await new Promise((resolve, reject) => {
    fetcherWorker.onmessage = (message) => {
      switch(message.data.type) {
        case 'fetchstart':
          fetchStartEvent.file = file;
          this.dispatchEvent(fetchStartEvent);
          break;
        case 'fetch':
          fetchEvent.file = file;
          this.dispatchEvent(fetchEvent);
          arrayBuffer = message.data.arrayBuffer;
          fetchSuccess = true;
          break;
        case 'fetchend':
          fetchEndEvent.file = file;
          this.dispatchEvent(fetchEndEvent);
          if (fetchSuccess) {
            resolve(arrayBuffer);
          } else {
            reject();
          }
          break;
        case 'fetchprogress':
          fetchProgressEvent.file = file;
          fetchProgressEvent.loaded = message.data.loaded;
          fetchProgressEvent.total = message.data.total;
          this.dispatchEvent(fetchProgressEvent);
          break;
        case 'fetcherror':
          fetchErrorEvent.file = file;
          this.dispatchEvent(fetchErrorEvent);
          reject();
          break;
        case 'fetchabort':
          fetchProgressEvent.file = file;
          this.dispatchEvent(fetchAbortEvent);
          reject();
          break;
        default:
          break;
      }
    };
    fetcherWorker.postMessage({type: 'fetchstart', file});
  });

  return {arrayBuffer, fetchSuccess};
 }

 private extractMetaInformationFrom = (file: string) => {
  const parsedUrl = CoreUtils.parseUrl(file);
  // update data
  const filename = parsedUrl.filename;
  let extension = parsedUrl.extension;
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  let gzCompressed = false;

  // unzip if extension is '.gz'
  if (extension === 'gz') {
    gzCompressed = true;
    extension = filename
      .split('.gz')
      .shift()
      .split('.')
      .pop();
  } else if (extension === 'mgz') {
    gzCompressed = true;
    extension = 'mgh';
  } else if (extension === 'zraw') {
    gzCompressed = true;
    extension = 'raw';
  }

  return {
    filename,
    extension,
    pathname,
    query,
    gzCompressed,
  } as FileMeta;
}

private parserWorkerForFile = (fileMeta: FileMeta) => {
    let Worker = null;

    switch (fileMeta.extension.toUpperCase()) {
      // case 'NII':
      // case 'NII_':
      //   Parser = ParsersNifti;
      //   break;
      case 'DCM':
      case 'DIC':
      case 'DICOM':
      case 'IMA':
      case '':
        Worker = DicomWorker;
        break;
      // case 'MHD':
      //   Parser = ParsersMhd;
      //   break;
      // case 'NRRD':
      //   Parser = ParsersNrrd;
      //   break;
      case 'MGH':
      case 'MGZ':
        Worker = MGHWorker;
        break;
      default:
        console.warn('unsupported extension: ' + fileMeta.extension);
        return false;
    }
    return Worker;
  }

 private parse = async (file: string, rawArrayBuffer: ArrayBuffer) => {

  // pre-process file and buffer
  const fileMeta = this.extractMetaInformationFrom(file);
  let arrayBuffer = rawArrayBuffer;
  if (fileMeta.gzCompressed) {
    arrayBuffer = PAKO.inflate(rawArrayBuffer).buffer;
  }


  // get proper worker
  const ParseWorker = this.parserWorkerForFile(fileMeta);
  const parserWorker = new ParseWorker();
  let seriesInformation = {} as any;
  let stackInformation = {} as any;
  let framesInformation = {} as any;
  let framesPixelData = [] as ArrayBuffer[];
  let parseSuccess = false;
  await new Promise((resolve, reject) => {
    parserWorker.onmessage = (message) => {
      switch(message.data.type) {
        case 'parse':
          seriesInformation = JSON.parse(message.data.seriesInformation);
          stackInformation = JSON.parse(message.data.stackInformation);
          framesInformation = JSON.parse(message.data.framesInformation);
          framesPixelData = message.data.framesPixelData;
          parseEvent.file = file;
          this.dispatchEvent(parseEvent);
          parseSuccess = true;
          break;
        case 'parseerror':
          parseErrorEvent.file = file;
          this.dispatchEvent(parseErrorEvent);
          break;
        case 'parseend':
          parseEndEvent.file = file;
          this.dispatchEvent(parseEndEvent);
          if (parseSuccess) {
            resolve();
          } else {
            reject();
          }
          break;
        default:
          break;
      }
    };
    parseStartEvent.file = file;
    this.dispatchEvent(parseStartEvent);
    parserWorker.postMessage({type: 'parsestart', arrayBuffer}, [arrayBuffer]);
  });

  return {parseSuccess, seriesInformation, stackInformation, framesInformation, framesPixelData};
 }

 private fetchAndParse = async (file: string) => {
  // get proper worker
  const parserWorker = new DicomFetcherWorker();
  let seriesInformation = {} as any;
  let stackInformation = {} as any;
  let framesInformation = {} as any;
  let framesPixelData = [] as ArrayBuffer[];
  let parseSuccess = false;
  await new Promise((resolve, reject) => {
    parserWorker.onmessage = (message) => {
      switch(message.data.type) {
        case 'parse':
          seriesInformation = message.data.seriesInformation;
          stackInformation = message.data.stackInformation;
          framesInformation = message.data.framesInformation;
          framesPixelData = message.data.framesPixelData;
          parseEvent.file = file;
          this.dispatchEvent(parseEvent);
          parseSuccess = true;
          break;
        case 'parseerror':
          parseErrorEvent.file = file;
          this.dispatchEvent(parseErrorEvent);
          break;
        case 'parseend':
          parseEndEvent.file = file;
          this.dispatchEvent(parseEndEvent);
          if (parseSuccess) {
            resolve();
          } else {
            reject();
          }
          break;
        default:
          break;
      }
    };
    parseStartEvent.file = file;
    this.dispatchEvent(parseStartEvent);
    parserWorker.postMessage({type: 'fetchstart', file});
  });

  return {parseSuccess, seriesInformation, stackInformation, framesInformation, framesPixelData};
 }

 public loadInstance = async (data: File) => {
  this.dispatchEvent(startEvent);

  // load file instance in web worker
  if (data.definition !== undefined) {
    // do something special?
    // maybe not
  }

  // // fetch
  // const {arrayBuffer, fetchSuccess} = await this.fetch(data.file);
  // if (!fetchSuccess) {
  //   return Promise.reject(`Could not fetch ${data.file}`);
  // }

  // // parse
  // const {parseSuccess, seriesInformation, stackInformation, framesInformation, framesPixelData} = await this.parse(data.file, arrayBuffer);
  // if (!parseSuccess) {
  //   return Promise.reject(`Could not parse ${data.file}`);
  // }
  
  const {parseSuccess, seriesInformation, stackInformation, framesInformation, framesPixelData} = await this.fetchAndParse(data.file);
    if (!parseSuccess) {
    return Promise.reject(`Could not parse ${data.file}`);
  }
  // reconstruct the object and initialize it!
  // create a series
  const series = new ModelsSeries();
  // global information
  series.seriesInstanceUID = seriesInformation.seriesInstanceUID;
  series.transferSyntaxUID = seriesInformation.transferSyntaxUID;
  series.seriesDate = seriesInformation.seriesDate;
  series.seriesDescription = seriesInformation.seriesDescription;
  series.studyDate = seriesInformation.studyDate;
  series.studyDescription = seriesInformation.studyDescription;
  series.numberOfFrames = seriesInformation.numberOfFrames;

  series.numberOfChannels = seriesInformation.numberOfChannels;
  series.modality = seriesInformation.modality;
  // if it is a segmentation, attach extra information
  if (series.modality === 'SEG') {
    series.segmentationType = seriesInformation.segmentationType;
    series.segmentationSegments = seriesInformation.segmentationSegments;
  }
  // patient information
  series.patientID = seriesInformation.patientID;
  series.patientName = seriesInformation.patientName;
  series.patientAge = seriesInformation.patientAge;
  series.patientBirthdate = seriesInformation.patientBirthdate;
  series.patientSex = seriesInformation.patientSex;


  // just create 1 dummy stack for now
  const stack = new ModelsStack();
  stack.numberOfChannels = stackInformation.numberOfChannels;
  stack.pixelRepresentation = stackInformation.pixelRepresentation;
  stack.pixelType = stackInformation.pixelType;
  stack.invert = stackInformation.invert;
  stack.spacingBetweenSlices = stackInformation.spacingBetweenSlices;
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

  framesInformation.forEach((element, index) => {
    const frame = new ModelsFrame();
    frame.sopInstanceUID = element.sopInstanceUID;
    frame.url = index;
    frame.index = element.index;
    frame.invert = stack.invert;
    frame.frameTime = element.frameTime;
    frame.ultrasoundRegions = element.ultrasoundRegions;
    frame.rows = element.rows;
    frame.columns = element.columns;
    frame.numberOfChannels = stack.numberOfChannels;
    frame.pixelPaddingValue = element.pixelPaddingValue;
    frame.pixelRepresentation = stack.pixelRepresentation;
    frame.pixelType = stack.pixelType;
    frame.pixelData = framesPixelData[index];
    frame.pixelSpacing = element.pixelSpacing;
    frame.spacingBetweenSlices = element.spacingBetweenSlices;
    frame.sliceThickness = element.sliceThickness;
    frame.imageOrientation = element.imageOrientation;
    frame.rightHanded = element.rightHanded;
    stack.rightHanded = frame.rightHanded;
    frame.imagePosition = element.imagePosition;
    frame.dimensionIndexValues = element.dimensionIndexValues;
    frame.bitsAllocated = element.bitsAllocated;
    frame.instanceNumber = element.instanceNumber;
    frame.windowCenter = element.windowCenter;
    frame.windowWidth = element.windowWidth;
    frame.rescaleSlope = element.rescaleSlope;
    frame.rescaleIntercept = element.rescaleIntercept;
    frame.minMax = element.minMax;

    // if series.mo
    if (series.modality === 'SEG') {
      frame.referencedSegmentNumber = element.referencedSegmentNumber;
    }

    stack.frame.push(frame);
  });

  endEvent.file = data.file;
  this.dispatchEvent(endEvent);
  return series;
}
}