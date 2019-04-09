void toUFloat32(in float r, in float g, in float b, in float a, out float value){

    // create arrays containing bits for rgba values
    // value between 0 and 255
    value = r * 255.;
    int bytemeR[8];
    bytemeR[0] = int(floor(value / 128.));
    value -= float(bytemeR[0] * 128);
    bytemeR[1] = int(floor(value / 64.));
    value -= float(bytemeR[1] * 64);
    bytemeR[2] = int(floor(value / 32.));
    value -= float(bytemeR[2] * 32);
    bytemeR[3] = int(floor(value / 16.));
    value -= float(bytemeR[3] * 16);
    bytemeR[4] = int(floor(value / 8.));
    value -= float(bytemeR[4] * 8);
    bytemeR[5] = int(floor(value / 4.));
    value -= float(bytemeR[5] * 4);
    bytemeR[6] = int(floor(value / 2.));
    value -= float(bytemeR[6] * 2);
    bytemeR[7] = int(floor(value));

    value = g * 255.;
    int bytemeG[8];
    bytemeG[0] = int(floor(value / 128.));
    value -= float(bytemeG[0] * 128);
    bytemeG[1] = int(floor(value / 64.));
    value -= float(bytemeG[1] * 64);
    bytemeG[2] = int(floor(value / 32.));
    value -= float(bytemeG[2] * 32);
    bytemeG[3] = int(floor(value / 16.));
    value -= float(bytemeG[3] * 16);
    bytemeG[4] = int(floor(value / 8.));
    value -= float(bytemeG[4] * 8);
    bytemeG[5] = int(floor(value / 4.));
    value -= float(bytemeG[5] * 4);
    bytemeG[6] = int(floor(value / 2.));
    value -= float(bytemeG[6] * 2);
    bytemeG[7] = int(floor(value));

    value = b * 255.;
    int bytemeB[8];
    bytemeB[0] = int(floor(value / 128.));
    value -= float(bytemeB[0] * 128);
    bytemeB[1] = int(floor(value / 64.));
    value -= float(bytemeB[1] * 64);
    bytemeB[2] = int(floor(value / 32.));
    value -= float(bytemeB[2] * 32);
    bytemeB[3] = int(floor(value / 16.));
    value -= float(bytemeB[3] * 16);
    bytemeB[4] = int(floor(value / 8.));
    value -= float(bytemeB[4] * 8);
    bytemeB[5] = int(floor(value / 4.));
    value -= float(bytemeB[5] * 4);
    bytemeB[6] = int(floor(value / 2.));
    value -= float(bytemeB[6] * 2);
    bytemeB[7] = int(floor(value));

    value = a * 255.;
    int bytemeA[8];
    bytemeA[0] = int(floor(value / 128.));
    value -= float(bytemeA[0] * 128);
    bytemeA[1] = int(floor(value / 64.));
    value -= float(bytemeA[1] * 64);
    bytemeA[2] = int(floor(value / 32.));
    value -= float(bytemeA[2] * 32);
    bytemeA[3] = int(floor(value / 16.));
    value -= float(bytemeA[3] * 16);
    bytemeA[4] = int(floor(value / 8.));
    value -= float(bytemeA[4] * 8);
    bytemeA[5] = int(floor(value / 4.));
    value -= float(bytemeA[5] * 4);
    bytemeA[6] = int(floor(value / 2.));
    value -= float(bytemeA[6] * 2);
    bytemeA[7] = int(floor(value));

    // compute float32 value from bit arrays

    // sign
    int issigned = 1 - 2 * bytemeR[0];
    //   issigned = int(pow(-1., float(bytemeR[0])));

    // exponent
    int exponent = 0;

    exponent += bytemeR[1] * int(pow(2., 7.));
    exponent += bytemeR[2] * int(pow(2., 6.));
    exponent += bytemeR[3] * int(pow(2., 5.));
    exponent += bytemeR[4] * int(pow(2., 4.));
    exponent += bytemeR[5] * int(pow(2., 3.));
    exponent += bytemeR[6] * int(pow(2., 2.));
    exponent += bytemeR[7] * int(pow(2., 1.));

    exponent += bytemeG[0];


    // fraction
    float fraction = 0.;

    fraction = float(bytemeG[1]) * pow(2., -1.);
    fraction += float(bytemeG[2]) * pow(2., -2.);
    fraction += float(bytemeG[3]) * pow(2., -3.);
    fraction += float(bytemeG[4]) * pow(2., -4.);
    fraction += float(bytemeG[5]) * pow(2., -5.);
    fraction += float(bytemeG[6]) * pow(2., -6.);
    fraction += float(bytemeG[7]) * pow(2., -7.);

    fraction += float(bytemeB[0]) * pow(2., -8.);
    fraction += float(bytemeB[1]) * pow(2., -9.);
    fraction += float(bytemeB[2]) * pow(2., -10.);
    fraction += float(bytemeB[3]) * pow(2., -11.);
    fraction += float(bytemeB[4]) * pow(2., -12.);
    fraction += float(bytemeB[5]) * pow(2., -13.);
    fraction += float(bytemeB[6]) * pow(2., -14.);
    fraction += float(bytemeB[7]) * pow(2., -15.);

    fraction += float(bytemeA[0]) * pow(2., -16.);
    fraction += float(bytemeA[1]) * pow(2., -17.);
    fraction += float(bytemeA[2]) * pow(2., -18.);
    fraction += float(bytemeA[3]) * pow(2., -19.);
    fraction += float(bytemeA[4]) * pow(2., -20.);
    fraction += float(bytemeA[5]) * pow(2., -21.);
    fraction += float(bytemeA[6]) * pow(2., -22.);
    fraction += float(bytemeA[7]) * pow(2., -23.);

    value = float(issigned) * pow( 2., float(exponent - 127)) * (1. + fraction);
}
#pragma glslify: export(toUFloat32)