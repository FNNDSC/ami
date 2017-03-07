/** * Imports ***/
import CoreColors from '../core/core.colors';
import CoreUtils from '../core/core.utils';
import ModelsBase from '../models/models.base';

let binaryString = require('math-float32-to-binary-string');


// Slicer way to handle images
// should follow it...
 // 897   if ( (this->IndexSeriesInstanceUIDs[k] != idxSeriesInstanceUID && this->IndexSeriesInstanceUIDs[k] >= 0 && idxSeriesInstanceUID >= 0) ||
 // 898        (this->IndexContentTime[k] != idxContentTime && this->IndexContentTime[k] >= 0 && idxContentTime >= 0) ||
 // 899        (this->IndexTriggerTime[k] != idxTriggerTime && this->IndexTriggerTime[k] >= 0 && idxTriggerTime >= 0) ||
 // 900        (this->IndexEchoNumbers[k] != idxEchoNumbers && this->IndexEchoNumbers[k] >= 0 && idxEchoNumbers >= 0) ||
 // 901        (this->IndexDiffusionGradientOrientation[k] != idxDiffusionGradientOrientation  && this->IndexDiffusionGradientOrientation[k] >= 0 && idxDiffusionGradientOrientation >= 0) ||
 // 902        (this->IndexSliceLocation[k] != idxSliceLocation && this->IndexSliceLocation[k] >= 0 && idxSliceLocation >= 0) ||
 // 903        (this->IndexImageOrientationPatient[k] != idxImageOrientationPatient && this->IndexImageOrientationPatient[k] >= 0 && idxImageOrientationPatient >= 0) )
 // 904     {
 // 905       continue;
 // 906     }

/**
 * Stack object.
 *
 * @module models/stack
 */

export default class ModelsStack extends ModelsBase {
  constructor() {
    super();

    this._uid = null;
    this._stackID = -1;

    this._frame = [];
    this._numberOfFrames = 0;

    this._rows = 0;
    this._columns = 0;
    this._numberOfChannels = 1;
    this._bitsAllocated = 8;
    this._pixelType = 0;
    this._pixelRepresentation = 0;

    this._textureSize = 4096;
    this._nbTextures = 7; // HIGH RES..
    this._rawData = [];

    this._windowCenter = 0;
    this._windowWidth = 0;

    this._rescaleSlope = 1;
    this._rescaleIntercept = 0;

    this._minMax = [65535, -32768];

    // TRANSFORMATION MATRICES
    this._regMatrix = new THREE.Matrix4();
	
    this._ijk2LPS = null;
    this._lps2IJK = null;

    this._aabb2LPS = null;
    this._lps2AABB = null;

    //
    // IJK dimensions
    this._dimensionsIJK = null;
    this._halfDimensionsIJK = null;
    this._spacing = new THREE.Vector3(1, 1, 1);
    this._spacingBetweenSlices = 0;
    this._sliceThickness = 0;
    this._origin = null;
    this._rightHanded = true;
    this._xCosine = new THREE.Vector3(1, 0, 0);
    this._yCosine = new THREE.Vector3(0, 1, 0);
    this._zCosine = new THREE.Vector3(0, 0, 1);

    // convenience vars
    this._prepared = false;
    this._packed = false;
    this._packedPerPixel = 1;

    //
    this._modality = 'Modality not set';

    // SEGMENTATION STUFF
    this._segmentationType = null;
    this._segmentationSegments = [];
    this._segmentationDefaultColor = [63, 174, 128];
    this._frameSegment = [];
    this._segmentationLUT = [];
    this._segmentationLUTO = [];

    // photometricInterpretation Monochrome1 VS Monochrome2
    this._invert = false;
  }

