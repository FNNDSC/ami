/**
 * @module parsers/volume
 */
export default class ParsersVolume {

  modality(){

    return 'unkown';

  }

  segmentationType(){

    return 'unknown';

  }

  segmentationSegments(){

    return [];

  }

  referencedSegmentNumber(frameIndex){

    return -1;

  }

  _decompressUncompressed(){
    
  }

  //http://stackoverflow.com/questions/5320439/how-do-i-swap-endian-ness-byte-order-of-a-variable-in-javascript
  _swap16(val) {

    return ((val & 0xFF) << 8)
      | ((val >> 8) & 0xFF);

  }

  _swap32(val) {

    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);

  }

  invert() {

    return false;

  }
}
