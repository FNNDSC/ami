/** * Imports ***/
import ModelsBase from '../models/models.base';
import ModelsStack from '../models/models.stack';

/**
 * Series object.
 *
 * @module models/series
 */
export default class ModelsSeries extends ModelsBase {
  /**
   * Models series constructor
   */
  constructor() {
    super();

    this._concatenationUID = -1;
    this._seriesInstanceUID = -1;
    this._transferSyntaxUID = '';
    this._seriesNumber = -1;
    this._seriesDescription = '';
    this._seriesDate = '';
    this._studyDescription = '';
    this._studyDate = '';
    this._accessionNumber = -1;
    this._modality = 'Modality not set';
    this._dimensionIndexSequence = [];
    // it is used in the loader in case a dicom/nifti contains multiple frames
    // should be updated after merge or renamed
    this._numberOfFrames = 0;
    this._numberOfChannels = 1;

    // patient information
    this._patientID = '';
    this._patientName = '';
    this._patientAge = '';
    this._patientBirthdate = '';
    this._patientSex = '';

    // SEGMENTATION STUFF
    this._segmentationType = null;
    this._segmentationSegments = [];

    // STACK
    this._stack = [];

    this._stackSorted = false;
    this._stackSortBy = '';
  }

  /**
   * Validate a series.
   *
   * Requirements:
   *   - mergeSeries method
   *   - _seriesInstanceUID
   *   - _numberOfFrames
   *   - _numberOfChannels
   *   _ _stack
   *
   * @param {ModelsSeries} model - Model to be validated as series.
   *
   * @return {boolean} True if series is valid. False if not.
   *
   * @override
   */
  validate(model) {
    if (!(super.validate(model) &&
      typeof model.mergeSeries === 'function' &&
      model.hasOwnProperty('_seriesInstanceUID') &&
      model.hasOwnProperty('_numberOfFrames') &&
      model.hasOwnProperty('_numberOfChannels') &&
      model.hasOwnProperty('_stack') &&
      typeof model._stack !== 'undefined' &&
      Array === model._stack.constructor)) {
      return false;
    }

    return true;
  }

  /**
   * Merge current series with provided series.
   * 2 series can ONLY be merge if they have the same SeriesInstanceUID.
   *
   * Also merges the stacks inside a series.
   *
   * @param {ModelsSeries} series - Series to be merged against current series.
   *
   * @return {boolean} True if series could be merge. False if not.
   *
   * @override
   */
  merge(series) {
    if (!this.validate(series)) {
      return false;
    }

    if (this._seriesInstanceUID === series.seriesInstanceUID) {
      // may merge incorrectly if loader will return more than one stacks per series
      if (series.stack[0]) {
        if (this._stack[0]._numberOfFrames === 0) {
          this._stack[0].computeNumberOfFrames();
        }
        this._stack[0].computeCosines();
        if (series.stack[0]._numberOfFrames === 0) {
          series.stack[0].computeNumberOfFrames();
        }
        series.stack[0].computeCosines();
      }
      return this.mergeModels(this._stack, series.stack);
    } else {
      return false;
    }
  }

  /**
   * Merge current series with provided array of series.
   * 2 series can ONLY be merge if they have the same SeriesInstanceUID.
   *
   * Also merges the stacks inside a series.
   *
   * @param {Array.<ModelsSeries>} target - Series to be merged against current series.
   *
   * @return {Array.<ModelsSeries>} Array of series properly merged.
   */
  mergeSeries(target) {
    let seriesContainer = [this];
    this.mergeModels(seriesContainer, target);
    this.sortStack();
    return seriesContainer;
  }