  prepareSegmentation() {
    // store frame and do special pre-processing
    this._frameSegment = this._frame;
    let mergedFrames = [];

    // order frames
    this.computeCosines();
    this._frame.map(this._computeDistanceArrayMap.bind(null, this._zCosine));
    this._frame.sort(this._sortDistanceArraySort);

    // merge frames
    let prevIndex = -1;
    for(let i = 0; i<this._frame.length; i++) {
      if(!mergedFrames[prevIndex] || mergedFrames[prevIndex]._dist != this._frame[i]._dist) {
        mergedFrames.push(this._frame[i]);
        prevIndex++;

        // scale it..
        for(let k=0; k<mergedFrames[prevIndex]._rows * mergedFrames[prevIndex]._columns; k++) {
          mergedFrames[prevIndex]._pixelData[k] *= this._frame[i]._referencedSegmentNumber;
        }
      } else{
        for(let k=0; k<mergedFrames[prevIndex]._rows * mergedFrames[prevIndex]._columns; k++) {
          mergedFrames[prevIndex]._pixelData[k] += this._frame[i].pixelData[k] * this._frame[i]._referencedSegmentNumber;
        }
      }

      mergedFrames[prevIndex].minMax = CoreUtils.minMaxPixelData(mergedFrames[prevIndex]._pixelData);
    }

    // get information about segments
    let dict = {};
    let max = 0;
    for(let i = 0; i<this._segmentationSegments.length; i++) {
      max = Math.max(max, parseInt(this._segmentationSegments[i].segmentNumber, 10));

      let color = this._segmentationSegments[i].recommendedDisplayCIELab;
      if(color === null) {
        dict[this._segmentationSegments[i].segmentNumber] = this._segmentationDefaultColor;
      } else {
        dict[this._segmentationSegments[i].segmentNumber] = CoreColors.cielab2RGB(...color);
      }
    }

    // generate LUTs
    let colors = [];
    let index = [0];
    for (let i = 0; i <= max; i++) {
      let index = i / max;
      let opacity = i ? 1 : 0;
      let rgb = [0, 0, 0];
      if(dict.hasOwnProperty(i.toString())) {
        rgb = dict[i.toString()];
      }

      rgb[0] /= 255;
      rgb[1] /= 255;
      rgb[2] /= 255;

      this._segmentationLUT.push([index, ...rgb]);
      this._segmentationLUTO.push([index, opacity]);
    }

    this._frame = mergedFrames;
  }

  /**
   * Compute cosines
   * Order frames
   * computeSpacing
   * sanityCheck
   * init some vars
   * compute min/max
   * compute transformation matrices
   */
  prepare() {
    // if segmentation, merge some frames...
    if(this._modality === 'SEG') {
      this.prepareSegmentation();
    }

    // we need at least 1 frame
    if (this._frame && this._frame.length > 0) {
      this._numberOfFrames = this._frame.length;
    } else {
      window.console.log('_frame doesn\'t contain anything....');
      window.console.log(this._frame);
      return false;
    }
    // pass parameters from frame to stack
    this._rows = this._frame[0].rows;
    this._columns = this._frame[0].columns;
    this._dimensionsIJK = new THREE.Vector3(this._columns, this._rows, this._numberOfFrames);
    this._halfDimensionsIJK = new THREE.Vector3(
      this._dimensionsIJK.x / 2,
      this._dimensionsIJK.y / 2,
      this._dimensionsIJK.z / 2
    );
    this._spacingBetweenSlices = this._frame[0].spacingBetweenSlices;
    this._sliceThickness = this._frame[0].sliceThickness;

    // compute direction cosines
    this.computeCosines();

    // order the frames
    this.orderFrames();

    // compute/guess spacing
    this.computeSpacing();
    // set extra vars if nulls
    // happens now because if it happen before, we would think image position/orientation
    // are defined and we would use it to compute spacing.
    if (!this._frame[0].imagePosition) {
      this._frame[0].imagePosition = [0, 0, 0];
    }
    if (!this._frame[0].imageOrientation) {
      this._frame[0].imageOrientation = [1, 0, 0, 0, 1, 0];
    }

    this._origin = this._vector3FromArray(this._frame[0].imagePosition, 0);

    // compute transforms
    this.computeIJK2LPS();
  
    this.computeLPS2AABB();
    // this.packEchos();

    this._rescaleSlope = this._frame[0].rescaleSlope || 1;
    this._rescaleIntercept = this._frame[0].rescaleIntercept || 0;

    // rescale/slope min max
    this.computeMinMaxIntensities();
    this._minMax[0] = ModelsStack.valueRescaleSlopeIntercept(
      this._minMax[0],
      this._rescaleSlope,
      this._rescaleIntercept);
    this._minMax[1] = ModelsStack.valueRescaleSlopeIntercept(
      this._minMax[1],
      this._rescaleSlope,
      this._rescaleIntercept);

    let width = this._frame[0].windowWidth || this._minMax[1] - this._minMax[0];
    this._windowWidth = this._rescaleSlope * width + this._rescaleIntercept;

    let center = this._frame[0].windowCenter || this._minMax[0] + width / 2;
    this._windowCenter = this._rescaleSlope * center + this._rescaleIntercept;

    this._bitsAllocated = this._frame[0].bitsAllocated;
    this._prepared = true;
  }

