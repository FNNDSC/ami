import WidgetsCss from "./widgets.css";

import {Vector2, Vector3} from 'three';

/**
 * @module Abstract Widget
 */
export default class WidgetsBase extends THREE.Object3D {
  constructor(targetMesh, controls) {
    super(); // init THREE Object 3D

    const elementStyle = document.getElementById('ami-widgets');
    if (elementStyle === null) {
      const styleEl = document.createElement('style');
      styleEl.setAttribute("id", 'ami-widgets');
      styleEl.innerHTML = WidgetsCss.code;
      document.head.appendChild(styleEl);
    }

    this._enabled = true; // is widget enabled?

    // STATE, ENUM might be better
    this._selected = false;
    this._hovered = true;
    this._active = true;
    // thos._state = 'SELECTED';

    this._colors = {
      default: '#00B0FF',
      active: '#FFEB3B',
      hover: '#F50057',
      select: '#76FF03',
      text: '#FFF',
      error: '#F77',
    };
    this._color = this._colors.default;

    this._dragged = false;
    // can not call it visible because it conflicts with THREE.Object3D
    this._displayed = true;

    this._targetMesh = targetMesh;
    this._controls = controls;
    this._camera = controls.object;
    this._container = controls.domElement;

    this._worldPosition = new Vector3(); // LPS position
    if (this._targetMesh !== null) {
      this._worldPosition.copy(this._targetMesh.position);
    }
  }

  initOffsets() {
    const box = this._container.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft =
      window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    this._offsets = {
      top: Math.round(box.top + scrollTop - clientTop),
      left: Math.round(box.left + scrollLeft - clientLeft),
    };
  }

  getMouseOffsets(event, container) {
    return {
      x: (event.clientX - this._offsets.left) / container.offsetWidth * 2 - 1,
      y: -((event.clientY - this._offsets.top) / container.offsetHeight)
        * 2 + 1,
      screenX: event.clientX - this._offsets.left,
      screenY: event.clientY - this._offsets.top,
    };
  }

  getLineData(pointA, pointB) {
    const line = pointB.clone().sub(pointA),
      center = pointB.clone().add(pointA).multiplyScalar(0.5),
      length = line.length(),
      angle = line.angleTo(new Vector3(1, 0, 0));

    return {
      line: line,
      length: length,
      transformX: center.x - length / 2,
      transformY: center.y - this._container.offsetHeight,
      transformAngle: pointA.y < pointB.y ? angle : -angle,
      center: center
    };
  }

  getRectData(pointA, pointB) {
    const line = pointB.clone().sub(pointA),
      vertical = line.projectOnVector(new Vector3(0, 1, 0)),
      min = pointA.clone().min(pointB); // coordinates of the top left corner

    return {
      width: line.projectOnVector(new Vector3(1, 0, 0)).length(),
      height: vertical.length(),
      transformX: min.x,
      transformY: min.y - this._container.offsetHeight,
      paddingVector: vertical.normalize(),
    };
  }

  adjustLabelTransform(label, point) { // by default point is the center of the label
    let x = Math.round(point.x - label.offsetWidth / 2),
      y = Math.round(point.y - label.offsetHeight / 2) - this._container.offsetHeight;

    if (x < 0) {
      x = x > -label.offsetWidth ? 0 : x + label.offsetWidth;
    } else if (x > this._container.offsetWidth - label.offsetWidth) {
      x = x < this._container.offsetWidth
        ? this._container.offsetWidth - label.offsetWidth
        : x - label.offsetWidth;
    }

    if (y < -this._container.offsetHeight) {
      y = y > -this._container.offsetHeight - label.offsetHeight
        ? -this._container.offsetHeight
        : y + label.offsetHeight;
    } else if (y > -label.offsetHeight) {
      y = y < 0 ? -label.offsetHeight : y - label.offsetHeight;
    }

    return new Vector2(x, y);
  }

  worldToScreen(worldCoordinate) {
    let screenCoordinates = worldCoordinate.clone();
    screenCoordinates.project(this._camera);

    screenCoordinates.x = Math.round((screenCoordinates.x + 1)
        * this._container.offsetWidth / 2);
    screenCoordinates.y = Math.round((-screenCoordinates.y + 1)
        * this._container.offsetHeight / 2);
    screenCoordinates.z = 0;

    return screenCoordinates;
  }

  update() {
    // to be overloaded
    window.console.log('update() should be overloaded!');
  }

  updateColor() {
    if (this._active) {
      this._color = this._colors.active;
    } else if (this._hovered) {
      this._color = this._colors.hover;
    } else if (this._selected) {
      this._color = this._colors.select;
    } else {
      this._color = this._colors.default;
    }
  }

  show() {
    this.showDOM();
    this.showMesh();
    this.update();
  }

  hide() {
    this.hideDOM();
    this.hideMesh();
  }

  hideDOM() {
    // to be overloaded
    window.console.log('hideDOM() should be overloaded!');
  }

  showDOM() {
    // to be overloaded
    window.console.log('showDOM() should be overloaded!');
  }

  hideMesh() {
    this.visible = false;
  }

  showMesh() {
    this.visible = true;
  }

  free() {
    this._container = null;
  }

  get targetMesh() {
    return this._targetMesh;
  }

  set targetMesh(targetMesh) {
    this._targetMesh = targetMesh;
    this.update();
  }

  get worldPosition() {
    return this._worldPosition;
  }

  set worldPosition(worldPosition) {
    this._worldPosition.copy(worldPosition);
    this.update();
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(enabled) {
    this._enabled = enabled;
    this.update();
  }

  get selected() {
    return this._selected;
  }

  set selected(selected) {
    this._selected = selected;
    this.update();
  }

  get hovered() {
    return this._hovered;
  }

  set hovered(hovered) {
    this._hovered = hovered;
    this.update();
  }

  get dragged() {
    return this._dragged;
  }

  set dragged(dragged) {
    this._dragged = dragged;
    this.update();
  }

  get displayed() {
    return this._displayed;
  }

  set displayed(displayed) {
    this._displayed = displayed;
    this.update();
  }

  get active() {
    return this._active;
  }

  set active(active) {
    this._active = active;
    this.update();
  }

  get color() {
    return this._color;
  }

  set color(color) {
    this._color = color;
    this.update();
  }
}
