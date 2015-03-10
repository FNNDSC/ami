'use strict';

var VJS = VJS || {};
VJS.Intersections = VJS.Intersections || {};

VJS.Intersections.OBBPlane = function(obb, plane) {

    //
    // obb = { halfDimensions, orientation, center, toOBBSpace, toOBBS }
    // plane = { origin, normal }
    //
    //
    // LOGIC:
    //
    // Test intersection of each edge of the Oriented Bounding Box with the Plane
    // 
    // ALL EDGES 
    //
    //      .+-------+  
    //    .' |     .'|  
    //   +---+---+'  |  
    //   |   |   |   |  
    //   |  ,+---+---+  
    //   |.'     | .'   
    //   +-------+'     
    //
    // SPACE ORIENTATION
    //
    //       +
    //     j |
    //       |
    //       |   i 
    //   k  ,+-------+  
    //    .'
    //   +
    //
    //
    // 1- Move Plane origin and orientation in IJK space
    // 2- Test Edges/ IJK Plane intersections
    // 3- Return intersection Edge/ IJK Plane if it touches the Oriented BBox


    var intersections = [];

    var t1 = plane.normal.clone().applyMatrix4(obb.toOBBSpace);
    var t0 = new THREE.Vector3(0, 0, 0).applyMatrix4(obb.toOBBSpace);

    var planeOBB = {
        origin: plane.origin.clone().applyMatrix4(obb.toOBBSpace),
        normal: new THREE.Vector3(t1.x - t0.x, t1.y - t0.y, t1.z - t0.z).normalize()
    };

    // 12 edges (i.e. ray)/plane intersection tests

    // RAYS STARTING FROM THE FIRST CORNER (0, 0, 0)
    //
    //       +
    //       |
    //       |
    //       | 
    //      ,+---+---+
    //    .'   
    //   +   

    var ray = {
        'origin': new THREE.Vector3(obb.center.x - obb.halfDimensions.x, obb.center.y - obb.halfDimensions.y, obb.center.z - obb.halfDimensions.z),
        'normal': obb.orientation.x
    };

    var intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.y;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.z;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    // RAYS STARTING FROM THE LAST CORNER
    //
    //               +
    //             .'
    //   +-------+'
    //           |
    //           |
    //           |
    //           +
    //

    ray = {
        'origin': new THREE.Vector3(obb.center.x + obb.halfDimensions.x, obb.center.y + obb.halfDimensions.y, obb.center.z + obb.halfDimensions.z),
        'normal': obb.orientation.x
    };

    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.y;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.z;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    // RAYS STARTING FROM THE SECOND CORNER
    //
    //               +
    //               |
    //               |
    //               |
    //               +
    //             .'
    //           +'

    ray = {
        'origin': new THREE.Vector3(obb.center.x + obb.halfDimensions.x, obb.center.y - obb.halfDimensions.y, obb.center.z - obb.halfDimensions.z),
        'normal': obb.orientation.y
    };

    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.z;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    // RAYS STARTING FROM THE THIRD CORNER
    //
    //      .+-------+  
    //    .'
    //   +
    //   
    //   
    //   
    //   

    ray = {
        'origin': new THREE.Vector3(obb.center.x - obb.halfDimensions.x, obb.center.y + obb.halfDimensions.y, obb.center.z - obb.halfDimensions.z),
        'normal': obb.orientation.x
    };

    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.z;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    // RAYS STARTING FROM THE FOURTH CORNER
    //
    //   
    //   
    //   +
    //   |
    //   |  
    //   |
    //   +-------+

    ray = {
        'origin': new THREE.Vector3(obb.center.x - obb.halfDimensions.x, obb.center.y - obb.halfDimensions.y, obb.center.z + obb.halfDimensions.z),
        'normal': obb.orientation.x
    };

    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    ray.normal = obb.orientation.y;
    intersection = this.RayPlane(ray, planeOBB);
    if (intersection && intersection.x >= 0 && intersection.y >= 0 && intersection.z >= 0 &&
        intersection.x <= 2 * obb.halfDimensions.x &&
        intersection.y <= 2 * obb.halfDimensions.y &&
        intersection.z <= 2 * obb.halfDimensions.z) {
        intersections.push(intersection.applyMatrix4(obb.toOBBSpaceInvert));
    }

    return intersections;
};

VJS.Intersections.RayPlane = function(ray, plane) {
    // ray: {origin, normal}
    // plane: {origin, normal}

    if (ray.normal.dot(plane.normal) !== 0) {
        //
        // not parallel, move forward
        //
        // LOGIC:
        //
        // Ray equation: P = P0 + tV
        // P = <Px, Py, Pz>
        // P0 = <ray.origin.x, ray.origin.y, ray.origin.z>
        // V = <ray.normal.x, ray.normal.y, ray.normal.z>
        //
        // Therefore:
        // Px = ray.origin.x + t*ray.normal.x
        // Py = ray.origin.y + t*ray.normal.y
        // Pz = ray.origin.z + t*ray.normal.z
        //
        //
        //
        // Plane equation: ax + by + cz + d = 0
        // a = plane.normal.x
        // b = plane.normal.y
        // c = plane.normal.z
        // d = -( plane.normal.x*plane.origin.x +
        //        plane.normal.y*plane.origin.y +
        //        plane.normal.z*plane.origin.z )
        //
        //
        // 1- in the plane equation, we replace x, y and z by Px, Py and Pz
        // 2- find t
        // 3- replace t in Px, Py and Pz to get the coordinate of the intersection
        //
        var t = (plane.normal.x * (plane.origin.x - ray.origin.x) + plane.normal.y * (plane.origin.y - ray.origin.y) + plane.normal.z * (plane.origin.z - ray.origin.z)) /
            (plane.normal.x * ray.normal.x + plane.normal.y * ray.normal.y + plane.normal.z * ray.normal.z);

        var intersection = new THREE.Vector3(
            ray.origin.x + t * ray.normal.x,
            ray.origin.y + t * ray.normal.y,
            ray.origin.z + t * ray.normal.z);

        return intersection;

    }

    return;

};
