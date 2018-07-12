/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * @author Patrick Fuller / http://patrick-fuller.com
 * @author Max Smolens / https://github.com/msmolens
 */

const trackballOrtho = (three = window.THREE) => {
  if (three === undefined || three.EventDispatcher === undefined) {
    return null;
  }

  const Constructor = three.EventDispatcher;
  return class extends Constructor {
    constructor(object, domElement, state = {NONE: -1, ROTATE: 1, ZOOM: 2, PAN: 0, SCROLL: 4, TOUCH_ROTATE: 4, TOUCH_ZOOM_PAN: 5}) {
      super();

      let _this = this;
      let STATE = state;
  
      this.object = object;
      this.domElement = (domElement !== undefined) ? domElement : document;
  
      // API
  
      this.enabled = true;
  
      this.screen = {left: 0, top: 0, width: 0, height: 0};
  
      this.radius = 0;
  
      this.zoomSpeed = 1.2;
  
      this.noZoom = false;
      this.noPan = false;
  
      this.staticMoving = false;
      this.dynamicDampingFactor = 0.2;
  
      this.keys = [65 /* A*/, 83 /* S*/, 68];
  
      // internals
  
      this.target = new three.Vector3();
  
      let EPS = 0.000001;
  
      let _changed = true;
  
      let _state = STATE.NONE,
      _prevState = STATE.NONE,
  
      _eye = new three.Vector3(),
  
      _zoomStart = new three.Vector2(),
      _zoomEnd = new three.Vector2(),
  
      _touchZoomDistanceStart = 0,
      _touchZoomDistanceEnd = 0,
  
      _panStart = new three.Vector2(),
      _panEnd = new three.Vector2();
  
      // window level fire after...
  
      // for reset
  
      this.target0 = this.target.clone();
      this.position0 = this.object.position.clone();
      this.up0 = this.object.up.clone();
  
      this.left0 = this.object.left;
      this.right0 = this.object.right;
      this.top0 = this.object.top;
      this.bottom0 = this.object.bottom;
  
      // events
  
      let changeEvent = {type: 'change'};
      let startEvent = {type: 'start'};
      let endEvent = {type: 'end'};
  
      // methods
  
      this.handleResize = function() {
        if (this.domElement === document) {
          this.screen.left = 0;
          this.screen.top = 0;
          this.screen.width = window.innerWidth;
          this.screen.height = window.innerHeight;
        } else {
          let box = this.domElement.getBoundingClientRect();
          // adjustments come from similar code in the jquery offset() function
          let d = this.domElement.ownerDocument.documentElement;
          this.screen.left = box.left + window.pageXOffset - d.clientLeft;
          this.screen.top = box.top + window.pageYOffset - d.clientTop;
          this.screen.width = box.width;
          this.screen.height = box.height;
        }
  
        this.radius = 0.5 * Math.min(this.screen.width, this.screen.height);
  
        this.left0 = this.object.left;
        this.right0 = this.object.right;
        this.top0 = this.object.top;
        this.bottom0 = this.object.bottom;
      };
  
      this.handleEvent = function(event) {
        if (typeof this[event.type] == 'function') {
          this[event.type](event);
        }
      };
  
      let getMouseOnScreen = (function() {
        let vector = new three.Vector2();
  
        return function getMouseOnScreen(pageX, pageY) {
          vector.set(
            (pageX - _this.screen.left) / _this.screen.width,
            (pageY - _this.screen.top) / _this.screen.height
          );
  
          return vector;
        };
      }());
  
      this.zoomCamera = function() {
        if (_state === STATE.TOUCH_ZOOM_PAN) {
          var factor = _touchZoomDistanceEnd / _touchZoomDistanceStart;
          _touchZoomDistanceStart = _touchZoomDistanceEnd;
  
          _this.object.zoom *= factor;
  
          _changed = true;
        } else {
          var factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;
  
          if (Math.abs(factor - 1.0) > EPS && factor > 0.0) {
            _this.object.zoom /= factor;
  
            if (_this.staticMoving) {
              _zoomStart.copy(_zoomEnd);
            } else {
              _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;
            }
  
            _changed = true;
          }
        }
      };
  
      this.panCamera = (function() {
        let mouseChange = new three.Vector2(),
          objectUp = new three.Vector3(),
          pan = new three.Vector3();
  
        return function panCamera() {
          mouseChange.copy(_panEnd).sub(_panStart);
  
          if (mouseChange.lengthSq()) {
            // Scale movement to keep clicked/dragged position under cursor
            let scale_x = (_this.object.right - _this.object.left) / _this.object.zoom;
            let scale_y = (_this.object.top - _this.object.bottom) / _this.object.zoom;
            mouseChange.x *= scale_x;
            mouseChange.y *= scale_y;
  
            pan.copy(_eye).cross(_this.object.up).setLength(mouseChange.x);
            pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));
  
            _this.object.position.add(pan);
            _this.target.add(pan);
  
            if (_this.staticMoving) {
              _panStart.copy(_panEnd);
            } else {
              _panStart.add(mouseChange.subVectors(_panEnd, _panStart).multiplyScalar(_this.dynamicDampingFactor));
            }
  
            _changed = true;
          }
        };
      }());
  
      this.update = function() {
        _eye.subVectors(_this.object.position, _this.target);
  
        if (!_this.noZoom) {
          _this.zoomCamera();
  
          if (_changed) {
            _this.object.updateProjectionMatrix();
          }
        }
  
        if (!_this.noPan) {
          _this.panCamera();
        }
  
        _this.object.position.addVectors(_this.target, _eye);
  
        _this.object.lookAt(_this.target);
  
        if (_changed) {
          _this.dispatchEvent(changeEvent);
  
          _changed = false;
        }
      };
  
      this.reset = function() {
        _state = STATE.NONE;
        _prevState = STATE.NONE;
  
        _this.target.copy(_this.target0);
        _this.object.position.copy(_this.position0);
        _this.object.up.copy(_this.up0);
  
        _eye.subVectors(_this.object.position, _this.target);
  
        _this.object.left = _this.left0;
        _this.object.right = _this.right0;
        _this.object.top = _this.top0;
        _this.object.bottom = _this.bottom0;
  
        _this.object.lookAt(_this.target);
  
        _this.dispatchEvent(changeEvent);
  
        _changed = false;
      };
  
      // listeners
  
      function keydown(event) {
        if (_this.enabled === false) return;
  
        window.removeEventListener('keydown', keydown);
  
        _prevState = _state;
  
        if (_state !== STATE.NONE) {
          return;
        } else if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noRotate) {
          _state = STATE.ROTATE;
        } else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {
          _state = STATE.ZOOM;
        } else if (event.keyCode === _this.keys[STATE.PAN] && !_this.noPan) {
          _state = STATE.PAN;
        }
      }
  
      function keyup(event) {
        if (_this.enabled === false) return;
  
        _state = _prevState;
  
        window.addEventListener('keydown', keydown, false);
      }
  
      function mousedown(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        if (_state === STATE.NONE) {
          _state = event.button;
        }
  
        if (_state === STATE.ROTATE && !_this.noRotate) {
  
        } else if (_state === STATE.ZOOM && !_this.noZoom) {
          _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
          _zoomEnd.copy(_zoomStart);
        } else if (_state === STATE.PAN && !_this.noPan) {
          _panStart.copy(getMouseOnScreen(event.pageX, event.pageY));
          _panEnd.copy(_panStart);
        }
  
        document.addEventListener('mousemove', mousemove, false);
        document.addEventListener('mouseup', mouseup, false);
  
        _this.dispatchEvent(startEvent);
      }
  
      function mousemove(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        if (_state === STATE.ROTATE && !_this.noRotate) {
  
        } else if (_state === STATE.ZOOM && !_this.noZoom) {
          _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        } else if (_state === STATE.PAN && !_this.noPan) {
          _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        }
      }
  
      function mouseup(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        _state = STATE.NONE;
  
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        _this.dispatchEvent(endEvent);
      }
  
      function mousewheel(event) {
        if ( _this.enabled === false ) return;
    
        if ( _this.noZoom === true ) return;

        event.preventDefault();
        event.stopPropagation();

        //_zoomStart.y += event.deltaY * 0.01;
        _this.dispatchEvent({
          type: 'OnScroll',
          delta: event.deltaY * 0.01,
        });

        _this.dispatchEvent( startEvent );
        _this.dispatchEvent( endEvent );
      }
  
      function touchstart(event) {
        if (_this.enabled === false) return;
  
        switch (event.touches.length) {
          case 1:
            _state = STATE.TOUCH_ROTATE;
  
            break;
  
          case 2:
            _state = STATE.TOUCH_ZOOM_PAN;
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;
            _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
  
            var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            _panStart.copy(getMouseOnScreen(x, y));
            _panEnd.copy(_panStart);
            break;
  
          default:
            _state = STATE.NONE;
        }
        _this.dispatchEvent(startEvent);
      }
  
      function touchmove(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        switch (event.touches.length) {
          case 1:
  
            break;
  
          case 2:
            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;
            _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
  
            var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            _panEnd.copy(getMouseOnScreen(x, y));
            break;
  
          default:
            _state = STATE.NONE;
        }
      }
  
      function touchend(event) {
        if (_this.enabled === false) return;
  
        switch (event.touches.length) {
          case 1:
  
            break;
  
          case 2:
            _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
  
            var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            _panEnd.copy(getMouseOnScreen(x, y));
            _panStart.copy(_panEnd);
            break;
        }
  
        _state = STATE.NONE;
        _this.dispatchEvent(endEvent);
      }
  
      function contextmenu(event) {
        event.preventDefault();
      }
  
      this.dispose = function() {
        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        this.domElement.removeEventListener('mousedown', mousedown, false);
        this.domElement.removeEventListener('wheel', mousewheel, false);

        this.domElement.removeEventListener('touchstart', touchstart, false);
        this.domElement.removeEventListener('touchend', touchend, false);
        this.domElement.removeEventListener('touchmove', touchmove, false);
  
        window.removeEventListener('keydown', keydown, false);
        window.removeEventListener('keyup', keyup, false);
      };
  
      this.domElement.addEventListener('contextmenu', contextmenu, false);
      this.domElement.addEventListener('mousedown', mousedown, false);
      this.domElement.addEventListener('wheel', mousewheel, false);

      this.domElement.addEventListener('touchstart', touchstart, false);
      this.domElement.addEventListener('touchend', touchend, false);
      this.domElement.addEventListener('touchmove', touchmove, false);
  
      window.addEventListener('keydown', keydown, false);
      window.addEventListener('keyup', keyup, false);
  
      this.handleResize();
  
      // force an update at start
      this.update();
    }
  }
}

// export factory
export {trackballOrtho};
// default export to
export default trackballOrtho();