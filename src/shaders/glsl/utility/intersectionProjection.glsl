/*
  varying vec4 vPos;
  varying mat4 vProjectionViewMatrix;
  varying vec4 vProjectedCoords;
*/

void intersectionProjection(
  in vec4 plane,
  in vec4 slice,
  out vec3 intersectionProjection){

      vec3 intersectionDirection = normalize(cross(plane.xyz, slice.xyz));
      vec3 intersectionPoint = 
        cross(intersectionDirection,slice.xyz) * plane.w +
        cross(plane.xyz, intersectionDirection) * slice.w;

      intersectionProjection =
        intersectionPoint.xyz +
        (dot(vPos.xyz - intersectionPoint, intersectionDirection)
          * intersectionDirection);

}

#pragma glslify: export(intersectionProjection)