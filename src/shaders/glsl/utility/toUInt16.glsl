void toUInt16(
    in float r, 
    in float a, 
    out float value
) {
void uInt16(){
    value = r * 255. + a * 255. * 256.;
}

#pragma glslify: export(toUInt16)