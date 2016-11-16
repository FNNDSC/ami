/* globals Stats, dat*/

// import ControlsTrackball from '../../src/controls/controls.trackball';
// import HelpersLut        from '../../src/helpers/helpers.lut';
// import HelpersVR         from '../../src/helpers/helpers.volumerendering';
// import LoadersVolume     from '../../src/loaders/loaders.volume';

let glslify = require('glslify');
let glslifyHex = require('glslify-hex');

// http://www.paulirish.com/2009/random-hex-color-code-snippets/
function randomHex(){
  return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
}

function yaya(){
  let hex = randomHex();
  let src = glslify(`
  precision mediump float;
 
  void main() {
    gl_FragColor = vec4(` + hex + `, 1.0);
  }
`, {
  inline: true,
  transform: [
    ["glslify-hex", {
      "option-1": true,
      "option-2": 42
    }]
  ]
 });

  return src;
}

window.onload = function() {

  // create a shader on the fly
  let hex = randomHex();
  window.console.log(glslify(`
  precision mediump float;
 
  void main() {
    gl_FragColor = vec4(` + hex + `, 1.0);
  }
`, {
  inline: true,
  transform: [
    ["glslify-hex", {
      "option-1": true,
      "option-2": 42
    }]
  ]
 }));


  let button = document.getElementById('clickclick');
  button.addEventListener('click', function() {
    window.console.log(yaya());
  });

};

