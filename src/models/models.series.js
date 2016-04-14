/*** Imports ***/
import ModelsBase from '../../src/models/models.base';

/**
 * Series object.
 *
 * @module models/series
 */

export default class ModelsSeries extends ModelsBase{
  constructor() {
    super();

    this._concatenationUID = -1;
    this._seriesInstanceUID = -1;
    this._seriesNumber = -1;
    this._dimensionIndexSequence = [];
    // it is used in the loader in case a dicom/nifti contains multiple frames
    // should be updated after merge or renamed
    this._numberOfFrames = 0;
    this._numberOfChannels = 1;

    this._stack = [];
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
   * @returns {boolean} True if series is valid. False if not.
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
   * @returns {boolean} True if series could be merge. False if not.
   *
   * @override
   */
  merge(series) {
    if(!this.validate(series)){
      return false;
    }

    if (this._seriesInstanceUID === series.seriesInstanceUID) {
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
   * @returns {Array.<ModelsSeries>} Array of series properly merged.
   */
  mergeSeries(target){
    var seriesContainer = [this];
    this.mergeModels(seriesContainer, target);
    return seriesContainer;
  }

  /**
   * Setters/Getters
   */

  set seriesInstanceUID(seriesInstanceUID) {
    this._seriesInstanceUID = seriesInstanceUID;
  }

  get seriesInstanceUID() {
    return this._seriesInstanceUID;
  }

  set numberOfFrames(numberOfFrames) {
    this._numberOfFrames = numberOfFrames;
  }

  get numberOfFrames() {
    return this._numberOfFrames;
  }

  set numberOfChannels(numberOfChannels) {
    this._numberOfChannels = numberOfChannels;
  }

  get numberOfChannels() {
    return this._numberOfChannels;
  }

  set stack(stack) {
    this._stack = stack;
  }

  get stack() {
    return this._stack;
  }
}
