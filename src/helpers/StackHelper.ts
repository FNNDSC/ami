/** 
 * Imports 
 */
import THREE from 'three';
import BoundingBoxHelper from './BoundingBoxHelper';
import { SliceHelper } from './SliceHelper';
import BorderHelper from './BorderHelper';

/**
 * Helper to easily display and interact with a stack.<br>
 * <br>
 * Defaults:<br>
 *   - orientation: 0 (acquisition direction)<br>
 *   - index: middle slice in acquisition direction<br>
 * <br>
 * Features:<br>
 *   - slice from the stack (in any direction)<br>
 *   - slice border<br>
 *   - stack bounding box<br>
 * <br>
 * Live demo at: {@link http://jsfiddle.net/gh/get/library/pure/fnndsc/ami/tree/master/lessons/01#run|Lesson 01}
 *
 * @example
 * let stack = new VJS.Models.Stack();
 * ... // prepare the stack
 *
 * let helpersStack = new VJS.Helpers.Stack(stack);
 * stackHelper.bbox.color = 0xF9F9F9;
 * stackHelper.border.color = 0xF9F9F9;
 *
 * let scene = new THREE.Scene();
 * scene.add(stackHelper);
 *
 * @see module:helpers/border
 * @see module:helpers/boundingbox
 * @see module:helpers/slice
 *
 * @module helpers/stack
 */

export class StackHelper extends THREE.Object3D {
  //#region Veriables
  private _stack;
  private _bBox;
  private _slice;
  private _border;
  private _orientation;
  private _index;
  private _outOfBounds;
  private _orientationMaxIndex;
  private _orientationSpacing;
  private _canvasWidth;
  private _canvasHeight;
  private _borderColor;
  //#endregion

  //#region Getters / Setters
    /**
     * Get stack.
     *
     * @type {ModelsStack}
     */
    get stack() {
      return this._stack;
    }
    /**
     * Set stack.
     *
     * @type {ModelsStack}
     */
    // tslint:disable-next-line:typedef
    set stack(stack) {
      this._stack = stack;
    }
    /**
     * Get bounding box helper.
     *
     * @type {HelpersBoundingBox}
     */
    get bbox() {
      return this._bBox;
    }
    /**
     * Get slice helper.
     *
     * @type {HelpersSlice}
     */
    get slice() {
      return this._slice;
    }
    /**
     * Get border helper.
     *
     * @type {HelpersSlice}
     */
    get border() {
      return this._border;
    }
    /**
     * Set/get current slice index.<br>
     * Sets outOfBounds flag to know if target index is in/out stack bounding box.<br>
     * <br>
     * Internally updates the sliceHelper index and position. Also updates the
     * borderHelper with the updated sliceHelper.
     *
     * @type {number}
     */
    get index() {
      return this._index;
    }
    // tslint:disable-next-line:typedef
    set index(index) {
      this._index = index;

      // update the slice
      this._slice.index = index;
      const halfDimensions = this._stack.halfDimensionsIJK;
      this._slice.planePosition = this._prepareSlicePosition(halfDimensions, this._index);

      // also update the border
      this._border.helpersSlice = this._slice;

      // update ourOfBounds flag
      this._isIndexOutOfBounds();
    }
    /**
     * Set/get current slice orientation.<br>
     * Values: <br>
     *   - 0: acquisition direction (slice normal is z_cosine)<br>
     *   - 1: next direction (slice normal is x_cosine)<br>
     *   - 2: next direction (slice normal is y_cosine)<br>
     *   - n: set orientation to 0<br>
     * <br>
     * Internally updates the sliceHelper direction. Also updates the
     * borderHelper with the updated sliceHelper.
     *
     * @type {number}
     */
    // tslint:disable-next-line:typedef
    set orientation(orientation) {
      this._orientation = orientation;
      this._computeOrientationMaxIndex();

      this._computeOrientationSpacing();
      this._slice.spacing = Math.abs(this._orientationSpacing);
      this._slice.thickness = this._slice.spacing;

      this._slice.planeDirection = this._prepareDirection(this._orientation);

      // also update the border
      this._border.helpersSlice = this._slice;
    }

