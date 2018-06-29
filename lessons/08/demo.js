/* globals AMI*/

var CustomProgressBar = function(container) {
    this._container = container;
    this._modes = {
        load: {
            name: 'load',
            color: '#FF0000'
        },
        parse: {
            name: 'parse',
            color: '#00FF00'
        }
    };
    this._requestAnimationFrameID = null;
    this._mode = null;
    this._value = null;
    this._total = null;

    this.init = function() {
        var container = document.createElement('div');
        container.classList.add('progress');
        container.classList.add('container');
        container.innerHTML =
            '<div class="progress load"></div><div class="progress parse">Parsing data <div class="beat">♥</div></div>';
        this._container.appendChild(container);
        // start rendering loop
        this.updateUI();
    }.bind(this);

    this.update = function(value, total, mode) {
        this._mode = mode;
        this._value = value;
        // depending on CDN, total return to XHTTPRequest can be 0.
        // In this case, we generate a random number to animate the progressbar
        if (total === 0) {
            this._total = value;
            this._value = Math.random() * value;
        } else {
            this._total = total;
        }
    }.bind(this);

    this.updateUI = function() {
        var self = this;
        this._requestAnimationFrameID = requestAnimationFrame(self.updateUI);

        if (
            !(
                this._modes.hasOwnProperty(this._mode) &&
                this._modes[this._mode].hasOwnProperty('name') &&
                this._modes[this._mode].hasOwnProperty('color')
            )
        ) {
            return false;
        }

        var progress = Math.round(this._value / this._total * 100);
        var color = this._modes[this._mode].color;

        var progressBar = this._container.getElementsByClassName('progress ' + this._modes[this._mode].name);
        if (progressBar.length > 0) {
            progressBar[0].style.borderColor = color;
            progressBar[0].style.width = progress + '%';
        }
        progressBar = null;

        if (this._mode === 'parse') {
            // hide progress load
            var loader = this._container.getElementsByClassName('progress load');
            loader[0].style.display = 'none';
            // show progress parse
            var container = this._container.getElementsByClassName('progress container');
            container[0].style.height = 'auto';
            container[0].style.width = 'auto';
            container[0].style.padding = '10px';
            var parser = this._container.getElementsByClassName('progress parse');
            parser[0].style.display = 'block';
            parser[0].style.width = '100%';
        }
    }.bind(this);

    this.free = function() {
        var progressContainers = this._container.getElementsByClassName('progress container');
        // console.log( progressContainers );
        if (progressContainers.length > 0) {
            progressContainers[0].parentNode.removeChild(progressContainers[0]);
        }
        progressContainers = null;
        // stop rendering loop
        window.cancelAnimationFrame(this._requestAnimationFrameID);
    }.bind(this);

    this.init();
};

// Setup renderer
var container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(0x353535, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Setup scene
var scene = new THREE.Scene();

// Setup camera
var camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.01, 10000000);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 100;

// Setup controls
var controls = new AMI.TrackballControl(camera, container);

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
}
window.addEventListener('resize', onWindowResize, false);

// Setup loader
var loader = new AMI.VolumeLoader(container, CustomProgressBar);

var t2 = ['template_T2.nii.gz'];
var files = t2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/nifti/fetalatlas_brain/t2/' + v;
});

loader
    .load(files)
    .then(function() {
        // merge files into clean series/stack/frame structure
        var series = loader.data[0].mergeSeries(loader.data);
        loader.free();
        loader = null;

        // be carefull that series and target stack exist!
        var stackHelper = new AMI.StackHelper(series[0].stack[0]);
        stackHelper.border.color = 0xffeb3b;

        scene.add(stackHelper);

        // center camera and interactor to center of bouding box
        // for nicer experience
        var centerLPS = stackHelper.stack.worldCenter();
        camera.lookAt(centerLPS.x, centerLPS.y, centerLPS.z);
        camera.updateProjectionMatrix();
        controls.target.set(centerLPS.x, centerLPS.y, centerLPS.z);
    })
    .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
    });

/**
 * Animation loop
 */
function animate() {
    controls.update();
    renderer.render(scene, camera);

    // request new frame
    requestAnimationFrame(function() {
        animate();
    });
}
animate();