  packEchos() {
    // 4 echo times...
    let echos = 4;
    let packedEcho = [];
    for(let i=0; i< this._frame.length; i+=echos) {
      let frame = this._frame[i];
      for(let k=0; k<this._rows * this._columns; k++) {
        for(let j=1; j<echos; j++) {
          frame.pixelData[k] += this._frame[i+j].pixelData[k];
        }
        frame.pixelData[k] /= echos;
      }
      packedEcho.push(frame);
    }
    this._frame = packedEcho;
    this._numberOfFrames = this._frame.length;
    this._dimensionsIJK = new THREE.Vector3(this._columns, this._rows, this._numberOfFrames);
    this._halfDimensionsIJK = new THREE.Vector3(
      this._dimensionsIJK.x / 2,
      this._dimensionsIJK.y / 2,
      this._dimensionsIJK.z / 2
    );
  }

  // frame.cosines - returns array [x, y, z]
  computeCosines() {
    if (this._frame &&
      this._frame[0]) {
      let cosines = this._frame[0].cosines();
      this._xCosine = cosines[0];
      this._yCosine = cosines[1];
      this._zCosine = cosines[2];
    }
  }

  orderFrames() {
    // order the frames based on theirs dimension indices
    // first index is the most important.
    // 1,1,1,1 willl be first
    // 1,1,2,1 will be next
    // 1,1,2,3 will be next
    // 1,1,3,1 wil be next
    if (this._frame[0].dimensionIndexValues) {
      this._frame.sort(this._orderFrameOnDimensionIndicesArraySort);

    // else order with image position and orientation
    } else if (
      this._frame[0].imagePosition && this._frame[0].imageOrientation &&
      this._frame[1] &&
      this._frame[1].imagePosition && this._frame[1].imageOrientation &&
      this._frame[0].imagePosition.join() !== this._frame[1].imagePosition.join()) {
      // compute and sort by dist in this series
      this._frame.map(this._computeDistanceArrayMap.bind(null, this._zCosine));
      this._frame.sort(this._sortDistanceArraySort);
    } else if (
      this._frame[0].instanceNumber !== null &&
      this._frame[1] && this._frame[1].instanceNumber !== null &&
      this._frame[0].instanceNumber !== this._frame[1].instanceNumber) {
      this._frame.sort(this._sortInstanceNumberArraySort);
    } else if (
      this._frame[0].sopInstanceUID &&
      this._frame[1] && this._frame[1].sopInstanceUID &&
      this._frame[0].sopInstanceUID !== this._frame[1].sopInstanceUID) {
      this._frame.sort(this._sortSopInstanceUIDArraySort);
    } else {
      // window.console.log(this._frame[0]);
      // window.console.log(this._frame[1]);
      // window.console.log(this._frame[0].instanceNumber !== null && true);
      // window.console.log(this._frame[0].instanceNumber !== this._frame[1].instanceNumber);
      window.console.log('do not know how to order the frames...');
      // else slice location
      // image number
      // ORDERING BASED ON instance number
      // _ordering = 'instance_number';
      // first_image.sort(function(a,b){return a["instance_number"]-b["instance_number"]});
    }
  }

