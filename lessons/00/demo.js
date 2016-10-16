/* globals Stats, dat, AMI*/

// VJS classes we will be using in this lesson
var LoadersVolume = AMI.default.Loaders.Volume;

// element to contain the progress bar
var container = document.getElementById('container');

// instantiate the loader
var loader = new LoadersVolume(container);

var t2 = ['36444280', '36444294', '36444308', '36444322', '36444336'];
var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
  });
  

// load sequence for each file
// 1- fetch
// 2- parse
// 3- add to array
var seriesContainer = [];
var loadSequence = [];
files.forEach(function(url) {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(function() {
        return loader.fetch(url);
      })
      .then(function(data) {
        return loader.parse(data);
      })
      .then(function(series) {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

// once all files have been loaded (fetch + parse + add to array)
// merge them into series / stacks / frames
Promise
.all(loadSequence)
  .then(function() {
    loader.free();
    loader = null;

    // merge files into clean series/stack/frame structure
    var series = seriesContainer[0].mergeSeries(seriesContainer);

    // series/stacks/frames are ready to be used
    window.console.log(series);

    // Display some content on the DOM
    var seriesIndex = 1;
    for(var mySeries of series){
      var seriesDiv = document.createElement("div");
      seriesDiv.className += "indent";
      seriesDiv.insertAdjacentHTML('beforeend', '<div> SERIES (' + seriesIndex + '/' + series.length + ')</div>');
      seriesDiv.insertAdjacentHTML('beforeend', '<div class="series"> numberOfChannels: ' + mySeries.numberOfChannels+ '</div>');

      container.appendChild(seriesDiv);

      // loop through stacks
      var stackIndex = 1;
      for(var myStack of mySeries.stack){
        var stackDiv = document.createElement("div");
        stackDiv.className += "indent";
        stackDiv.insertAdjacentHTML('beforeend', '<div> STACK (' + stackIndex + '/' + mySeries.stack.length + ')</div>');
        stackDiv.insertAdjacentHTML('beforeend', '<div class="stack"> bitsAllocated: ' + myStack.bitsAllocated+ '</div>');

        seriesDiv.appendChild(stackDiv);

        // loop through frames
        var frameIndex = 1;
        for(var myFrame of myStack.frame){
          var frameDiv = document.createElement("div");
          frameDiv.className += "indent";
          frameDiv.insertAdjacentHTML('beforeend', '<div> FRAME (' + frameIndex + '/' + myStack.frame.length + ')</div>');
          frameDiv.insertAdjacentHTML('beforeend', '<div class="frame"> instanceNumber: ' + myFrame.instanceNumber+ '</div>');

          stackDiv.appendChild(frameDiv);
          frameIndex++;
        }

        stackIndex++;

      }

      seriesIndex++;

    }

  })
  .catch(function(error) {
    window.console.log('oops... something went wrong...');
    window.console.log(error);
  });

