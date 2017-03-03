(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* globals Stats, dat*/

// import ControlsTrackball from '../../src/controls/controls.trackball';
// import HelpersLut        from '../../src/helpers/helpers.lut';
// import HelpersVR         from '../../src/helpers/helpers.volumerendering';
// import LoadersVolume     from '../../src/loaders/loaders.volume';

var glslify = require('glslify');
var glslifyHex = require('glslify-hex');

// http://www.paulirish.com/2009/random-hex-color-code-snippets/
function randomHex() {
  return '#' + function co(lor) {
    return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) && lor.length == 6 ? lor : co(lor);
  }('');
}

function yaya() {
  var hex = randomHex();
  var src = glslify('\n  precision mediump float;\n \n  void main() {\n    gl_FragColor = vec4(' + hex + ', 1.0);\n  }\n', {
    inline: true,
    transform: [['glslify-hex', {
      'option-1': true,
      'option-2': 42
    }]]
  });

  return src;
}

window.onload = function () {
  // create a shader on the fly
  var hex = randomHex();
  window.console.log(glslify('\n  precision mediump float;\n \n  void main() {\n    gl_FragColor = vec4(' + hex + ', 1.0);\n  }\n', {
    inline: true,
    transform: [['glslify-hex', {
      'option-1': true,
      'option-2': 42
    }]]
  }));

  var button = document.getElementById('clickclick');
  button.addEventListener('click', function () {
    window.console.log(yaya());
  });
};

},{"glslify":3,"glslify-hex":2}],2:[function(require,module,exports){
var regexLong  = /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?/gi
var regexShort = /#([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?(...)?/gi

module.exports = transform

function transform(filename, src, opts, done) {
  src = src.replace(regexLong, function(whole, r, g, b, a) {
    return makeVec(r, g, b, a)
  }).replace(regexShort, function(whole, r, g, b, a, remaining) {
    var str = makeVec(r + r, g + g, b + b, a + a)
    if (remaining === 'ine') return whole
    if (remaining) str += remaining
    return str
  })

  done(null, src)
}

function makeVec(r, g, b, a) {
  r = parseInt(r, 16) / 255
  g = parseInt(g, 16) / 255
  b = parseInt(b, 16) / 255
  a = parseInt(a, 16) / 255

  return isNaN(a)
    ? 'vec3('+[r,g,b].map(makeFloat).join(',')+')'
    : 'vec4('+[r,g,b,a].map(makeFloat).join(',')+')'
}

function makeFloat(n) {
  return String(n).indexOf('.') === -1
    ? n + '.'
    : n
}

},{}],3:[function(require,module,exports){
module.exports = function() {
  throw new Error(
      "It appears that you're using glslify in browserify without "
    + "its transform applied. Make sure that you've set up glslify as a source transform: "
    + "https://github.com/substack/node-browserify#browserifytransform"
  )
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9jb21tb25nbC9jb21tb25nbC5qcyIsIm5vZGVfbW9kdWxlcy9nbHNsaWZ5LWhleC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nbHNsaWZ5L2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7QUNPQSxJQUFJLFVBQVUsUUFBZCxBQUFjLEFBQVE7QUFDdEIsSUFBSSxhQUFhLFFBQWpCLEFBQWlCLEFBQVE7OztBQUd6QixTQUFBLEFBQVMsWUFBWSxBQUNuQjtTQUFPLGVBQU8sQUFBUyxHQUFULEFBQVksS0FBSyxBQUM5QjtXQUFPLENBQUMsT0FDVCxDQUFBLEFBQUMsR0FBRCxBQUFJLEdBQUosQUFBTyxHQUFQLEFBQVUsR0FBVixBQUFhLEdBQWIsQUFBZ0IsR0FBaEIsQUFBbUIsR0FBbkIsQUFBc0IsR0FBdEIsQUFBeUIsR0FBekIsQUFBNEIsR0FBNUIsQUFBK0IsS0FBL0IsQUFBb0MsS0FBcEMsQUFBeUMsS0FBekMsQUFBOEMsS0FBOUMsQUFBbUQsS0FBbkQsQUFBd0QsS0FBSyxLQUFBLEFBQUssTUFBTSxLQUFBLEFBQUssV0FEckUsQUFDUixBQUE2RCxBQUF5QixTQUNsRixJQUFBLEFBQUksVUFGQSxBQUVVLElBRlYsQUFFZSxNQUFNLEdBRjVCLEFBRTRCLEFBQUcsQUFDakM7QUFKYyxHQUFDLENBQWQsQUFBYSxBQUlaLEFBQ0Y7OztBQUVELFNBQUEsQUFBUyxPQUFPLEFBQ2Q7TUFBSSxNQUFKLEFBQVUsQUFDVjtNQUFJLGNBQWMsK0VBQUEsQUFJUSxNQUpoQjtZQU1ULEFBQ08sQUFDUjtpQkFDRSxBQUFDO2tCQUFlLEFBQ0YsQUFDWjtrQkFYSixBQUFVLEFBTVQsQUFFVSxBQUNULEFBQWdCLEFBRUYsQUFLaEI7QUFQa0IsQUFDZCxLQURGLENBRFM7QUFGVixBQUNELEdBUFU7O1NBZ0JWLEFBQU8sQUFDUjs7O0FBRUQsT0FBQSxBQUFPLFNBQVMsWUFBVyxBQUV6Qjs7TUFBSSxNQUFKLEFBQVUsQUFDVjtTQUFBLEFBQU8sUUFBUCxBQUFlLFlBQVksK0VBQUEsQUFJRCxNQUpQO1lBTWxCLEFBQ08sQUFDUjtpQkFDRSxBQUFDO2tCQUFlLEFBQ0YsQUFDWjtrQkFYSixBQUFtQixBQU1sQixBQUVVLEFBQ1QsQUFBZ0IsQUFFRixBQU1oQjtBQVJrQixBQUNkLEtBREYsQ0FEUztBQUZWLEFBQ0QsR0FQbUI7O01BaUJmLFNBQVMsU0FBQSxBQUFTLGVBQXRCLEFBQWEsQUFBd0IsQUFDckM7U0FBQSxBQUFPLGlCQUFQLEFBQXdCLFNBQVMsWUFBVyxBQUMxQztXQUFBLEFBQU8sUUFBUCxBQUFlLElBQWYsQUFBbUIsQUFDcEI7QUFGRCxBQUdEO0FBeEJEOzs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWxzIFN0YXRzLCBkYXQqL1xuXG4vLyBpbXBvcnQgQ29udHJvbHNUcmFja2JhbGwgZnJvbSAnLi4vLi4vc3JjL2NvbnRyb2xzL2NvbnRyb2xzLnRyYWNrYmFsbCc7XG4vLyBpbXBvcnQgSGVscGVyc0x1dCAgICAgICAgZnJvbSAnLi4vLi4vc3JjL2hlbHBlcnMvaGVscGVycy5sdXQnO1xuLy8gaW1wb3J0IEhlbHBlcnNWUiAgICAgICAgIGZyb20gJy4uLy4uL3NyYy9oZWxwZXJzL2hlbHBlcnMudm9sdW1lcmVuZGVyaW5nJztcbi8vIGltcG9ydCBMb2FkZXJzVm9sdW1lICAgICBmcm9tICcuLi8uLi9zcmMvbG9hZGVycy9sb2FkZXJzLnZvbHVtZSc7XG5cbmxldCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xubGV0IGdsc2xpZnlIZXggPSByZXF1aXJlKCdnbHNsaWZ5LWhleCcpO1xuXG4vLyBodHRwOi8vd3d3LnBhdWxpcmlzaC5jb20vMjAwOS9yYW5kb20taGV4LWNvbG9yLWNvZGUtc25pcHBldHMvXG5mdW5jdGlvbiByYW5kb21IZXgoKSB7XG4gIHJldHVybiAnIycgKyAoZnVuY3Rpb24gY28obG9yKSB7XG4gICByZXR1cm4gKGxvciArPVxuICBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJ11bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjE2KV0pXG4gICYmIChsb3IubGVuZ3RoID09IDYpID8gbG9yIDogY28obG9yKTtcbn0pKCcnKTtcbn1cblxuZnVuY3Rpb24geWF5YSgpIHtcbiAgbGV0IGhleCA9IHJhbmRvbUhleCgpO1xuICBsZXQgc3JjID0gZ2xzbGlmeShgXG4gIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuIFxuICB2b2lkIG1haW4oKSB7XG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChgICsgaGV4ICsgYCwgMS4wKTtcbiAgfVxuYCwge1xuICBpbmxpbmU6IHRydWUsXG4gIHRyYW5zZm9ybTogW1xuICAgIFsnZ2xzbGlmeS1oZXgnLCB7XG4gICAgICAnb3B0aW9uLTEnOiB0cnVlLFxuICAgICAgJ29wdGlvbi0yJzogNDIsXG4gICAgfV0sXG4gIF0sXG4gfSk7XG5cbiAgcmV0dXJuIHNyYztcbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAvLyBjcmVhdGUgYSBzaGFkZXIgb24gdGhlIGZseVxuICBsZXQgaGV4ID0gcmFuZG9tSGV4KCk7XG4gIHdpbmRvdy5jb25zb2xlLmxvZyhnbHNsaWZ5KGBcbiAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG4gXG4gIHZvaWQgbWFpbigpIHtcbiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGAgKyBoZXggKyBgLCAxLjApO1xuICB9XG5gLCB7XG4gIGlubGluZTogdHJ1ZSxcbiAgdHJhbnNmb3JtOiBbXG4gICAgWydnbHNsaWZ5LWhleCcsIHtcbiAgICAgICdvcHRpb24tMSc6IHRydWUsXG4gICAgICAnb3B0aW9uLTInOiA0MixcbiAgICB9XSxcbiAgXSxcbiB9KSk7XG5cblxuICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWNrY2xpY2snKTtcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKHlheWEoKSk7XG4gIH0pO1xufTtcblxuIiwidmFyIHJlZ2V4TG9uZyAgPSAvIyhbYS1mMC05XXsyfSkoW2EtZjAtOV17Mn0pKFthLWYwLTldezJ9KShbYS1mMC05XXsyfSk/L2dpXG52YXIgcmVnZXhTaG9ydCA9IC8jKFthLWYwLTldKShbYS1mMC05XSkoW2EtZjAtOV0pKFthLWYwLTldKT8oLi4uKT8vZ2lcblxubW9kdWxlLmV4cG9ydHMgPSB0cmFuc2Zvcm1cblxuZnVuY3Rpb24gdHJhbnNmb3JtKGZpbGVuYW1lLCBzcmMsIG9wdHMsIGRvbmUpIHtcbiAgc3JjID0gc3JjLnJlcGxhY2UocmVnZXhMb25nLCBmdW5jdGlvbih3aG9sZSwgciwgZywgYiwgYSkge1xuICAgIHJldHVybiBtYWtlVmVjKHIsIGcsIGIsIGEpXG4gIH0pLnJlcGxhY2UocmVnZXhTaG9ydCwgZnVuY3Rpb24od2hvbGUsIHIsIGcsIGIsIGEsIHJlbWFpbmluZykge1xuICAgIHZhciBzdHIgPSBtYWtlVmVjKHIgKyByLCBnICsgZywgYiArIGIsIGEgKyBhKVxuICAgIGlmIChyZW1haW5pbmcgPT09ICdpbmUnKSByZXR1cm4gd2hvbGVcbiAgICBpZiAocmVtYWluaW5nKSBzdHIgKz0gcmVtYWluaW5nXG4gICAgcmV0dXJuIHN0clxuICB9KVxuXG4gIGRvbmUobnVsbCwgc3JjKVxufVxuXG5mdW5jdGlvbiBtYWtlVmVjKHIsIGcsIGIsIGEpIHtcbiAgciA9IHBhcnNlSW50KHIsIDE2KSAvIDI1NVxuICBnID0gcGFyc2VJbnQoZywgMTYpIC8gMjU1XG4gIGIgPSBwYXJzZUludChiLCAxNikgLyAyNTVcbiAgYSA9IHBhcnNlSW50KGEsIDE2KSAvIDI1NVxuXG4gIHJldHVybiBpc05hTihhKVxuICAgID8gJ3ZlYzMoJytbcixnLGJdLm1hcChtYWtlRmxvYXQpLmpvaW4oJywnKSsnKSdcbiAgICA6ICd2ZWM0KCcrW3IsZyxiLGFdLm1hcChtYWtlRmxvYXQpLmpvaW4oJywnKSsnKSdcbn1cblxuZnVuY3Rpb24gbWFrZUZsb2F0KG4pIHtcbiAgcmV0dXJuIFN0cmluZyhuKS5pbmRleE9mKCcuJykgPT09IC0xXG4gICAgPyBuICsgJy4nXG4gICAgOiBuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkl0IGFwcGVhcnMgdGhhdCB5b3UncmUgdXNpbmcgZ2xzbGlmeSBpbiBicm93c2VyaWZ5IHdpdGhvdXQgXCJcbiAgICArIFwiaXRzIHRyYW5zZm9ybSBhcHBsaWVkLiBNYWtlIHN1cmUgdGhhdCB5b3UndmUgc2V0IHVwIGdsc2xpZnkgYXMgYSBzb3VyY2UgdHJhbnNmb3JtOiBcIlxuICAgICsgXCJodHRwczovL2dpdGh1Yi5jb20vc3Vic3RhY2svbm9kZS1icm93c2VyaWZ5I2Jyb3dzZXJpZnl0cmFuc2Zvcm1cIlxuICApXG59XG4iXX0=
