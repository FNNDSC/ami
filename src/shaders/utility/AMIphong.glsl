const float EPSILON = 0.0000152587;

/**
 * Adapted from original sources
 * 
 * Original code: 
 * http://jamie-wong.com/2016/07/15/ray-marching-signed-distance-functions/
 * https://www.shadertoy.com/view/lt33z7

 * The vec3 returned is the RGB color of the light's contribution.
 
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 AMIphong(
    vec3 ambientColor, 
    vec3 diffuseColor, 
    vec3 specularColor, 
    float shininess, 
    vec3 positionBeingLit, 
    vec3 eye,
    vec3 lightPos, 
    vec3 lightIntensity, 
    vec3 normal
) {
  vec3 N = normal;
  vec3 L = lightPos - positionBeingLit;
  L = L / (length(L) + EPSILON);
  vec3 V = eye - positionBeingLit;
  V = V / (length(V) + EPSILON);
  vec3 R = reflect(-L, N);
  R = R / (length(R) + EPSILON);

  // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model
  vec3 h = L + V;
  vec3 H = h;
  H = H / (length(H) + EPSILON);

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  // Light not visible from this point on the surface
  if (dotLN < 0.) {
    return ambientColor;
  } 
  // DOES NOT NEED REMOVAL
  // Statically uniform branching condition - cannot cause wavefront divergance
  // ---------------------------------------------------------------------------
  // Light reflection in opposite direction as viewer, apply only diffuse component
  if (dotRV < 0.) {
    return ambientColor + lightIntensity * (diffuseColor * dotLN);
  }

  float specAngle = max(dot(H, normal), 0.0);
  float specular = pow(dotRV, shininess);
  return ambientColor + lightIntensity * (diffuseColor * dotLN  + specularColor * specular);
}

#pragma glslify: export(AMIphong)