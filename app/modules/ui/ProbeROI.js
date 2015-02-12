var VJS = VJS || {};

VJS.ProbeROI = function(){
  this.domElement = null;
  this.nbPointsContainer = null;
  this.meanContainer = null;
  this.maxContainer = null;
  this.minContainer = null;
  this.varianceContainer = null;
  this.chartContainer = null;

  this.createDomElement();
}

VJS.ProbeROI.prototype.createDomElement = function(){

  // Number of voxels
  this.nbPointsContainer = document.createElement('div');
  this.nbPointsContainer.setAttribute("id", "VJSProbeROINbPoints");

  // Mean value
  this.meanContainer = document.createElement('div');
  this.meanContainer.setAttribute("id", "VJSProbeROIMean");

  // Max Value
  this.maxContainer = document.createElement('div');
  this.maxContainer.setAttribute("id", "VJSProbeROIMax");

  // Min value
  this.minContainer = document.createElement('div');
  this.minContainer.setAttribute("id", "VJSProbeROIMin");

  // Variance value
  this.varianceContainer = document.createElement('div');
  this.varianceContainer.setAttribute("id", "VJSProbeROIVariance");

  // small trick so chart not drawn on top of it.
  this.update({});

  // Chart elements to display all info at once
  this.chartContainer = document.createElement('div');
  this.chartContainer.setAttribute("id", "VJSProbeROIChart");
  // load empty chart
  var self = this;
  // google.load('visualization', '1.0', {'packages':['corechart'], callback: this.drawChart.bind(this)});
   google.load('visualization', '1.1', {packages: ['line'], callback: this.drawChart.bind(this)});


  this.domElement = document.createElement('div');
  this.domElement.setAttribute("id", "VJSProbeROI");
  this.domElement.appendChild(this.nbPointsContainer);
  this.domElement.appendChild(this.meanContainer);
  this.domElement.appendChild(this.maxContainer);
  this.domElement.appendChild(this.minContainer);
  this.domElement.appendChild(this.varianceContainer);
  this.domElement.appendChild(this.chartContainer);
}

// should just pass the points and do stats here...
// but might be worst performance-wise
VJS.ProbeROI.prototype.update = function(points){

  // ugly
  if(JSON.stringify(points) === '{}'){
    return;
  }

  // build data to update graph!
  var mean = 0;
  var nbPoints = points.points.length;
  var max = points.max;
  var min = points.min;
  var variance = 0;

  //   this.data = google.visualization.arrayToDataTable([
  //   ['Value', 'Intensity'],
  //   ['0',  165],
  //   ['1',  135],
  //   ['2',  157],
  //   ['3',  139],
  //   ['4',  136]
  // ]);

if(this.chart){
  // create array to contain all data
  var range = points.max - points.min + 1;
  var data = Array(range + 1);
  data[0] = ['Value', 'Intensity'];
  var index = 1;
  //init data..
  for(var i = 0; i<range; i++ ){
    data[i+1] = [ points.min + i, 0]
  }

  // window.console.log('I\'m in');
  //  window.console.log(points.points.length);
  for(var i=0; i<points.points.length; i++){
    var pData = data[ points.points[i].value - points.min + 1];
      pData[1] += 1;
  }

  // window.console.log(data);

this.data = google.visualization.arrayToDataTable(data);
this.chart.draw(this.data, this.options);

}

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

}

VJS.ProbeROI.prototype.drawChart = function () {
  window.console.log(this);
  // Some raw data (not necessarily accurate)
  this.data = google.visualization.arrayToDataTable([
    ['Value', 'Intensity'],
    [0,  165],
    [1,  135],
    [2,  157],
    [3,  139],
    [4,  136]
  ]);

  this.options = {
    title : 'Voxels Distribution in ROI',
    vAxis: {title: "Nb Voxels"},
    hAxis: {title: "Intensity"},
    seriesType: "bars",
      animation:{
        duration: 10,
        easing: 'out',
      },
    // series: {5: {type: "line"}}
  };

  // Instantiate and draw our chart, passing in some options.
  // this.chart = new google.visualization.LineChart(document.getElementById('VJSProbeROIChart'));
  this.chart = new google.charts.Line(document.getElementById('VJSProbeROIChart'));
  this.chart.draw(this.data, this.options);
}