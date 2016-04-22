----------

**AMI Alpha** is now available for developer preview.</br>
Developper preview means that the API might change but we are confident you can already build cool apps with AMI.</br>
Please submit pull request, open issues or contact us for any question, feature request, etc.

----------

[![Build Status](https://travis-ci.org/FNNDSC/ami.svg)](https://travis-ci.org/FNNDSC/ami)
[![Code Climate](https://codeclimate.com/github/FNNDSC/ami/badges/gpa.svg)](https://codeclimate.com/github/FNNDSC/ami)
[![Slack](https://img.shields.io/badge/slack-join-blue.svg)](http://slack.babymri.org)
[![NPM Version](https://img.shields.io/npm/v/ami.js.svg)](https://www.npmjs.com/package/ami.js)
[![NPM Downloads per Month](https://img.shields.io/npm/dm/ami.js.svg)](https://www.npmjs.com/package/ami.js)


# <img align="left" src="https://cloud.githubusercontent.com/assets/214063/14279153/f74bc160-fb2b-11e5-9722-94501b191bc1.png" width="15%"> AMI JS ToolKit (Alpha - 0.0.*)
> AMI Medical Imaging (AMI) JS ToolKit for THREEJS

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
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run' target=_blank>-->
    <!--  <img src="https://cdn.rawgit.com/fnndsc/ami/master/lessons/02/thumbnail-128x128.jpg" alt="lesson00" title="Click me!">-->
    <!--  <img src="http://xtk.github.com/fiddlelogo_small2.png">-->
    <!--</a>-->
  </td>
  <td valign="top" width="326">
    <!--<a href='http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/02#run'>-->
      <b>Lesson 04: Labelmap</b>
    <!--</a>-->
    <div>
      Label maps - coming soon.
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
:white_check_mark: READY - :large_orange_diamond: IN PROGRESS OR LIMITED SUPPORT - :x: ON ROADMAP
#### Capabilities
:white_check_mark: 2D Visulization

:white_check_mark: 3D Visualization

:white_check_mark: Volume Rendering

:white_check_mark: Lookup Tables

:large_orange_diamond: Label Maps

#### Widgets

:large_orange_diamond: Probe (2D/3D)
  
:large_orange_diamond: Ruler (2D/3D)

:large_orange_diamond: Angle (2D/3D)
  
:large_orange_diamond: Orientation (2D/3D)

#### Volumes

:white_check_mark: Dicom
  
:white_check_mark: NRRD

:large_orange_diamond: Nifti
  
:x: MGH/MGZ
  
:x: JPEG
  
#### Meshes

:white_check_mark: VTK (THREEJS)
  
:white_check_mark: STL (THREEJS)
  
:large_orange_diamond: TRK
  
:x: CURV
  
:x: FSM

## Usage

If you know how to use THREEJS, you already know out to use AMI. Learn about THREEJS then checkout the lessons, examples and the API to dive in!

## Pre-requisites

### THREEJS
Make sure that you are loading THREEJS your index.html **BEFORE** AMI.
```
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r75/three.js"></script>
```

### Promise polyfills (for older browsers)
Follow the instructions from [babel's wiki](http://babeljs.io/docs/usage/polyfill/) or just use one of the many Promise polyfill available out there.

**NOT FOR PRODUCTION**: available for convenience at:
```
<script type="text/javascript" src="https://cdn.rawgit.com/fnndsc/vjs/master/external/scripts/babel/polyfill.min.js"></script>
```

## NPM

Check-out the ami-starter kit to get started quickly. It is already configured to use browserify, babelify and glslify,

https://github.com/FNNDSC/ami-starter

### Installation


```
$> npm install ami.js
```

Note that you might need to include [babel](https://github.com/babel/babel) and [glslify](https://github.com/stackgl/glslify) transforms in you build (browserify, webpack, etc.) process.
```
...
browserify(
  {entries: [entry],
   debug: true
  })
  .transform(babelify, {"presets": ["es2015"]})
  .transform(glslify)
  .bundle()
...
```

### Usage

```
let AMI = require('ami.js');
window.console.log(AMI);

// Ready to rock
```

## Compiled

Check-out the lessons to get started quickly.

[Lessons](#lessons)

### Installation
Add AMI in your index.html after THREEJS.
```
...
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r75/three.js"></script>
<script src="https://rawgit.com/FNNDSC/ami/master/dist/ami.js"></script>
...
```

### Usage
```
let AMI = AMI.default;
window.console.log(AMI);

// Ready to rock
```

## Developer corner
Get the source code and related packages.
```
$> git clone https://github.com/FNNDSC/ami.git
$> cd ami
$> npm install
```

Default task (runs tests, documentation, etc. and create a directory ready to be pushed as gh-page)
```
$> gulp
```

To run examples (browserify/babelify/glslify the example)
```
$> gulp examples --<example>

# for instance to run the geometries_slice example

$> gulp examples --geometries_slices
```

To run lessons (runs example against compiled ami.js)
```
$> gulp lessons --<lesson #>

# for instance to run lesson 00

$> gulp lessons --00
```

Build standalone library to build/
```
$> gulp build
```

Tests
```
$> gulp test
```

Documentation
```
$> gulp doc
```

# Credits

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
