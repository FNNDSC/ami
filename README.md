# vjs

[![Join the chat at https://gitter.im/FNNDSC/vjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FNNDSC/vjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
the FNNDSC visualization tool (based on XTK and ThreeJS)!

2048 * 2048 * 4 pixels big object supported in the shader. Needs a good fall back solution for bigger volumes.

WebGL support: http://caniuse.com/#search=webgl

## Examples

http://fnndsc.github.io/vjs

## Usage

### 1. Create

```javascript
// create a viewer
myVjs = new vjs.vjs();
```

### 2. Create objects to visualize (best way to link different controller to listen to obj events?)

Separate logic from presentation somehow. Separate volume from slices...

### 2. Add data to visualize

```javascript
// create a viewer
// volume Object has an ID, so we can map label maps and LUTs
myVjs.addVolume(volumeObject);
myVjs.addLabelMap(labelObject, volumeId);
myVjs.addLut(lutObject, volumeId);
myVjs.addMesh(meshObject);
myVjs.addTrk(trkObj);
```


### 3. Choose your controller mode
This is the most important part of the library. Based on you interaction mode, you can look at a volume as if it was a 2D object, as a 3D object, you can pick pixel values, you can pick ROIs, etc.

```javascript
myVjs.controller("2D");
myVjs.controller("3D");

```

allow user to switch from RAS (LPS) to image space easily. The transform is a property of volume or object (i.e. trk).
handle rgb volumes

JS Style Guide:
https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml

Use JS Doc