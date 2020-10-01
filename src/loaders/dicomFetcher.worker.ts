import ParsersDicom from '../parsers/parsers.dicom';

const ctx: Worker = self as any;

// setup xhr request with all listeners
const request = new XMLHttpRequest();
request.addEventListener('load', () => {
  const arrayBuffer = request.response;
  if (request.readyState === 4 && request.status === 200 && arrayBuffer) {
      // ctx.postMessage({type: 'fetch', arrayBuffer}, [arrayBuffer]);
      const volumeParser = new ParsersDicom({buffer: arrayBuffer}, 0);
      // get all the series / stack / frame information for this file
      // return it as a string
      // const rawHeader = volumeParser.rawHeader()
      
      // series;
      // seriesDescription obj?
      const seriesInformation = {} as any;
      // seriesInformation.rawHeader = volumeParser.rawHeader();
      // global information
      seriesInformation.seriesInstanceUID = volumeParser.seriesInstanceUID();
      seriesInformation.transferSyntaxUID = volumeParser.transferSyntaxUID();
      seriesInformation.seriesDate = volumeParser.seriesDate();
      seriesInformation.seriesDescription = volumeParser.seriesDescription();
      seriesInformation.studyDate = volumeParser.studyDate();
      seriesInformation.studyDescription = volumeParser.studyDescription();
      seriesInformation.numberOfFrames = volumeParser.numberOfFrames();
      if (!seriesInformation.numberOfFrames) {
        seriesInformation.numberOfFrames = 1;
      }
      seriesInformation.numberOfChannels = volumeParser.numberOfChannels();
      seriesInformation.modality = volumeParser.modality();
      // if it is a DICOM segmentation, attach extra information
      if (seriesInformation.modality === 'SEG') {
        seriesInformation.segmentationType = volumeParser.segmentationType();
        seriesInformation.segmentationSegments = volumeParser.segmentationSegments();
      }
      // patient information
      seriesInformation.patientID = volumeParser.patientID();
      seriesInformation.patientName = volumeParser.patientName();
      seriesInformation.patientAge = volumeParser.patientAge();
      seriesInformation.patientBirthdate = volumeParser.patientBirthdate();
      seriesInformation.patientSex = volumeParser.patientSex();

      const stackInformation = {} as any;
      stackInformation.numberOfChannels = volumeParser.numberOfChannels();
      stackInformation.pixelRepresentation = volumeParser.pixelRepresentation();
      stackInformation.pixelType = volumeParser.pixelType();
      stackInformation.invert = volumeParser.invert();
      stackInformation.spacingBetweenSlices = volumeParser.spacingBetweenSlices();
      stackInformation.modality = seriesInformation.modality;
      // if it is a DICOM segmentation, attach extra information
      if (stackInformation.modality === 'SEG') {
        stackInformation.segmentationType = seriesInformation.segmentationType;
        stackInformation.segmentationSegments = seriesInformation.segmentationSegments;
      }

      // parse all frames from file
      const framesInformation  = [] as any;
      const framesPixelDataBuffer  = [] as ArrayBuffer[];
      const framesPixelData  = [] as any[];

      for (let i = 0; i < seriesInformation.numberOfFrames; i++) {
          const frameInformation = {} as any;
          frameInformation.sopInstanceUID = volumeParser.sopInstanceUID(i);
          frameInformation.url = 'filename not set';
          frameInformation.index = i;
          frameInformation.invert = stackInformation.invert;
          frameInformation.frameTime = volumeParser.frameTime(i);
          frameInformation.ultrasoundRegions = volumeParser.ultrasoundRegions(i);
          frameInformation.rows = volumeParser.rows(i);
          frameInformation.columns = volumeParser.columns(i);
          frameInformation.numberOfChannels = stackInformation.numberOfChannels;
          frameInformation.pixelPaddingValue = volumeParser.pixelPaddingValue(i);
          frameInformation.pixelRepresentation = stackInformation.pixelRepresentation;
          frameInformation.pixelType = stackInformation.pixelType;
          frameInformation.pixelSpacing = volumeParser.pixelSpacing(i);
          frameInformation.spacingBetweenSlices = volumeParser.spacingBetweenSlices(i);
          frameInformation.sliceThickness = volumeParser.sliceThickness(i);
          frameInformation.imageOrientation = volumeParser.imageOrientation(i);
          frameInformation.rightHanded = volumeParser.rightHanded();
          stackInformation.rightHanded = frameInformation.rightHanded;
          if (frameInformation.imageOrientation === null) {
              frameInformation.imageOrientation = [1, 0, 0, 0, 1, 0];
          }
          frameInformation.imagePosition = volumeParser.imagePosition(i);
          frameInformation.dimensionIndexValues = volumeParser.dimensionIndexValues(i);
          frameInformation.bitsAllocated = volumeParser.bitsAllocated(i);
          frameInformation.instanceNumber = volumeParser.instanceNumber(i);
          frameInformation.windowCenter = volumeParser.windowCenter(i);
          frameInformation.windowWidth = volumeParser.windowWidth(i);
          frameInformation.rescaleSlope = volumeParser.rescaleSlope(i);
          frameInformation.rescaleIntercept = volumeParser.rescaleIntercept(i);
          // should pass frame index for consistency...
          const pixelData = volumeParser.extractPixelData(i);
          frameInformation.minMax = volumeParser.minMaxPixelData(pixelData);
          frameInformation.byteOffset = 0 + pixelData.byteOffset;
          frameInformation.byteLength = 0 + pixelData.byteLength;

          // if series.mo
          if (seriesInformation.modality === 'SEG') {
              frameInformation.referencedSegmentNumber = volumeParser.referencedSegmentNumber(i);
          }

          framesInformation.push(frameInformation);
          framesPixelData.push(pixelData);
          framesPixelDataBuffer.push(pixelData.buffer);
      }

      ctx.postMessage({type: 'parse', framesInformation, seriesInformation, stackInformation, framesPixelData}, framesPixelDataBuffer);
      ctx.postMessage({type: 'parseend'});
  } else {
    // server error retrieveing data
    ctx.postMessage({type: 'fetcherror'});
  }
});

