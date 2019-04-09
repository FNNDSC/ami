float luma (vec3 rgb) {
  return (rgb.r + rgb.g + rgb.b)/3.0;
}

#pragma glslify: export(luma)