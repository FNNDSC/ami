/* globals Stats, dat, AMI*/

// VJS classes we will be using in this lesson
var LoadersVolume = AMI.VolumeLoader;
var CamerasOrthographic = AMI.OrthographicCamera;
var ControlsOrthographic = AMI.TrackballOrthoControl;
var HelpersStack = AMI.StackHelper;
var ModelsStack = AMI.StackModel;

var stack0, stackHelper0;
var stack1, stackHelper1;

// Setup renderers

// 0
var container = document.getElementById('data0');
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setClearColor(0x3535dd, 1);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 1
var container1 = document.getElementById('data1');
var renderer1 = new THREE.WebGLRenderer({
    antialias: true
});
renderer1.setSize(container1.offsetWidth, container1.offsetHeight);
renderer1.setClearColor(0x35dd35, 1);
renderer1.setPixelRatio(window.devicePixelRatio);
container1.appendChild(renderer1.domElement);

// Setup scene
var scene = new THREE.Scene();
var scene1 = new THREE.Scene();

// Setup camera
var camera = new CamerasOrthographic(
    container.clientWidth / -2,
    container.clientWidth / 2,
    container.clientHeight / 2,
    container.clientHeight / -2,
    0.1,
    10000
);

var camera1 = new CamerasOrthographic(
    container1.clientWidth / -2,
    container1.clientWidth / 2,
    container1.clientHeight / 2,
    container1.clientHeight / -2,
    0.1,
    10000
);

// Setup controls
var controls = new ControlsOrthographic(camera, container);
controls.staticMoving = true;
controls.noRotate = true;

var controls1 = new ControlsOrthographic(camera1, container1);
controls1.staticMoving = true;
controls1.noRotate = true;

// handle resize
function onWindowResize() {
    // 0
    camera.canvas = {
        width: container.offsetWidth,
        height: container.offsetHeight,
    };
    camera.fitBox(2);

    renderer.setSize(container.offsetWidth, container.offsetHeight);

    // 1
    camera1.canvas = {
        width: container1.offsetWidth,
        height: container1.offsetHeight,
    };
    camera1.fitBox(2);

    renderer1.setSize(container1.offsetWidth, container1.offsetHeight);
}
window.addEventListener('resize', onWindowResize, false);

// build GUI
function gui() {
    var gui = new dat.GUI({ autoPlace: false });
    var customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    // of course we can do everything from lesson 01!
    var stackFolder = gui.addFolder('Stack');
    var indexUpdate = stackFolder
        .add(stackHelper0, 'index', 0, stackHelper0.stack.dimensionsIJK.z - 1)
        .step(1)
        .listen();
    indexUpdate.onChange(function() {
        // IJK
        window.console.log('IJK Base');
        window.console.log(stackHelper0.slice.planePosition);
        window.console.log(stackHelper0.slice.planeDirection);

        // TO LPS
        var worldPosition = new THREE.Vector3().copy(stackHelper0.slice.planePosition).applyMatrix4(stack0.ijk2LPS);
        var worldDirection = new THREE.Vector3().copy(stackHelper0.slice.planeDirection).applyMatrix4(stack0.ijk2LPS);
        var worldDirection0 = new THREE.Vector3(0, 0, 0).applyMatrix4(stack0.ijk2LPS);

        window.console.log('LPS Base');
        window.console.log(worldPosition);
        window.console.log(worldDirection0);
        window.console.log(worldDirection);

        // TO IJK
        var dataPosition = worldPosition.applyMatrix4(stack1.lps2IJK);
        var dataDirection = worldDirection.applyMatrix4(stack1.lps2IJK);
        var dataDirection0 = worldDirection0.applyMatrix4(stack1.lps2IJK);

        window.console.log('IJK Layer');
        window.console.log(dataPosition);
        window.console.log(dataDirection);
        window.console.log(dataDirection0);

        // back to LPS for testing...
        var worldPosition1 = new THREE.Vector3().copy(dataPosition).applyMatrix4(stack1.ijk2LPS);
        var worldDirection1 = new THREE.Vector3().copy(dataDirection).applyMatrix4(stack1.ijk2LPS);

        window.console.log('LPS Layer');
        window.console.log(worldPosition1);
        window.console.log(worldDirection1);

        // update slice and THEN its border
        stackHelper1.slice.planePosition = dataPosition;
        stackHelper1.slice.planeDirection = dataDirection.sub(dataDirection0);
        // update border with new slice
        stackHelper1.border.helpersSlice = stackHelper1.slice;
    });
    var interpolation = stackFolder
        .add(stackHelper0.slice, 'interpolation', 0, 1)
        .step(1)
        .listen();
    interpolation.onChange(function() {
        stackHelper1.slice.interpolation = stackHelper0.slice.interpolation;
    });
    stackFolder.open();
}

