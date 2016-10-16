require('shelljs/global');

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

if( process.argv[2] === 'lessons' && process.argv[3] ){

  exec(`npm run dev --ami.js:target=${process.argv[2]}/${process.argv[3]}/demo.js`);
  // also watch ami.js!   

}
else if( process.argv[2] === 'examples' && process.argv[3] ){

  exec(`npm run dev --ami.js:target=${process.argv[2]}/${process.argv[3]}/${process.argv[3]}.js`);

}
