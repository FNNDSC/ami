'use strict';
THREE.FreeSurferLoader = function() {};

Object.assign(THREE.FreeSurferLoader.prototype, THREE.EventDispatcher.prototype, {

    constructor: THREE.FreeSurferLoader,

    load: function(url, onLoad, onProgress, onError) {
        window.console.log(url, onLoad, onProgress, onError);

        let scope = this;
        let xhr = new XMLHttpRequest();

        function onloaded(event) {
            if (event.target.status === 200 || event.target.status === 0) {
                let geometry = scope.parse(event.target.response || event.target.responseText);
                scope.dispatchEvent({
                    type: 'load',
                    content: geometry,
                });
                if (onLoad) {
                    onLoad(geometry);
                }
            } else {
                scope.dispatchEvent({
                    type: 'error',
                    message: 'Couldn\'t load URL [' + url + ']',
                    response: event.target.statusText,
                });
            }
        }

        xhr.addEventListener('load', onloaded, false);

        xhr.addEventListener('progress', function(event) {
            scope.dispatchEvent({
                type: 'progress',
                loaded: event.loaded,
                total: event.total,
            });
        }, false);

        xhr.addEventListener('error', function() {
            scope.dispatchEvent({
                type: 'error',
                message: 'Couldn\'t load URL [' + url + ']',
            });
        }, false);

        if (xhr.overrideMimeType) {
            xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }

        xhr.open('GET', url, true);

        xhr.responseType = 'arraybuffer';

        xhr.send(null);
    },


    littleEndian: function() {
        let buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);

        return new Int16Array(buffer)[0] === 256;
    },

    scan: function(type, chunks, offset, data) {
        window.console.log(type, chunks, offset, data);
    },

    parse: function(data) {
        let littleEndian = this.littleEndian();
        let reader = new DataView(data);
        let offset = 0;
        let surfType = 0;
        let surfDesc = undefined;
        let geometry = undefined;

        window.console.log(this);
        //check magic bytes
        let b1=reader.getUint8(offset); offset++;
        let b2=reader.getUint8(offset); offset++;
        let b3=reader.getUint8(offset); offset++;
        if (b1 == 0xff && b2 == 0xff && b3 < 0xff)
        {
            surfType+=b1 << 16;
            surfType+=b2 << 8;
            surfType+=b3;
            littleEndian=false;
        }
        else if (b1 < 0xff && b2==0xff && b3 == 0xff)
        {
            window.console.log("Endian swap");
            surfType+=b3 << 16;
            surfType+=b2 << 8;
            surfType+=b1;
            littleEndian=true;
        }

        switch (surfType)
        {
            case THREE.FreeSurferLoader.QUAD_FILE_MAGIC_NUMBER:
                throw("Parser not defined for  QUAD_FILE_MAGIC_NUMBER");
            case THREE.FreeSurferLoader.TRIANGLE_FILE_MAGIC_NUMBER:
                //created by text
                while (true)
                {
                    b1=b2;
                    b2=reader.getUint8(offset); offset++;
                    if (b1==10 && b2==10)
                        break;
                }
                let enc = new TextDecoder();
                surfDesc=enc.decode(data.slice(3,offset-1));
                let vertCount=reader.getInt32(offset,littleEndian); offset+=4;
                let faceCount=reader.getInt32(offset,littleEndian); offset+=4;
                window.console.log("VertCount="+vertCount+"; FaceCount="+faceCount);
                
                geometry = new THREE.Geometry();
                for (let v=0; v < vertCount; v++)
                {
                    if (false) //Use original, unmodified vectors (MGH _readType 2)
                    {
                        geometry.vertices.push(
                            new THREE.Vector3(reader.getFloat32(offset +  0,littleEndian),  reader.getFloat32(offset +  4,littleEndian), reader.getFloat32(offset +  8,littleEndian) )
                        );
                    }
                    else
                    {
                        geometry.vertices.push(
                            new THREE.Vector3(reader.getFloat32(offset +  0,littleEndian) * -1,  reader.getFloat32(offset +  4,littleEndian) * -1, reader.getFloat32(offset +  8,littleEndian) )
                        );
                    }
                    offset+=12;
                }
                
                for (let f=0; f < faceCount; f++)
                {
                    geometry.faces.push( new THREE.Face3( reader.getInt32(offset + 0,littleEndian), reader.getInt32(offset + 4,littleEndian), reader.getInt32(offset + 8,littleEndian) ) );
                    offset+=12;
                }
                geometry.computeBoundingBox();
                break;
            case THREE.FreeSurferLoader.NEW_QUAD_FILE_MAGIC_NUMBER:
                throw("Parser not defined for  NEW_QUAD_FILE_MAGIC_NUMBER");
            default:
                throw("Unknown FreeSurfer MAGICNUMBER: " + surfType.toString(16));
        }
        return geometry;



    },

});

//From: https://github.com/freesurfer/freesurfer
//  utils/mrisurf.c
//  the magic number is 3 bytes although this has it listed as 4.
THREE.FreeSurferLoader.QUAD_FILE_MAGIC_NUMBER     = -1 & 0x00ffffff;
THREE.FreeSurferLoader.TRIANGLE_FILE_MAGIC_NUMBER = -2 & 0x00ffffff;
THREE.FreeSurferLoader.NEW_QUAD_FILE_MAGIC_NUMBER = -3 & 0x00ffffff;
