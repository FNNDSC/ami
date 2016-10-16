const fs     = require('fs');
const path   = require('path');
const config = require('./config.js');

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " --dev");
    process.exit(-1);
}
// --dev
// --build
// --demo

let _mode = 'dev';
let _destRootDir = 'dev'
let _destFile = 'index.html';

if(process.argv[2] === '--dist'){
  _mode = 'dist';
  _destRootDir = 'dist';
}

const targetDir = 'examples/';
const destRootDir = _destRootDir;
const destFile = _destFile;
const destDir = path.join(destRootDir, targetDir);
const mode = _mode;
const ExampleTemplate = require('./examplesTemplate.js');

//
try {
  fs.statSync(destRootDir);
} catch(e){
  fs.mkdirSync(destRootDir);
}

// <dev> or <dist> or <> / lessons
try {
  fs.statSync(destDir);
} catch(e){
  fs.mkdirSync(destDir);
}

// parse target dir
fs.readdir(targetDir, function(e, files) {
  // each lesson directory
  files.forEach(function(file) {

    const lessonName = file;
    const lessonTargetDir = path.join(targetDir,lessonName);
    const lessonContentHMTL = path.join(lessonTargetDir, lessonName + '.html');
    const lessonDestDir = path.join(destDir,lessonName);
    const lessonDestFile = path.join(lessonDestDir, destFile);
    const toCopy = [lessonName+'.css'];
    const exampleTemplate = new ExampleTemplate.ExampleTemplate();
    exampleTemplate.name = lessonName;
    exampleTemplate.content = fs.readFileSync(lessonContentHMTL, 'utf8');
    exampleTemplate.mode = mode;

    // <dev> or <dist> or <> / lessons / <lessonName>
    try {
      fs.statSync(lessonDestDir);
    } catch(e){
      fs.mkdirSync(lessonDestDir);
    }

    // copy files to right location
    toCopy.forEach(function(file){
      const targetFile = path.join(lessonTargetDir,file);
      const destFile = path.join(lessonDestDir,file);
      fs.createReadStream(targetFile).pipe(fs.createWriteStream(destFile));
    });
    
    fs.writeFile(lessonDestFile, exampleTemplate.html(), (err) => {
      if (err) throw err;
      console.log('Write: ' + lessonDestFile);
    });

  });

});