    get orientation() {
      return this._orientation;
    }

    /**
     * Set/get the outOfBound flag.
     *
     * @type {boolean}
     */
    // tslint:disable-next-line:typedef
    set outOfBounds(outOfBounds) {
      this._outOfBounds = outOfBounds;
    }

    get outOfBounds() {
      return this._outOfBounds;
    }

    /**
     * Set/get the orientationMaxIndex.
     *
     * @type {number}
     */
    // tslint:disable-next-line:typedef
    set orientationMaxIndex(orientationMaxIndex) {
      this._orientationMaxIndex = orientationMaxIndex;
    }

    get orientationMaxIndex() {
      return this._orientationMaxIndex;
    }

    /**
     * Set/get the orientationSpacing.
     *
     * @type {number}
     */
    // tslint:disable-next-line:typedef
    set orientationSpacing(orientationSpacing) {
      this._orientationSpacing = orientationSpacing;
    }

    get orientationSpacing() {
      return this._orientationSpacing;
    }

    // tslint:disable-next-line:typedef
    set canvasWidth(canvasWidth) {
      this._canvasWidth = canvasWidth;
      this._slice.canvasWidth = this._canvasWidth;
    }

    get canvasWidth() {
      return this._canvasWidth;
    }

    // tslint:disable-next-line:typedef
    set canvasHeight(canvasHeight) {
      this._canvasHeight = canvasHeight;
      this._slice.canvasHeight = this._canvasHeight;
    }

    get canvasHeight() {
      return this._canvasHeight;
    }

    // tslint:disable-next-line:typedef
    set borderColor(borderColor) {
      this._borderColor = borderColor;
      this._border.color = borderColor;
      this._slice.borderColor = this._borderColor;
    }

    get borderColor() {
      return this._borderColor;
    }
  //#endregion

  // tslint:disable-next-line:typedef
  constructor(stack) {
    super();

    this._stack = stack;
    this._bBox = null;
    this._slice = null;
    this._border = null;
    this._orientation = 0;
    this._index = 0;
    this._outOfBounds = false;
    this._orientationMaxIndex = 0;
    this._orientationSpacing = 0;
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._borderColor = null;

    this._create();
  }


    /**
     * Initial setup, including stack prepare, bbox prepare, slice prepare and
     * border prepare.
     *
     * @private
     */
    public _create() {
      if (this._stack) {
        // prepare sthe stack internals
        this._prepareStack();

        // prepare visual objects
        this._prepareBBox();
        this._prepareSlice();
        this._prepareBorder();
        // todo: Arrow
      } else {
        window.console.log('no stack to be prepared...');
      }
    }

    public _computeOrientationSpacing() {
      const spacing = this._stack._spacing;
      switch (this._orientation) {
        case 0:
          this._orientationSpacing = spacing.z;
          break;
        case 1:
          this._orientationSpacing = spacing.x;
          break;
        case 2:
          this._orientationSpacing = spacing.y;
          break;
        default:
          this._orientationSpacing = 0;
          break;
      }
    }

    public _computeOrientationMaxIndex() {
      const dimensionsIJK = this._stack.dimensionsIJK;
      this._orientationMaxIndex = 0;
      switch (this._orientation) {
        case 0:
          this._orientationMaxIndex = dimensionsIJK.z - 1;
          break;
        case 1:
          this._orientationMaxIndex = dimensionsIJK.x - 1;
          break;
        case 2:
          this._orientationMaxIndex = dimensionsIJK.y - 1;
          break;
        default:
          // do nothing!
          break;
      }
    }

    /**
     * Given orientation, check if index is in/out of bounds.
     *
     * @private
     */
    public _isIndexOutOfBounds() {
      this._computeOrientationMaxIndex();
      if (this._index >= this._orientationMaxIndex || this._index < 0) {
        this._outOfBounds = true;
      } else {
        this._outOfBounds = false;
      }
    }

