(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* globals Stats, dat*/

// import ControlsTrackball from '../../src/controls/controls.trackball';
// import HelpersLut        from '../../src/helpers/helpers.lut';
// import HelpersVR         from '../../src/helpers/helpers.volumerendering';
// import LoadersVolume     from '../../src/loaders/loaders.volume';

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
    transform: [["glslify-hex", {
      "option-1": true,
      "option-2": 42
    }]]
  });

  return src;
}

window.onload = function () {

  // create a shader on the fly
  var hex = randomHex();
  window.console.log(glslify('\n  precision mediump float;\n \n  void main() {\n    gl_FragColor = vec4(' + hex + ', 1.0);\n  }\n', {
    inline: true,
    transform: [["glslify-hex", {
      "option-1": true,
      "option-2": 42
    }]]
  }));

  var button = document.getElementById('clickclick');
  button.addEventListener('click', function () {
    window.console.log(yaya());
  });
};

},{"glslify-hex":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9jb21tb25nbC9jb21tb25nbC5qcyIsIm5vZGVfbW9kdWxlcy9nbHNsaWZ5LWhleC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ09BLEFBQUksQUFBVSxBQUFROzs7Ozs7Ozs7QUFDdEIsSUFBSSxhQUFhLFFBQWpCLEFBQWlCLEFBQVE7OztBQUd6QixTQUFBLEFBQVMsWUFBVyxBQUNsQjtTQUFPLGVBQU8sQUFBUyxHQUFULEFBQVksS0FBSSxBQUFJO1dBQU8sQ0FBQyxPQUMxQyxDQUFBLEFBQUMsR0FBRCxBQUFHLEdBQUgsQUFBSyxHQUFMLEFBQU8sR0FBUCxBQUFTLEdBQVQsQUFBVyxHQUFYLEFBQWEsR0FBYixBQUFlLEdBQWYsQUFBaUIsR0FBakIsQUFBbUIsR0FBbkIsQUFBcUIsS0FBckIsQUFBeUIsS0FBekIsQUFBNkIsS0FBN0IsQUFBaUMsS0FBakMsQUFBcUMsS0FBckMsQUFBeUMsS0FBSyxLQUFBLEFBQUssTUFBTSxLQUFBLEFBQUssV0FEckIsQUFDekMsQUFBOEMsQUFBeUIsU0FDbkUsSUFBQSxBQUFJLFVBRmlDLEFBRXZCLElBRnVCLEFBRWpCLE1BQU0sR0FGSSxBQUVKLEFBQUcsQUFBTztBQUYzQixHQUFDLENBQWQsQUFBYSxBQUU2QixBQUMzQzs7O0FBRUQsU0FBQSxBQUFTLE9BQU0sQUFDYjtNQUFJLE1BQUosQUFBVSxBQUNWO01BQUksY0FBYywrRUFBQSxBQUlRLE1BSmhCO1lBTVQsQUFDTyxBQUNSO2lCQUNFLEFBQUM7a0JBQWUsQUFDRixBQUNaO2tCQVhKLEFBQVUsQUFNVCxBQUVVLEFBQ1QsQUFBZ0IsQUFFRixBQUtoQjtBQVBrQixBQUNkLEtBREYsQ0FEUztBQUZWLEFBQ0QsR0FQVTs7U0FnQlYsQUFBTyxBQUNSOzs7QUFFRCxPQUFBLEFBQU8sU0FBUyxZQUFXLEFBR3pCOzs7TUFBSSxNQUFKLEFBQVUsQUFDVjtTQUFBLEFBQU8sUUFBUCxBQUFlLFlBQVksK0VBQUEsQUFJRCxNQUpQO1lBTWxCLEFBQ08sQUFDUjtpQkFDRSxBQUFDO2tCQUFlLEFBQ0YsQUFDWjtrQkFYSixBQUFtQixBQU1sQixBQUVVLEFBQ1QsQUFBZ0IsQUFFRixBQU1oQjtBQVJrQixBQUNkLEtBREYsQ0FEUztBQUZWLEFBQ0QsR0FQbUI7O01BaUJmLFNBQVMsU0FBQSxBQUFTLGVBQXRCLEFBQWEsQUFBd0IsQUFDckM7U0FBQSxBQUFPLGlCQUFQLEFBQXdCLFNBQVMsWUFBVyxBQUMxQztXQUFBLEFBQU8sUUFBUCxBQUFlLElBQWYsQUFBbUIsQUFDcEI7QUFGRCxBQUlEO0FBMUJEOzs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWxzIFN0YXRzLCBkYXQqL1xuXG4vLyBpbXBvcnQgQ29udHJvbHNUcmFja2JhbGwgZnJvbSAnLi4vLi4vc3JjL2NvbnRyb2xzL2NvbnRyb2xzLnRyYWNrYmFsbCc7XG4vLyBpbXBvcnQgSGVscGVyc0x1dCAgICAgICAgZnJvbSAnLi4vLi4vc3JjL2hlbHBlcnMvaGVscGVycy5sdXQnO1xuLy8gaW1wb3J0IEhlbHBlcnNWUiAgICAgICAgIGZyb20gJy4uLy4uL3NyYy9oZWxwZXJzL2hlbHBlcnMudm9sdW1lcmVuZGVyaW5nJztcbi8vIGltcG9ydCBMb2FkZXJzVm9sdW1lICAgICBmcm9tICcuLi8uLi9zcmMvbG9hZGVycy9sb2FkZXJzLnZvbHVtZSc7XG5cbmxldCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xubGV0IGdsc2xpZnlIZXggPSByZXF1aXJlKCdnbHNsaWZ5LWhleCcpO1xuXG4vLyBodHRwOi8vd3d3LnBhdWxpcmlzaC5jb20vMjAwOS9yYW5kb20taGV4LWNvbG9yLWNvZGUtc25pcHBldHMvXG5mdW5jdGlvbiByYW5kb21IZXgoKXtcbiAgcmV0dXJuICcjJyArIChmdW5jdGlvbiBjbyhsb3IpeyAgIHJldHVybiAobG9yICs9XG4gIFswLDEsMiwzLDQsNSw2LDcsOCw5LCdhJywnYicsJ2MnLCdkJywnZScsJ2YnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTYpXSlcbiAgJiYgKGxvci5sZW5ndGggPT0gNikgPyAgbG9yIDogY28obG9yKTsgfSkoJycpO1xufVxuXG5mdW5jdGlvbiB5YXlhKCl7XG4gIGxldCBoZXggPSByYW5kb21IZXgoKTtcbiAgbGV0IHNyYyA9IGdsc2xpZnkoYFxuICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcbiBcbiAgdm9pZCBtYWluKCkge1xuICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoYCArIGhleCArIGAsIDEuMCk7XG4gIH1cbmAsIHtcbiAgaW5saW5lOiB0cnVlLFxuICB0cmFuc2Zvcm06IFtcbiAgICBbXCJnbHNsaWZ5LWhleFwiLCB7XG4gICAgICBcIm9wdGlvbi0xXCI6IHRydWUsXG4gICAgICBcIm9wdGlvbi0yXCI6IDQyXG4gICAgfV1cbiAgXVxuIH0pO1xuXG4gIHJldHVybiBzcmM7XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAvLyBjcmVhdGUgYSBzaGFkZXIgb24gdGhlIGZseVxuICBsZXQgaGV4ID0gcmFuZG9tSGV4KCk7XG4gIHdpbmRvdy5jb25zb2xlLmxvZyhnbHNsaWZ5KGBcbiAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG4gXG4gIHZvaWQgbWFpbigpIHtcbiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGAgKyBoZXggKyBgLCAxLjApO1xuICB9XG5gLCB7XG4gIGlubGluZTogdHJ1ZSxcbiAgdHJhbnNmb3JtOiBbXG4gICAgW1wiZ2xzbGlmeS1oZXhcIiwge1xuICAgICAgXCJvcHRpb24tMVwiOiB0cnVlLFxuICAgICAgXCJvcHRpb24tMlwiOiA0MlxuICAgIH1dXG4gIF1cbiB9KSk7XG5cblxuICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaWNrY2xpY2snKTtcbiAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKHlheWEoKSk7XG4gIH0pO1xuXG59O1xuXG4iLCJ2YXIgcmVnZXhMb25nICA9IC8jKFthLWYwLTldezJ9KShbYS1mMC05XXsyfSkoW2EtZjAtOV17Mn0pKFthLWYwLTldezJ9KT8vZ2lcbnZhciByZWdleFNob3J0ID0gLyMoW2EtZjAtOV0pKFthLWYwLTldKShbYS1mMC05XSkoW2EtZjAtOV0pPyguLi4pPy9naVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYW5zZm9ybVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm0oZmlsZW5hbWUsIHNyYywgb3B0cywgZG9uZSkge1xuICBzcmMgPSBzcmMucmVwbGFjZShyZWdleExvbmcsIGZ1bmN0aW9uKHdob2xlLCByLCBnLCBiLCBhKSB7XG4gICAgcmV0dXJuIG1ha2VWZWMociwgZywgYiwgYSlcbiAgfSkucmVwbGFjZShyZWdleFNob3J0LCBmdW5jdGlvbih3aG9sZSwgciwgZywgYiwgYSwgcmVtYWluaW5nKSB7XG4gICAgdmFyIHN0ciA9IG1ha2VWZWMociArIHIsIGcgKyBnLCBiICsgYiwgYSArIGEpXG4gICAgaWYgKHJlbWFpbmluZyA9PT0gJ2luZScpIHJldHVybiB3aG9sZVxuICAgIGlmIChyZW1haW5pbmcpIHN0ciArPSByZW1haW5pbmdcbiAgICByZXR1cm4gc3RyXG4gIH0pXG5cbiAgZG9uZShudWxsLCBzcmMpXG59XG5cbmZ1bmN0aW9uIG1ha2VWZWMociwgZywgYiwgYSkge1xuICByID0gcGFyc2VJbnQociwgMTYpIC8gMjU1XG4gIGcgPSBwYXJzZUludChnLCAxNikgLyAyNTVcbiAgYiA9IHBhcnNlSW50KGIsIDE2KSAvIDI1NVxuICBhID0gcGFyc2VJbnQoYSwgMTYpIC8gMjU1XG5cbiAgcmV0dXJuIGlzTmFOKGEpXG4gICAgPyAndmVjMygnK1tyLGcsYl0ubWFwKG1ha2VGbG9hdCkuam9pbignLCcpKycpJ1xuICAgIDogJ3ZlYzQoJytbcixnLGIsYV0ubWFwKG1ha2VGbG9hdCkuam9pbignLCcpKycpJ1xufVxuXG5mdW5jdGlvbiBtYWtlRmxvYXQobikge1xuICByZXR1cm4gU3RyaW5nKG4pLmluZGV4T2YoJy4nKSA9PT0gLTFcbiAgICA/IG4gKyAnLidcbiAgICA6IG5cbn1cbiJdfQ==
