import CoreUtils from '../core/core.utils';

/**
 * Event Based progressbar
 * @module helpers/progressBar
 *
 * @example
 *
 * let loader = new LoadersVolume();
 * const domContainer = document.getElementById('progressbar');
 * const pb = new HelpersProgressBarEventBased(loader, domContainer);
 */

export default class HelpersProgressBarEventBased {
  constructor(emitter, domTarget) {
    if (!emitter || !this._isFunction(emitter.emit)) {
      window.console.error('please give the this._emitter instance');
      return;
    }

    if (CoreUtils.isString(domTarget)) {
      this._dom = document.getElementById(domTarget);
    } else {
      this._dom = domTarget;
    }

    if (!CoreUtils.isElement(this._dom)) {
      window.console.error('please give the id of container dom or directly a dom instance');
      return;
    }
    this._emitter = emitter;
    this.initContainerDom();
    this.initEventListenner();
    this.loaded = 0;
    this.totalFile = 0;
  }

  _isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
  }

  initEventListenner() {
    const self = this;

    this._emitter.on('load-start', function(event) {
      const totalFiles = event.files.length;
      self.totalFile = totalFiles;
      self._domTotalFile.innerHTML = totalFiles;
    });

    this._emitter.on('fetch-start', function(event) {
      const fetchLi = document.createElement('li');

      const fileTag = document.createElement('div');
      fileTag.innerHTML = 'file: ' + event.file;
      fileTag.style.color = '#ffffff';
      fetchLi.append(fileTag);

      fetchLi.className = 'fetch-file';
      fetchLi.id = 'file-' + event.file;
      fetchLi.style.marginBottom = '7px';
      fetchLi.style.border = '1px solid #ffffff;';
      fetchLi.style.width = '60%';
      const fetchprogress = document.createElement('div');
      fetchprogress.id = 'file-fetch-' + event.file;
      fetchprogress.style.width = '0%';
      fetchLi.append(fetchprogress);
      self._domProcessList.append(fetchLi);
    });

    this._emitter.on('fetch-progress', function(event) {
      const id = 'file-fetch-' + event.file;
      const fileFetchDom = document.getElementById(id);
      fileFetchDom.style.width = (event.loaded / event.total) * 100 + '%';
      fileFetchDom.style.border = '1px solid red';
    });

    this._emitter.on('fetch-success', function(event) {
      // show result
      const liParent = document.getElementById('file-' + event.file);
      const result = document.createElement('div');
      result.id = 'file-result-' + event.file;
      result.innerHTML = 'fetch-success';
      result.style.color = '#ffffff';
      liParent.append(result);
    });

    this._emitter.on('fetch-error', function(event) {
      // console.log(event);
    });

    this._emitter.on('fetch-abort', function(event) {
      // console.log(event);
    });

    this._emitter.on('fetch-end', function(event) {
      // console.log(event);
    });

    this._emitter.on('fetch-timeout', function(event) {
      // console.log(event);
    });

    this._emitter.on('parse-start', function(event) {
      const liParent = document.getElementById('file-' + event.file);
      const parseprogress = document.createElement('div');
      parseprogress.id = 'file-parse-' + event.file;
      parseprogress.style.width = '0%';
      liParent.append(parseprogress);
    });

    this._emitter.on('parsing', function(event) {
      const id = 'file-parse-' + event.file;
      const fileParseDom = document.getElementById(id);
      fileParseDom.style.width = (event.parsed / event.total) * 100 + '%';
      fileParseDom.style.border = '1px solid yellow';
    });

    this._emitter.on('parse-success', function(event) {
      self.loaded += 1;
      self._domCurrentFile.innerHTML = self.loaded;
      self._domCurrentProgress.style.width = (self.loaded / self.totalFile) *
        100 + '%';
      // show result
      const liParent = document.getElementById('file-' + event.file);
      const result = document.createElement('div');
      result.id = 'file-result-' + event.file;
      result.innerHTML = 'parse-success';
      result.style.color = '#ffffff';
      liParent.append(result);
    });
  }

  initContainerDom() {
    const containerDom = `
      <div id="ami-progress-bar-container" style="background-color: rgb(33, 33, 33); color: #ffffff;">
      <div>
      <label for="progress-bar" id="progress-label" style="width: 60%; border: 1px solid #ffffff; text-align: center;">
      <span id="current-file-index">0</span>
      <span id="total-file">0</span>
      </label>
      <div id="progress-bar" style="width: 60%; border: 1px solid #ffffff; text-align: center;">
      <div id="current-progress" style="border: 1px solid red; width: 0%;"></div>
      </div>
      </div>
      <ul id="process-list" style="list-style-type: none; padding: 0; overflow-y: auto;">
      </ul>
      </div>`;
    const wrap = document.createElement('div');
    wrap.innerHTML = containerDom;
    this._dom.append(wrap);
    // dom interface
    this._domCurrentFile = document.getElementById('current-file-index');
    this._domTotalFile = document.getElementById('total-file');
    this._domProcessList = document.getElementById('process-list');
    this._domCurrentProgress = document.getElementById('current-progress');
  }
}