  computeSpacing() {
    this.xySpacing();
    this.zSpacing();
  }

  /**
   * 
   */
  zSpacing() {
    if (this._numberOfFrames > 1) {
      if(this._frame[0].pixelSpacing && this._frame[0].pixelSpacing[2]) {
        this._spacing.z = this._frame[0].pixelSpacing[2];
      } else {
        // compute and sort by dist in this series
        this._frame.map(
          this._computeDistanceArrayMap.bind(null, this._zCosine));

        // if distances are different, re-sort array
        if(this._frame[1].dist !== this._frame[0].dist) {
          this._frame.sort(this._sortDistanceArraySort);
          this._spacing.z = this._frame[1].dist - this._frame[0].dist;
        } else if(this._spacingBetweenSlices) {
          this._spacing.z = this._spacingBetweenSlices;
        } else if(this._frame[0].sliceThickness) {
          this._spacing.z = this._frame[0].sliceThickness;
        }
      }
    }

    // Spacing
    // can not be 0 if not matrix can not be inverted.
    if (this._spacing.z === 0) {
      this._spacing.z = 1;
    }
  }

  /**
   *  FRAME CAN DO IT
   */
  xySpacing() {
    if (this._frame &&
      this._frame[0]) {
      let spacingXY = this._frame[0].spacingXY();
      this._spacing.x = spacingXY[0];
      this._spacing.y = spacingXY[1];
    }
  }

  computeMinMaxIntensities() {
    // what about colors!!!!?
    for (let i = 0; i < this._frame.length; i++) {
      // get min/max
      this._minMax[0] = Math.min(this._minMax[0], this._frame[i].minMax[0]);
      this._minMax[1] = Math.max(this._minMax[1], this._frame[i].minMax[1]);
    }
  }

  computeIJK2LPS() {
    this._ijk2LPS = new THREE.Matrix4();
    this._ijk2LPS.set(
      this._xCosine.x * this._spacing.x, this._yCosine.x * this._spacing.y, this._zCosine.x * this._spacing.z, this._origin.x,
      this._xCosine.y * this._spacing.x, this._yCosine.y * this._spacing.y, this._zCosine.y * this._spacing.z, this._origin.y,
      this._xCosine.z * this._spacing.x, this._yCosine.z * this._spacing.y, this._zCosine.z * this._spacing.z, this._origin.z,
      0, 0, 0, 1);
    this._ijk2LPS.premultiply(this._regMatrix);
    this._lps2IJK = new THREE.Matrix4();
    this._lps2IJK.getInverse(this._ijk2LPS);
  }

  computeLPS2AABB() {
    this._aabb2LPS = new THREE.Matrix4();
    this._aabb2LPS.set(
        this._xCosine.x, this._yCosine.x, this._zCosine.x, this._origin.x,
        this._xCosine.y, this._yCosine.y, this._zCosine.y, this._origin.y,
        this._xCosine.z, this._yCosine.z, this._zCosine.z, this._origin.z,
        0, 0, 0, 1);

    this._lps2AABB = new THREE.Matrix4();
    this._lps2AABB.getInverse(this._aabb2LPS);
  }

  merge(stack) {
    // also make sure x/y/z cosines are a match!
    if (this._stackID === stack.stackID) {
      return this.mergeModels(this._frame, stack.frame);
    } else {
      return false;
    }
  }

