const fs = require('fs');
const path = require('path');

if (process.argv.length <= 2) {
    console.log(`Usage: ${__filename} --dev`);
    process.exit(-1);
}
// --dev
// --demo

let _mode = 'dist';
let _destRootDir = 'dist';
let _destFile = 'index.html';

if (process.argv[2] === '--demo') {
  // inplace replace demo.thml
  _mode = 'demo';
  _destRootDir = '';
  _destFile = 'demo.html';
}

const targetDir = 'lessons/';
const destRootDir = _destRootDir;
const destFile = _destFile;
const destDir = path.join(destRootDir, targetDir);
const mode = _mode;
const LessonTemplate = require('./templates/lessons.js');

//
if (_destRootDir!=='') {
  try {
    fs.statSync(destRootDir);
  } catch (e) {
    fs.mkdirSync(destRootDir);
  }
}

// <dev> or <dist> or <> / lessons
try {
  fs.statSync(destDir);
} catch (e) {
  fs.mkdirSync(destDir);
}

// parse target dir
fs.readdir(targetDir, function(e, files) {
  // each lesson directory
  files.forEach(function(file) {
    const lessonName = file;
    const lessonTargetDir = path.join(targetDir, lessonName);
    const lessonContentHMTL = path.join(lessonTargetDir, lessonName + '.html');
    const lessonDestDir = path.join(destDir, lessonName);
    const lessonDestFile = path.join(lessonDestDir, destFile);
    const toCopy = ['demo.js', 'demo.css'];
    const lessonTemplate = new LessonTemplate.LessonTemplate();
    lessonTemplate.name = lessonName;
    lessonTemplate.content = fs.readFileSync(lessonContentHMTL, 'utf8');
    lessonTemplate.mode = mode;

    // <dev> or <dist> or <> / lessons / <lessonName>
    try {
      fs.statSync(lessonDestDir);
    } catch (e) {
      fs.mkdirSync(lessonDestDir);
    }

    // if dev, generate proper index.html in proper location
    if (mode !== 'demo') {
      // copy static files to right location
      toCopy.forEach(function(file) {
        let targetFile = path.join(lessonTargetDir, file);
        let destFile = path.join(lessonDestDir, file);
        fs.readFile(targetFile, 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
          }

          fs.writeFile(destFile, data, (err) => {
          if (err) throw err;
            console.log('Write: ' + destFile);
          });
        });

        fs.createReadStream(targetFile).pipe(fs.createWriteStream(destFile));
      });
    }


    fs.writeFile(lessonDestFile, lessonTemplate.html(), (err) => {
      if (err) throw err;
      console.log('Write: ' + lessonDestFile);
    });

    // if build, generate proper index.html in proper location

    // if demo, create proper demo.html in proper location
  });
});
