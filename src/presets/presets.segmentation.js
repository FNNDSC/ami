/**
 * @module presets/segmentation
 */

import freesurferSegmentation from './presets.segmentation.freesurfer';


export default class PresetsSegmentation {
  constructor(presetID = 'Freesurfer') {
    this._presetID = presetID;
    this._presets = this.presetSegs();
  }

  set preset(targetPreset) {
    this._presetID = targetPreset;
  }

  get preset() {
    return this.fetchPreset(this._presetID);
  }

  fetchPreset(presetID) {
    let presets = this._presets;
    return presets[presetID];
  }

  addPreset(presetObj) {
    this._presets.push(presetObj);
  }

  presetsAvailable(type = 'segmentation') {
    let available = [];
    let presets = this._presets;

    for (let i in presets) {
      available.push(i);
    }

    return available;
  }

  presetSegs() {
    return {
      'Freesurfer': freesurferSegmentation,
    };
  }
}
