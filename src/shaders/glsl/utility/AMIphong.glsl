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
  if (length(L) > 0.) {
    L = L / length(L);
  }
  vec3 V = eye - positionBeingLit;
  if (length(V) > 0.) {
    V = V / length(V);
  }
  vec3 R = reflect(-L, N);
  if (length(R) > 0.) {
    R = R / length(R);
  }

  // https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model
  vec3 h = L + V;
  vec3 H = h;
  if (length(h) > 0.) {
    H = H / length(h);
  }

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.) {
    // Light not visible from this point on the surface
    return ambientColor;
  } 

  if (dotRV < 0.) {
    // Light reflection in opposite direction as viewer, apply only diffuse component
    return ambientColor + lightIntensity * (diffuseColor * dotLN);
  }

  float specAngle = max(dot(H, normal), 0.0);
  float specular = pow(dotRV, shininess); //pow(specAngle, shininess); // 
  return ambientColor + lightIntensity * (diffuseColor * dotLN  + specularColor * specular);
}

#pragma glslify: export(AMIphong)