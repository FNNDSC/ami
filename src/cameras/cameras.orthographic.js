import Intersections from '../core/core.intersections';
import Validators from '../core/core.validators';

/**
 * Orthographic camera from THREE.JS with some extra convenience
 * functionalities.
 *
 * @example
 * //
 * //
 *
 * @module cameras/orthographic
 */


const camerasOrthographic = (three = window.THREE) => {
  if (three === undefined || three.OrthographicCamera === undefined) {
    return null;
  }

  const Constructor = three.OrthographicCamera;
  return class extends Constructor {
    constructor(left, right, top, bottom, near, far) {
      super(left, right, top, bottom, near, far);

      this._front = null;
      this._back = null;

      this._directions = [
        new three.Vector3(1, 0, 0),
        new three.Vector3(0, 1, 0),
        new three.Vector3(0, 0, 1),
        ];

      this._directionsLabel = [
        'A', 'P', // TOP/BOTTOM
        'L', 'R', // LEFT/RIGHT
        'I', 'S', // FROM/TO
      ];

      this._orientation = 'default';
      this._convention = 'radio';
      this._stackOrientation = 0;

      this._right = null;
      this._up = null;
      this._direction = null;

      this._controls = null;
      this._box = null;
      this._canvas = {
        width: null,
        height: null,
      };

      this._fromFront = true;
      this._angle = 0;
    }

    /**
     * Initialize orthographic camera variables
     */
    init(xCosine, yCosine, zCosine, controls, box, canvas) {
      // DEPRECATION NOTICE
      window.console.warn(
        `cameras.orthographic.init(...) is deprecated.
        Use .cosines, .controls, .box and .canvas instead.`);

      //
      if (!(Validators.vector3(xCosine) &&
        Validators.vector3(yCosine) &&
        Validators.vector3(zCosine) &&
        Validators.box(box) &&
        controls)) {
        window.console.log('Invalid input provided.');

        return false;
      }

      this._right = xCosine;
      this._up = this._adjustTopDirection(xCosine, yCosine);
      this._direction = new three.Vector3().crossVectors(this._right, this._up);
      this._controls = controls;
      this._box = box;
      this._canvas = canvas;

      let ray = {
        position: this._box.center,
        direction: this._direction,
      };

      let intersections =
        this._orderIntersections(
          Intersections.rayBox(ray, this._box),
          this._direction);
      this._front = intersections[0];
      this._back = intersections[1];

      // set default values
      this.up.set(this._up.x, this._up.y, this._up.z);
      this._updateCanvas();
      this._updatePositionAndTarget(this._front, this._back);
      this._updateMatrices();
      this._updateDirections();
    }

    update() {
      // http://www.grahamwideman.com/gw/brain/orientation/orientterms.htm
      // do magics depending on orientation and convention
      // also needs a default mode

      if (this._orientation === 'default') {
        switch (this._getMaxIndex(this._directions[2])) {
          case 0:
            this._orientation = 'sagittal';
            break;

          case 1:
            this._orientation = 'coronal';
            break;

          case 2:
            this._orientation = 'axial';
            break;

          default:
            this._orientation = 'free';
            break;
        }
      }

      if (this._orientation === 'free') {
        this._right = this._directions[0];
        this._up = this._directions[1];
        this._direction = this._directions[2];
      } else {
        let leftIndex = this.leftDirection();
        let leftDirection = this._directions[leftIndex];
        let posteriorIndex = this.posteriorDirection();
        let posteriorDirection = this._directions[posteriorIndex];
        let superiorIndex = this.superiorDirection();
        let superiorDirection = this._directions[superiorIndex];

        if (this._convention === 'radio') {
            switch (this._orientation) {
              case 'axial':
                // up vector is 'anterior'
                if (posteriorDirection.y > 0) {
                  posteriorDirection.negate();
                }

                // looking towards superior
                if (superiorDirection.z < 0) {
                  superiorDirection.negate();
                }

                //
                this._right = leftDirection; // does not matter right/left
                this._up = posteriorDirection;
                this._direction = superiorDirection;
                break;

              case 'coronal':
                // up vector is 'superior'
                if (superiorDirection.z < 0) {
                  superiorDirection.negate();
                }

                // looking towards posterior
                if (posteriorDirection.y < 0) {
                  posteriorDirection.negate();
                }

                //
                this._right = leftDirection; // does not matter right/left
                this._up = superiorDirection;
                this._direction = posteriorDirection;
                break;

              case 'sagittal':
                // up vector is 'superior'
                if (superiorDirection.z < 0) {
                  superiorDirection.negate();
                }

                // looking towards right
                if (leftDirection.x > 0) {
                  leftDirection.negate();
                }

                //
                this._right = posteriorDirection; // does not matter right/left
                this._up = superiorDirection;
                this._direction = leftDirection;

                break;

              default:
                window.console.warn(
                  `"${this._orientation}" orientation is not valid.
                  (choices: axial, coronal, sagittal)`);
                break;
            }
        } else if (this._convention === 'neuro') {
            switch (this._orientation) {
              case 'axial':
                // up vector is 'anterior'
                if (posteriorDirection.y > 0) {
                  posteriorDirection.negate();
                }

                // looking towards inferior
                if (superiorDirection.z > 0) {
                  superiorDirection.negate();
                }

                //
                this._right = leftDirection; // does not matter right/left
                this._up = posteriorDirection;
                this._direction = superiorDirection;
                break;

              case 'coronal':
                // up vector is 'superior'
                if (superiorDirection.z < 0) {
                  superiorDirection.negate();
                }

                // looking towards anterior
                if (posteriorDirection.y > 0) {
                  posteriorDirection.negate();
                }

                //
                this._right = leftDirection; // does not matter right/left
                this._up = superiorDirection;
                this._direction = posteriorDirection;
                break;

              case 'sagittal':
                // up vector is 'superior'
                if (superiorDirection.z < 0) {
                  superiorDirection.negate();
                }

                // looking towards right
                if (leftDirection.x > 0) {
                  leftDirection.negate();
                }

                //
                this._right = posteriorDirection; // does not matter right/left
                this._up = superiorDirection;
                this._direction = leftDirection;

                break;

              default:
                window.console.warn(
                  `"${this._orientation}" orientation is not valid.
                  (choices: axial, coronal, sagittal)`);
                break;
            }
        } else {
          window.console.warn(
            `${this._convention} is not valid (choices: radio, neuro)`);
        }
      }

      // that is what determines left/right
      let ray = {
        position: this._box.center,
        direction: this._direction,
      };

      let intersections =
        this._orderIntersections(
          Intersections.rayBox(ray, this._box),
          this._direction);
      this._front = intersections[0];
      this._back = intersections[1];

      // set default values
      this.up.set(this._up.x, this._up.y, this._up.z);
      this._updateCanvas();
      this._updatePositionAndTarget(this._front, this._back);
      this._updateMatrices();
      this._updateDirections();
    }

    leftDirection() {
      return this._findMaxIndex(this._directions, 0);
    }

    posteriorDirection() {
      return this._findMaxIndex(this._directions, 1);
    }

    superiorDirection() {
      return this._findMaxIndex(this._directions, 2);
    }

    /**
     * Invert rows in the current slice.
     * Inverting rows in 2 steps:
     *   * Flip the "up" vector
     *   * Look at the slice from the other side
     */
    invertRows() {
      // flip "up" vector
      // we flip up first because invertColumns update projectio matrices
      this.up.multiplyScalar(-1);
      this.invertColumns();

      this._updateDirections();
    }

    /**
     * Invert rows in the current slice.
     * Inverting rows in 1 step:
     *   * Look at the slice from the other side
     */
    invertColumns() {
      this.center();
      // rotate 180 degrees around the up vector...
      let oppositePosition = this._oppositePosition(this.position);

      // update posistion and target
      // clone is needed because this.position is overwritten in method
      this._updatePositionAndTarget(oppositePosition, this.position.clone());
      this._updateMatrices();
      this._fromFront = !this._fromFront;

      this._angle %= 360;
      this._angle = 360 - this._angle;

      this._updateDirections();
    }

    /**
     * Center slice in the camera FOV.
     * It also updates the controllers properly.
     * We can center a camera from the front or from the back.
     */
    center() {
      if (this._fromFront) {
        this._updatePositionAndTarget(this._front, this._back);
      } else {
        this._updatePositionAndTarget(this._back, this._front);
      }

      this._updateMatrices();
      this._updateDirections();
    }

    /**
     * Pi/2 rotation around the zCosine axis.
     * Clock-wise rotation from the user point of view.
     */
    rotate(angle=null) {
      this.center();

      let computedAngle = 90;

      let clockwise = 1;
      if (!this._fromFront) {
        clockwise = -1;
      }

      if (angle === null) {
        computedAngle *= -clockwise;
        this._angle += 90;
      } else {
        computedAngle = 360 - clockwise * (angle - this._angle);
        this._angle = angle;
      }

      this._angle %= 360;

      // Rotate the up vector around the "zCosine"
      let rotation = new three.Matrix4().makeRotationAxis(
        this._direction,
        computedAngle * Math.PI/180);
      this.up.applyMatrix4(rotation);

      this._updateMatrices();
      this._updateDirections();
    }

    // dimensions[0] // width
    // dimensions[1] // height
    // direction= 0 width, 1 height, 2 best
    // factor
    fitBox(direction = 0, factor=1.5) {
      //
      // if (!(dimensions && dimensions.length >= 2)) {
      //   window.console.log('Invalid dimensions container.');
      //   window.console.log(dimensions);

      //   return false;
      // }

      //
      let zoom = 1;

      // update zoom
      switch (direction) {
        case 0:
          zoom = factor * this._computeZoom(this._canvas.width, this._right);
          break;
        case 1:
          zoom = factor * this._computeZoom(this._canvas.height, this._up);
          break;
        case 2:
          zoom = factor * (Math.min(
            this._computeZoom(this._canvas.width, this._right),
            this._computeZoom(this._canvas.height, this._up)
          ));
          break;
        default:
          break;
      }

      if (!zoom) {
        return false;
      }

      this.zoom = zoom;

      this.center();
    }

    _adjustTopDirection(horizontalDirection, verticalDirection) {
      const vMaxIndex = this._getMaxIndex(verticalDirection);

      // should handle vMax index === 0
      if ((vMaxIndex === 2 && verticalDirection.getComponent(vMaxIndex) < 0) ||
          (vMaxIndex === 1 && verticalDirection.getComponent(vMaxIndex) > 0) ||
          (vMaxIndex === 0 && verticalDirection.getComponent(vMaxIndex) > 0)) {
        verticalDirection.negate();
      }

     return verticalDirection;
    }

    _getMaxIndex(vector) {
      // init with X value
      let maxValue = Math.abs(vector.x);
      let index = 0;

      if (Math.abs(vector.y) > maxValue) {
        maxValue = Math.abs(vector.y);
        index = 1;
      }

      if (Math.abs(vector.z) > maxValue) {
        index = 2;
      }

      return index;
    }

    _findMaxIndex(directions, target) {
      // get index of the most superior direction
      let maxIndices = this._getMaxIndices(directions);

      for (let i = 0; i < maxIndices.length; i++) {
        if (maxIndices[i] === target) {
          return i;
        }
      }
    }

    _getMaxIndices(directions) {
      let indices = [];
      indices.push(this._getMaxIndex(directions[0]));
      indices.push(this._getMaxIndex(directions[1]));
      indices.push(this._getMaxIndex(directions[2]));

      return indices;
    }

    _orderIntersections(intersections, direction) {
      const ordered =
        intersections[0].dot(direction) < intersections[1].dot(direction);

      if (!ordered) {
          return [intersections[1], intersections[0]];
      }

     return intersections;
    }

    _updateCanvas() {
      let camFactor = 2;
      this.left = -this._canvas.width / camFactor;
      this.right = this._canvas.width / camFactor;
      this.top = this._canvas.height / camFactor;
      this.bottom = -this._canvas.height / camFactor;

      this._updateMatrices();
      this.controls.handleResize();
    }

    _oppositePosition(position) {
      let oppositePosition = position.clone();
      // center world postion around box center
      oppositePosition.sub(this._box.center);
      // rotate
      let rotation = new three.Matrix4().makeRotationAxis(
        this.up,
        Math.PI);

      oppositePosition.applyMatrix4(rotation);
      // translate back to world position
      oppositePosition.add(this._box.center);
      return oppositePosition;
    }

    _computeZoom(dimension, direction) {
      if (!(dimension && dimension > 0)) {
        window.console.log('Invalid dimension provided.');
        window.console.log(dimension);
        return false;
      }

      // ray
      let ray = {
        position: this._box.center.clone(),
        direction: direction,
      };

      let intersections = Intersections.rayBox(ray, this._box);
      if (intersections.length < 2) {
        window.console.log('Can not adjust the camera ( < 2 intersections).');
        window.console.log(ray);
        window.console.log(this._box);
        return false;
      }

      return dimension / intersections[0].distanceTo(intersections[1]);
    }

    _updatePositionAndTarget(position, target) {
        // position
        this.position.set(position.x, position.y, position.z);

        // targets
        this.lookAt(target.x, target.y, target.z);
        this._controls.target.set(target.x, target.y, target.z);
    }

    _updateMatrices() {
      this._controls.update();
      // THEN camera
      this.updateProjectionMatrix();
      this.updateMatrixWorld();
    }

    _updateLabels() {
      this._directionsLabel = [
        this._vector2Label(this._up),
        this._vector2Label(this._up.clone().negate()),
        this._vector2Label(this._right),
        this._vector2Label(this._right.clone().negate()),
        this._vector2Label(this._direction),
        this._vector2Label(this._direction.clone().negate()),
      ];
    }

    _vector2Label(direction) {
      const index = this._getMaxIndex(direction);
      // set vector max value to 1
      const scaledDirection =
        direction.clone().divideScalar(Math.abs(direction.getComponent(index)));
      const delta = 0.2;
      let label = '';

      // loop through components of the vector
      for (let i = 0; i<3; i++) {
        if (i === 0) {
          if (scaledDirection.getComponent(i) + delta >= 1) {
            label += 'L';
          } else if (scaledDirection.getComponent(i) - delta <= -1) {
            label += 'R';
          }
        }

        if (i === 1) {
          if (scaledDirection.getComponent(i) + delta >= 1) {
            label += 'P';
          } else if (scaledDirection.getComponent(i) - delta <= -1) {
            label += 'A';
          }
        }

        if (i === 2) {
          if (scaledDirection.getComponent(i) + delta >= 1) {
            label += 'S';
          } else if (scaledDirection.getComponent(i) - delta <= -1) {
            label += 'I';
          }
        }
      }

      return label;
    }

    _updateDirections() {
      // up is correct
      this._up = this.up.clone();

      // direction
      let pLocal = new three.Vector3(0, 0, -1);
      let pWorld = pLocal.applyMatrix4(this.matrixWorld);
      this._direction = pWorld.sub(this.position).normalize();

      // right
      this._right = new three.Vector3().crossVectors(this._direction, this.up);

      // update labels accordingly
      this._updateLabels();
    }

    set controls(controls) {
      this._controls = controls;
    }

    get controls() {
      return this._controls;
    }

    set box(box) {
      this._box = box;
    }

    get box() {
      return this._box;
    }

    set canvas(canvas) {
      this._canvas = canvas;
      this._updateCanvas();
    }

    get canvas() {
      return this._canvas;
    }

    set angle(angle) {
      this.rotate(angle);
    }

    get angle() {
      return this._angle;
    }

    set directions(directions) {
      this._directions = directions;
    }

    get directions() {
      return this._directions;
    }

    set convention(convention) {
      this._convention = convention;
    }

    get convention() {
      return this._convention;
    }

    set orientation(orientation) {
      this._orientation = orientation;
    }

    get orientation() {
      return this._orientation;
    }

    set directionsLabel(directionsLabel) {
      this._directionsLabel = directionsLabel;
    }

    get directionsLabel() {
      return this._directionsLabel;
    }

    set stackOrientation(stackOrientation) {
      this._stackOrientation = stackOrientation;

      if (this._stackOrientation === 0) {
        this._orientation = 'default';
      } else {
        const maxIndex =
          this._getMaxIndex(
            this._directions[(this._stackOrientation + 2) % 3]);

        if (maxIndex === 0) {
          this._orientation = 'sagittal';
        } else if (maxIndex === 1) {
          this._orientation = 'coronal';
        } else if (maxIndex === 2) {
          this._orientation = 'axial';
        }
      }
    }

    get stackOrientation() {
      //
      if (this._orientation === 'default') {
        this._stackOrientation = 0;
      } else {
        let maxIndex = this._getMaxIndex(this._direction);

        if (maxIndex === this._getMaxIndex(this._directions[2])) {
          this._stackOrientation = 0;
        } else if (maxIndex === this._getMaxIndex(this._directions[0])) {
          this._stackOrientation = 1;
        } else if (maxIndex === this._getMaxIndex(this._directions[1])) {
          this._stackOrientation = 2;
        }
      }

      return this._stackOrientation;
    }
  };
};

// export factory
export {camerasOrthographic};
// default export to
export default camerasOrthographic();
