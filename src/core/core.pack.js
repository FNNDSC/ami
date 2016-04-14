/**
 * Packing functions.
 *
 * @module core/pack */

export default class Pack {

  /**
   *
   */
  // static packTo8BitsTexture(bits, channels, frame, textureSize, startVoxel, stopVoxel) {
  //   let packed = {
  //     textureType: null,
  //     data: null
  //   };

  //   let packIndex = 0;
  //   let frameIndex = 0;
  //   let inFrameIndex = 0;
  //   let frameDimension = frame[0].rows * frame[0].columns;
  //   let data = null;

  //   if (bits === 8 && channels === 1) {
  //     let data = new Uint8Array(textureSize * textureSize * 1);
  //     for (let i = startVoxel; i < stopVoxel; i++) {
  //       /*jshint bitwise: false*/
  //       frameIndex = ~~(i / frameDimension);
  //       inFrameIndex = i % (frameDimension);
  //       /*jshint bitwise: true*/

  //       data[packIndex] = frame[frameIndex].pixelData[inFrameIndex];
  //       packIndex++;

  //     }
  //     packed.textureType = THREE.RGBFormat;
  //     packed.data = data;
  //   } else if (bits === 16 && channels === 1) {
  //     let data = new Uint8Array(textureSize * textureSize * 2);
  //     for (let i = startVoxel; i < stopVoxel; i++) {
  //       /*jshint bitwise: false*/
  //       frameIndex = ~~(i / frameDimension);
  //       inFrameIndex = i % (frameDimension);
  //       /*jshint bitwise: true*/

  //       // slow!
  //       //let asb = VJS.core.pack.uint16ToAlphaLuminance(frame[frameIndex].pixelData[inFrameIndex]);
  //       let raw = frame[frameIndex].pixelData[inFrameIndex];

  //       /*jshint bitwise: false*/
  //       let lsb = raw & 0x00FF;
  //       let msb = (raw >>> 8) & 0x00FF;
  //       /*jshint bitwise: true*/
  //       data[2 * packIndex] = lsb;
  //       data[2 * packIndex + 1] = msb;
  //       packIndex++;
  //     }
  //     packed.textureType = THREE.LuminanceAlphaFormat;
  //     packed.data = data;
  //   } else if (bits === 32 && channels === 1) {

  //     let data = new Uint8Array(textureSize * textureSize * 4);
  //     for (let i = startVoxel; i < stopVoxel; i++) {
  //       /*jshint bitwise: false*/
  //       frameIndex = ~~(i / frameDimension);
  //       inFrameIndex = i % (frameDimension);
  //       /*jshint bitwise: true*/

  //       // slow!
  //       //let asb = VJS.core.pack.uint16ToAlphaLuminance(frame[frameIndex].pixelData[inFrameIndex]);
  //       let raw = frame[frameIndex].pixelData[inFrameIndex];

  //       /*jshint bitwise: false*/
  //       let b0 = raw & 0x000000FF;
  //       let b1 = (raw >>> 8) & 0x000000FF;
  //       let b2 = (raw >>> 8) & 0x000000FF;
  //       let b3 = (raw >>> 8) & 0x000000FF;
  //       // let lsb1 = raw & 0xFF;
  //       // let msb1 = (raw >> 8) & 0xFF;
  //       /*jshint bitwise: true*/
  //       data[4 * packIndex] = b0;
  //       data[4 * packIndex + 1] = b1;
  //       data[4 * packIndex + 2] = b2;
  //       data[4 * packIndex + 3] = b3;
  //       packIndex++;
  //     }
  //     packed.textureType = THREE.RGBAFormat;
  //     packed.data = data;
  //   } else if (bits === 8 && channels === 3) {
  //     let data = new Uint8Array(textureSize * textureSize * 3);
  //     for (let i = startVoxel; i < stopVoxel; i++) {
  //       /*jshint bitwise: false*/
  //       frameIndex = ~~(i / frameDimension);
  //       inFrameIndex = i % (frameDimension);
  //       /*jshint bitwise: true*/

  //       data[3 * packIndex] = frame[frameIndex].pixelData[3 * inFrameIndex];
  //       data[3 * packIndex + 1] = frame[frameIndex].pixelData[3 * inFrameIndex + 1];
  //       data[3 * packIndex + 2] = frame[frameIndex].pixelData[3 * inFrameIndex + 2];
  //       packIndex++;

  //     }
  //     packed.textureType = THREE.LuminanceFormat;
  //     packed.data = data;
  //   }

  //   return packed;

  // }
}

// 'use strict';

// var VJS = VJS || {};
// VJS.core = VJS.core || {};

// /**
//  * @constructor
//  * @class
//  * @memberOf VJS.core
//  * @public
// */
// VJS.core.pack = VJS.core.pack || {};

// // Deal with endianess
// // do not add a if there af is is slow in bog loops
// // add more functions
// VJS.core.pack.uint16ToAlphaLuminance = function(uint16, ab) {
//   /*jshint bitwise: false*/
//   var lsb = uint16 & 0xFF;
//   var msb = (uint16 >> 8) & 0xFF;
//   /*jshint bitwise: true*/
//   ab = [lsb, msb];
// };

// VJS.core.pack.uint8ToLuminance = function(uint8) {
//   return uint8;
// };

// VJS.core.pack.uint8V3ToRGB = function(uint8V3) {
//   return uint8V3;
// };

// /*** Exports ***/

// var moduleType = typeof module;
// if ((moduleType !== 'undefined') && module.exports) {
//   module.exports = VJS.core.pack;
// }
