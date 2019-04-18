void intersectsBox(
    vec3 rayOrigin, 
    vec3 rayDirection, 
    vec3 boxMin, 
    vec3 boxMax, 
    out float tNear, 
    out float tFar, 
    out bool intersect
) {
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

#pragma glslify: export(intersectsBox)