  pack() {
    // Get total number of voxels
    let nbVoxels = this._dimensionsIJK.x * this._dimensionsIJK.y * this._dimensionsIJK.z;

    // Packing style
    if(this._bitsAllocated === 16 && this._numberOfChannels === 1) {
      this._packedPerPixel = 2;
    }

    // Loop through all the textures we need
    let textureDimension = this._textureSize * this._textureSize;
    let requiredTextures = Math.ceil(nbVoxels / (textureDimension * this._packedPerPixel));
    let voxelIndexStart = 0;
    let voxelIndexStop = this._packedPerPixel * textureDimension;
    if (voxelIndexStop > nbVoxels) {
      voxelIndexStop = nbVoxels;
    }

    for (let ii = 0; ii < requiredTextures; ii++) {
      // console.log( voxelIndexStart );
      // console.log( voxelIndexStop );

      let packed = this._packTo8Bits(this._bitsAllocated, this._pixelType, this._numberOfChannels, this._frame, this._textureSize, voxelIndexStart, voxelIndexStop);
      this._textureType = packed.textureType;
      this._rawData.push(packed.data);

      voxelIndexStart += this._packedPerPixel * textureDimension;
      voxelIndexStop += this._packedPerPixel * textureDimension;
      if (voxelIndexStop > nbVoxels) {
        voxelIndexStop = nbVoxels;
      }
    }

    this._packed = true;
  }

  _packTo8Bits(bits, pixelType, channels, frame, textureSize, startVoxel, stopVoxel) {
    let packed = {
      textureType: null,
      data: null,
    };

    // transform signed to unsigned for convenience
    let offset = 0;
    if(this._minMax[0] < 0) {
      offset -= this._minMax[0];
    }

    let packIndex = 0;
    let frameIndex = 0;
    let inFrameIndex = 0;
    // frame can do it!
    let frameDimension = frame[0].rows * frame[0].columns;
    let data = null;

    if (bits === 8 && channels === 1 || bits === 1) {
      let data = new Uint8Array(textureSize * textureSize * 1);
      for (let i = startVoxel; i < stopVoxel; i++) {
        /* jshint bitwise: false*/
        frameIndex = ~~(i / frameDimension);
        inFrameIndex = i % (frameDimension);
        /* jshint bitwise: true*/

        data[packIndex] = offset + frame[frameIndex].pixelData[inFrameIndex];
        packIndex++;
      }
      packed.textureType = THREE.LuminanceFormat;
      packed.data = data;
    } else if (bits === 16 && channels === 1) {
      let data = new Uint8Array(textureSize * textureSize * 4);
      let coordinate = 0;
      let channelOffset = 0;

      for (let i = startVoxel; i < stopVoxel; i++) {
        /* jshint bitwise: false*/
        frameIndex = ~~(i / frameDimension);
        inFrameIndex = i % (frameDimension);
        /* jshint bitwise: true*/

        let raw = offset + frame[frameIndex].pixelData[inFrameIndex];
        data[4 * coordinate + 2 * channelOffset] = raw & 0x00FF;
        data[4 * coordinate + 2 * channelOffset + 1] = (raw >>> 8) & 0x00FF;

        packIndex++;
        coordinate = Math.floor(packIndex / 2);
        channelOffset = packIndex % 2;
      }

      packed.textureType = THREE.RGBAFormat;
      packed.data = data;
    } else if (bits === 32 && channels === 1 && pixelType === 0) {
      let data = new Uint8Array(textureSize * textureSize * 4);
      for (let i = startVoxel; i < stopVoxel; i++) {
        /* jshint bitwise: false*/
        frameIndex = ~~(i / frameDimension);
        inFrameIndex = i % (frameDimension);
        /* jshint bitwise: true*/

        // slow!
        // let asb = VJS.core.pack.uint16ToAlphaLuminance(frame[frameIndex].pixelData[inFrameIndex]);
        let raw = offset + frame[frameIndex].pixelData[inFrameIndex];
        data[4 * packIndex] = raw & 0x000000FF;
        data[4 * packIndex + 1] = (raw >>> 8) & 0x000000FF;
        data[4 * packIndex + 2] = (raw >>> 8) & 0x000000FF;
        data[4 * packIndex + 3] = (raw >>> 8) & 0x000000FF;

        packIndex++;
      }
      packed.textureType = THREE.RGBAFormat;
      packed.data = data;
    } else if (bits === 32 && channels === 1 && pixelType === 1) {
      let data = new Uint8Array(textureSize * textureSize * 4);

      for (let i = startVoxel; i < stopVoxel; i++) {
        /* jshint bitwise: false*/
        frameIndex = ~~(i / frameDimension);
        inFrameIndex = i % (frameDimension);
        /* jshint bitwise: true*/

        // slow!
        // let asb = VJS.core.pack.uint16ToAlphaLuminance(frame[frameIndex].pixelData[inFrameIndex]);
        let raw = offset + frame[frameIndex].pixelData[inFrameIndex];
        let bitString = binaryString(raw);
        let bitStringArray = bitString.match(/.{1,8}/g);

        data[4 * packIndex] = parseInt(bitStringArray[0], 2);
        data[4 * packIndex + 1] = parseInt(bitStringArray[1], 2);
        data[4 * packIndex + 2] = parseInt(bitStringArray[2], 2);
        data[4 * packIndex + 3] = parseInt(bitStringArray[3], 2);

        packIndex++;
      }

      packed.textureType = THREE.RGBAFormat;
      packed.data = data;
    } else if (bits === 8 && channels === 3) {
      let data = new Uint8Array(textureSize * textureSize * 3);

      for (let i = startVoxel; i < stopVoxel; i++) {
        /* jshint bitwise: false*/
        frameIndex = ~~(i / frameDimension);
        inFrameIndex = i % (frameDimension);
        /* jshint bitwise: true*/
        data[3 * packIndex] =
          frame[frameIndex].pixelData[3 * inFrameIndex];
        data[3 * packIndex + 1] =
          frame[frameIndex].pixelData[3 * inFrameIndex + 1];
        data[3 * packIndex + 2] =
          frame[frameIndex].pixelData[3 * inFrameIndex + 2];
        packIndex++;
      }

      packed.textureType = THREE.RGBFormat;
      packed.data = data;
    }

    return packed;
  }