// Start animation loop
function animate() {
    controls.update();
    renderer.render(scene, camera);

    controls1.update();
    renderer1.render(scene1, camera1);

    // request new frame
    requestAnimationFrame(function() {
        animate();
    });
}
animate();

// Setup loader
var loader = new LoadersVolume(container);

var t2 = [
    'IM-0026-360003920-0001.dcm',
    'IM-0026-366162032-0001.dcm',
    'IM-0026-380074896-0001.dcm',
    'IM-0026-427054640-0001.dcm',
    'IM-0026-427607040-0001.dcm',
    'IM-0026-429085072-0001.dcm',
    'IM-0026-43091024-0001.dcm',
    'IM-0026-43096288-0001.dcm',
    'IM-0026-43101984-0001.dcm',
    'IM-0026-43102464-0001.dcm',
    'IM-0026-43126528-0001.dcm',
    'IM-0026-43126576-0001.dcm',
    'IM-0026-43682288-0001.dcm',
    'IM-0026-46149760-0001.dcm',
    'IM-0026-46149808-0001.dcm',
    'IM-0026-46150496-0001.dcm',
    'IM-0026-46292176-0001.dcm',
    'IM-0026-466846976-0001.dcm',
    'IM-0026-466992464-0001.dcm',
    'IM-0026-467073520-0001.dcm',
    'IM-0026-467315312-0001.dcm',
    'IM-0026-467351824-0001.dcm',
    'IM-0026-484782208-0001.dcm',
    'IM-0026-484808064-0001.dcm',
    'IM-0026-487594016-0001.dcm',
    'IM-0026-487763216-0001.dcm',
    'IM-0026-487785136-0001.dcm',
    'IM-0026-487830256-0001.dcm',
    'IM-0026-487863104-0001.dcm',
    'IM-0026-487865056-0001.dcm',
    'IM-0026-487868000-0001.dcm',
    'IM-0026-488018368-0001.dcm',
    'IM-0026-488029136-0001.dcm',
    'IM-0026-488038352-0001.dcm',
    'IM-0026-488083504-0001.dcm',
    'IM-0026-488093408-0001.dcm',
    'IM-0026-488104944-0001.dcm',
    'IM-0026-488106880-0001.dcm',
    'IM-0026-488108816-0001.dcm',
    'IM-0026-488119504-0001.dcm',
    'IM-0026-488134080-0001.dcm',
    'IM-0026-488134624-0001.dcm',
    'IM-0026-488136016-0001.dcm',
    'IM-0026-488139040-0001.dcm',
    'IM-0026-488154032-0001.dcm',
    'IM-0026-488168256-0001.dcm',
    'IM-0026-488172960-0001.dcm',
    'IM-0026-488175296-0001.dcm',
    'IM-0026-488177136-0001.dcm',
    'IM-0026-488185888-0001.dcm',
    'IM-0026-488195136-0001.dcm',
    'IM-0026-488201008-0001.dcm',
    'IM-0026-488219344-0001.dcm',
    'IM-0026-488223712-0001.dcm',
    'IM-0026-488226912-0001.dcm',
    'IM-0026-492847536-0001.dcm',
    'IM-0026-492850992-0001.dcm',
    'IM-0026-492853072-0001.dcm',
    'IM-0026-492862672-0001.dcm',
    'IM-0026-492877920-0001.dcm',
    'IM-0026-492931984-0001.dcm',
    'IM-0026-492932624-0001.dcm',
    'IM-0026-492934736-0001.dcm',
    'IM-0026-492959792-0001.dcm',
    'IM-0026-492965808-0001.dcm',
    'IM-0026-492976320-0001.dcm',
    'IM-0026-492976480-0001.dcm',
    'IM-0026-492996560-0001.dcm',
    'IM-0026-492999104-0001.dcm',
    'IM-0026-493003072-0001.dcm',
    'IM-0026-493013680-0001.dcm',
    'IM-0026-493050064-0001.dcm',
    'IM-0026-493058240-0001.dcm',
    'IM-0026-493062944-0001.dcm',
    'IM-0026-493089696-0001.dcm',
    'IM-0026-493091952-0001.dcm',
    'IM-0026-493093888-0001.dcm',
    'IM-0026-493105408-0001.dcm',
    'IM-0026-493112128-0001.dcm',
    'IM-0026-493133200-0001.dcm',
    'IM-0026-493134272-0001.dcm',
    'IM-0026-493220064-0001.dcm',
    'IM-0026-493241248-0001.dcm',
    'IM-0026-493244656-0001.dcm',
    'IM-0026-493288544-0001.dcm',
    'IM-0026-493301600-0001.dcm',
    'IM-0026-493303600-0001.dcm',
    'IM-0026-493317008-0001.dcm',
    'IM-0026-493319376-0001.dcm',
    'IM-0026-493326896-0001.dcm',
    'IM-0026-493330016-0001.dcm',
    'IM-0026-493330368-0001.dcm',
    'IM-0026-493332208-0001.dcm',
    'IM-0026-493337632-0001.dcm',
    'IM-0026-493338240-0001.dcm',
    'IM-0026-493341936-0001.dcm',
    'IM-0026-493348032-0001.dcm',
    'IM-0026-493349440-0001.dcm',
    'IM-0026-493372208-0001.dcm',
    'IM-0026-493382528-0001.dcm',
    'IM-0026-493389408-0001.dcm',
    'IM-0026-493391696-0001.dcm',
    'IM-0026-493392688-0001.dcm',
    'IM-0026-493397296-0001.dcm',
    'IM-0026-493407440-0001.dcm',
    'IM-0026-493420832-0001.dcm',
    'IM-0026-493440608-0001.dcm',
    'IM-0026-493492608-0001.dcm',
    'IM-0026-493523264-0001.dcm',
    'IM-0026-493545024-0001.dcm',
    'IM-0026-493559280-0001.dcm',
    'IM-0026-493626192-0001.dcm',
    'IM-0026-493679680-0001.dcm',
    'IM-0026-493710080-0001.dcm',
    'IM-0026-493755920-0001.dcm',
    'IM-0026-493760464-0001.dcm',
    'IM-0026-493768352-0001.dcm',
    'IM-0026-493773168-0001.dcm',
    'IM-0026-493779296-0001.dcm',
    'IM-0026-493793664-0001.dcm',
    'IM-0026-493795808-0001.dcm',
    'IM-0026-493825824-0001.dcm',
    'IM-0026-493838064-0001.dcm',
    'IM-0026-497139776-0001.dcm',
    'IM-0026-497502768-0001.dcm',
    'IM-0026-497513712-0001.dcm',
    'IM-0026-497541872-0001.dcm',
    'IM-0026-497548448-0001.dcm',
    'IM-0026-497590896-0001.dcm',
    'IM-0026-497594976-0001.dcm',
    'IM-0026-497599968-0001.dcm',
    'IM-0026-497608288-0001.dcm',
    'IM-0026-497609952-0001.dcm',
    'IM-0026-497644112-0001.dcm',
    'IM-0026-497655888-0001.dcm',
    'IM-0026-497713248-0001.dcm',
    'IM-0026-497729088-0001.dcm',
    'IM-0026-497730368-0001.dcm',
    'IM-0026-497735952-0001.dcm',
    'IM-0026-501524224-0001.dcm',
    'IM-0026-501752144-0001.dcm',
    'IM-0026-501844720-0001.dcm',
    'IM-0026-501860928-0001.dcm',
    'IM-0026-501863904-0001.dcm',
    'IM-0026-501865392-0001.dcm',
    'IM-0026-501866880-0001.dcm',
    'IM-0026-501868368-0001.dcm',
    'IM-0026-501869856-0001.dcm',
    'IM-0026-501871344-0001.dcm',
    'IM-0026-501872832-0001.dcm',
    'IM-0026-501874320-0001.dcm',
    'IM-0026-501875808-0001.dcm',
    'IM-0026-501877072-0001.dcm',
    'IM-0026-501878544-0001.dcm',
    'IM-0026-501881472-0001.dcm',
    'IM-0026-501882960-0001.dcm',
    'IM-0026-501884448-0001.dcm',
    'IM-0026-501885936-0001.dcm',
    'IM-0026-501887424-0001.dcm',
    'IM-0026-501888912-0001.dcm'
];
var files = t2.map(function(v) {
    return 'http://localhost:8800/5946503419920384_/' + v;
});

