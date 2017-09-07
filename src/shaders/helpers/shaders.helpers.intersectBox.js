import ShadersBase from '../shaders.base';

class IntersectBox extends ShadersBase {
  constructor() {
    super();
    this.name = 'intersectBox';

    // default properties names
    this._rayOrigin = 'rayOrigin';
    this._rayDirection = 'rayDirection';
    this._aabbMin = 'aabbMin';
    this._aabbMax = 'aabbMax';
    this._tNear = 'tNear';
    this._tFar = 'tFar';
    this._intersect = 'intersect';
  }

  api(baseFragment = this._base,
       rayOrigin = this._rayOrigin, rayDirection = this._rayDirection,
       aabbMin = this._aabbMin, aabbMax = this._aabbMax,
       tNear = this._tNear, tFar = this._tFar,
       intersect = this._intersect) {
    this._base = baseFragment;
    return this.compute(rayOrigin, rayDirection, aabbMin, aabbMax, tNear, tFar, intersect);
  }

  compute(rayOrigin, rayDirection, aabbMin, aabbMax, tNear, tFar, intersect) {
    this.computeDefinition();
    this._base._functions[this._name] = this._definition;
    return `${this._name}(${rayOrigin}, ${rayDirection}, ${aabbMin}, ${aabbMax}, ${tNear}, ${tFar}, ${intersect});`;
  }

  computeDefinition() {
    this._definition = `
void ${this._name}(vec3 rayOrigin, vec3 rayDirection, vec3 boxMin, vec3 boxMax, out float tNear, out float tFar, out bool intersect){
  // compute intersection of ray with all six bbox planes
  vec3 invRay = vec3(1.) / rayDirection;
  vec3 tBot = invRay * (boxMin - rayOrigin);
  vec3 tTop = invRay * (boxMax - rayOrigin);
  // re-order intersections to find smallest and largest on each axis
  vec3 tMin = min(tTop, tBot);
  vec3 tMax = max(tTop, tBot);
  // find the largest tMin and the smallest tMax
  float largest_tMin = max(max(tMin.x, tMin.y), max(tMin.x, tMin.z));
  float smallest_tMax = min(min(tMax.x, tMax.y), min(tMax.x, tMax.z));
  tNear = largest_tMin;
  tFar = smallest_tMax;
  intersect = smallest_tMax > largest_tMin;
}

    `;
  }
}

export default new IntersectBox();