  sortStack() {
    if (this._stackSorted || this._stack.length === 0) return;
    let stackArray = this._stack;
    // for (let i = 1; i < stackArray.length; i++) stackArray[0]._frame = stackArray[0]._frame.concat(stackArray[i]._frame);
    stackArray.length = 1;

    let firstEchoNumber = stackArray[0]._frame[0]._echoNumber;
    let firstAcquisitionNumber = stackArray[0]._frame[0]._acquisitionNumber;
    let firstSliceLocation = stackArray[0]._frame[0]._sliceLocation;
    let firstInStackPositionNumber = stackArray[0]._frame[0]._inStackPositionNumber;

    let echoNumberIsDiff = false;
    let acquisitionNumberIsDiff = false;
    let hasStack = false;
    let maxInStackPositionNumber = 0;
    // let maxInstanceNumber = 0;
    for (let i in stackArray[0]._frame) {
      if (stackArray[0]._frame[i]._echoNumber !== firstEchoNumber) echoNumberIsDiff = true;
      if (stackArray[0]._frame[i]._acquisitionNumber !== firstAcquisitionNumber
        && stackArray[0]._frame[i]._sliceLocation === firstSliceLocation) acquisitionNumberIsDiff = true;
      if (stackArray[0]._frame[i]._inStackPositionNumber !== firstInStackPositionNumber) hasStack = true;
      maxInStackPositionNumber = Math.max(maxInStackPositionNumber, stackArray[0]._frame[i]._inStackPositionNumber);
      // maxInstanceNumber = Math.max(maxInstanceNumber, stackArray[0]._frame[i]._instanceNumber)
      if (echoNumberIsDiff || acquisitionNumberIsDiff) break;
    }

    if (echoNumberIsDiff && !acquisitionNumberIsDiff) this._stackSortBy = '_echoNumber';
    else if (!echoNumberIsDiff && acquisitionNumberIsDiff) this._stackSortBy = '_acquisitionNumber';

    if (this._stackSortBy || hasStack) {
      stackArray[0]._frame.forEach(k => {
        let stackID = this._stackSortBy ? k[this._stackSortBy] : parseInt((k._instanceNumber - 1) / maxInStackPositionNumber) + 1;
        let stack;
        for (let i in stackArray) if (stackArray[i]._stackID === stackID) stack = stackArray[i];
        if (!stack) {
          stack = new ModelsStack();
          stackArray.push(stack);
          stack.numberOfChannels = stackArray[0].numberOfChannels;
          stack.pixelRepresentation = stackArray[0].pixelRepresentation;
          stack.pixelType = stackArray[0].pixelType;
          stack.invert = stackArray[0].invert;
          stack.spacingBetweenSlices = stackArray[0].spacingBetweenSlices;
          stack.modality = stackArray[0].modality;
          if (stack.modality === 'SEG') {
            stack.segmentationType = stackArray[0].segmentationType;
            stack.segmentationSegments = stackArray[0].segmentationSegments;
          }
          stack._stackID = stackID;
          if(stackArray.length > 2) stack._rawDataFromOtherStack = stackArray[1];
        }
        stack._frame.push(k);
      })
      stackArray.shift();
    }
    this._stackSorted = true;
  }

  /**
   * Series instance UID setter
   *
   * @param {*} seriesInstanceUID
   */
  set seriesInstanceUID(seriesInstanceUID) {
    this._seriesInstanceUID = seriesInstanceUID;
  }

  /**
   * Series instace UID getter
   *
   * @return {*}
   */
  get seriesInstanceUID() {
    return this._seriesInstanceUID;
  }

  /**
   * Transfer syntax UID setter
   *
   * @param {*} transferSyntaxUID
   */
  set transferSyntaxUID(transferSyntaxUID) {
    this._transferSyntaxUID = transferSyntaxUID;
  }

  /**
   * Transfer syntax UID getter
   *
   * @return {*}
   */
  get transferSyntaxUID() {
    return this._transferSyntaxUID;
  }

  /**
   * Transfer syntax UID getter
   *
   * @return {*}
   */
  get transferSyntaxUIDLabel() {
    switch (this._transferSyntaxUID) {
      case '1.2.840.10008.1.2.4.90':
        return 'JPEG 2000 Lossless';
      case '1.2.840.10008.1.2.4.91':
        return 'JPEG 2000 Lossy';
      case '1.2.840.10008.1.2.4.57':
        return 'JPEG Lossless, Nonhierarchical (Processes 14)';
      case '1.2.840.10008.1.2.4.70':
        return 'JPEG Lossless, Nonhierarchical (Processes 14 [Selection 1])';
      case '1.2.840.10008.1.2.4.50':
        return 'JPEG Baseline lossy process 1 (8 bit)';
      case '1.2.840.10008.1.2.4.51':
        return 'JPEG Baseline lossy process 2 & 4 (12 bit)';
      case '1.2.840.10008.1.2':
        return 'Implicit VR Little Endian';
      case '1.2.840.10008.1.2.1':
        return 'Explicit VR Little Endian';
      case '1.2.840.10008.1.2.2':
        return 'Explicit VR Big Endian';
      default:
        return `Unknown transfersyntax: ${this._transferSyntaxUID}`;
    }
  }

  /**
   * Study date setter
   *
   * @param {*} studyDate
   */
  set studyDate(studyDate) {
    this._studyDate = studyDate;
  }

