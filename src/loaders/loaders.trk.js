'use strict';

THREE.TRKLoader = function() {};

Object.assign(THREE.TRKLoader.prototype, THREE.EventDispatcher.prototype, {

    constructor: THREE.TRKLoader,

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

        // String.fromCharCode
        // str.charCodeAt(position)

        // ////////////////////////////////////////////
        //
        // parse all trk header
        // http://msdn.microsoft.com/en-us/library/s3f49ktz.aspx
        //
        // ////////////////////////////////////////////

        let offset = 0;
        let header = {};

        // id_string[6]
        // char
        // 6
        // ID string for track file. The first 5 characters must be "TRACK".
        header.ID_STRING = [];
        for (let i = 0; i < 6; i++) {
            header.ID_STRING.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }

        // dim[3]
        // short int
        // 6
        // Dimension of the image volume.
        header.dim = [];
        for (let q = 0; q < 3; q++) {
            header.dim.push(reader.getInt16(offset, littleEndian));
            offset += 2;
        }

        // voxel_size[3]
        // float
        // 12
        // Voxel size of the image volume.
        header.VOXEL_SIZE = [];
        for (let r = 0; r < 3; r++) {
            header.VOXEL_SIZE.push(reader.getFloat32(offset, littleEndian));
            offset += 4;
        }
        // origin[3]
        // float
        // 12
        // Origin of the image volume. This field is not yet being used by TrackVis. That means the origin is always (0, 0, 0).
        header.origin = [];
        for (let s = 0; s < 3; s++) {
            header.origin.push(reader.getFloat32(offset, littleEndian));
            offset += 4;
        }

        // n_scalars
        // short int
        // 2
        // Number of scalars saved at each track point (besides x, y and z coordinates).
        header.N_SCALARS = [];
        for (let t = 0; t < 1; t++) {
            header.N_SCALARS.push(reader.getInt16(offset, littleEndian));
            offset += 2;
        }

        //  scalar_name[10][20]
        //  char
        //  200
        //  Name of each scalar. Can not be longer than 20 characters each. Can only store up to 10 names.
        header.SCALAR_NAME = [];
        for (let u = 0; u < 10; u++) {
            header.SCALAR_NAME.push([]);
            for (let v = 0; v < 20; v++) {
                header.SCALAR_NAME[u].push(String.fromCharCode(reader.getUint8(offset)));
                offset++;
            }
        }

        // n_propertiess
        // short int
        // 2
        // Number of properties saved at each track.
        header.N_PROPERTIES = [];
        for (let x = 0; x < 1; x++) {
            header.N_PROPERTIES.push(reader.getInt16(offset, littleEndian));
            offset += 2;
        }

        //  scalar_name[10][20]
        //  char
        //  200
        //  Name of each scalar. Can not be longer than 20 characters each. Can only store up to 10 names.
        header.PROPERTY_NAME = [];
        for (let y = 0; y < 10; y++) {
            header.PROPERTY_NAME.push([]);
            for (let z = 0; z < 20; z++) {
                header.PROPERTY_NAME[y].push(String.fromCharCode(reader.getUint8(offset)));
                offset++;
            }
        }

        // vox_to_ras[4][4]
        // float
        // 64
        // 4x4 matrix for voxel to RAS (crs to xyz) transformation. If vox_to_ras[3][3] is 0, it means the matrix is not recorded. This field is added from version 2.
        header.VOX_TO_RAS = [];
        for (let a = 0; a < 4; a++) {
            header.VOX_TO_RAS.push([]);
            for (let b = 0; b < 4; b++) {
                header.VOX_TO_RAS[a].push(reader.getFloat32(offset));
                offset += 4;
            }
        }

        // reserved[444]
        // char
        // 444
        // Reserved space for future version.
        offset += 444;

        // voxel_order[4]
        // char
        // 4
        // Storing order of the original image data.
        header.VOXEL_ORDER = [];
        for (let c = 0; c < 4; c++) {
            header.VOXEL_ORDER.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }

        // pad2[4]
        // char
        // 4
        // Paddings.
        header.pad2 = [];
        for (let d = 0; d < 4; d++) {
            header.pad2.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }

        // image_orientation_patient[6]
        // float
        // 24
        // Image orientation of the original image. As defined in the DICOM header.
        header.IMAGE_ORIENTATION_PATIENT = [];
        for (let e = 0; e < 6; e++) {
            header.IMAGE_ORIENTATION_PATIENT.push(reader.getFloat32(offset, littleEndian));
            offset += 4;
        }

        // pad1[2]
        // char
        // 2
        // Paddings.
        header.pad1 = [];
        for (let f = 0; f < 2; f++) {
            header.pad2.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }

        // invert_x, invert_y, invert_z, swap_xy, swap_yz, swap_zx
        // unsigned_char
        // 1
        // Inversion/rotation flags used to generate this track file. For internal use only.
        header.INVERT_X = [];
        for (let g = 0; g < 1; g++) {
            header.INVERT_X.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }
        header.INVERT_Y = [];
        for (let h = 0; h < 1; h++) {
            header.INVERT_Y.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }
        header.INVERT_Z = [];
        for (let ii = 0; ii < 1; ii++) {
            header.INVERT_Z.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }
        header.SWAP_XY = [];
        for (let ij = 0; ij < 1; ij++) {
            header.SWAP_XY.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }
        header.SWAP_YZ = [];
        for (let ik = 0; ik < 1; ik++) {
            header.SWAP_YZ.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }
        header.SWAP_ZX = [];
        for (let il = 0; il < 1; il++) {
            header.SWAP_ZX.push(String.fromCharCode(reader.getUint8(offset)));
            offset++;
        }

        // n_count
        // int
        // 4
        // Number of tracks stored in this track file. 0 means the number was NOT stored.
        header.N_COUNT = [];
        for (let im = 0; im < 1; im++) {
            header.N_COUNT.push(reader.getUint32(offset, littleEndian));
            offset += 4;
        }

        // version
        // int
        // 4
        // Version number. Current version is 2.
        header.version = [];
        for (let io = 0; io < 1; io++) {
            header.version.push(reader.getUint32(offset, littleEndian));
            offset += 4;
        }

        // hdr_size
        // int
        // 4
        // Size of the header. Used to determine byte swap. Should be 1000.
        header.HDR_SIZE = [];
        for (let ip = 0; ip < 1; ip++) {
            header.HDR_SIZE.push(reader.getUint32(offset, littleEndian));
            offset += 4;
        }

        window.console.log(header);

        // /////////////////////////////////////
        //
        // parse the tracts now...!
        //
        // ////////////////////////////////////

        // we should also store each track length

        // get the number of points in this track
        let tracks = [];

        while (offset < reader.byteLength) {
            let nbPoints = -1;
            nbPoints = reader.getUint32(offset, littleEndian);
            offset += 4;

            let track = {
                'points': [],
                'scalars': [],
                'properties': [],
                'geometry': new THREE.Geometry(),
                'xProperties': {},
            };

            let length = 0;

            for (let k = 0; k < nbPoints; k++) {
                // first 3 floats are the coordinates
                track.points[k] = [];
                track.points[k].push(reader.getFloat32(offset, littleEndian));
                offset += 4;
                track.points[k].push(reader.getFloat32(offset, littleEndian));
                offset += 4;
                track.points[k].push(reader.getFloat32(offset, littleEndian));
                offset += 4;

                // add geometry
                //
                track.geometry.vertices.push(new THREE.Vector3(track.points[k][0], track.points[k][1], track.points[k][2]));

                // then the scalars
                track.scalars[k] = [];
                for (let l = 0; l < header.N_SCALARS[0]; l++) {
                    track.scalars[k][l] = [];
                    track.scalars[k][l].push(reader.getFloat32(offset, littleEndian));
                    offset += 4;
                    track.scalars[k][l].push(reader.getFloat32(offset, littleEndian));
                    offset += 4;
                    track.scalars[k][l].push(reader.getFloat32(offset, littleEndian));
                    offset += 4;
                }

                if (k !== 0) {
                    // get previous and current points
                    let prev = track.points[k - 1];
                    let cur = track.points[k];
                    let xDist = cur[0] - prev[0];
                    let yDist = cur[1] - prev[1];
                    let zDist = cur[2] - prev[2];
                    // get distance
                    let distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
                    // add add to length
                    length += distance;
                }
            }

            track.xProperties.length = length;

            for (let p = 0; p < nbPoints; p++) {
                // get previous point if any
                let first = track.points[0];
                if (p > 1) {
                    first = track.points[p - 1];
                }

                // get next point if any
                let last = track.points[nbPoints - 1];
                if (p < nbPoints - 2) {
                    last = track.points[p + 1];
                }

                let diff = [Math.abs(last[0] - first[0]),
                    Math.abs(last[1] - first[1]),
                    Math.abs(last[2] - first[2]),
                ];

                let colordistance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2]);
                diff[0] /= colordistance;
                diff[1] /= colordistance;
                diff[2] /= colordistance;

                track.geometry.colors.push(new THREE.Color(diff[0], diff[1], diff[2]));
            }

            // get the property of this track
            for (let o = 0; o < header.N_PROPERTIES[0]; o++) {
                track.properties[o] = [];
                track.properties[o].push(reader.getFloat32(offset, littleEndian));
                offset += 4;
                track.properties[o].push(reader.getFloat32(offset, littleEndian));
                offset += 4;
                track.properties[o].push(reader.getFloat32(offset, littleEndian));
                offset += 4;
            }

            tracks.push(track);
        }


        return tracks;
    },
});
