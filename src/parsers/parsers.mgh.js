/** * Imports ***/
import ParsersVolume from './parsers.volume';
import {Vector3} from 'three';

/**
 * @module parsers/mgh
 */
export default class ParsersMgh extends ParsersVolume {
    constructor(data, id) {
        super();

        /**
          * @member
          * @type {arraybuffer}
        */
        this._id = id;
        this._url = data.url;
        this._buffer = null;
        this._bufferPos = 0;
        this._dataPos = 0;
        this._pixelData = null;

        // Default MGH Header as described at:
        // https://surfer.nmr.mgh.harvard.edu/fswiki/FsTutorial/MghFormat
        // Image "header" with default values
        this._version = 1;
        this._width = 0;
        this._height = 0;
        this._depth = 0;
        this._nframes = 0;
        this._type = ParsersMgh.MRI_UCHAR; // 0-UCHAR, 4-SHORT, 1-INT, 3-FLOAT
        this._dof = 0;
        this._goodRASFlag = 0; // True: Use directional cosines, false assume CORONAL
        this._spacingXYZ = [1, 1, 1];
        this._Xras = [-1, 0, 0];
        this._Yras = [0, 0, -1];
        this._Zras = [0, 1, 0];
        this._Cras = [0, 0, 0];
        // Image "footer"
        this._tr = 0; // ms
        this._flipAngle = 0; // radians
        this._te = 0; // ms
        this._ti = 0; // ms
        this._fov = 0; // from doc: IGNORE THIS FIELD (data is inconsistent)
        this._tags = []; // Will then contain variable length char strings

        // Other misc
        this._origin = [0, 0, 0];
        this._imageOrient = [0, 0, 0, 0, 0, 0];

        // Read header
        // ArrayBuffer in data.buffer may need endian swap
        this._buffer = data.buffer;

        this._version = this._readInt();
        this._swapEndian = false;
        if (this._version == 1) {
            // Life is good
        } else if (this._version == 16777216) {
            this._swapEndian = true;
            this._version = this._swap32(this._version);
        } else {
            const error = new Error('MGH/MGZ parser: Unknown Endian.  Version reports: ' + this._version);
            throw error;
        }
        this._width = this._readInt();
        this._height = this._readInt();
        this._depth = this._readInt(); // AMI calls this frames
        this._nframes = this._readInt();
        this._type = this._readInt();
        this._dof = this._readInt();
        this._goodRASFlag = this._readShort();
        this._spacingXYZ = this._readFloat(3);
        this._Xras = this._readFloat(3);
        this._Yras = this._readFloat(3);
        this._Zras = this._readFloat(3);
        this._Cras = this._readFloat(3);

        this._bufferPos=284;
        let dataSize=this._width * this._height * this._depth * this._nframes;
        let vSize=this._width * this._height * this._depth;

        switch (this._type) {
            case ParsersMgh.MRI_UCHAR:
                this._pixelData = this._readUChar(dataSize);
                break;
            case ParsersMgh.MRI_INT:
                this._pixelData = this._readInt(dataSize);
                break;
            case ParsersMgh.MRI_FLOAT:
                this._pixelData = this._readFloat(dataSize);
                break;
            case ParsersMgh.MRI_SHORT:
                this._pixelData = this._readShort(dataSize);
                break;
            default:
                throw Error('MGH/MGZ parser: Unknown _type.  _type reports: ' + this._type);
        }

        this._tr = this._readFloat(1);
        this._flipAngle = this._readFloat(1);
        this._te = this._readFloat(1);
        this._ti = this._readFloat(1);
        this._fov = this._readFloat(1);

        let enc = new TextDecoder();
        let t=this._tagReadStart();
        while (t[0]!=undefined) {
            let tagType=t[0];
            let tagLen=t[1];
            let tagValue=undefined;

            switch (tagType) {
                case ParsersMgh.TAG_OLD_MGH_XFORM:
                case ParsersMgh.TAG_MGH_XFORM:
                    tagValue=this._readChar(tagLen);
                    break;
                default:
                    tagValue=this._readChar(tagLen);
            }
            tagValue=enc.decode(tagValue);
            this._tags.push({tagType: tagType, tagValue: tagValue});

            // read for next loop
            t=this._tagReadStart();
        }

        // detect if we are in a right handed coordinate system
        const first = new Vector3().fromArray(this._Xras);
        const second = new Vector3().fromArray(this._Yras);
        const crossFirstSecond = new Vector3().crossVectors(first, second);
        const third = new Vector3().fromArray(this._Zras);

        if (crossFirstSecond.angleTo(third) > Math.PI / 2) {
            this._rightHanded = false;
        }

        // - sign to move to LPS space
        this._imageOrient = [
            -this._Xras[0], -this._Xras[1], this._Xras[2],
            -this._Yras[0], -this._Yras[1], this._Yras[2],
        ];

        // Calculate origin
        let fcx = this._width / 2.0;
        let fcy = this._height / 2.0;
        let fcz = this._depth / 2.0;

        for (let ui = 0; ui < 3; ++ui) {
            this._origin[ui] = this._Cras[ui]
                - (this._Xras[ui] * this._spacingXYZ[0] * fcx
                + this._Yras[ui] * this._spacingXYZ[1] * fcy
                + this._Zras[ui] * this._spacingXYZ[2] * fcz);
        }

        // - sign to move to LPS space
        this._origin = [
            -this._origin[0],
            -this._origin[1],
            this._origin[2],
        ];
    }

