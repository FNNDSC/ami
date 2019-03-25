import { File } from './loaders2';

const ctx: Worker = self as any;

// setup xhr request with all listeners
const request = new XMLHttpRequest();
request.addEventListener('loadstart', () => {
    ctx.postMessage({type: 'fetchstart'});
});
request.addEventListener('load', () => {
    const arrayBuffer = request.response;
    if (request.readyState === 4 && request.status === 200 && arrayBuffer) {
        ctx.postMessage({type: 'fetch', arrayBuffer}, [arrayBuffer]);
    } else {
      // server error retrieveing data
      ctx.postMessage({type: 'fetcherror'});
    }
});
request.addEventListener('loadend', () => {
    ctx.postMessage({type: 'fetchend'});
});
request.addEventListener('progress', (event) => {
    ctx.postMessage({type: 'fetchprogress', loaded: event.loaded, total: event.total});
});
request.addEventListener('error', () => {
    // network error
    ctx.postMessage({type: 'fetcherror'});
});
request.addEventListener('abort', () => {
    ctx.postMessage({type: 'fetchabort'});
});

ctx.onmessage = (message) => {
    switch(message.data.type) {
      case 'fetchstart':
        const file = message.data.file as string;
        request.open('GET', file);
        request.responseType = 'arraybuffer';
        request.send();
        break;
      case 'end':
        ctx.postMessage({type: 'end'});
        break;
      default:
        break;
    }
};

export default {} as typeof Worker & {new (): Worker};