'use strict';

var VJS = VJS || {};
VJS.slice = VJS.slice || {};

VJS.slice.core = function(origin, normal, volumeCore) {
    this._origin = origin;
    this._normal = normal;
    this._transforms = {};
    this._intersections = [];
    this._intersectionsXY = [];
    this._intersectionsAngle = [];
    this._centerOfMass = null;

    this._volumeCore = volumeCore;
};

VJS.slice.core.prototype.slice = function() {
    // update all information according to Normal and Origin!   // normalize slice direction
    this._normal.normalize();

    // Should directly get the intersection between OBB and plane
    // need volume 3 directions
    // need volume center RAS
    // need half lenght in each direction
    var obb = {
        'halfDimensions': this._volumeCore._halfDimensions,
        'orientation': this._volumeCore._orientation,
        'center': this._volumeCore._halfDimensions, //this._volumeCore._RAS.center,
        'toOBBSpace': this._volumeCore._transforms.ras2ijk,
        'toOBBSpaceInvert': this._volumeCore._transforms.ijk2ras,
    };

    var plane = {
        'origin': this._origin,
        'normal': this._normal
    };

    // BOOM!
    this._intersections = VJS.Intersections.obbPlane(obb, plane);

    // if less than 3, we have a problem: not a surface!
    if (this._intersections.length < 3) {
        window.console.log('WARNING: Less than 3 intersections between OBB and Plane.');
        window.console.log('OBB');
        window.console.log(obb);
        window.console.log('Plane');
        window.console.log(plane);
        window.console.log('exiting...');
    }

    // center of mass
    this._centerOfMass = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < this._intersections.length; i++) {
        this._centerOfMass.x += this._intersections[i].x;
        this._centerOfMass.y += this._intersections[i].y;
        this._centerOfMass.z += this._intersections[i].z;
    }
    this._centerOfMass.divideScalar(this._intersections.length);

    // order the intersections
    var epsilon = 0.0000001;
    // reference line
    var a0 = this._intersections[0].x;
    var b0 = this._intersections[0].y;
    var c0 = this._intersections[0].z;
    var x0 = this._intersections[0].x - this._centerOfMass.x;
    var y0 = this._intersections[0].y - this._centerOfMass.y;
    var z0 = this._intersections[0].z - this._centerOfMass.z;
    var l0 = {
        origin: new THREE.Vector3(a0, b0, c0),
        direction: new THREE.Vector3(x0, y0, z0).normalize()
    };

    var base = new THREE.Vector3(0, 0, 0).crossVectors(l0.direction, this._normal).normalize();

    var orderedIntersections = [];

    // other lines // if inter, return location + angle
    for (var j = 0; j < this._intersections.length; j++) {

        var a1 = this._intersections[j].x;
        var b1 = this._intersections[j].y;
        var c1 = this._intersections[j].z;
        var x1 = this._intersections[j].x - this._centerOfMass.x;
        var y1 = this._intersections[j].y - this._centerOfMass.y;
        var z1 = this._intersections[j].z - this._centerOfMass.z;

        var l1 = {
            origin: new THREE.Vector3(a1, b1, c1),
            direction: new THREE.Vector3(x1, y1, z1).normalize()
        };

        // if lines intersect, proceed
        // http://www.nabla.hr/PC-LinePlaneIn3DSp2.htm
        var intersect = -1;

        var origs = new THREE.Vector3(0, 0, 0).subVectors(l0.origin, l1.origin).normalize();
        intersect = origs.dot(this._normal);
        window.console.log(intersect);

        // why epsilon so big?
        if (Math.abs(intersect) < epsilon) {
            window.console.log('intersection...!');
            var x = l0.direction.dot(l1.direction);
            var y = base.dot(l1.direction);

            var thetaAngle = Math.atan2(y, x);
            var theta = thetaAngle * (180 / Math.PI);
            orderedIntersections.push({
                'angle': theta,
                'point': l1.origin,
                'xy': {
                    'x': x,
                    'y': y
                }
            });

        } else {
            window.console.log('no intersection...!');
        }
    }

    orderedIntersections.sort(function(a, b) {
        return a.angle - b.angle;
    });

    // format vars
    this._intersections = [];
    for (var k = 0; k < orderedIntersections.length; k++) {
        this._intersections.push(orderedIntersections[k].point);
        this._intersectionsXY.push(orderedIntersections[k].xy);
        this._intersectionsAngle.push(orderedIntersections[k].angle);
    }
};
