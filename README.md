<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/214063/19763517/a83873fc-9c3e-11e6-8390-229d7749246e.png" width="60%">
</p>

<p align="center">
    <a href="https://travis-ci.org/FNNDSC/ami">
        <img src="https://travis-ci.org/FNNDSC/ami.svg"
             alt="Build Status">
    </a>
    <a href="https://codeclimate.com/github/FNNDSC/ami">
        <img src="https://codeclimate.com/github/FNNDSC/ami/badges/gpa.svg"
             alt="Code Climate">
    </a>
    <a href="https://www.npmjs.com/package/ami.js">
        <img src="https://img.shields.io/npm/v/ami.js.svg"
             alt="NPM Version">
    </a>
    <a href="https://www.npmjs.com/package/ami.js">
        <img src="https://img.shields.io/npm/dm/ami.js.svg"
             alt="NPM Downloads per Month">
    </a>
    <a href="http://slack.babymri.org">
        <img src="https://img.shields.io/badge/slack-join-blue.svg"
             alt="Slack">
    </a>
</p>

----------

> **AMI Alpha** is now available for developer preview.</br>
> Developper preview means that the API might change but we are confident you can already build cool apps with AMI.</br>
> Please submit pull request, open issues or contact us for any question, feature request, etc.

----------

### Content

