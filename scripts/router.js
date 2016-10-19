require('shelljs/global');

if(process.argv[2] && process.argv[3]){

  const mode = process.argv[2];
  const file = (mode === 'lessons') ? 'demo.js' : `${process.argv[3]}.js`;
  const directory = `${mode}/${file}`;

  exec(`npm run dist --ami.js:mode=${mode} --ami.js:target=${directory}/${file}.js --ami.js:open=${directory}/`);
  // also watch AMI if lessons mode
  if(mode === 'lessons'){
    exec('npm run dist:watchAmi');
  }
}
else{

  console.warn('router.js requires 2 arguments. Make sure the following arguments are correct:');
  process.argv.forEach(function (val, index, array) {
    console.warn(index + ': ' + val);
  });

}