  static worldToData(stack, worldCoordinates) {
    let dataCoordinate = new THREE.Vector3()
      .copy(worldCoordinates)
      .applyMatrix4(stack._lps2IJK);

    // same rounding in the shaders
    dataCoordinate.addScalar(0.5).floor();

    return dataCoordinate;
  }

  worldCenter() {
    let center = this._halfDimensionsIJK.clone().addScalar(-0.5)
      .applyMatrix4(this._ijk2LPS);
    return center;
  }

  worldBoundingBox() {
    let bbox = [
      Number.MAX_VALUE, Number.MIN_VALUE,
      Number.MAX_VALUE, Number.MIN_VALUE,
      Number.MAX_VALUE, Number.MIN_VALUE,
    ];

    for (let i = 0; i <= this._dimensionsIJK.x; i += this._dimensionsIJK.x) {
      for (let j = 0; j <= this._dimensionsIJK.y; j += this._dimensionsIJK.y) {
        for (let k = 0; k <= this._dimensionsIJK.z; k += this._dimensionsIJK.z) {
          let world = new THREE.Vector3(i, j, k).applyMatrix4(this._ijk2LPS);
          bbox = [
            Math.min(bbox[0], world.x), Math.max(bbox[1], world.x), // x min/max
            Math.min(bbox[2], world.y), Math.max(bbox[3], world.y),
            Math.min(bbox[4], world.z), Math.max(bbox[5], world.z),
            ];
        }
      }
    }

    return bbox;
  }

  AABBox() {
    let world0 = new THREE.Vector3().addScalar(-0.5)
      .applyMatrix4(this._ijk2LPS)
      .applyMatrix4(this._lps2AABB);

    let world7 = this._dimensionsIJK.clone().addScalar(-0.5)
      .applyMatrix4(this._ijk2LPS)
      .applyMatrix4(this._lps2AABB);

    let minBBox = new THREE.Vector3(
      Math.abs(world0.x - world7.x),
      Math.abs(world0.y - world7.y),
      Math.abs(world0.z - world7.z)
    );

    return minBBox;
  }

