require('shelljs/global');

if(process.argv[2] && process.argv[3]){

  const mode = process.argv[2];
  const target = process.argv[3];
  const file = (mode === 'lessons') ? 'demo.js' : `${target}.js`;
  const directory = `${mode}/${target}`;

  exec(`npm run dist --ami.js:mode=${mode} --ami.js:target=${directory}/${file} --ami.js:open=${directory}/`);
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