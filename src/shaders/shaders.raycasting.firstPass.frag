uniform float uWorldBBox[6];

varying vec4 vPos;

void main(void) {

  // NORMALIZE LPS VALUES
  gl_FragColor = vec4((vPos.x - uWorldBBox[0])/(uWorldBBox[1] - uWorldBBox[0]),
                      (vPos.y - uWorldBBox[2])/(uWorldBBox[3] - uWorldBBox[2]),
                      (vPos.z - uWorldBBox[4])/(uWorldBBox[5] - uWorldBBox[4]),
                      1.0);

}