const filenames = [
  '36444280',
  '36444294',
  '36444308',
  '36444322',
  '36444336',
  '36444350',
  '36444364',
  '36444378',
  '36444392',
  '36444406',
  '36444434',
  '36444448',
  '36444462',
  '36444476',
  '36444490',
  '36444504',
  '36444518',
  '36444532',
  '36746856',
];

export const files = filenames.map(filename => {
  return `https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/${filename}`;
});

export const colors = {
  red: 0xff0000,
  blue: 0x0000ff,
  darkGrey: 0x353535,
};
