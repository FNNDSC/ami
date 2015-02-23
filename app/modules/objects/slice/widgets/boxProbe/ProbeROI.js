'use strict';

var VJS = VJS || {};

VJS.ProbeROI = function() {
    this.domElement = null;
    this.nbPointsContainer = null;
    this.meanContainer = null;
    this.maxContainer = null;
    this.minContainer = null;
    this.varianceContainer = null;
    this.chartContainer = null;

    this.createDomElement();
};

VJS.ProbeROI.prototype.createDomElement = function() {

    // Number of voxels
    this.nbPointsContainer = document.createElement('div');
    this.nbPointsContainer.setAttribute('id', 'VJSProbeROINbPoints');

    // Mean value
    this.meanContainer = document.createElement('div');
    this.meanContainer.setAttribute('id', 'VJSProbeROIMean');

    // Max Value
    this.maxContainer = document.createElement('div');
    this.maxContainer.setAttribute('id', 'VJSProbeROIMax');

    // Min value
    this.minContainer = document.createElement('div');
    this.minContainer.setAttribute('id', 'VJSProbeROIMin');

    // Variance value
    this.varianceContainer = document.createElement('div');
    this.varianceContainer.setAttribute('id', 'VJSProbeROIVariance');

    // small trick so chart not drawn on top of it.
    this.update({});

    // Chart elements to display all info at once
    this.chartContainer = document.createElement('div');
    this.chartContainer.setAttribute('id', 'VJSProbeROIChart');
    // load empty chart
    // google.load('visualization', '1.0', {'packages':['corechart'], callback: this.drawChart.bind(this)});
    google.load('visualization', '1.1', {
        packages: ['line', 'bar'],
        callback: this.drawChart.bind(this)
    });


    this.domElement = document.createElement('div');
    this.domElement.setAttribute('id', 'VJSProbeROI');
    this.domElement.appendChild(this.nbPointsContainer);
    this.domElement.appendChild(this.meanContainer);
    this.domElement.appendChild(this.maxContainer);
    this.domElement.appendChild(this.minContainer);
    this.domElement.appendChild(this.varianceContainer);
    this.domElement.appendChild(this.chartContainer);
};

// should just pass the points and do stats here...
// but might be worst performance-wise
VJS.ProbeROI.prototype.update = function(points) {

    // ugly
    if (JSON.stringify(points) === '{}') {
        return;
    }

    // build data to update graph!
    var mean = 0;
    var nbPoints = points.points.length;
    var max = points.max;
    var min = points.min;
    var variance = 0;

    if (!this.chart && this.chartReady) {
        // init chart
        this.options = {
            title: 'Voxels Distribution in ROI',
            vAxis: {
                title: 'Nb of Voxels'
            },
            hAxis: {
                title: 'Intensity'
            }
        };

        this.chart = new google.charts.Bar(document.getElementById('VJSProbeROIChart'));
    }

    if (this.chart) {
        // create array to contain all data
        var range = points.max - points.min + 1;
        var data = new Array(range + 1);
        data[0] = ['Intensity', 'Nb of Voxels'];
        //init data..
        for (var i = 0; i < range; i++) {
            data[i + 1] = [points.min + i, 0];
        }

        // window.console.log('I\'m in');
        //  window.console.log(points.points.length);
        for (var j = 0; j < points.points.length; j++) {
            var pData = data[points.points[j].value - points.min + 1];
            pData[1] += 1;
        }

        // might be expensive to convert here, might be better to directly create right format.
        this.data = google.visualization.arrayToDataTable(data);
        this.chart.draw(this.data, this.options);
    }

    //  if(!this.chart && this.chartReady){
    //   // init chart
    //   this.options = {
    //     title : 'Voxels Distribution in ROI',
    //     vAxis: {title: 'Nb of Voxels'},
    //     hAxis: {title: 'Intensity'},
    //     animation:{
    //       duration: 5,
    //       easing: 'out',
    //     }
    //   };

    //   this.chart = new google.charts.Bar(document.getElementById('VJSProbeROIChart'));
    // }

    // if(this.chart){
    //   // create array to contain all data
    //   var range = points.max - points.min + 1;
    //   //
    //   var data = new google.visualization.DataTable();
    //   // Add columns
    //   data.addColumn('number', 'Intensity');
    //   data.addColumn('number', 'Nb of Voxels');

    //   // Add empty rows
    //   data.addRows(range);

    //   // window.console.log('I\'m in');
    //   //  window.console.log(points.points.length);
    //   for(var i=0; i<points.points.length; i++){
    //     var index = points.points[i].value - points.min;
    //     data.setCell(index, 0, points.points[i].value);
    //     var inc  = data.getValue(index, 1);
    //     // window.console.log(inc);
    //     if(inc == null){
    //       inc = 1;
    //     }
    //     else{
    //       // window.console.log('increment...');
    //       inc += 1;
    //     }

    //     data.setCell(index, 1, inc);

    //   }

    //   this.chart.draw(data, this.options);
    // }

    var nbPointsContent = nbPoints;
    this.nbPointsContainer.innerHTML = 'Nb of voxels: ' + nbPointsContent;

    var meanContent = mean;
    this.meanContainer.innerHTML = 'Mean: ' + meanContent;

    var maxContent = max;
    this.maxContainer.innerHTML = 'Max: ' + maxContent;

    var minContent = min;
    this.minContainer.innerHTML = 'Min: ' + minContent;

    var varianceContent = variance;
    this.varianceContainer.innerHTML = 'Variance: ' + varianceContent;

};

VJS.ProbeROI.prototype.drawChart = function() {
    this.chartReady = true;
};