var t1 = [
    'IM-0025-360003920-0001.dcm',
    'IM-0025-429447552-0001.dcm',
    'IM-0025-43091024-0001.dcm',
    'IM-0025-43096288-0001.dcm',
    'IM-0025-43101984-0001.dcm',
    'IM-0025-43102464-0001.dcm',
    'IM-0025-43126528-0001.dcm',
    'IM-0025-43126576-0001.dcm',
    'IM-0025-43682288-0001.dcm',
    'IM-0025-46149760-0001.dcm',
    'IM-0025-46149808-0001.dcm',
    'IM-0025-46150496-0001.dcm',
    'IM-0025-46292176-0001.dcm',
    'IM-0025-463118944-0001.dcm',
    'IM-0025-468156752-0001.dcm',
    'IM-0025-488131952-0001.dcm',
    'IM-0025-488164992-0001.dcm',
    'IM-0025-488241008-0001.dcm',
    'IM-0025-492844880-0001.dcm',
    'IM-0025-492849152-0001.dcm',
    'IM-0025-492854064-0001.dcm',
    'IM-0025-492855184-0001.dcm',
    'IM-0025-492856464-0001.dcm',
    'IM-0025-492860064-0001.dcm',
    'IM-0025-492870992-0001.dcm',
    'IM-0025-492871488-0001.dcm',
    'IM-0025-492918256-0001.dcm',
    'IM-0025-492946480-0001.dcm',
    'IM-0025-492975760-0001.dcm',
    'IM-0025-493007680-0001.dcm',
    'IM-0025-493052928-0001.dcm',
    'IM-0025-493058608-0001.dcm',
    'IM-0025-493073360-0001.dcm',
    'IM-0025-493081552-0001.dcm',
    'IM-0025-493083296-0001.dcm',
    'IM-0025-493088960-0001.dcm',
    'IM-0025-493095280-0001.dcm',
    'IM-0025-493096512-0001.dcm',
    'IM-0025-493097808-0001.dcm',
    'IM-0025-493100208-0001.dcm',
    'IM-0025-493101904-0001.dcm',
    'IM-0025-493103440-0001.dcm',
    'IM-0025-493105920-0001.dcm',
    'IM-0025-493108736-0001.dcm',
    'IM-0025-493110432-0001.dcm',
    'IM-0025-493111536-0001.dcm',
    'IM-0025-493113456-0001.dcm',
    'IM-0025-493114736-0001.dcm',
    'IM-0025-493116224-0001.dcm',
    'IM-0025-493119344-0001.dcm',
    'IM-0025-493122224-0001.dcm',
    'IM-0025-493124768-0001.dcm',
    'IM-0025-493127248-0001.dcm',
    'IM-0025-493130144-0001.dcm',
    'IM-0025-493132320-0001.dcm',
    'IM-0025-493135184-0001.dcm',
    'IM-0025-493137952-0001.dcm',
    'IM-0025-493141184-0001.dcm',
    'IM-0025-493143488-0001.dcm',
    'IM-0025-493203664-0001.dcm',
    'IM-0025-493240160-0001.dcm',
    'IM-0025-493243408-0001.dcm',
    'IM-0025-493256944-0001.dcm',
    'IM-0025-493257648-0001.dcm',
    'IM-0025-493260416-0001.dcm',
    'IM-0025-493262080-0001.dcm',
    'IM-0025-493267824-0001.dcm',
    'IM-0025-493269168-0001.dcm',
    'IM-0025-493271536-0001.dcm',
    'IM-0025-493284768-0001.dcm',
    'IM-0025-493295440-0001.dcm',
    'IM-0025-493297840-0001.dcm',
    'IM-0025-493299936-0001.dcm',
    'IM-0025-493302544-0001.dcm',
    'IM-0025-493307456-0001.dcm',
    'IM-0025-493316080-0001.dcm',
    'IM-0025-493323296-0001.dcm',
    'IM-0025-493325040-0001.dcm',
    'IM-0025-493328512-0001.dcm',
    'IM-0025-493329824-0001.dcm',
    'IM-0025-493332848-0001.dcm',
    'IM-0025-493335424-0001.dcm',
    'IM-0025-493336608-0001.dcm',
    'IM-0025-493339824-0001.dcm',
    'IM-0025-493344352-0001.dcm',
    'IM-0025-493344544-0001.dcm',
    'IM-0025-493349088-0001.dcm',
    'IM-0025-493350784-0001.dcm',
    'IM-0025-493351760-0001.dcm',
    'IM-0025-493363200-0001.dcm',
    'IM-0025-493376864-0001.dcm',
    'IM-0025-493378848-0001.dcm',
    'IM-0025-493380608-0001.dcm',
    'IM-0025-493382336-0001.dcm',
    'IM-0025-493386288-0001.dcm',
    'IM-0025-497613280-0001.dcm',
    'IM-0025-501618112-0001.dcm',
    'IM-0025-501716032-0001.dcm',
    'IM-0025-501767552-0001.dcm',
    'IM-0025-501769040-0001.dcm',
    'IM-0025-501770528-0001.dcm',
    'IM-0025-501772016-0001.dcm',
    'IM-0025-501773504-0001.dcm',
    'IM-0025-501774992-0001.dcm',
    'IM-0025-501776224-0001.dcm',
    'IM-0025-501779200-0001.dcm',
    'IM-0025-501780688-0001.dcm',
    'IM-0025-501782176-0001.dcm',
    'IM-0025-501785152-0001.dcm',
    'IM-0025-501788128-0001.dcm',
    'IM-0025-501789616-0001.dcm',
    'IM-0025-501791104-0001.dcm',
    'IM-0025-501792592-0001.dcm',
    'IM-0025-501794080-0001.dcm',
    'IM-0025-501795568-0001.dcm',
    'IM-0025-501797056-0001.dcm',
    'IM-0025-501798544-0001.dcm',
    'IM-0025-501800032-0001.dcm',
    'IM-0025-501801520-0001.dcm',
    'IM-0025-501803008-0001.dcm',
    'IM-0025-501804496-0001.dcm',
    'IM-0025-501805984-0001.dcm',
    'IM-0025-501807472-0001.dcm',
    'IM-0025-501808960-0001.dcm',
    'IM-0025-501811728-0001.dcm',
    'IM-0025-501813200-0001.dcm',
    'IM-0025-501814688-0001.dcm',
    'IM-0025-501816144-0001.dcm',
    'IM-0025-501817616-0001.dcm',
    'IM-0025-501819088-0001.dcm',
    'IM-0025-501820560-0001.dcm',
    'IM-0025-501822032-0001.dcm',
    'IM-0025-501823504-0001.dcm',
    'IM-0025-501824976-0001.dcm',
    'IM-0025-501826448-0001.dcm',
    'IM-0025-501827920-0001.dcm',
    'IM-0025-501829392-0001.dcm',
    'IM-0025-501830864-0001.dcm',
    'IM-0025-501832336-0001.dcm',
    'IM-0025-501833808-0001.dcm',
    'IM-0025-501835280-0001.dcm',
    'IM-0025-501836752-0001.dcm',
    'IM-0025-501838224-0001.dcm',
    'IM-0025-501839696-0001.dcm',
    'IM-0025-501841168-0001.dcm',
    'IM-0025-501842640-0001.dcm',
    'IM-0025-501844112-0001.dcm',
    'IM-0025-501845584-0001.dcm',
    'IM-0025-501847056-0001.dcm',
    'IM-0025-501848528-0001.dcm',
    'IM-0025-501850000-0001.dcm',
    'IM-0025-501851472-0001.dcm',
    'IM-0025-501852944-0001.dcm',
    'IM-0025-501854416-0001.dcm',
    'IM-0025-501855888-0001.dcm',
    'IM-0025-501857360-0001.dcm'
];

