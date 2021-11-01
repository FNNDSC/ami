'use strict';
THREE.FreeSurferCurvLoader = function() {};

Object.assign(THREE.FreeSurferCurvLoader.prototype, THREE.EventDispatcher.prototype, {
    constructor: THREE.FreeSurferCurvLoader,

    load: function(url, onLoad, onProgress, onError) {
        let scope = this;
        let xhr = new XMLHttpRequest();
        let settings=THREE.FreeSurferCurvLoader.settings;

        if (typeof(url) != 'string' && !(url instanceof String) ) {
        //Assume this is a settings object with at least a type and surf 
            settings=Object.assign({},THREE.FreeSurferCurvLoader.settings,url);
            url = settings.curv;
        }

        function onloaded(event) {
            if (event.target.status === 200 || event.target.status === 0) {
                let geometry = scope.parse(event.target.response || event.target.responseText,settings);
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

        xhr.addEventListener(
            'progress',
            function(event) {
                scope.dispatchEvent({
                    type: 'progress',
                    loaded: event.loaded,
                    total: event.total,
                });
            },
            false
        );

        xhr.addEventListener(
            'error',
            function() {
                scope.dispatchEvent({
                    type: 'error',
                    message: 'Couldn\'t load URL [' + url + ']',
                });
            },
            false
        );

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

    parse: function(data,settings) {
        let littleEndian = this.littleEndian();
        let reader = new DataView(data);
        let offset = 0;

        function readInt24(offset, littleEndian = false) {
            let v = 0;
            let b1 = reader.getUint8(offset);
            let b2 = reader.getUint8(offset + 1);
            let b3 = reader.getUint8(offset + 2);
            if (littleEndian) {
                v += b3 << 16;
                v += b2 << 8;
                v += b1;
            } else {
                v += b1 << 16;
                v += b2 << 8;
                v += b3;
            }
            return v;
        }

        // check magic bytes
        let surfType = readInt24(0);
        if (surfType > 0xffff00) {
            littleEndian = false;
        } else {
            littleEndian = true;
            surfType = readInt24(0, littleEndian);
        }
        offset += 3;

        let vertCount = 0;
        let faceCount = 0;
        let valsPerVertex = 0;
        let vertArray = [];
        switch (surfType) {
        case THREE.FreeSurferCurvLoader.NEW_VERSION_MAGIC_NUMBER: {
            vertCount = reader.getInt32(offset, littleEndian);
            offset += 4;
            faceCount = reader.getInt32(offset, littleEndian);
            offset += 4;
            valsPerVertex = reader.getInt32(offset, littleEndian);
            offset += 4;

            // Sanity check from FreeSurfer: utils/mrisurf.c
            if (faceCount > 4 * vertCount) {
                throw Error(
                    'file has many more faces (' + faceCount + ') than vertices (' + vertCount+ ')!  Probably trying to use a scalar data file as a surface!'
                );
            }
            if (valsPerVertex != 1) {
                throw Error(
                    'values per vertex is ' + valsPerVertex + 'instead of 1.'
                );
            }
            if (vertCount != settings.geometry.vertices.length) {
                throw Error(
                    'settings.geometry has '+ settings.geometry.vertices.length + ' vertices while curv file has ' + vertCount
                );
            }

            let vMax=-Infinity;
            let vMin=Infinity;
            for (let v = 0; v < vertCount; v++) {
                let vertValue = reader.getFloat32(offset, littleEndian);
                if (vertValue > vMax) {
                    vMax=vertValue;
                }
                if (vertValue < vMin) {
                    vMin = vertValue;
                }
                offset += 4;
                vertArray[v]=vertValue;
            }
            if (settings.maxValue != null) {
                vMax=settings.maxValue;
            }
            if (settings.minValue != null) {
                vMin=settings.minValue;
            }

            let colorMatrix=[];
            let colorDivisions=100;
            if (settings.texture == null) {
                let rStep=(settings.colorMax.r - settings.colorMin.r) / (colorDivisions-1);
                let gStep=(settings.colorMax.g - settings.colorMin.g) / (colorDivisions-1);
                let bStep=(settings.colorMax.b - settings.colorMin.b) / (colorDivisions-1);
                let r=settings.colorMin.r;
                let g=settings.colorMin.g;
                let b=settings.colorMin.b;
                for(let a=0; a < colorDivisions; a++) {
                    colorMatrix.push(new THREE.Color(
                        r+rStep*a,
                        g+gStep*a,
                        b+bStep*a
                    ));
                }
            } else {
                colorDivisions=settings.texture.image.height * settings.texture.image.width;
                for (let a=0; a < settings.texture.image.height; a++) {
                    for (let b=0; b < settings.texture.image.width; b++) {
                        let c = settings.texture.image.getContext('2d').getImageData(b,a,1,1).data;
                        colorMatrix.push(new THREE.Color(
                            c[0]/255,
                            c[1]/255,
                            c[2]/255
                        ));
                    }
                }
            }

            for (let v = 0; v < vertCount; v++) {
                vertArray[v]=Math.round(((vertArray[v]-vMin)/vMax)*(colorDivisions-1));
                //verArray values may be more or less than vMin/vMax....sanity check array.
                if (vertArray[v] < 0) {
                    vertArray[v] = 0;
                }
                if (vertArray[v] > colorDivisions -1) {
                    vertArray[v] = colorDivisions -1;
                }
            }

            for (let f = 0; f < settings.geometry.faces.length; f++) {
                settings.geometry.faces[f].vertexColors=[
                    colorMatrix[vertArray[settings.geometry.faces[f].a]],
                    colorMatrix[vertArray[settings.geometry.faces[f].b]],
                    colorMatrix[vertArray[settings.geometry.faces[f].c]]
                ];
            }
            settings.geometry.elementsNeedUpdate=true;
            break;
        }
        default: {
            throw Error('Unknown FreeSurfer MAGICNUMBER: ' + surfType.toString(16));
        }
        }
        return settings.geometry;
    },
  
});

// From: https://github.com/freesurfer/freesurfer
// utils/mrisurf.c
// the magic number is 3 bytes although this has it listed as 4.
THREE.FreeSurferCurvLoader.NEW_VERSION_MAGIC_NUMBER = -1 & 0x00ffffff;
THREE.FreeSurferCurvLoader.type = 'FreeSurferCurv';
THREE.FreeSurferCurvLoader.settings = {
    //Surface Parser object required fields
    type: THREE.FreeSurferCurvLoader.type,
    surf: null,
    //Curv Parser object required fields
    geometry: null,
    curv: null,
    //Curv Parser object optional fields
    texture: null,
    colorMin: new THREE.Color(0,0,1), //RGB
    colorMax: new THREE.Color(1,0,0), //RGB
    minValue: null,
    maxValue: null,
};