  centerAABBox() {
    let centerBBox = this.worldCenter();
    centerBBox.applyMatrix4(this._lps2AABB);
    return centerBBox;
  }

  static value(stack, ijkCoordinate) {
    if(ijkCoordinate.z >= 0 && ijkCoordinate.z < stack._frame.length) {
      return stack._frame[ijkCoordinate.z].value(
        ijkCoordinate.x,
        ijkCoordinate.y);
    } else {
      return null;
    }
  }

  static valueRescaleSlopeIntercept(value, slope, intercept) {
    return value * slope + intercept;
  }

  static indexInDimensions(index, dimensions) {
    if (index.x >= 0 &&
         index.y >= 0 &&
         index.z >= 0 &&
         index.x < dimensions.x &&
         index.y < dimensions.y &&
         index.z < dimensions.z) {
      return true;
    }

    return false;
  }

  _vector3FromArray(array, index) {
    return new THREE.Vector3(
      array[index],
      array[index + 1],
      array[index + 2]
      );
  }

  _orderFrameOnDimensionIndicesArraySort(a, b) {
    if ('dimensionIndexValues' in a && Object.prototype.toString.call(a.dimensionIndexValues) === '[object Array]' && 'dimensionIndexValues' in b && Object.prototype.toString.call(b.dimensionIndexValues) === '[object Array]') {
      for (let i = 0; i < a.dimensionIndexValues.length; i++) {
        if (parseInt(a.dimensionIndexValues[i], 10) > parseInt(b.dimensionIndexValues[i], 10)) {
          return 1;
        }
        if (parseInt(a.dimensionIndexValues[i], 10) < parseInt(b.dimensionIndexValues[i], 10)) {
          return -1;
        }
      }
    } else {
      window.console.log('One of the frames doesn\'t have a dimensionIndexValues array.');
      window.console.log(a);
      window.console.log(b);
    }

    return 0;
  }

  _computeDistanceArrayMap(normal, frame) {
    frame.dist = frame.imagePosition[0] * normal.x +
      frame.imagePosition[1] * normal.y +
      frame.imagePosition[2] * normal.z;
    return frame;
  }

  _sortDistanceArraySort(a, b) {
return a.dist - b.dist;
}
  _sortInstanceNumberArraySort(a, b) {
return a.instanceNumber - b.instanceNumber;
}
  _sortSopInstanceUIDArraySort(a, b) {
return a.sopInstanceUID - b.sopInstanceUID;
}

  set numberOfChannels(numberOfChannels) {
    this._numberOfChannels = numberOfChannels;
  }

  get numberOfChannels() {
    return this._numberOfChannels;
  }

  set frame(frame) {
    this._frame = frame;
  }

  get frame() {
    return this._frame;
  }

  set prepared(prepared) {
    this._prepared = prepared;
  }

  get prepared() {
    return this._prepared;
  }

  set packed(packed) {
    this._packed = packed;
  }

  get packed() {
    return this._packed;
  }

  set packedPerPixel(packedPerPixel) {
    this._packedPerPixel = packedPerPixel;
  }

  get packedPerPixel() {
    return this._packedPerPixel;
  }

  set dimensionsIJK(dimensionsIJK) {
    this._dimensionsIJK = dimensionsIJK;
  }

  get dimensionsIJK() {
    return this._dimensionsIJK;
  }

  set halfDimensionsIJK(halfDimensionsIJK) {
    this._halfDimensionsIJK = halfDimensionsIJK;
  }

  get halfDimensionsIJK() {
    return this._halfDimensionsIJK;
  }
  
  set regMatrix(regMatrix) {
	  this._regMatrix = regMatrix;
  }
  
  get regMatrix() {
	  return this._regMatrix;
  }

