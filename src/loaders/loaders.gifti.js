'use strict';
THREE.GiftiLoader = function() {};

Object.assign(THREE.GiftiLoader.prototype, THREE.EventDispatcher.prototype, {
    constructor: THREE.GiftiLoader,

    load: function(url, onLoad, onProgress, onError) {
        let scope = this;
        let xhr = new XMLHttpRequest();
        let additionalData=null;


        if (typeof(url) != 'string' && !(url instanceof String) ) {
            //Assume this is a settings object with at least a type and surf 
            additionalData=url;
            url = additionalData.surf;
        }

        function onloaded(event) {
            if (event.target.status === 200 || event.target.status === 0) {
                let geometry = scope.parse(event.target.response || event.target.responseText,additionalData);
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

    decodeData: function(elDom) {
        let rawData = elDom.getElementsByTagName('Data')[0].innerHTML;
        let data = [];
        let vecData = [];
        let nDims=parseInt(elDom.getAttribute('Dimensionality'));
        let dims=[];
        for (let a=0; a < nDims; a++) {
            dims.push(parseInt(elDom.getAttribute('Dim'+a)));
        }
        let numValues=dims.reduce((a,b) => a * b);
      
        switch (elDom.getAttribute('Encoding')) {
        case 'Base64Binary': {
            let le=true;
            if (elDom.getAttribute('Endian') != 'LittleEndian') {
                le=!le;
            }
            //TextEncoder method doesn't work UTF-8 problems
            //rawData=new DataView(new TextEncoder().encode(atob(rawData)).buffer); 
            rawData = Uint8Array.from(atob(rawData), c => c.charCodeAt(0)); 
            rawData = new DataView(rawData.buffer);
              
            switch (elDom.getAttribute('DataType')) {
            case 'NIFTI_TYPE_UINT8': {
                for (let c=0; c < numValues; c++) {
                    vecData.push(rawData.getUint8(c,le));
                }
                break;
            }
            case 'NIFTI_TYPE_INT32': {
                /* expeceted output
                       *     2  10242  10244
                       * 10242   2562  10243
                       */
                for (let c=0; c < numValues; c++) {
                    vecData.push(rawData.getInt32(c*4,le));
                }
                break;
            }
            case 'NIFTI_TYPE_FLOAT32': {
                /* expeceted output
                       * 72.50   49.34  -3.64
                       * 71.65  -50.65  -1.97
                       */
                for (let c=0; c < numValues; c++) {
                    vecData.push(rawData.getFloat32(c*4,le));
                }
                break;
            }
            default: {
                throw Error('Unknown GIFTI DataType: `' + elDom.getAttribute('DataType') +'`');
            }
            }
            break;
        }
        case 'ASCII': {
            //data cleanup. change \n to space
            //change multiple space to single
            //trim
            rawData=rawData.replace(/[\n\r\f\t\v]/g,' ');
            rawData=rawData.replace(/\s{2,}/g,' ');
            rawData=rawData.trim();
            //window.console.log(rawData);

            vecData=rawData.split(/\s/);
            for (let c=0; c < vecData.length; c++) {
                vecData[c]=parseFloat(vecData[c]);
            }
            break;
        }
        default: {
            throw Error('Unknown GIFTI Encoding: `' + elDom.getAttribute('Encoding') +'`');
        }
        }

        if (nDims <= 1) {
            return vecData;
        }

        if (nDims > 2) {
            throw Error('Unable to handle data with more than 2 dimensions.  This dataset has ' + dims.length);
        }

        let cnt=0;
        switch (elDom.getAttribute('ArrayIndexingOrder')) {
        case 'RowMajorOrder': {
            for (let a=0; a<dims[0]; a++)
            {
                data.push([]);
            }
            for (let a=0; a<dims[0]; a++)
            {
                for (let b=0; b<dims[1]; b++)
                {
                    data[a].push(vecData[cnt]);
                    cnt++;
                }
            }
            break;
        }
        case 'ColumnMajorOrder': {
            for (let b=0; b<dims[1]; b++)
            {
                data.push([]);
            }
            for (let b=0; b<dims[1]; b++)
            {
                for (let a=0; a<dims[0]; a++)
                {
                    data[b].push(vecData[cnt]);
                    cnt++;
                }
            }
            break;
        }
        default: {
            throw Error('Unknown GIFTI ArrayIndexingOrder: `' + elDom.getAttribute('ArrayIndexingOrder') +'`');
        }
        }
        return data;
    },

    parse: function(data,additionalData) {
        let geometry = undefined;
        let pointset = undefined;
        let triangles = undefined;
        let XML = new TextDecoder('utf-8').decode(new Uint8Array(data));
        let parser = new DOMParser();
        let xmlDom = parser.parseFromString(XML,'text/xml');
    
        let dataArraysDom = xmlDom.getElementsByTagName('DataArray');
        for (let dax=0; dax < dataArraysDom.length; dax++)
        {
            let daElemDom = dataArraysDom[dax];
            switch (daElemDom.getAttribute('Intent')) {
            case 'NIFTI_INTENT_POINTSET': {
                //window.console.log('Pointset');
                pointset = this.decodeData(daElemDom);
                //window.console.log(pointset);
                break;
            }
            case 'NIFTI_INTENT_TRIANGLE': {
                //window.console.log('Triangle');
                triangles = this.decodeData(daElemDom);
                //window.console.log(triangles);
                break;
            }
            default: {
                throw Error('Unknown GIFTI INTENT: `' + daElemDom.getAttribute('Intent') +'`');
            }
            }
        }

        if (pointset===undefined || triangles===undefined) {
            throw Error('Either POINTSET or TRIANGLES not defined in gifti.  Do not know what to do.');
        }

        geometry = new THREE.Geometry();
        for (let v = 0; v < pointset.length; v++) {
            geometry.vertices.push(new THREE.Vector3(pointset[v][0],pointset[v][1],pointset[v][2]));
        }

        for (let f = 0; f < triangles.length; f++) {
            geometry.faces.push(new THREE.Face3(triangles[f][0],triangles[f][1],triangles[f][2]));
        }

        if (additionalData != null) {
            switch (additionalData.type) {
            case THREE.FreeSurferCurvLoader.type: {
                const fscLoader = new THREE.FreeSurferCurvLoader();
                additionalData.geometry=geometry;
                fscLoader.load(additionalData);
                break;
            }
            default: {
                throw Error('Unknown additional data type: '+ additionalData.type);
            }
            }
        }

        geometry.computeBoundingBox();

        return geometry;
    },
});
