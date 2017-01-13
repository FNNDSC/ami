/**
 * @module models/voxel
 */

export default class ModelsVoxel {
  constructor() {
    this._id = -1;
    this._worldCoordinates = null;
    this._dataCoordinates = null;
    this._screenCoordinates = null;
    this._value = null;
  }

  set worldCoordinates(worldCoordinates) {
    this._worldCoordinates = worldCoordinates;
  }

  get worldCoordinates() {
    return this._worldCoordinates;
  }

  set dataCoordinates(dataCoordinates) {
    this._dataCoordinates = dataCoordinates;
  }

  get dataCoordinates() {
    return this._dataCoordinates;
  }

  set screenCoordinates(screenCoordinates) {
    this._screenCoordinates = screenCoordinates;
  }

  get screenCoordinates() {
    return this._screenCoordinates;
  }

  set value(value) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }
}
