var VJS = VJS || {};

VJS.ProbeROI = function(){
  this.domElement = null;
  this.nbPointsContainer = null;
  this.meanContainer = null;
  this.maxContainer = null;
  this.minContainer = null;
  this.varianceContainer = null;

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

  // Graph elements to display all info at once

  this.domElement = document.createElement('div');
  this.domElement.setAttribute("id", "VJSProbeROI");
  this.domElement.appendChild(this.nbPointsContainer);
  this.domElement.appendChild(this.meanContainer);
  this.domElement.appendChild(this.maxContainer);
  this.domElement.appendChild(this.minContainer);
  this.domElement.appendChild(this.varianceContainer);
}

// should just pass the points and do stats here...
VJS.ProbeROI.prototype.update = function(nbPoints, mean, max, min, variance, points){
  var nbPointsContent = nbPoints;
  this.nbPointsContainer.innerHTML = 'Nb of points: ' + nbPointsContent;

  var meanContent = mean;
  this.meanContainer.innerHTML = 'Mean: ' + meanContent;

  var maxContent = max;
  this.maxContainer.innerHTML = 'Max: ' + maxContent;

  var minContent = min;
  this.minContainer.innerHTML = 'Min: ' + minContent;

  var varianceContent = variance;
  this.varianceContainer.innerHTML = 'Variance: ' + varianceContent;

}