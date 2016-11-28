/* globals Stats, dat*/

import CamerasOrthographic  from '../../src/cameras/cameras.orthographic';
import ControlsOrthographic from '../../src/controls/controls.trackballortho';
import HelpersLut           from '../../src/helpers/helpers.lut';
import HelpersStack         from '../../src/helpers/helpers.stack';
import LoadersVolume        from '../../src/loaders/loaders.volume';


import ShadersLayerUniform  from '../../src/shaders/shaders.layer.uniform';
import ShadersLayerVertex   from '../../src/shaders/shaders.layer.vertex';
import ShadersLayerFragment from '../../src/shaders/shaders.layer.fragment';
import ShadersDataUniform   from '../../src/shaders/shaders.data.uniform';
import ShadersDataVertex    from '../../src/shaders/shaders.data.vertex';
import ShadersDataFragment  from '../../src/shaders/shaders.data.fragment';


// standard global letiables
let controls, renderer, camera, statsyay, threeD;
//
let sceneLayer0TextureTarget, sceneLayer1TextureTarget;
//
let scene, sceneLayer0;
//
let lutLayer0;
let sceneLayer1, meshLayer1, uniformsLayer1, materialLayer1, lutLayer1;
let sceneLayerMix, meshLayerMix, uniformsLayerMix, materialLayerMix, lutLayerMix;

let layerMix = {
  opacity0: 1.0,
  opacity1: 1.0,
  type0: 0,
  type1: 1,
  lut: null
};

// FUNCTIONS
function init() {
  // this function is executed on each animation frame
  function animate() {

    // render
    controls.update();
    // render first layer offscreen
    renderer.render(sceneLayer0, camera, sceneLayer0TextureTarget, true);
    // render second layer offscreen
    renderer.render(sceneLayer1, camera, sceneLayer1TextureTarget, true);
    // mix the layers and render it ON screen!
    renderer.render(sceneLayerMix, camera);
    statsyay.update();

    // request new frame
    requestAnimationFrame(function() {
      animate();
    });
  }

  // renderer
  threeD = document.getElementById('r3d');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(threeD.clientWidth, threeD.clientHeight);
  renderer.setClearColor(0x607D8B, 1);

  threeD.appendChild(renderer.domElement);

  // stats
  statsyay = new Stats();
  threeD.appendChild(statsyay.domElement);

  // scene
  scene = new THREE.Scene();
  sceneLayer0 = new THREE.Scene();
  sceneLayer1 = new THREE.Scene();
  sceneLayerMix = new THREE.Scene();

  // render to texture!!!!
  sceneLayer0TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
     magFilter: THREE.NearestFilter,
     format: THREE.RGBAFormat
  });

  sceneLayer1TextureTarget = new THREE.WebGLRenderTarget(
    threeD.clientWidth,
    threeD.clientHeight,
    {minFilter: THREE.LinearFilter,
     magFilter: THREE.NearestFilter,
     format: THREE.RGBAFormat
  });

  // camera
  camera = new CamerasOrthographic(threeD.clientWidth / -2, threeD.clientWidth / 2, threeD.clientHeight / 2, threeD.clientHeight / -2, 0.1, 10000);

  // controls
  controls = new ControlsOrthographic(camera, threeD);
  controls.staticMoving = true;
  controls.noRotate = true;

  animate();
}