    seriesInstanceUID() {
        // use filename + timestamp..?
        return this._url;
    }

    numberOfFrames() {
        // AMI calls Z component frames, not T (_nframes)
        return this._depth;
    }

    sopInstanceUID(frameIndex = 0) {
        return frameIndex;
    }

    rows(frameIndex = 0) {
        return this._width;
    }

    columns(frameIndex = 0) {
        return this._height;
    }

    pixelType(frameIndex = 0) {
        // Return: 0 integer, 1 float
        switch (this._type) {
            case ParsersMgh.MRI_UCHAR:
            case ParsersMgh.MRI_INT:
            case ParsersMgh.MRI_SHORT:
                return 0;
            case ParsersMgh.MRI_FLOAT:
                return 1;
            default:
                throw Error('MGH/MGZ parser: Unknown _type.  _type reports: ' + this._type);
        }
    }

    bitsAllocated(frameIndex = 0) {
        switch (this._type) {
            case ParsersMgh.MRI_UCHAR:
                return 8;
            case ParsersMgh.MRI_SHORT:
                return 16;
            case ParsersMgh.MRI_INT:
            case ParsersMgh.MRI_FLOAT:
                return 32;
            default:
                throw Error('MGH/MGZ parser: Unknown _type.  _type reports: ' + this._type);
        }
    }

    pixelSpacing(frameIndex = 0) {
        return this._spacingXYZ;
    }

    imageOrientation(frameIndex = 0) {
        return this._imageOrient;
    }

    imagePosition(frameIndex = 0) {
        return this._origin;
    }

    extractPixelData(frameIndex = 0) {
        let sliceSize = this._width * this._height;
        return this._pixelData.slice(frameIndex*sliceSize, (frameIndex+1)*sliceSize);
    }