1. [Lessons](#lessons)
2. [Sandbox](#sandbox)
2. [Features](#features)
3. [Usage](#usage)
4. [Pre-requisites](#pre-requisites)
5. [Use with NPM](#npm)
6. [Use compiled version](#compiled)
7. [API Documentation](https://fnndsc.github.io/ami/doc)
8. [Developer corner](https://fnndsc.github.io/ami/doc)
9. [Credits](#credits)

## Lessons
<table>
<tr>
  <!-- Lesson 00 -->
  <td valign="middle" width="100">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/00#run' target=_blank>
      <img src="https://cdn.rawgit.com/fnndsc/ami/master/lessons/00/thumbnail-128x128.jpg" alt="lesson00" title="Click me!">
      <img src="http://xtk.github.com/fiddlelogo_small2.png">
    </a>
  </td>
  <td valign="top" width="326">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/00#run'>
      <b>Lesson 00: Load</b>
    </a>
    <div>
      Load DICOM Data and get a nice Series/Stack/Frame structure.
    </div>
  </td>

  <!-- Lesson 01 -->
  <td valign="middle" width="100">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/01#run' target=_blank>
      <img src="https://cloud.githubusercontent.com/assets/214063/14734707/8963a142-086c-11e6-99e2-35125f5ebb83.gif" style="width:128x, height:128px" alt="lesson01" title="Click me!">
      <img src="http://xtk.github.com/fiddlelogo_small2.png">
    </a>
  </td>
  <td valign="top" width="326">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/01#run'>
      <b>Lesson 01: Visualize 3D</b>
    </a>
    <div>
      Look at the data we loaded in 3D.
    </div>
  </td>
</tr>

<tr>
  <!-- Lesson 02 -->
  <td valign="middle" width="100">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run' target=_blank>
      <img src="https://cloud.githubusercontent.com/assets/214063/14734782/1aa3006c-086d-11e6-9f56-6476e5ac6188.gif" style="width:128x, height:128px" alt="lesson00" title="Click me!">
      <img src="http://xtk.github.com/fiddlelogo_small2.png">
    </a>
  </td>
  <td valign="top" width="326">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run'>
      <b>Lesson 02: Mesh</b>
    </a>
    <div>
      Add a mesh to the scene.
    </div>
  </td>

  <!-- Lesson 03 -->
  <td valign="middle" width="100">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/03#run' target=_blank>
      <img src="https://cloud.githubusercontent.com/assets/214063/14734860/99882c22-086d-11e6-99ae-16b7e5371f40.gif" style="width:128x, height:128px" alt="lesson00" title="Click me!">
      <img src="http://xtk.github.com/fiddlelogo_small2.png">
    </a>
  </td>
  <td valign="top" width="326">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/03#run'>
      <b>Lesson 03: Visualize 2D</b>
    </a>
    <div>
      Look at the data in 2D.
    </div>
  </td>
</tr>
<tr>
  <!-- Lesson 04 -->
  <td valign="middle" width="100">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/04#run' target=_blank>
      <img src="https://cloud.githubusercontent.com/assets/214063/16259390/b04a7d96-3862-11e6-8937-3019b913a21f.gif" style="width:128x, height:128px" alt="lesson00" title="Click me!">
      <img src="http://xtk.github.com/fiddlelogo_small2.png">
    </a>
  </td>
  <td valign="top" width="326">
    <a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/04#run' target=_blank>
      <b>Lesson 04: Labelmap</b>
    </a>
    <div>
      Overlays on top of you data.
    </div>
  </td>
  
  <!-- Lesson 05 -->
  <td valign="middle" width="100">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run' target=_blank>-->
    <!--  <img src="https://cdn.rawgit.com/fnndsc/ami/master/lessons/02/thumbnail-128x128.jpg" alt="lesson00" title="Click me!">-->
    <!--  <img src="http://xtk.github.com/fiddlelogo_small2.png">-->
    <!--</a>-->
  </td>
  <td valign="top" width="326">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run'>-->
      <b>Lesson 05: TRK</b>
    <!--</a>-->
    <div>
      TRK - coming soon.
    </div>
  </td>
</tr>
<tr>
  <!-- Lesson 06 -->
  <td valign="middle" width="100">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run' target=_blank>-->
    <!--  <img src="https://cdn.rawgit.com/fnndsc/ami/master/lessons/02/thumbnail-128x128.jpg" alt="lesson00" title="Click me!">-->
    <!--  <img src="http://xtk.github.com/fiddlelogo_small2.png">-->
    <!--</a>-->
  </td>
  <td valign="top" width="326">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run'>-->
      <b>Lesson 06: Volume Rendering</b>
    <!--</a>-->
    <div>
      Volume Rendering - coming soon.
    </div>
  </td>
  
  <!-- Lesson 07 -->
  <td valign="middle" width="100">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run' target=_blank>-->
    <!--  <img src="https://cdn.rawgit.com/fnndsc/ami/master/lessons/02/thumbnail-128x128.jpg" alt="lesson00" title="Click me!">-->
    <!--  <img src="http://xtk.github.com/fiddlelogo_small2.png">-->
    <!--</a>-->
  </td>
  <td valign="top" width="326">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run'>-->
      <b>Lesson 07: Lookup tables</b>
    <!--</a>-->
    <div>
      Lookup Tables - coming soon.
    </div>
  </td>
</tr>
</table>

## Sandbox

Volume rendering, 2D viewer, arbitrary reslicing and more examples and advanced demos [there](https://fnndsc.github.io/ami)!

## Features

> :white_check_mark: READY - :large_orange_diamond: IN PROGRESS OR LIMITED SUPPORT - :x: ON ROADMAP


| Capabilities       	| Volumes   	| Meshes          	| Widgets                	|
|--------------------	|-----------	|-----------------	|------------------------	|
| ✅ 2D Visulization  	| ✅ Dicom   	| ✅ VTK (THREEJS) 	| 🔶 Handle (2D/3D)      	|
| ✅ 3D Visualization 	| ✅ NRRD    	| ✅ STL (THREEJS) 	| 🔶 Probe (2D/3D)       	|
| ✅ Volume Rendering 	| 🔶 Nifti  	| 🔶 TRK          	| 🔶 Ruler (2D/3D)       	|
| ✅ Lookup Tables    	| ❌ MGH/MGZ 	| ❌ CURV          	| 🔶 Angle (2D/3D)       	|
| 🔶 Label Maps       	| ❌ JPEG    	| ❌ FSM           	| 🔶 Orientation (2D/3D) 	|

## Pre-requisites

### Modern web browser
AMI relies on ES2015 promises to perform many task so consider using a polyfill if needed.

### THREEJS
Make sure that you are loading THREEJS your index.html **BEFORE** AMI.
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r81/three.js"></script>
```

## Usage

### NPM
```
$> npm install ami.js
```

*Note*: you might need to include [babel](https://github.com/babel/babel) transforms in you build process.

```
# app.js
const AMI = require('ami.js');
window.console.log('Ready to rock!!');
```

### ami.js

Check-out the [lessons](#lessons) to get started quickly.

Add AMI in your index.html **after** THREEJS.
```
# index.html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r81/three.js"></script>
<script src="https://rawgit.com/FNNDSC/ami/master/dist/ami.js"></script>
<script src="app.js"></script>

#app.js
const AMI = AMI.default;
window.console.log('Ready to rock!!');
```

## Developer corner
Get the source code and related packages.
```
$> git clone https://github.com/FNNDSC/ami.git
$> cd ami
$> npm install
```

Default task (lint, tests, demo and build)
```
$> npm run
```

To run examples (browserify/babelify/serve the example)
```
$> npm run example <examples name>

#run the geometries_slice example
$> npm run example geometries_slice
```

To run lessons (browserify/babelify/serve the lesson)
```
$> run lesson <lesson number>

# run lesson 00
$> npm run lesson 00
```

Build standalone library to build/
```
$> npm run build:ami
```

Tests
```
$> npm run test
```

Documentation
```
$> npm run doc
```

Deploy dist/ to gh-pages
```
$> npm run deploy
```

# Credits

AMI would not exist without them:

##### [THREEJS](https://github.com/mrdoob/three.js/)
* Base components such as Vectors, Matrices and Objects3D.
* HTML template for example page.
* Author(s): [mrdoob](https://github.com/mrdoob)

##### [DicomParser](https://github.com/chafey/dicomParser)
* DICOM parsing relies on it.
* Author(s): [chafey](https://github.com/chafey)

##### [CornerstoneWADOImageLoader](https://github.com/chafey/cornerstoneWADOImageLoader)
* Was used to figure out how to use the dicom parser properly.
* Author(s): [chafey](https://github.com/chafey)

##### [NIFTI-Reader-JS](https://github.com/rii-mango/NIFTI-Reader-JS)
* Nifti parsing relies on it.
* Author(s): [rii-mango](https://github.com/rii-mango)

##### [JPEGLosslessDecoderJS](https://github.com/rii-mango/JPEGLosslessDecoderJS)
* JPEG Lossless Decoder for DICOM images
* Author(s): [rii-mango](https://github.com/rii-mango)

##### [Image-JPEG2000](https://github.com/OHIF/image-JPEG2000)
* JPEG 2000 Decoder for DICOM images
* Author(s): [jpambrun](https://github.com/jpambrun), [mozilla](https://github.com/mozilla/pdf.js/)

##### [Pako](https://github.com/nodeca/pako)
* GZ file decompression
* Author(s): [nodeca](https://github.com/nodeca)