    /**
     * Prepare a stack for visualization. (image to world transform, frames order,
     * pack data into 8 bits textures, etc.)
     *
     * @private
     */
    public _prepareStack() {
      // make sure there is something, if not throw an error
      // compute image to workd transform, order frames, etc.
      if (!this._stack.prepared) {
        this._stack.prepare();
      }
      // pack data into 8 bits rgba texture for the shader
      // this one can be slow...
      if (!this._stack.packed) {
        this._stack.pack();
      }
    }

    /**
     * Setup bounding box helper given prepared stack and add bounding box helper
     * to stack helper.
     *
     * @private
     */
    public _prepareBBox() {
      this._bBox = new BoundingBoxHelper(this._stack);
      this.add(this._bBox);
    }

    /**
     * Setup border helper given slice helper and add border helper
     * to stack helper.
     *
     * @private
     */
    public _prepareBorder() {
      this._border = new BorderHelper(this._slice);
      this.add(this._border);
    }

    /**
     * Setup slice helper given prepared stack helper and add slice helper
     * to stack helper.
     *
     * @private
     */
    public _prepareSlice() {
      const halfDimensionsIJK = this._stack.halfDimensionsIJK;
      // compute initial index given orientation
      this._index = this._prepareSliceIndex(halfDimensionsIJK);
      // compute initial position given orientation and index
      const position = this._prepareSlicePosition(halfDimensionsIJK, this._index);
      // compute initial direction orientation
      const direction = this._prepareDirection(this._orientation);

      this._slice = new SliceHelper(this._stack, this._index, position, direction);
      this.add(this._slice);
    }

    /**
     * Compute slice index depending on orientation.
     *
     * @param {Vector3} indices - Indices in each direction.
     *
     * @returns {number} Slice index according to current orientation.
     *
     * @private
     */
    // tslint:disable-next-line:typedef
    public _prepareSliceIndex(indices) {
      let index = 0;
      switch (this._orientation) {
        case 0:
          index = Math.floor(indices.z);
          break;
        case 1:
          index = Math.floor(indices.x);
          break;
        case 2:
          index = Math.floor(indices.y);
          break;
        default:
          // do nothing!
          break;
      }
      return index;
    }

    /**
     * Compute slice position depending on orientation.
     * Sets index in proper location of reference position.
     *
     * @param {Vector3} rPosition - Reference position.
     * @param {number} index - Current index.
     *
     * @returns {number} Slice index according to current orientation.
     *
     * @private
     */
    // tslint:disable-next-line:typedef
    public _prepareSlicePosition(rPosition, index) {
      let position = new THREE.Vector3(0, 0, 0);
      switch (this._orientation) {
        case 0:
          position = new THREE.Vector3(Math.floor(rPosition.x), Math.floor(rPosition.y), index);
          break;
        case 1:
          position = new THREE.Vector3(index, Math.floor(rPosition.y), Math.floor(rPosition.z));
          break;
        case 2:
          position = new THREE.Vector3(Math.floor(rPosition.x), index, Math.floor(rPosition.z));
          break;
        default:
          // do nothing!
          break;
      }
      return position;
    }

    /**
     * Compute slice direction depending on orientation.
     *
     * @param {number} orientation - Slice orientation.
     *
     * @returns {Vector3} Slice direction
     *
     * @private
     */
    // tslint:disable-next-line:typedef
    public _prepareDirection(orientation) {
      let direction = new THREE.Vector3(0, 0, 1);
      switch (orientation) {
        case 0:
          direction = new THREE.Vector3(0, 0, 1);
          break;
        case 1:
          direction = new THREE.Vector3(1, 0, 0);
          break;
        case 2:
          direction = new THREE.Vector3(0, 1, 0);
          break;
        default:
          // do nothing!
          break;
      }

      return direction;
    }

    /**
     * Release the stack helper memory including the slice memory.
     *
     * @public
     */
    public dispose() {
      this.remove(this._slice);
      this._slice.dispose();
      this._slice = null;
      this._bBox.dispose();
      this._bBox = null;
      this._border.dispose();
      this._border = null;
    }
}
