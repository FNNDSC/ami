'use strict';
THREE.FreeSurferLoader = function() {};

Object.assign(THREE.FreeSurferLoader.prototype, THREE.EventDispatcher.prototype, {

    constructor: THREE.FreeSurferLoader,

    load: function(url, onLoad, onProgress, onError) {
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

    parse: function(data) {
        let littleEndian = this.littleEndian();
        let reader = new DataView(data);
        let offset = 0;
        let surfDesc = undefined;
        let geometry = undefined;

        function readInt24(offset, littleEndian=false) {
            let v = 0;
            let b1=reader.getUint8(offset);
            let b2=reader.getUint8(offset+1);
            let b3=reader.getUint8(offset+2);
            if (littleEndian) {
                v+=b3 << 16;
                v+=b2 << 8;
                v+=b1;
            } else {
                v+=b1 << 16;
                v+=b2 << 8;
                v+=b3;
            }
            return v;
        }

        // check magic bytes
        let surfType = readInt24(0);
        if (surfType > 0xffff00) {
            littleEndian=false;
        } else {
            littleEndian=true;
            surfType = readInt24(0, littleEndian);
        }
        offset+=3;

        let vertCount=0;
        let faceCount=0;
        switch (surfType) {
            case THREE.FreeSurferLoader.QUAD_FILE_MAGIC_NUMBER: {
                vertCount=readInt24(offset, littleEndian);
                offset+=3;
                faceCount=readInt24(offset, littleEndian);
                offset+=3;

                // Sanity check from FreeSurfer: utils/mrisurf.c
                if (faceCount > 4 * vertCount) {
                    throw Error('file has many more faces than vertices!  Probably trying to use a scalar data file as a surface!');
                }

                geometry = new THREE.Geometry();
                for (let v=0; v < vertCount; v++) {
                    geometry.vertices.push(
                        new THREE.Vector3(reader.getInt16(offset + 0, littleEndian) / 100, reader.getInt16(offset + 2, littleEndian) / 100, reader.getInt16(offset + 4, littleEndian) / 100)
                    );
                    offset+=6;
                }

                for (let f=0; f < faceCount; f++) {
                    // THREE.Face4 doesn't exist anymore
                    // using recommendation from
                    // https://stackoverflow.com/questions/46132689/how-to-fix-face4-to-face3
                    let v1=readInt24(offset + 0, littleEndian);
                    let v2=readInt24(offset + 3, littleEndian);
                    let v3=readInt24(offset + 6, littleEndian);
                    let v4=readInt24(offset + 9, littleEndian);
                    offset+=12;
                    geometry.faces.push(new THREE.Face3(v1, v2, v3));
                    geometry.faces.push(new THREE.Face3(v1, v3, v4));
                }
                geometry.computeBoundingBox();
                break;
            }
            case THREE.FreeSurferLoader.TRIANGLE_FILE_MAGIC_NUMBER: {
                // the "created by text"
                let b1=0;
                let b2=0;
                while (b1 != 10 && b2 != 10) {
                    b1=b2;
                    b2=reader.getUint8(offset); offset++;
                }
                let enc = new TextDecoder();
                surfDesc=enc.decode(data.slice(3, offset-1));
                offset++;
                vertCount=reader.getInt32(offset, littleEndian);
                offset+=4;
                faceCount=reader.getInt32(offset, littleEndian);
                offset+=4;

                geometry = new THREE.Geometry();
                for (let v=0; v < vertCount; v++) {
                    geometry.vertices.push(
                        new THREE.Vector3(reader.getFloat32(offset + 0, littleEndian), reader.getFloat32(offset + 4, littleEndian), reader.getFloat32(offset + 8, littleEndian))
                    );
                    offset+=12;
                }

                for (let f=0; f < faceCount; f++) {
                    geometry.faces.push(new THREE.Face3(reader.getInt32(offset + 0, littleEndian), reader.getInt32(offset + 4, littleEndian), reader.getInt32(offset + 8, littleEndian)));
                    offset+=12;
                }
                geometry.computeBoundingBox();
                break;
            }
            case THREE.FreeSurferLoader.NEW_QUAD_FILE_MAGIC_NUMBER: {
                throw Error('Parser not defined for  NEW_QUAD_FILE_MAGIC_NUMBER');
            }
            default: {
                throw Error('Unknown FreeSurfer MAGICNUMBER: ' + surfType.toString(16));
            }
        }
        return geometry;
    },
});

// From: https://github.com/freesurfer/freesurfer
// utils/mrisurf.c
// the magic number is 3 bytes although this has it listed as 4.
THREE.FreeSurferLoader.QUAD_FILE_MAGIC_NUMBER = -1 & 0x00ffffff;
THREE.FreeSurferLoader.TRIANGLE_FILE_MAGIC_NUMBER = -2 & 0x00ffffff;
THREE.FreeSurferLoader.NEW_QUAD_FILE_MAGIC_NUMBER = -3 & 0x00ffffff;