  set ijk2LPS(ijk2LPS) {
    this._ijk2LPS = ijk2LPS;
  }

  get ijk2LPS() {
    return this._ijk2LPS;
  }

  set lps2IJK(lps2IJK) {
    this._lps2IJK = lps2IJK;
  }

  get lps2IJK() {
    return this._lps2IJK;
  }

  set lps2AABB(lps2AABB) {
    this._lps2AABB = lps2AABB;
  }

  get lps2AABB() {
    return this._lps2AABB;
  }

  set textureSize(textureSize) {
    this._textureSize = textureSize;
  }

  get textureSize() {
    return this._textureSize;
  }

  set textureType(textureType) {
    this._textureType = textureType;
  }

  get textureType() {
    return this._textureType;
  }

  set bitsAllocated(bitsAllocated) {
    this._bitsAllocated = bitsAllocated;
  }

  get bitsAllocated() {
    return this._bitsAllocated;
  }

  set rawData(rawData) {
    this._rawData = rawData;
  }

  get rawData() {
    return this._rawData;
  }

  get windowWidth() {
    return this._windowWidth;
  }

  set windowWidth(windowWidth) {
    this._windowWidth = windowWidth;
  }

  get windowCenter() {
    return this._windowCenter;
  }

  set windowCenter(windowCenter) {
    this._windowCenter = windowCenter;
  }

  get rescaleSlope() {
    return this._rescaleSlope;
  }

  set rescaleSlope(rescaleSlope) {
    this._rescaleSlope = rescaleSlope;
  }

  get rescaleIntercept() {
    return this._rescaleIntercept;
  }

  set rescaleIntercept(rescaleIntercept) {
    this._rescaleIntercept = rescaleIntercept;
  }

  get xCosine() {
    return this._xCosine;
  }

  set xCosine(xCosine) {
    this._xCosine = xCosine;
  }

  get yCosine() {
    return this._yCosine;
  }

  set yCosine(yCosine) {
    this._yCosine = yCosine;
  }

  get zCosine() {
    return this._zCosine;
  }

  set zCosine(zCosine) {
    this._zCosine = zCosine;
  }

  get minMax() {
    return this._minMax;
  }

  set minMax(minMax) {
    this._minMax = minMax;
  }

  get stackID() {
    return this._stackID;
  }

  set stackID(stackID) {
    this._stackID = stackID;
  }

  get pixelType() {
    return this._pixelType;
  }

  set pixelType(pixelType) {
    this._pixelType = pixelType;
  }

  get pixelRepresentation() {
    return this._pixelRepresentation;
  }

  set pixelRepresentation(pixelRepresentation) {
    this._pixelRepresentation = pixelRepresentation;
  }

  set invert(invert) {
    this._invert = invert;
  }

  get invert() {
    return this._invert;
  }

  set modality(modality) {
    this._modality = modality;
  }

  get modality() {
    return this._modality;
  }

  get rightHanded() {
    return this._rightHanded;
  }

  set rightHanded(rightHanded) {
    this._rightHanded = rightHanded;
  }

  get spacingBetweenSlices() {
    return this._spacingBetweenSlices;
  }

  set spacingBetweenSlices(spacingBetweenSlices) {
    this._spacingBetweenSlices = spacingBetweenSlices;
  }

  set segmentationSegments(segmentationSegments) {
    this._segmentationSegments = segmentationSegments;
  }

  get segmentationSegments() {
    return this._segmentationSegments;
  }

  set segmentationType(segmentationType) {
    this._segmentationType = segmentationType;
  }

  get segmentationType() {
    return this._segmentationType;
  }

  set segmentationLUT(segmentationLUT) {
    this._segmentationLUT = segmentationLUT;
  }

  get segmentationLUT() {
    return this._segmentationLUT;
  }

  set segmentationLUTO(segmentationLUTO) {
    this._segmentationLUTO = segmentationLUTO;
  }

  get segmentationLUTO() {
    return this._segmentationLUTO;
  }
}