    // signed int32
    _readInt(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len*4));
        this._bufferPos += len*4;
        let v=undefined;
        if (len==1) {
            v=tempBuff.getInt32(0, this._swapEndian);
        } else {
            v=new Int32Array(len);
            for (let i=0; i < len; i++) {
                v[i]=tempBuff.getInt32(i*4, this._swapEndian);
            }
        }
        return v;
    }

    // signed int16
    _readShort(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len*2));
        this._bufferPos += len*2;
        let v=undefined;
        if (len==1) {
            v=tempBuff.getInt16(0, this._swapEndian);
        } else {
            v=new Int16Array(len);
            for (let i=0; i < len; i++) {
                v[i]=tempBuff.getInt16(i*2, this._swapEndian);
            }
        }
        return v;
    }

    // signed int64
    _readLong(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len*8));
        this._bufferPos += len*8;
        let v=new Uint16Array(len);
        for (let i=0; i < len; i++) {
            /* DataView doesn't have Int64.
             * This work around based off Scalajs
             * (https://github.com/scala-js/scala-js/blob/master/library/src/main/scala/scala/scalajs/js/typedarray/DataViewExt.scala)
             * v[i]=tempBuff.getInt64(i*8,this._swapEndian);
            */
            let shiftHigh=0;
            let shiftLow=0;
            if (this._swapendian) {
                shiftHigh=4;
            } else {
                shiftLow=4;
            }
            let high = tempBuff.getInt32(i*8 + shiftHigh, this._swapEndian);
            let low = tempBuff.getInt32(i*8 + shiftLow, this._swapEndian);
            if (high != 0) {
                console.log('Unable to read Int64 with high word: ' + high + 'low word: ' + low);
                low=undefined;
            }
            v[i]=low;
        }
        if (len==0) {
            return undefined;
        } else if (len==1) {
            return v[0];
        } else {
            return v;
        }
    }

    // signed int8
    _readChar(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len));
        this._bufferPos += len;
        let v=undefined;
        if (len==1) {
            v=tempBuff.getInt8(0, this._swapEndian);
        } else {
            v=new Int8Array(len);
            for (let i=0; i < len; i++) {
                v[i]=tempBuff.getInt8(i, this._swapEndian);
            }
        }
        return v;
    }

    // unsigned int8
    _readUChar(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len));
        this._bufferPos += len;
        let v=undefined;
        if (len==1) {
            v=tempBuff.getUint8(0, this._swapEndian);
        } else {
            v=new Uint8Array(len);
            for (let i=0; i < len; i++) {
                v[i]=tempBuff.getUint8(i, this._swapEndian);
            }
        }
        return v;
    }

    // float32
    _readFloat(len=1) {
        let tempBuff=new DataView(this._buffer.slice(this._bufferPos, this._bufferPos+len*4));
        this._bufferPos += len*4;
        let v=undefined;
        if (len==1) {
            v=tempBuff.getFloat32(0, this._swapEndian);
        } else {
            v=new Float32Array(len);
            for (let i=0; i < len; i++) {
                v[i]=tempBuff.getFloat32(i*4, this._swapEndian);
            }
        }
        return v;
    }

    _tagReadStart() {
        if (this._bufferPos >= this._buffer.byteLength) {
            return [undefined, undefined];
        }
        let tagType=this._readInt();
        let tagLen=undefined;
        switch (tagType) {
            case ParsersMgh.TAG_OLD_MGH_XFORM:
                tagLen=this._readInt();
                tagLen-=1;
                break;
            case ParsersMgh.TAG_OLD_SURF_GEOM:
            case ParsersMgh.TAG_OLD_USEREALRAS:
            case ParsersMgh.TAG_OLD_COLORTABLE:
                tagLen=0;
                break;
            default:
                tagLen=this._readLong();
        }
        if (tagLen==undefined) {
            tagType=undefined;
        }
        return [tagType, tagLen];
    }
}

// https://github.com/freesurfer/freesurfer/
// See include/mri.h
ParsersMgh.MRI_UCHAR = 0;
ParsersMgh.MRI_INT = 1;
ParsersMgh.MRI_LONG = 2;
ParsersMgh.MRI_FLOAT = 3;
ParsersMgh.MRI_SHORT = 4;
ParsersMgh.MRI_BITMAP = 5;
ParsersMgh.MRI_TENSOR = 6;
ParsersMgh.MRI_FLOAT_COMPLEX = 7;
ParsersMgh.MRI_DOUBLE_COMPLEX = 8;
ParsersMgh.MRI_RGB = 9;

// https://github.com/freesurfer/freesurfer/
// See include/tags.h
ParsersMgh.TAG_OLD_COLORTABLE = 1;
ParsersMgh.TAG_OLD_USEREALRAS = 2;
ParsersMgh.TAG_CMDLINE = 3;
ParsersMgh.TAG_USEREALRAS = 4;
ParsersMgh.TAG_COLORTABLE = 5;
ParsersMgh.TAG_GCAMORPH_GEOM = 10;
ParsersMgh.TAG_GCAMORPH_TYPE = 11;
ParsersMgh.TAG_GCAMORPH_LABELS = 12;
ParsersMgh.TAG_OLD_SURF_GEOM = 20;
ParsersMgh.TAG_SURF_GEOM = 21;
ParsersMgh.TAG_OLD_MGH_XFORM = 30;
ParsersMgh.TAG_MGH_XFORM = 31;
ParsersMgh.TAG_GROUP_AVG_SURFACE_AREA = 32;
ParsersMgh.TAG_AUTO_ALIGN = 33;
ParsersMgh.TAG_SCALAR_DOUBLE = 40;
ParsersMgh.TAG_PEDIR = 41;
ParsersMgh.TAG_MRI_FRAME = 42;
ParsersMgh.TAG_FIELDSTRENGTH = 43;