ctx.onmessage = (message) => {
    switch(message.data.type) {
      case 'fetchstart':
        const file = message.data.file as string;
        request.open('GET', file);
        request.responseType = 'arraybuffer';
        request.send();
        break;
      case 'parsestart':
            // const volumeParser = new ParsersDicom({buffer: message.data.arrayBuffer}, 0);
            // // get all the series / stack / frame information for this file
            // // return it as a string
            // // const rawHeader = volumeParser.rawHeader()
            
            // // series;
            // // seriesDescription obj?
            // const seriesInformation = {} as any;
            // // seriesInformation.rawHeader = volumeParser.rawHeader();
            // // global information
            // seriesInformation.seriesInstanceUID = volumeParser.seriesInstanceUID();
            // seriesInformation.transferSyntaxUID = volumeParser.transferSyntaxUID();
            // seriesInformation.seriesDate = volumeParser.seriesDate();
            // seriesInformation.seriesDescription = volumeParser.seriesDescription();
            // seriesInformation.studyDate = volumeParser.studyDate();
            // seriesInformation.studyDescription = volumeParser.studyDescription();
            // seriesInformation.numberOfFrames = volumeParser.numberOfFrames();
            // if (!seriesInformation.numberOfFrames) {
            //   seriesInformation.numberOfFrames = 1;
            // }
            // seriesInformation.numberOfChannels = volumeParser.numberOfChannels();
            // seriesInformation.modality = volumeParser.modality();
            // // if it is a DICOM segmentation, attach extra information
            // if (seriesInformation.modality === 'SEG') {
            //   seriesInformation.segmentationType = volumeParser.segmentationType();
            //   seriesInformation.segmentationSegments = volumeParser.segmentationSegments();
            // }
            // // patient information
            // seriesInformation.patientID = volumeParser.patientID();
            // seriesInformation.patientName = volumeParser.patientName();
            // seriesInformation.patientAge = volumeParser.patientAge();
            // seriesInformation.patientBirthdate = volumeParser.patientBirthdate();
            // seriesInformation.patientSex = volumeParser.patientSex();
    
            // const stackInformation = {} as any;
            // stackInformation.numberOfChannels = volumeParser.numberOfChannels();
            // stackInformation.pixelRepresentation = volumeParser.pixelRepresentation();
            // stackInformation.pixelType = volumeParser.pixelType();
            // stackInformation.invert = volumeParser.invert();
            // stackInformation.spacingBetweenSlices = volumeParser.spacingBetweenSlices();
            // stackInformation.modality = seriesInformation.modality;
            // // if it is a DICOM segmentation, attach extra information
            // if (stackInformation.modality === 'SEG') {
            //   stackInformation.segmentationType = seriesInformation.segmentationType;
            //   stackInformation.segmentationSegments = seriesInformation.segmentationSegments;
            // }

            // // parse all frames from file
            // const framesInformation  = [] as any;
            // const framesPixelDataBuffer  = [] as ArrayBuffer[];
            // const framesPixelData  = [] as any[];

            // for (let i = 0; i < seriesInformation.numberOfFrames; i++) {
            //     const frameInformation = {} as any;
            //     frameInformation.sopInstanceUID = volumeParser.sopInstanceUID(i);
            //     frameInformation.url = 'filename not set';
            //     frameInformation.index = i;
            //     frameInformation.invert = stackInformation.invert;
            //     frameInformation.frameTime = volumeParser.frameTime(i);
            //     frameInformation.ultrasoundRegions = volumeParser.ultrasoundRegions(i);
            //     frameInformation.rows = volumeParser.rows(i);
            //     frameInformation.columns = volumeParser.columns(i);
            //     frameInformation.numberOfChannels = stackInformation.numberOfChannels;
            //     frameInformation.pixelPaddingValue = volumeParser.pixelPaddingValue(i);
            //     frameInformation.pixelRepresentation = stackInformation.pixelRepresentation;
            //     frameInformation.pixelType = stackInformation.pixelType;
            //     frameInformation.pixelSpacing = volumeParser.pixelSpacing(i);
            //     frameInformation.spacingBetweenSlices = volumeParser.spacingBetweenSlices(i);
            //     frameInformation.sliceThickness = volumeParser.sliceThickness(i);
            //     frameInformation.imageOrientation = volumeParser.imageOrientation(i);
            //     frameInformation.rightHanded = volumeParser.rightHanded();
            //     stackInformation.rightHanded = frameInformation.rightHanded;
            //     if (frameInformation.imageOrientation === null) {
            //         frameInformation.imageOrientation = [1, 0, 0, 0, 1, 0];
            //     }
            //     frameInformation.imagePosition = volumeParser.imagePosition(i);
            //     frameInformation.dimensionIndexValues = volumeParser.dimensionIndexValues(i);
            //     frameInformation.bitsAllocated = volumeParser.bitsAllocated(i);
            //     frameInformation.instanceNumber = volumeParser.instanceNumber(i);
            //     frameInformation.windowCenter = volumeParser.windowCenter(i);
            //     frameInformation.windowWidth = volumeParser.windowWidth(i);
            //     frameInformation.rescaleSlope = volumeParser.rescaleSlope(i);
            //     frameInformation.rescaleIntercept = volumeParser.rescaleIntercept(i);
            //     // should pass frame index for consistency...
            //     const pixelData = volumeParser.extractPixelData(i);
            //     frameInformation.minMax = volumeParser.minMaxPixelData(pixelData);
            //     frameInformation.byteOffset = 0 + pixelData.byteOffset;
            //     frameInformation.byteLength = 0 + pixelData.byteLength;

            //     // if series.mo
            //     if (seriesInformation.modality === 'SEG') {
            //         frameInformation.referencedSegmentNumber = volumeParser.referencedSegmentNumber(i);
            //     }

            //     framesInformation.push(frameInformation);
            //     framesPixelData.push(pixelData);
            //     framesPixelDataBuffer.push(pixelData.buffer);
            // }
  
            // ctx.postMessage({type: 'parse', framesInformation: JSON.stringify(framesInformation), seriesInformation: JSON.stringify(seriesInformation), stackInformation: JSON.stringify(stackInformation), framesPixelData}, framesPixelDataBuffer);
            // ctx.postMessage({type: 'parseend'});
        break;
        default:
        break;
    }
};

export default {} as typeof Worker & {new (): Worker};