window.onload = function() {

  // init threeJS...
  init();

//   let data = [
//     '000001.dcm', '000002.dcm', '000003.dcm', 
//     '000004.dcm', '000005.dcm', '000006.dcm', 
//     '000007.dcm', '000008.dcm', '000009.dcm', 
//     '000010.dcm', '000011.dcm', '000012.dcm', 
//     '000013.dcm', '000014.dcm', '000015.dcm', 
//     '000016.dcm', '000017.dcm', '000018.dcm', 
//     '000019.dcm', '000020.dcm', '000021.dcm', 
//     '000022.dcm', '000023.dcm', '000024.dcm', 
//     '000025.dcm', '000026.dcm', '000027.dcm', 
//     '000028.dcm', '000029.dcm', '000030.dcm', 
//     '000031.dcm', '000032.dcm', '000033.dcm', 
//     '000034.dcm', '000035.dcm', '000036.dcm', 
//     '000037.dcm', '000038.dcm', '000039.dcm', 
//     '000040.dcm', '000041.dcm', '000042.dcm', 
//     '000043.dcm', '000044.dcm', '000045.dcm', 
//     '000046.dcm', '000047.dcm', '000048.dcm', 
//     '000049.dcm', '000050.dcm', '000051.dcm', 
//     '000052.dcm', '000053.dcm', '000054.dcm', 
//     '000055.dcm', '000056.dcm', '000057.dcm', 
//     '000058.dcm', '000059.dcm', '000060.dcm', 
//     '000061.dcm', '000062.dcm', '000063.dcm', 
//     '000064.dcm', '000065.dcm', '000066.dcm', 
//     '000067.dcm', '000068.dcm', '000069.dcm', 
//     '000070.dcm', '000071.dcm', '000072.dcm', 
//     '000073.dcm', '000074.dcm', '000075.dcm', 
//     '000076.dcm', '000077.dcm', '000078.dcm', 
//     '000079.dcm', '000080.dcm', '000081.dcm', 
//     '000082.dcm', '000083.dcm', '000084.dcm', 
//     '000085.dcm', '000086.dcm', '000087.dcm', 
//     '000088.dcm', '000089.dcm', '000090.dcm', 
//     '000091.dcm', '000092.dcm', '000093.dcm', 
//     '000094.dcm', '000095.dcm', '000096.dcm', 
//     '000097.dcm', '000098.dcm', '000099.dcm', 
//     '000100.dcm', '000101.dcm', '000102.dcm', 
//     '000103.dcm', '000104.dcm', '000105.dcm', 
//     '000106.dcm', '000107.dcm', '000108.dcm', 
//     '000109.dcm', '000110.dcm', '000111.dcm', 
//     '000112.dcm', '000113.dcm', '000114.dcm', 
//     '000115.dcm', '000116.dcm', '000117.dcm', 
//     '000118.dcm', '000119.dcm', '000120.dcm', 
//     '000121.dcm', '000122.dcm', '000123.dcm', 
//     '000124.dcm', '000125.dcm', '000126.dcm', 
//     '000127.dcm', '000128.dcm', '000129.dcm', 
//     '000130.dcm', '000131.dcm', '000132.dcm', 
//     '000133.dcm', '000134.dcm', '000135.dcm', 
//     '000136.dcm', '000137.dcm', '000138.dcm', 
//     '000139.dcm', '000140.dcm', '000141.dcm', 
//     '000142.dcm', '000143.dcm', '000144.dcm', 
//     '000145.dcm', '000146.dcm', '000147.dcm', 
//     '000148.dcm', '000149.dcm', '000150.dcm', 
//     '000151.dcm', '000152.dcm', '000153.dcm', 
//     '000154.dcm', '000155.dcm', '000156.dcm', 
//     '000157.dcm', '000158.dcm', '000159.dcm', 
//     '000160.dcm', '000161.dcm', '000162.dcm', 
//     '000163.dcm', '000164.dcm', '000165.dcm', 
//     '000166.dcm', '000167.dcm', '000168.dcm', 
//     '000169.dcm', '000170.dcm', '000171.dcm', 
//     '000172.dcm', '000173.dcm', '000174.dcm', 
//     '000175.dcm', '000176.dcm', '000177.dcm', 
//     '000178.dcm', '000179.dcm', '000180.dcm', 
//     '000181.dcm', '000182.dcm', '000183.dcm', 
//     '000184.dcm', '000185.dcm', '000186.dcm', 
//     '000187.dcm', '000188.dcm', '000189.dcm', 
//     '000190.dcm', '000191.dcm', '000192.dcm', 
//     '000193.dcm', '000194.dcm', '000195.dcm', 
//     '000196.dcm', '000197.dcm', '000198.dcm', 
//     '000199.dcm', '000200.dcm', '000201.dcm', 
//     '000202.dcm', '000203.dcm', '000204.dcm', 
//     '000205.dcm', '000206.dcm', '000207.dcm', 
//     '000208.dcm', '000209.dcm', '000210.dcm', 
//     '000211.dcm', '000212.dcm', '000213.dcm', 
//     '000214.dcm', '000215.dcm', '000216.dcm', 
//     '000217.dcm', '000218.dcm', '000219.dcm', 
//     '000220.dcm', '000221.dcm', '000222.dcm', 
//     '000223.dcm', '000224.dcm', '000225.dcm', 
//     '000226.dcm', '000227.dcm', '000228.dcm', 
//     '000229.dcm', '000230.dcm', '000231.dcm', 
//     '000232.dcm', '000233.dcm', '000234.dcm', 
//     '000235.dcm', '000236.dcm', '000237.dcm', 
//     '000238.dcm', '000239.dcm', '000240.dcm', 
//     '000241.dcm', '000242.dcm', '000243.dcm', 
//     '000244.dcm', '000245.dcm', '000246.dcm', 
//     '000247.dcm', '000248.dcm', '000249.dcm', 
//     '000250.dcm', '000251.dcm', '000252.dcm', 
//     '000253.dcm', '000254.dcm', '000255.dcm', 
//     '000256.dcm', '000257.dcm', '000258.dcm', 
//     '000259.dcm', '000260.dcm', '000261.dcm', 
//     '000262.dcm', '000263.dcm', '000264.dcm', 
//     '000265.dcm', '000266.dcm', '000267.dcm', 
//     '000268.dcm', '000269.dcm', '000270.dcm', 
//     '000271.dcm', '000272.dcm', '000273.dcm', 
//     '000274.dcm', '000275.dcm'];

//   let dataFullPath = data.map(function(v) {
//     return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/andrei_abdomen/data/' + v;
//   });

//   let labelmap = [
//     '000000.dcm'
//   ];

//   let labelmapFullPath = labelmap.map(function(v) {
//     return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/andrei_abdomen/segmentation/' + v;
//   });

//  let files_dataset1 = dataFullPath.concat(labelmapFullPath);


let ds2 = [
'000000.dcm', '000001.dcm', '000002.dcm', '000003.dcm', '000004.dcm', '000005.dcm', '000006.dcm', '000007.dcm', '000008.dcm', '000009.dcm', '000010.dcm', 
'000011.dcm', '000012.dcm', '000013.dcm', '000014.dcm', '000015.dcm', '000016.dcm', '000017.dcm', '000018.dcm', '000019.dcm', '000020.dcm', '000021.dcm', 
'000022.dcm', '000023.dcm', '000024.dcm', '000025.dcm', '000026.dcm', '000027.dcm', '000028.dcm', '000029.dcm', '000030.dcm', '000031.dcm', '000032.dcm', 
'000033.dcm', '000034.dcm', '000035.dcm', '000036.dcm', '000037.dcm', '000038.dcm', '000039.dcm', '000040.dcm', '000041.dcm', '000042.dcm', '000043.dcm', 
'000044.dcm', '000045.dcm', '000046.dcm', '000047.dcm', '000048.dcm', '000049.dcm', '000050.dcm', '000051.dcm', '000052.dcm', '000053.dcm', '000054.dcm', 
'000055.dcm', '000056.dcm', '000057.dcm', '000058.dcm', '000059.dcm', '000060.dcm', '000061.dcm', '000062.dcm', '000063.dcm', '000064.dcm', '000065.dcm', 
'000066.dcm', '000067.dcm', '000068.dcm', '000069.dcm', '000070.dcm', '000071.dcm', '000072.dcm', '000073.dcm', '000074.dcm', '000075.dcm', '000076.dcm', 
'000077.dcm', '000078.dcm', '000079.dcm', '000080.dcm', '000081.dcm', '000082.dcm', '000083.dcm', '000084.dcm', '000085.dcm', '000086.dcm', '000087.dcm', 
'000088.dcm', '000089.dcm', '000090.dcm', '000091.dcm', '000092.dcm', '000093.dcm', '000094.dcm', '000095.dcm', '000096.dcm', '000097.dcm', '000098.dcm', 
'000099.dcm', '000100.dcm', '000101.dcm', '000102.dcm', '000103.dcm', '000104.dcm', '000105.dcm', '000106.dcm', '000107.dcm', '000108.dcm', '000109.dcm', 
'000110.dcm', '000111.dcm', '000112.dcm', '000113.dcm', '000114.dcm', '000115.dcm', '000116.dcm', '000117.dcm', '000118.dcm', '000119.dcm', '000120.dcm', 
'000121.dcm', '000122.dcm', '000123.dcm', '000124.dcm', '000125.dcm', '000126.dcm', '000127.dcm', '000128.dcm', '000129.dcm', '000130.dcm', '000131.dcm', 
'000132.dcm', '000133.dcm', '000134.dcm', '000135.dcm', '000136.dcm', '000137.dcm', '000138.dcm', '000139.dcm', '000140.dcm', '000141.dcm', '000142.dcm', 
'000143.dcm', '000144.dcm', '000145.dcm', '000146.dcm', '000147.dcm', '000148.dcm', '000149.dcm', '000150.dcm', '000151.dcm', '000152.dcm', '000153.dcm', 
'000154.dcm', '000155.dcm', '000156.dcm', '000157.dcm', '000158.dcm', '000159.dcm', '000160.dcm', '000161.dcm', '000162.dcm', '000163.dcm', '000164.dcm', 
'000165.dcm', '000166.dcm', '000167.dcm', '000168.dcm', '000169.dcm', '000170.dcm', '000171.dcm', '000172.dcm', '000173.dcm', '000174.dcm', '000175.dcm', 
'000176.dcm', '000177.dcm', '000178.dcm', '000179.dcm', '000180.dcm', '000181.dcm', '000182.dcm', '000183.dcm', '000184.dcm', '000185.dcm', '000186.dcm', 
'000187.dcm', '000188.dcm', '000189.dcm', '000190.dcm', '000191.dcm', '000192.dcm', '000193.dcm', '000194.dcm', '000195.dcm', '000196.dcm', '000197.dcm', 
'000198.dcm', '000199.dcm', '000200.dcm', '000201.dcm', '000202.dcm', '000203.dcm', '000204.dcm', '000205.dcm', '000206.dcm', '000207.dcm', '000208.dcm', 
'000209.dcm', '000210.dcm', '000211.dcm', '000212.dcm', '000213.dcm', '000214.dcm', '000215.dcm', '000216.dcm', '000217.dcm', '000218.dcm', '000219.dcm', 
'000220.dcm', '000221.dcm', '000222.dcm', '000223.dcm', '000224.dcm', '000225.dcm', '000226.dcm', '000227.dcm', '000228.dcm', '000229.dcm', '000230.dcm', 
'000231.dcm', '000232.dcm', '000233.dcm', '000234.dcm', '000235.dcm', '000236.dcm', '000237.dcm', '000238.dcm', '000239.dcm', '000240.dcm', '000241.dcm', 
'000242.dcm', '000243.dcm', '000244.dcm', '000245.dcm', '000246.dcm', '000247.dcm', '000248.dcm', '000249.dcm', '000250.dcm', '000251.dcm', '000252.dcm', 
'000253.dcm', '000254.dcm', '000255.dcm', '000256.dcm', '000257.dcm', '000258.dcm', '000259.dcm', '000260.dcm', '000261.dcm', '000262.dcm', '000263.dcm', 
'000264.dcm', '000265.dcm', '000266.dcm', '000267.dcm', '000268.dcm', '000269.dcm', '000270.dcm', '000271.dcm', '000272.dcm', '000273.dcm', '000274.dcm', 
'000275.dcm', '000276.dcm', '000277.dcm', '000278.dcm', '000279.dcm', '000280.dcm', '000281.dcm', '000282.dcm', '000283.dcm', '000284.dcm', '000285.dcm', 
'000286.dcm', '000287.dcm', '000288.dcm', '000289.dcm', '000290.dcm', '000291.dcm', '000292.dcm', '000293.dcm', '000294.dcm', '000295.dcm', '000296.dcm', 
'000297.dcm', '000298.dcm'
];

  let ds2fp = ds2.map(function(v) {
    return 'https://cdn.rawgit.com/FNNDSC/data/master/dicom/rsna_2/PET/' + v;
  });

  ds2fp.push('https://cdn.rawgit.com/FNNDSC/data/master/dicom/rsna_2/SEG/3DSlicer/tumor_User1_Manual_Trial1.dcm');

//   let ds3 = [
// '1-103.dcm', '10-112.dcm', '100-202.dcm', '101-203.dcm', '102-204.dcm', '103-205.dcm', '104-206.dcm', '105-207.dcm', '106-208.dcm', '107-209.dcm', 
// '108-210.dcm', '109-211.dcm', '11-113.dcm', '110-212.dcm', '111-213.dcm', '112-214.dcm', '113-215.dcm', '114-216.dcm', '115-217.dcm', '116-218.dcm', 
// '117-219.dcm', '118-220.dcm', '119-221.dcm', '12-114.dcm', '120-222.dcm', '121-223.dcm', '122-224.dcm', '123-225.dcm', '124-226.dcm', '125-227.dcm', 
// '126-228.dcm', '127-229.dcm', '128-230.dcm', '129-231.dcm', '13-115.dcm', '130-232.dcm', '131-233.dcm', '132-234.dcm', '133-235.dcm', '134-236.dcm', 
// '135-237.dcm', '136-238.dcm', '137-239.dcm', '138-240.dcm', '139-241.dcm', '14-116.dcm', '140-242.dcm', '141-243.dcm', '142-244.dcm', '143-245.dcm', 
// '144-246.dcm', '145-247.dcm', '146-248.dcm', '147-249.dcm', '148-250.dcm', '149-251.dcm', '15-117.dcm', '150-252.dcm', '151-253.dcm', '152-254.dcm', 
// '153-255.dcm', '154-256.dcm', '155-257.dcm', '156-258.dcm', '157-259.dcm', '158-260.dcm', '159-261.dcm', '16-118.dcm', '160-262.dcm', '161-263.dcm', 
// '162-264.dcm', '163-265.dcm', '164-266.dcm', '165-267.dcm', '166-268.dcm', '167-269.dcm', '168-270.dcm', '169-271.dcm', '17-119.dcm', '170-272.dcm', 
// '171-273.dcm', '172-274.dcm', '173-275.dcm', '174-276.dcm','175-277.dcm', '176-278.dcm', '177-279.dcm', '178-280.dcm', '179-281.dcm', '18-120.dcm', 
// '180-282.dcm', '181-283.dcm','182-284.dcm', '183-285.dcm', '184-286.dcm', '185-287.dcm', '186-288.dcm', '187-289.dcm', '188-290.dcm', '189-291.dcm', 
// '19-121.dcm', '190-292.dcm', '191-293.dcm', '192-294.dcm', '193-295.dcm', '194-296.dcm', '195-297.dcm', '196-298.dcm', '197-299.dcm', '198-000.dcm', 
// '199-001.dcm', '2-104.dcm', '20-122.dcm', '200-002.dcm', '201-003.dcm', '202-004.dcm', '203-005.dcm', '204-006.dcm', '205-007.dcm', '206-008.dcm', 
// '207-009.dcm', '208-010.dcm', '209-011.dcm', '21-123.dcm', '210-012.dcm', '211-013.dcm', '212-014.dcm', '213-015.dcm', '214-016.dcm', '215-017.dcm', 
// '216-018.dcm', '217-019.dcm', '218-020.dcm', '219-021.dcm', '22-124.dcm', '220-022.dcm', '221-023.dcm', '222-024.dcm', '223-025.dcm', '224-026.dcm', 
// '225-027.dcm', '226-028.dcm', '227-029.dcm', '228-030.dcm', '229-031.dcm','23-125.dcm', '230-032.dcm', '231-033.dcm', '232-034.dcm', '233-035.dcm', 
// '234-036.dcm', '235-037.dcm', '236-038.dcm', '237-039.dcm', '238-040.dcm', '239-041.dcm', '24-126.dcm', '240-042.dcm', '241-043.dcm', '242-044.dcm', 
// '243-045.dcm', '244-046.dcm', '245-047.dcm', '246-048.dcm', '247-049.dcm', '248-050.dcm', '249-051.dcm', '25-127.dcm', '250-052.dcm', '251-053.dcm', 
// '252-054.dcm', '253-055.dcm', '254-056.dcm', '255-057.dcm', '256-058.dcm', '257-059.dcm', '258-060.dcm', '259-061.dcm', '26-128.dcm', '260-062.dcm', 
// '261-063.dcm', '262-064.dcm', '263-065.dcm', '264-066.dcm', '265-067.dcm', '266-068.dcm', '267-069.dcm', '268-070.dcm', '269-071.dcm', '27-129.dcm', 
// '270-072.dcm', '271-073.dcm', '272-074.dcm', '273-075.dcm', '274-076.dcm', '275-077.dcm', '276-078.dcm', '277-079.dcm', '278-080.dcm', '279-081.dcm', 
// '28-130.dcm', '280-082.dcm', '281-083.dcm', '282-084.dcm', '283-085.dcm', '284-086.dcm', '285-087.dcm', '286-088.dcm', '287-089.dcm', '288-090.dcm', 
// '289-091.dcm', '29-131.dcm', '290-092.dcm', '291-093.dcm', '292-094.dcm', '293-095.dcm', '294-096.dcm', '295-097.dcm', '296-098.dcm', '297-099.dcm', 
// '298-100.dcm', '299-101.dcm', '3-105.dcm', '30-132.dcm', '300-102.dcm', '301-103.dcm', '302-104.dcm', '303-105.dcm', '304-106.dcm', '305-107.dcm', 
// '306-108.dcm', '307-109.dcm', '308-110.dcm', '309-111.dcm', '31-133.dcm', '310-112.dcm', '311-113.dcm', '312-114.dcm', '313-115.dcm', '314-116.dcm', 
// '315-117.dcm', '316-118.dcm', '317-119.dcm', '318-120.dcm', '319-121.dcm', '32-134.dcm', '320-122.dcm', '321-123.dcm', '322-124.dcm', '323-125.dcm', 
// '324-126.dcm', '325-127.dcm', '326-128.dcm', '327-129.dcm', '328-130.dcm', '329-131.dcm', '33-135.dcm', '330-132.dcm', '331-133.dcm', '332-134.dcm', 
// '333-135.dcm', '334-136.dcm', '335-137.dcm', '336-138.dcm', '337-139.dcm', '338-140.dcm', '339-141.dcm', '34-136.dcm', '340-142.dcm', '341-143.dcm', 
// '342-144.dcm', '343-145.dcm', '344-146.dcm', '345-147.dcm', '346-148.dcm', '347-149.dcm', '348-150.dcm', '349-151.dcm', '35-137.dcm', '350-152.dcm', 
// '351-153.dcm', '352-154.dcm', '353-155.dcm', '354-156.dcm', '355-157.dcm', '356-158.dcm', '357-159.dcm', '358-160.dcm', '359-161.dcm', '36-138.dcm', 
// '360-162.dcm', '361-163.dcm', '362-164.dcm', '363-165.dcm', '364-166.dcm', '365-167.dcm', '366-168.dcm', '367-169.dcm', '368-170.dcm','369-171.dcm', 
// '37-139.dcm', '370-172.dcm', '371-173.dcm', '372-174.dcm', '373-175.dcm', '374-176.dcm', '375-177.dcm', '376-178.dcm', '377-179.dcm', '378-180.dcm', 
// '379-181.dcm', '38-140.dcm', '380-182.dcm', '381-183.dcm', '382-184.dcm', '383-185.dcm', '384-186.dcm', '385-187.dcm', '386-188.dcm', '387-189.dcm', 
// '388-190.dcm', '389-191.dcm', '39-141.dcm', '390-192.dcm', '391-193.dcm', '392-194.dcm', '393-195.dcm', '394-196.dcm', '395-197.dcm', '396-198.dcm', 
// '397-199.dcm', '398-200.dcm', '399-201.dcm', '4-106.dcm', '40-142.dcm', '400-202.dcm', '401-203.dcm', '402-204.dcm', '403-205.dcm', '404-206.dcm', 
// '405-207.dcm', '406-208.dcm', '407-209.dcm', '408-210.dcm', '409-211.dcm', '41-143.dcm', '410-212.dcm', '411-213.dcm', '412-214.dcm', '413-215.dcm', 
// '414-216.dcm', '415-217.dcm', '416-218.dcm', '417-219.dcm', '418-220.dcm', '419-221.dcm', '42-144.dcm', '420-222.dcm', '421-223.dcm', '422-224.dcm', 
// '423-225.dcm', '424-226.dcm', '425-227.dcm', '426-228.dcm', '427-229.dcm', '428-230.dcm', '429-231.dcm', '43-145.dcm', '430-232.dcm', '431-233.dcm', 
// '432-234.dcm', '433-235.dcm', '434-236.dcm', '435-237.dcm', '436-238.dcm', '437-239.dcm', '438-240.dcm', '439-241.dcm', '44-146.dcm', '440-242.dcm', 
// '441-243.dcm', '442-244.dcm', '443-245.dcm', '444-246.dcm', '445-247.dcm', '446-248.dcm', '447-249.dcm', '448-250.dcm', '449-251.dcm', '45-147.dcm', 
// '450-252.dcm', '451-253.dcm', '452-254.dcm', '453-255.dcm', '454-256.dcm', '455-257.dcm', '456-258.dcm', '457-259.dcm', '458-260.dcm', '459-261.dcm', 
// '46-148.dcm', '460-262.dcm', '461-263.dcm', '462-264.dcm', '463-265.dcm', '464-266.dcm', '465-267.dcm', '466-268.dcm', '467-269.dcm', '468-270.dcm', 
// '469-271.dcm', '47-149.dcm', '470-272.dcm', '471-273.dcm', '472-274.dcm', '473-275.dcm', '474-276.dcm', '475-277.dcm', '476-278.dcm', '477-279.dcm', 
// '478-280.dcm', '479-281.dcm', '48-150.dcm', '480-282.dcm', '481-283.dcm', '482-284.dcm', '483-285.dcm', '484-286.dcm', '485-287.dcm', '486-288.dcm', 
// '487-289.dcm', '488-290.dcm', '489-291.dcm', '49-151.dcm', '490-292.dcm', '491-293.dcm', '492-294.dcm', '493-295.dcm', '494-296.dcm', '495-297.dcm', 
// '496-298.dcm', '497-299.dcm', '498-000.dcm', '499-001.dcm', '5-107.dcm', '50-152.dcm', '500-002.dcm', '501-003.dcm', '502-004.dcm', '503-005.dcm', 
// '504-006.dcm', '505-007.dcm', '506-008.dcm', '507-009.dcm', '508-010.dcm', '509-011.dcm', '51-153.dcm', '510-012.dcm', '511-013.dcm', '512-014.dcm', 
// '513-015.dcm', '514-016.dcm', '515-017.dcm', '516-018.dcm', '517-019.dcm', '518-020.dcm', '519-021.dcm', '52-154.dcm', '520-022.dcm', '521-023.dcm', 
// '522-024.dcm','523-025.dcm', '524-026.dcm', '525-027.dcm', '526-028.dcm', '527-029.dcm', '528-030.dcm', '529-031.dcm', '53-155.dcm', '530-032.dcm', 
// '531-033.dcm','532-034.dcm', '533-035.dcm', '534-036.dcm', '535-037.dcm', '536-038.dcm', '537-039.dcm', '538-040.dcm', '539-041.dcm', '54-156.dcm', 
// '540-042.dcm','541-043.dcm', '542-044.dcm', '543-045.dcm', '544-046.dcm', '545-047.dcm', '55-157.dcm', '56-158.dcm', '57-159.dcm', '58-160.dcm', 
// '59-161.dcm', '6-108.dcm', '60-162.dcm', '61-163.dcm', '62-164.dcm', '63-165.dcm', '64-166.dcm', '65-167.dcm', '66-168.dcm', '67-169.dcm', '68-170.dcm', 
// '69-171.dcm', '7-109.dcm', '70-172.dcm', '71-173.dcm', '72-174.dcm', '73-175.dcm', '74-176.dcm', '75-177.dcm', '76-178.dcm', '77-179.dcm', '78-180.dcm', 
// '79-181.dcm', '8-110.dcm', '80-182.dcm', '81-183.dcm', '82-184.dcm', '83-185.dcm', '84-186.dcm', '85-187.dcm', '86-188.dcm', '87-189.dcm', '88-190.dcm', 
// '89-191.dcm', '9-111.dcm', '90-192.dcm', '91-193.dcm', '92-194.dcm', '93-195.dcm', '94-196.dcm', '95-197.dcm', '96-198.dcm', '97-199.dcm', '98-200.dcm', 
// '99-201.dcm'
//   ];

//   let ds3fp = ds3.map(function(v) {
//     return '../../data_rsna/dataset3/PET/' + v;
//   });

//   ds3fp.push('../../data_rsna/dataset3/SEG/3DSlicer/Tumor_User2_SemiAuto_Trial2/1-105.dcm');

//   let ds4 = [
//     '000000.dcm', '000001.dcm', '000002.dcm', '000003.dcm', '000004.dcm', '000005.dcm', '000006.dcm', '000007.dcm', '000008.dcm', '000009.dcm', '000010.dcm', 
//     '000011.dcm', '000012.dcm', '000013.dcm', '000014.dcm', '000015.dcm', '000016.dcm', '000017.dcm', '000018.dcm', '000019.dcm'
//   ];

//   let ds4fp = ds4.map(function(v) {
//     return '../../data_rsna/dataset4/MR/' + v;
//   });

//   ds4fp.push('../../data_rsna/dataset4/SEG/3DSlicer/adc_label.dcm');

  // load sequence for each file
  // instantiate the loader
  // it loads and parses the dicom image
  let loader = new LoadersVolume(threeD);
  let seriesContainer = [];
  let loadSequence = [];
  ds2fp.forEach((url) => {
    loadSequence.push(
      Promise.resolve()
      // fetch the file
      .then(() => loader.fetch(url))
      .then((data) => loader.parse(data))
      .then((series) => {
        seriesContainer.push(series);
      })
      .catch(function(error) {
        window.console.log('oops... something went wrong...');
        window.console.log(error);
      })
    );
  });

  function buildGUI(stackHelper) {
    function updateLayer1(){
      // update layer1 geometry...
      if (meshLayer1) {

        meshLayer1.geometry.dispose();
        meshLayer1.geometry = stackHelper.slice.geometry;
        meshLayer1.geometry.verticesNeedUpdate = true;
        
      }
    }

    function updateLayerMix(){
      // update layer1 geometry...
      if (meshLayerMix) {

        sceneLayerMix.remove(meshLayerMix);
        meshLayerMix.material.dispose();
        meshLayerMix.material = null;
        meshLayerMix.geometry.dispose();
        meshLayerMix.geometry = null;

        // add mesh in this scene with right shaders...
        meshLayerMix = new THREE.Mesh(stackHelper.slice.geometry, materialLayerMix);
        // go the LPS space
        meshLayerMix.applyMatrix(stackHelper.stack._ijk2LPS);

        sceneLayerMix.add(meshLayerMix);
      }
    }

    let stack = stackHelper.stack;

    let gui = new dat.GUI({
            autoPlace: false
          });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    let layer0Folder = gui.addFolder('Layer 0 (Base)');
    layer0Folder.add(stackHelper.slice, 'windowWidth', 1, stack.minMax[1]).step(1).listen();
    layer0Folder.add(stackHelper.slice, 'windowCenter', stack.minMax[0], stack.minMax[1]).step(1).listen();
    layer0Folder.add(stackHelper.slice, 'intensityAuto');
    layer0Folder.add(stackHelper.slice, 'invert');

    let lutUpdate = layer0Folder.add(stackHelper.slice, 'lut', lutLayer0.lutsAvailable());
    lutUpdate.onChange(function(value) {
      lutLayer0.lut = value;
      stackHelper.slice.lutTexture = lutLayer0.texture;
    });

    let indexUpdate = layer0Folder.add(stackHelper, 'index', 0, stack.dimensionsIJK.z - 1).step(1).listen();
    indexUpdate.onChange(function(){
      updateLayer1();
      updateLayerMix();
    });

    layer0Folder.add(stackHelper.slice, 'interpolation', 0, 1 ).step( 1 ).listen();

    layer0Folder.open();

    // layer mix folder
    let layerMixFolder = gui.addFolder('Layer Mix');
    let opacityLayerMix1 = layerMixFolder.add(layerMix, 'opacity1', 0, 1).step(0.01);
    opacityLayerMix1.onChange(function(value){
      uniformsLayerMix.uOpacity1.value = value;
    });
    let typeLayerMix1 = layerMixFolder.add(layerMix, 'type1', 0, 1).step( 1 );
    typeLayerMix1.onChange(function(value){
      uniformsLayerMix.uType1.value = value;
    });

    layerMixFolder.open();

    // hook up callbacks
    controls.addEventListener('OnScroll', function(e) {
      if (e.delta > 0) {
        if (stackHelper.index >= stack.dimensionsIJK.z - 1) {
          return false;
        }
        stackHelper.index += 1;
      } else {
        if (stackHelper.index <= 0) {
          return false;
        }
        stackHelper.index -= 1;
      }

      updateLayer1();
      updateLayerMix();
    });

    updateLayer1();
    updateLayerMix();

    function onWindowResize() {
      let threeD = document.getElementById('r3d');
      camera.canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight
      };
      camera.fitBox(2);

      renderer.setSize(threeD.clientWidth, threeD.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
  }

  function handleSeries() {
    loader.free();
    loader = null;
    //
    //
    // first stack of first series
    let mergedSeries = seriesContainer[0].mergeSeries(seriesContainer);
    let stack  = mergedSeries[0].stack[0];
    let stack2 = mergedSeries[1].stack[0];

    if(stack.modality === 'SEG'){

      stack  = mergedSeries[0].stack[0];
      stack2 = mergedSeries[1].stack[0];

    }

    let stackHelper = new HelpersStack(stack);
    stackHelper.bbox.visible = false;
    stackHelper.border.visible = false;
    stackHelper.index = 247;

    sceneLayer0.add(stackHelper);

    //
    //
    // create labelmap....
    // we only care about the geometry....
    // get first stack from series
    // prepare it
    // * ijk2LPS transforms
    // * Z spacing
    // * etc.
    //
    stack2.prepare();
    // pixels packing for the fragment shaders now happens there
    stack2.pack();

    let textures2 = [];
    for (let m = 0; m < stack2._rawData.length; m++) {
      let tex = new THREE.DataTexture(
            stack2.rawData[m],
            stack2.textureSize,
            stack2.textureSize,
            stack2.textureType,
            THREE.UnsignedByteType,
            THREE.UVMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter);
      tex.needsUpdate = true;
      tex.flipY = true;
      textures2.push(tex);
    }

    // create material && mesh then add it to sceneLayer1
    uniformsLayer1 = ShadersDataUniform.uniforms();
    uniformsLayer1.uTextureSize.value = stack2.textureSize;
    uniformsLayer1.uTextureContainer.value = textures2;
    uniformsLayer1.uWorldToData.value = stack2.lps2IJK;
    uniformsLayer1.uNumberOfChannels.value = stack2.numberOfChannels;
    uniformsLayer1.uPixelType.value = stack2.pixelType;
    uniformsLayer1.uBitsAllocated.value = stack2.bitsAllocated;
    uniformsLayer1.uWindowCenterWidth.value = [stack2.windowCenter, stack2.windowWidth];
    uniformsLayer1.uRescaleSlopeIntercept.value = [stack2.rescaleSlope, stack2.rescaleIntercept];
    uniformsLayer1.uDataDimensions.value = [stack2.dimensionsIJK.x,
                                                stack2.dimensionsIJK.y,
                                                stack2.dimensionsIJK.z];
    uniformsLayer1.uInterpolation.value = 0;

    // generate shaders on-demand!
    let fs = new ShadersDataFragment(uniformsLayer1);
    let vs = new ShadersDataVertex();
    materialLayer1 = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: uniformsLayer1,
      vertexShader: vs.compute(),
      fragmentShader: fs.compute()
    });

    // add mesh in this scene with right shaders...
    meshLayer1 = new THREE.Mesh(stackHelper.slice.geometry, materialLayer1);
    // go the LPS space
    meshLayer1.applyMatrix(stack._ijk2LPS);
    sceneLayer1.add(meshLayer1);

    // Create the Mix layer
    uniformsLayerMix = ShadersLayerUniform.uniforms();
    uniformsLayerMix.uTextureBackTest0.value = sceneLayer0TextureTarget.texture;
    uniformsLayerMix.uTextureBackTest1.value = sceneLayer1TextureTarget.texture;

    let fls = new ShadersLayerFragment(uniformsLayerMix);
    let vls = new ShadersLayerVertex();
    materialLayerMix = new THREE.ShaderMaterial(
      {side: THREE.DoubleSide,
      uniforms: uniformsLayerMix,
      vertexShader: vls.compute(),
      fragmentShader: fls.compute(),
      transparent: true
    });

    // add mesh in this scene with right shaders...
    meshLayerMix = new THREE.Mesh(stackHelper.slice.geometry, materialLayerMix);
    // go the LPS space
    meshLayerMix.applyMatrix(stack._ijk2LPS);
    sceneLayerMix.add(meshLayerMix);

    //
    // set camera
    let worldbb = stack.worldBoundingBox();
    let lpsDims = new THREE.Vector3(
      worldbb[1] - worldbb[0],
      worldbb[3] - worldbb[2],
      worldbb[5] - worldbb[4]
    );

    // box: {halfDimensions, center}
    let bbox = {
      center: stack.worldCenter().clone(),
      halfDimensions: new THREE.Vector3(lpsDims.x + 10, lpsDims.y + 10, lpsDims.z + 10)
    };

    // init and zoom
    let canvas = {
        width: threeD.clientWidth,
        height: threeD.clientHeight
      };
    camera.init(stack.xCosine, stack.yCosine, stack.zCosine, controls, bbox, canvas);
    camera.fitBox(2);

    // CREATE LUT
    lutLayer0 = new HelpersLut(
      'my-lut-canvases-l0',
      'default',
      'linear',
      [[0, 0, 0, 0], [1, 1, 1, 1]],
      [[0, 1], [1, 1]]);
    lutLayer0.luts = HelpersLut.presetLuts();
    lutLayer0.lut = 'random';
    stackHelper.slice.lut = 1;
    stackHelper.slice.lutTexture = lutLayer0.texture;

    lutLayer1 = new HelpersLut(
      'my-lut-canvases-l1',
      'default',
      'linear',
      stack2.segmentationLUT,
      stack2.segmentationLUTO,
      true);
    uniformsLayer1.uLut.value = 1;
    uniformsLayer1.uTextureLUT.value = lutLayer1.texture;

    buildGUI(stackHelper);
  }

  Promise
    .all(loadSequence)
    .then(function() {
      handleSeries();
    })
    .catch(function(error) {
      window.console.log('oops... something went wrong...');
      window.console.log(error);
    });
};
