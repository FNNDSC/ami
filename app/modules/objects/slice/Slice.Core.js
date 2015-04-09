'use strict';

var VJS = VJS || {};
VJS.Slice = VJS.Slice || {};

VJS.Slice.Core = function(origin, normal, volumeCore) {
    this._Origin = origin;
    this._Normal = normal;
    this._VolumeCore = volumeCore;
    this._Width = -1;
    this._Height = -1;
    this._Transforms = {};

    this._IntersectionRASBBoxPlane = null;
};

VJS.Slice.Core.prototype.Slice = function() {
    // update all information according to Normal and Origin!   // normalize slice direction
    this._Normal.normalize();

    // Should directly get the intersection between OBB and plane
    // need volume 3 directions
    // need volume center RAS
    // need half lenght in each direction
    window.console.log(this._VolumeCore._HalfDimensions);
    window.console.log(this._VolumeCore._Orientation);
    window.console.log(this._VolumeCore._RAS.center);
    var obb = {
        'halfDimensions': this._VolumeCore._HalfDimensions,
        'orientation': this._VolumeCore._Orientation,
        'center': this._VolumeCore._HalfDimensions, //this._VolumeCore._RAS.center,
        'toOBBSpace': this._VolumeCore._Transforms.ras2ijk,
        'toOBBSpaceInvert': this._VolumeCore._Transforms.ijk2ras,
    };

    var plane = {
        'origin': this._Origin,
        'normal': this._Normal
    };

    // BOOM!
    this._INTERSECTIONS = VJS.Intersections.OBBPlane(obb, plane);

    // if less than 3, we have a problem: not a surface!

    // center of mass
    this._COM = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < this._INTERSECTIONS.length; i++) {
        this._COM.x += this._INTERSECTIONS[i].x;
        this._COM.y += this._INTERSECTIONS[i].y;
        this._COM.z += this._INTERSECTIONS[i].z;
    }
    this._COM.divideScalar(this._INTERSECTIONS.length);

    // order the points
    this._ORDERERPOINTS = [];
    var epsilon = 1;
    // reference line
    var a0 = this._INTERSECTIONS[0].x;
    var b0 = this._INTERSECTIONS[0].y;
    var c0 = this._INTERSECTIONS[0].z;
    var x0 = this._INTERSECTIONS[0].x - this._COM.x;
    var y0 = this._INTERSECTIONS[0].y - this._COM.y;
    var z0 = this._INTERSECTIONS[0].z - this._COM.z;
    var l0 = {
        origin: new THREE.Vector3(a0, b0, c0),
        direction: new THREE.Vector3(x0, y0, z0).normalize()
    };

    var a1 = this._INTERSECTIONS[1].x;
    var b1 = this._INTERSECTIONS[1].y;
    var c1 = this._INTERSECTIONS[1].z;
    var x1 = this._INTERSECTIONS[1].x - this._COM.x;
    var y1 = this._INTERSECTIONS[1].y - this._COM.y;
    var z1 = this._INTERSECTIONS[1].z - this._COM.z;

    var l1 = {
        origin: new THREE.Vector3(a1, b1, c1),
        direction: new THREE.Vector3(x1, y1, z1).normalize()
    };

    // danger if cross product fails (0,0,0)
    // test if vectors are parallels
    // if so, get the next point (assuming we have 3 points now...)
    var dotProd = l0.direction.dot(l1.direction);
    var normProd = l0.direction.length() * l1.direction.length();
    window.console.log(dotProd);
    window.console.log(normProd);

    if (Math.abs(dotProd - normProd) < epsilon || Math.abs(dotProd + normProd) < epsilon) {
        window.console.log('parallels, get next point');
        a1 = this._INTERSECTIONS[2].x;
        b1 = this._INTERSECTIONS[2].y;
        c1 = this._INTERSECTIONS[2].z;
        x1 = this._INTERSECTIONS[2].x - this._COM.x;
        y1 = this._INTERSECTIONS[2].y - this._COM.y;
        z1 = this._INTERSECTIONS[2].z - this._COM.z;

        l1 = {
            origin: new THREE.Vector3(a1, b1, c1),
            direction: new THREE.Vector3(x1, y1, z1).normalize()
        };
    } else {
        window.console.log('non parrallers, good to go');
    }

    var cross = new THREE.Vector3(0, 0, 0).crossVectors(l0.direction.normalize(), l1.direction).normalize();
    var base = new THREE.Vector3(0, 0, 0).crossVectors(l0.direction, cross).normalize();
    window.console.log('l0');
    window.console.log(l0);
    window.console.log('l1');
    window.console.log(l1);
    window.console.log('cross');
    window.console.log(cross);
    window.console.log('base');
    window.console.log(base);
    // push first point to list
    // this._ORDERERPOINTS.push({
    //     'angle': 0,
    //     'point': l0.origin,
    //     'xy': {
    //         'x': 1,
    //         'y': 0
    //     }
    // });

    // other lines // if inter, return location + angle
    for (var j = 0; j < this._INTERSECTIONS.length; j++) {

        a1 = this._INTERSECTIONS[j].x;
        b1 = this._INTERSECTIONS[j].y;
        c1 = this._INTERSECTIONS[j].z;
        x1 = this._INTERSECTIONS[j].x - this._COM.x;
        y1 = this._INTERSECTIONS[j].y - this._COM.y;
        z1 = this._INTERSECTIONS[j].z - this._COM.z;

        l1 = {
            origin: new THREE.Vector3(a1, b1, c1),
            direction: new THREE.Vector3(x1, y1, z1).normalize()
        };

        // if lines intersect, proceed
        // http://www.nabla.hr/PC-LinePlaneIn3DSp2.htm
        var intersect = -1;

        var origs = new THREE.Vector3(0, 0, 0).subVectors(l0.origin, l1.origin).normalize();
        intersect = origs.dot(cross);

        // why epsilon so big?
        if (Math.abs(intersect) < epsilon) {
            window.console.log('intersection!');
            var x = l0.direction.dot(l1.direction);
            var y = base.dot(l1.direction);

            var thetaAngle = Math.atan2(y, x);
            var theta = thetaAngle * (180 / Math.PI);
            window.console.log(theta);
            //     // get angle to order points!
            //     var cosAngle = l0.direction.dot(l1.direction) / (l0.direction.length() * l1.direction.length());
            //     var angle = Math.acos(cosAngle);
            this._ORDERERPOINTS.push({
                'angle': theta,
                'point': l1.origin,
                'xy': {
                    'x': x,
                    'y': y
                }
            });

            window.console.log(intersect);
            window.console.log(x, y);
            //     window.console.log(angle * (180 / Math.PI));

        } else {
            window.console.log('no intersection...!');
        }


        window.console.log('=====================');

    }

    window.console.log(this._ORDERERPOINTS);
    this._ORDERERPOINTS.sort(function(a, b) {
        return a.angle - b.angle;
    });


    this._ORDERERPOINTSYAY = [];
    for (var k = 0; k < this._ORDERERPOINTS.length; k++) {
        this._ORDERERPOINTSYAY.push(this._ORDERERPOINTS[k].point);
    }

    window.console.log(this._ORDERERPOINTS);

    // get intersection between RAS BBox and the slice plane
    this._IntersectionRASBBoxPlane = [this._INTERSECTIONS, null];
};