  /**
   * Study date getter
   *
   * @return {*}
   */
  get studyDate() {
    return this._studyDate;
  }

  /**
   * Study descripition setter
   *
   * @param {*} studyDescription
   */
  set studyDescription(studyDescription) {
    this._studyDescription = studyDescription;
  }

  /**
   * Study description getter
   *
   * @return {*}
   */
  get studyDescription() {
    return this._studyDescription;
  }

  /**
   * Series date setter
   *
   * @param {*} seriesDate
   */
  set seriesDate(seriesDate) {
    this._seriesDate = seriesDate;
  }

  /**
   * Series date getter
   *
   * @return {*}
   */
  get seriesDate() {
    return this._seriesDate;
  }

  /**
   * Series descripition setter
   *
   * @param {*} seriesDescription
   */
  set seriesDescription(seriesDescription) {
    this._seriesDescription = seriesDescription;
  }

  /**
   * Series description getter
   *
   * @return {*}
   */
  get seriesDescription() {
    return this._seriesDescription;
  }

  /**
   * Patient ID setter
   *
   * @param {*} patientID
   */
  set patientID(patientID) {
    this._patientID = patientID;
  }

  /**
   * Patient ID getter
   *
   * @return {*}
   */
  get patientID() {
    return this._patientID;
  }

  /**
   * Patient name setter
   *
   * @param {*} patientName
   */
  set patientName(patientName) {
    this._patientName = patientName;
  }

  /**
   * Patient name getter
   *
   * @return {*}
   */
  get patientName() {
    return this._patientName;
  }

  /**
   * Patient age setter
   *
   * @param {*} patientAge
   */
  set patientAge(patientAge) {
    this._patientAge = patientAge;
  }

  /**
   * Patient age getter
   *
   * @return {*}
   */
  get patientAge() {
    return this._patientAge;
  }

  /**
   * Patient birthdate setter
   *
   * @param {*} patientBirthdate
   */
  set patientBirthdate(patientBirthdate) {
    this._patientBirthdate = patientBirthdate;
  }

  /**
   * Patient birthdate getter
   *
   * @return {*}
   */
  get patientBirthdate() {
    return this._patientBirthdate;
  }

  /**
   * Patient sex setter
   *
   * @param {*} patientSex
   */
  set patientSex(patientSex) {
    this._patientSex = patientSex;
  }

  /**
   * Patient sex getter
   *
   * @return {*}
   */
  get patientSex() {
    return this._patientSex;
  }

  /**
   * Number of frames setter
   *
   * @param {*} numberOfFrames
   */
  set numberOfFrames(numberOfFrames) {
    this._numberOfFrames = numberOfFrames;
  }

  /**
   * Number of frames getter
   *
   * @return {*}
   */
  get numberOfFrames() {
    return this._numberOfFrames;
  }

  /**
   * Number of channels setter
   *
   * @param {*} numberOfChannels
   */
  set numberOfChannels(numberOfChannels) {
    this._numberOfChannels = numberOfChannels;
  }

  /**
   * Number of channels getter
   *
   * @return {*}
   */
  get numberOfChannels() {
    return this._numberOfChannels;
  }

  /**
   * Stack setter
   *
   * @param {*} stack
   */
  set stack(stack) {
    this._stack = stack;
  }

  /**
   * Stack getter
   *
   * @return {*}
   */
  get stack() {
    return this._stack;
  }

  /**
   * Modality setter
   *
   * @param {*} modality
   */
  set modality(modality) {
    this._modality = modality;
  }

  /**
   * Modality getter
   *
   * @return {*}
   */
  get modality() {
    return this._modality;
  }

  /**
   * Segmentation type setter
   *
   * @param {*} segmentationType
   */
  set segmentationType(segmentationType) {
    this._segmentationType = segmentationType;
  }

  /**
   * Segmentation type getter
   *
   * @return {*}
   */
  get segmentationType() {
    return this._segmentationType;
  }

  /**
   * Segmentation segments setter
   *
   * @param {*} segmentationSegments
   */
  set segmentationSegments(segmentationSegments) {
    this._segmentationSegments = segmentationSegments;
  }

  /**
   * Segmentation segments getter
   *
   * @return {*}
   */
  get segmentationSegments() {
    return this._segmentationSegments;
  }

  get stackSorted() {
    return this._stackSorted;
  }

  set stackSorted(stackSorted) {
    this._stackSorted = stackSorted;
  }

  get stackSortBy() {
    return this._stackSortBy;
  }

  set stackSortBy(stackSortBy) {
    this._stackSortBy = stackSortBy;
  }
}
