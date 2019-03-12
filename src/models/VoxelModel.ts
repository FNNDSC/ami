import BaseModel from "./BaseModel";

/**
 * @module models/voxel
 */

export default class VoxelModel extends BaseModel {
  constructor() {
    super();

    this._id = -1;
    this.worldCoordinates = null;
    this.dataCoordinates = null;
    this.screenCoordinates = null;
    this.value = null;
  }

  set worldCoordinates(worldCoordinates) {
    this.worldCoordinates = worldCoordinates;
  }

  get worldCoordinates() {
    return this.worldCoordinates;
  }

  set dataCoordinates(dataCoordinates) {
    this.dataCoordinates = dataCoordinates;
  }

  get dataCoordinates() {
    return this.dataCoordinates;
  }

  set screenCoordinates(screenCoordinates) {
    this.screenCoordinates = screenCoordinates;
  }

  get screenCoordinates() {
    return this.screenCoordinates;
  }

  set value(value) {
    this.value = value;
  }

  get value() {
    return this.value;
  }

  set _id(_id) {
    this._id = _id;
  }

  get _id() {
    return this._id;
  }
}
