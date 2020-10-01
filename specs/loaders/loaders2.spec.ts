import Loader2 from '../../src/loaders/loaders2';

describe('Worker Loader', () => {
  const sourceUrl = '/base/data/dicom/adi_slice.dcm';

  describe('Loading a file', () => {
    it('should receive all events ordered', async () => {
      const startMessage = 'start';
      const fetchMessages = ['fetchstart', 'fetchprogress', 'fetch', 'fetchend'];
      const parseMessages = ['parsestart', 'parse', 'parseend'];
      const endMessage = 'end';
      const expectedSequence = [startMessage, ...fetchMessages, ...parseMessages, endMessage];

      const results = [] as string[];

      const loader = new Loader2();
      loader.addEventListener('start', () => results.push('start'));
      loader.addEventListener('end', () => results.push('end'));
    
      loader.addEventListener('fetchstart', () => results.push('fetchstart'));
      loader.addEventListener('fetchend', () => results.push('fetchend'))
      loader.addEventListener('fetch', () => results.push('fetch'))
      loader.addEventListener('fetchprogress', () => !results.includes('fetchprogress') ? results.push('fetchprogress') : null);

      loader.addEventListener('parsestart', () => results.push('parsestart'));
      loader.addEventListener('parseend', () => results.push('parseend'))
      loader.addEventListener('parse', () => results.push('parse'))

      await loader.loadInstance({file: sourceUrl});

      expect(results.join()).toEqual(expectedSequence.join());

    });

    it('should receive fetch progress', async () => {
      const loader = new Loader2();
      let loaded = 0;

      loader.addEventListener('fetchprogress', (event) => {
        loaded = event.loaded;
      });

      await loader.loadInstance({file: sourceUrl});

      expect(loaded).toBeGreaterThan(0);
    });

    it('should error gracefully', async () => {
      const loader = new Loader2();

      let serverError = false;
      let rejectPromise = false;
      loader.addEventListener('fetcherror', (event) => {
        serverError = true;
      });

      await loader.loadInstance({file: 'incorrect URL'}).catch(() => rejectPromise = true);

      expect(serverError).toBeTruthy();
      expect(rejectPromise).toBeTruthy();
      
      // test with incorrect data too -> parse error
      // 

      // test with 1 good and 1 bad


    });
  });
});
