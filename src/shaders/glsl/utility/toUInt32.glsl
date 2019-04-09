void toUInt32(
    in float r, 
    in float g, 
    in float b, 
    in float a, 
    out float value
){
    value = r * 255. + g * 255. * 256. + b * 255. * 256. * 256. + a * 255. * 256. * 256. * 256.;
}

#pragma glslify: export(toUInt32)