void toUInt8(
    in float r, 
    out float value
){
    value = r * 255.;
}

#pragma glslify: export(toUInt8)
  
