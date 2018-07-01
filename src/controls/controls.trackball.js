/**
 * Original authors from THREEJS repo
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga  / http://lantiga.github.io
 */

const trackball = (three = window.THREE) => {
  if (three === undefined || three.EventDispatcher === undefined) {
    return null;
  }

  const Constructor = three.EventDispatcher;
  return class extends Constructor {
    constructor(object, domElement) {
      super();
  
      let _this = this;
      let STATE = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM: 4, TOUCH_PAN: 5, CUSTOM: 99};
  
      this.object = object;
      this.domElement = (domElement !== undefined) ? domElement : document;
  
      // API
  
      this.enabled = true;
  
      this.screen = {left: 0, top: 0, width: 0, height: 0};
  
      this.rotateSpeed = 1.0;
      this.zoomSpeed = 1.2;
      this.panSpeed = 0.3;
  
      this.noRotate = false;
      this.noZoom = false;
      this.noPan = false;
      this.noCustom = false;
  
      this.forceState = -1;
  
      this.staticMoving = false;
      this.dynamicDampingFactor = 0.2;
  
      this.minDistance = 0;
      this.maxDistance = Infinity;
  
      this.keys = [65 /* A*/, 83 /* S*/, 68];
  
      // internals
  
      this.target = new three.Vector3();
  
      let EPS = 0.000001;
  
      let lastPosition = new three.Vector3();
  
      let _state = STATE.NONE,
      _prevState = STATE.NONE,
  
      _eye = new three.Vector3(),
  
      _movePrev = new three.Vector2(),
      _moveCurr = new three.Vector2(),
  
      _lastAxis = new three.Vector3(),
      _lastAngle = 0,
  
      _zoomStart = new three.Vector2(),
      _zoomEnd = new three.Vector2(),
  
      _touchZoomDistanceStart = 0,
      _touchZoomDistanceEnd = 0,
  
      _panStart = new three.Vector2(),
      _panEnd = new three.Vector2(),
  
      _customStart = new three.Vector2(),
      _customEnd = new three.Vector2();
  
      // for reset
  
      this.target0 = this.target.clone();
      this.position0 = this.object.position.clone();
      this.up0 = this.object.up.clone();
  
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
      };
  
      this.handleEvent = function(event) {
        if (typeof this[event.type] == 'function') {
          this[event.type](event);
        }
      };
  
      let getMouseOnScreen = (function() {
        let vector = new three.Vector2();
  
        return function(pageX, pageY) {
          vector.set(
              (pageX - _this.screen.left) / _this.screen.width,
              (pageY - _this.screen.top) / _this.screen.height
          );
  
          return vector;
        };
      }());
  
      let getMouseOnCircle = (function() {
        let vector = new three.Vector2();
  
        return function(pageX, pageY) {
          vector.set(
              ((pageX - _this.screen.width * 0.5 - _this.screen.left) / (_this.screen.width * 0.5)),
              ((_this.screen.height + 2 * (_this.screen.top - pageY)) / _this.screen.width) // screen.width intentional
          );
  
          return vector;
        };
      }());
  
      this.rotateCamera = (function() {
        let axis = new three.Vector3(),
            quaternion = new three.Quaternion(),
            eyeDirection = new three.Vector3(),
            objectUpDirection = new three.Vector3(),
            objectSidewaysDirection = new three.Vector3(),
            moveDirection = new three.Vector3(),
            angle;
  
        return function() {
          moveDirection.set(_moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0);
          angle = moveDirection.length();
  
          if (angle) {
            _eye.copy(_this.object.position).sub(_this.target);
  
            eyeDirection.copy(_eye).normalize();
            objectUpDirection.copy(_this.object.up).normalize();
            objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();
  
            objectUpDirection.setLength(_moveCurr.y - _movePrev.y);
            objectSidewaysDirection.setLength(_moveCurr.x - _movePrev.x);
  
            moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));
  
            axis.crossVectors(moveDirection, _eye).normalize();
  
            angle *= _this.rotateSpeed;
            quaternion.setFromAxisAngle(axis, angle);
  
            _eye.applyQuaternion(quaternion);
            _this.object.up.applyQuaternion(quaternion);
  
            _lastAxis.copy(axis);
            _lastAngle = angle;
          } else if (!_this.staticMoving && _lastAngle) {
            _lastAngle *= Math.sqrt(1.0 - _this.dynamicDampingFactor);
            _eye.copy(_this.object.position).sub(_this.target);
            quaternion.setFromAxisAngle(_lastAxis, _lastAngle);
            _eye.applyQuaternion(quaternion);
            _this.object.up.applyQuaternion(quaternion);
          }
  
          _movePrev.copy(_moveCurr);
        };
      }());
  
      this.zoomCamera = function() {
        let factor;
  
        if (_state === STATE.TOUCH_ZOOM) {
          factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
          _touchZoomDistanceStart = _touchZoomDistanceEnd;
          _eye.multiplyScalar(factor);
        } else {
          factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;
  
          if (factor !== 1.0 && factor > 0.0) {
            _eye.multiplyScalar(factor);
  
            if (_this.staticMoving) {
              _zoomStart.copy(_zoomEnd);
            } else {
              _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;
            }
          }
        }
      };
  
      this.panCamera = (function() {
        let mouseChange = new three.Vector2(),
            objectUp = new three.Vector3(),
            pan = new three.Vector3();
  
        return function() {
          mouseChange.copy(_panEnd).sub(_panStart);
  
          if (mouseChange.lengthSq()) {
            mouseChange.multiplyScalar(_eye.length() * _this.panSpeed);
  
            pan.copy(_eye).cross(_this.object.up).setLength(mouseChange.x);
            pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));
  
            _this.object.position.add(pan);
            _this.target.add(pan);
  
            if (_this.staticMoving) {
              _panStart.copy(_panEnd);
            } else {
              _panStart.add(mouseChange.subVectors(_panEnd, _panStart).multiplyScalar(_this.dynamicDampingFactor));
            }
          }
        };
      }());
  
      this.checkDistances = function() {
        if (!_this.noZoom || !_this.noPan) {
          if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {
            _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));
          }
  
          if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {
            _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));
          }
        }
      };
  
      this.update = function() {
        _eye.subVectors(_this.object.position, _this.target);
  
        if (!_this.noRotate) {
          _this.rotateCamera();
        }
  
        if (!_this.noZoom) {
          _this.zoomCamera();
        }
  
        if (!_this.noPan) {
          _this.panCamera();
        }
  
        if (!_this.noCustom) {
          _this.custom(_customStart, _customEnd);
        }
  
        _this.object.position.addVectors(_this.target, _eye);
  
        _this.checkDistances();
  
        _this.object.lookAt(_this.target);
  
        if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
          _this.dispatchEvent(changeEvent);
  
          lastPosition.copy(_this.object.position);
        }
      };
  
      this.reset = function() {
        _state = STATE.NONE;
        _prevState = STATE.NONE;
  
        _this.target.copy(_this.target0);
        _this.object.position.copy(_this.position0);
        _this.object.up.copy(_this.up0);
  
        _eye.subVectors(_this.object.position, _this.target);
  
        _this.object.lookAt(_this.target);
  
        _this.dispatchEvent(changeEvent);
  
        lastPosition.copy(_this.object.position);
      };
  
      this.setState = function(targetState) {
        _this.forceState = targetState;
        _prevState = targetState;
        _state = targetState;
      };
  
      this.custom = function(customStart, customEnd) {
  
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
          _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
          _movePrev.copy(_moveCurr);
        } else if (_state === STATE.ZOOM && !_this.noZoom) {
          _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
          _zoomEnd.copy(_zoomStart);
        } else if (_state === STATE.PAN && !_this.noPan) {
          _panStart.copy(getMouseOnScreen(event.pageX, event.pageY));
          _panEnd.copy(_panStart);
        } else if (_state === STATE.CUSTOM && !_this.noCustom) {
          _customStart.copy(getMouseOnScreen(event.pageX, event.pageY));
          _customEnd.copy(_panStart);
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
          _movePrev.copy(_moveCurr);
          _moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
        } else if (_state === STATE.ZOOM && !_this.noZoom) {
          _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        } else if (_state === STATE.PAN && !_this.noPan) {
          _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        } else if (_state === STATE.CUSTOM && !_this.noCustom) {
          _customEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        }
      }
  
      function mouseup(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        if (_this.forceState === -1) {
          _state = STATE.NONE;
        }
  
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        _this.dispatchEvent(endEvent);
      }
  
      function mousewheel(event) {

        if ( _this.enabled === false ) return;
    
        if ( _this.noZoom === true ) return;
    
        event.preventDefault();
        event.stopPropagation();
    
        switch ( event.deltaMode ) {
    
          case 2:
            // Zoom in pages
            _zoomStart.y -= event.deltaY * 0.025;
            break;
    
          case 1:
            // Zoom in lines
            _zoomStart.y -= event.deltaY * 0.01;
            break;
    
          default:
            // undefined, 0, assume pixels
            _zoomStart.y -= event.deltaY * 0.00025;
            break;
    
        }
  
        // _zoomStart.y += delta * 0.01;
        _this.dispatchEvent(startEvent);
        _this.dispatchEvent(endEvent);
      }
  
      function touchstart(event) {
        if (_this.enabled === false) return;
  
        if (_this.forceState === -1) {
          switch (event.touches.length) {
            case 1:
              _state = STATE.TOUCH_ROTATE;
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
              _movePrev.copy(_moveCurr);
              break;
  
            case 2:
              _state = STATE.TOUCH_ZOOM;
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
        } else {
          // { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4, CUSTOM: 99 };
          switch (_state) {
            case 0:
              // 1 or 2 fingers, smae behavior
              _state = STATE.TOUCH_ROTATE;
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
              _movePrev.copy(_moveCurr);
              break;
  
            case 1:
            case 4:
              if (event.touches.length >= 2) {
                _state = STATE.TOUCH_ZOOM;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
              } else {
                _state = STATE.ZOOM;
                _zoomStart.copy(getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY));
                _zoomEnd.copy(_zoomStart);
              }
              break;
  
            case 2:
            case 5:
              if (event.touches.length >= 2) {
                _state = STATE.TOUCH_PAN;
                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _panStart.copy(getMouseOnScreen(x, y));
                _panEnd.copy(_panStart);
              } else {
                _state = STATE.PAN;
                _panStart.copy(getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY));
                _panEnd.copy(_panStart);
              }
              break;
  
            case 99:
              _state = STATE.CUSTOM;
              var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
              var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
              _customStart.copy(getMouseOnScreen(x, y));
              _customEnd.copy(_customStart);
              break;
  
            default:
              _state = STATE.NONE;
          }
        }
  
        _this.dispatchEvent(startEvent);
      }
  
      function touchmove(event) {
        if (_this.enabled === false) return;
  
        event.preventDefault();
        event.stopPropagation();
  
        if (_this.forceState === -1) {
          switch (event.touches.length) {
            case 1:
              _movePrev.copy(_moveCurr);
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
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
        } else {
          // { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4, CUSTOM: 99 };
          switch (_state) {
            case 0:
              _movePrev.copy(_moveCurr);
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
              break;
  
            case 1:
              _zoomEnd.copy(getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY));
              break;
  
            case 2:
              _panEnd.copy(getMouseOnScreen(event.touches[0].pageX, event.touches[0].pageY));
              break;
  
            case 4:
              // 2 fingers!
              // TOUCH ZOOM
              var dx = event.touches[0].pageX - event.touches[1].pageX;
              var dy = event.touches[0].pageY - event.touches[1].pageY;
              _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
              break;
  
            case 5:
              // 2 fingers
              // TOUCH_PAN
              var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
              var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
              _panEnd.copy(getMouseOnScreen(x, y));
              break;
  
            case 99:
              var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
              var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
              _customEnd.copy(getMouseOnScreen(x, y));
              break;
  
            default:
              _state = STATE.NONE;
          }
        }
      }
  
      function touchend(event) {
        if (_this.enabled === false) return;
  
        if (_this.forceState === -1) {
          switch (event.touches.length) {
            case 1:
              _movePrev.copy(_moveCurr);
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
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
        } else {
          switch (_state) {
            case 0:
              _movePrev.copy(_moveCurr);
              _moveCurr.copy(getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY));
              break;
  
            case 1:
            case 2:
              break;
  
            case 4:
              // TOUCH ZOOM
              _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
              _state = STATE.ZOOM;
              break;
  
            case 5:
              // TOUCH ZOOM
              if (event.touches.length >= 2) {
                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _panEnd.copy(getMouseOnScreen(x, y));
                _panStart.copy(_panEnd);
              }
              _state = STATE.PAN;
              break;
  
            case 99:
              var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
              var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
              _customEnd.copy(getMouseOnScreen(x, y));
              _customStart.copy(_customEnd);
              break;
  
            default:
              _state = STATE.NONE;
          }
        }
  
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
  };
};

// export factory
export {trackball};
// default export to
export default trackball();

