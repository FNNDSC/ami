/* globals AMI*/

// element to contain the progress bar
var container = document.getElementById('container');

// instantiate the loader
var loader = new AMI.VolumeLoader(container);

var t2 = ['36444280', '36444294', '36444308', '36444322', '36444336'];
var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/adi_brain/' + v;
});

// once all files have been loaded (fetch + parse + add to array)
// merge them into series / stacks / frames
loader
    .load(files)
    .then(function() {
        // merge files into clean series/stack/frame structure
        var series = loader.data[0].mergeSeries(loader.data);
        loader.free();
        loader = null;

        // series/stacks/frames are ready to be used
        window.console.log(series);

        // Display some content on the DOM
        var seriesIndex = 1;
        for (var mySeries of series) {
            var seriesDiv = document.createElement('div');
            seriesDiv.className += 'indent';
            seriesDiv.insertAdjacentHTML('beforeend', '<div> SERIES (' + seriesIndex + '/' + series.length + ')</div>');
            seriesDiv.insertAdjacentHTML(
                'beforeend',
                '<div class="series"> numberOfChannels: ' + mySeries.numberOfChannels + '</div>'
            );

            container.appendChild(seriesDiv);

            // loop through stacks
            var stackIndex = 1;
            for (var myStack of mySeries.stack) {
                var stackDiv = document.createElement('div');
                stackDiv.className += 'indent';
                stackDiv.insertAdjacentHTML(
                    'beforeend',
                    '<div> STACK (' + stackIndex + '/' + mySeries.stack.length + ')</div>'
                );
                stackDiv.insertAdjacentHTML(
                    'beforeend',
                    '<div class="stack"> bitsAllocated: ' + myStack.bitsAllocated + '</div>'
                );

                seriesDiv.appendChild(stackDiv);

                // loop through frames
                var frameIndex = 1;
                for (var myFrame of myStack.frame) {
                    var frameDiv = document.createElement('div');
                    frameDiv.className += 'indent';
                    frameDiv.insertAdjacentHTML(
                        'beforeend',
                        '<div> FRAME (' + frameIndex + '/' + myStack.frame.length + ')</div>'
                    );
                    frameDiv.insertAdjacentHTML(
                        'beforeend',
                        '<div class="frame"> instanceNumber: ' + myFrame.instanceNumber + '</div>'
                    );

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