var files2 = t1.map(function(v) {
    return 'http://localhost:8800/4679866024722432_/' + v;
});

files = files.concat(files2);

console.log(files);

var dbox = ['MR.nii.gz', 'PET.nii.gz'];

files = dbox.map(function(v) {
    return 'https://dl.dropboxusercontent.com/u/16854480/' + v;
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
Promise.all(loadSequence)
    .then(function() {
        loader.free();
        loader = null;

        // merge files into clean series/stack/frame structure
        var series = seriesContainer[0].mergeSeries(seriesContainer);

        console.log(series);

        stack0 = series[0].stack[0];
        stack1 = series[1].stack[0];
        // be carefull that series and target stack exist!

        // 0
        stackHelper0 = new HelpersStack(stack0);
        // stackHelper0.orientation = 2;
        // stackHelper0.index = 56;

        // tune bounding box
        stackHelper0.bbox.visible = false;

        //tune slice border
        stackHelper0.border.color = 0xff0000;
        //stackHelper0.border.visible = false;

        scene.add(stackHelper0);

        // 1
        stackHelper1 = new HelpersStack(stack1);
        // stackHelper.orientation = 2;
        // stackHelper.index = 56;

        // tune bounding box
        stackHelper1.bbox.visible = false;

        //tune slice border
        stackHelper1.border.color = 0xff0000;
        //stackHelper.border.visible = false;

        scene1.add(stackHelper1);

        // build the gui
        gui();

        // center camera and interactor to center of bouding box
        // for nicer experience
        // set camera
        var worldbb = stack0.worldBoundingBox();
        console.log(stack0.worldBoundingBox());
        console.log(stack1.worldBoundingBox());
        var lpsDims = new THREE.Vector3(worldbb[1] - worldbb[0], worldbb[3] - worldbb[2], worldbb[5] - worldbb[4]);

        // box: {halfDimensions, center}
        var bbox = {
            center: stack0.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
        };

        // init and zoom
        var canvas = {
            width: container.clientWidth,
            height: container.clientHeight
        };
        camera.init(stack0.xCosine, stack0.yCosine, stack0.zCosine, controls, bbox, canvas);
        camera.fitBox(2);
        //
        var worldbb1 = stack1.worldBoundingBox();
        var lpsDims1 = new THREE.Vector3(
            worldbb1[1] - worldbb1[0],
            worldbb1[3] - worldbb1[2],
            worldbb1[5] - worldbb1[4]
        );

        var bbox1 = {
            center: stack1.worldCenter().clone(),
            halfDimensions: new THREE.Vector3(lpsDims1.x + 10, lpsDims1.y + 10, lpsDims1.z + 10)
        };
        var canvas1 = {
            width: container1.clientWidth,
            height: container1.clientHeight
        };
        camera1.init(stack0.xCosine, stack0.yCosine, stack0.zCosine, controls1, bbox, canvas1);
        camera1.fitBox(2);
    })
    .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
    });
