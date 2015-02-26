'use strict';

var VJS = VJS || {};
VJS.Adaptor = VJS.Adaptor || {};

VJS.Adaptor.Xtk2ThreejsVec3 = function(xVec3) {

    var vVec3 = new THREE.Vector3(xVec3[0], xVec3[1], xVec3[2]);

    return vVec3;
};


VJS.Adaptor.Xtk2ThreejsMat4 = function(xMat4) {

    var vMat4 = new THREE.Matrix4().set(
        xMat4[0], xMat4[4], xMat4[8], xMat4[12],
        xMat4[1], xMat4[5], xMat4[9], xMat4[13],
        xMat4[2], xMat4[6], xMat4[10], xMat4[14],
        xMat4[3], xMat4[7], xMat4[11], xMat4[15]);

    return vMat4;
};
