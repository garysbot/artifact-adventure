import * as THREE from '/node_modules/three/build/three.module.js';
import { PointerLockControls } from '/node_modules/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import GUI from 'lil-gui';

// ! Setup ----------------------------------------------------------------------------------
// * Move to Experience class
let camera
let scene
let renderer
let controls

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

init();
animate();





// ! Main Experience -----------------------------------------------------------------------
function init() {


  

  console.log(`INVOKED: init()`)
  // ^ Setup -------------------------------------------------------------------------------
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.y = 10;
  camera.position.z = 50;
  console.log(`init() - camera: Object3D? [${camera.isObject3D}] | Visible? [${camera.visible}] | id: [${camera.id}]`);

  

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
  console.log(`init() - scene: Object3D? [${scene.isObject3D}] | Visible? [${scene.visible}] | id: [${scene.id}]`);

  // ^ EnvironmentMap Textures -------------------------------------------------------------
  const textureLoader = new THREE.TextureLoader();
  // const environmentMapURL = './textures/environmentMap/cyberpunk.png'
  const environmentMapURL = './textures/environmentMap/cyberpunk.png'
  const environmentMap = textureLoader.load(environmentMapURL);
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;
  environmentMap.colorSpace = THREE.SRGBColorSpace;
  scene.environment = environmentMap;
  scene.background = environmentMap;
  // console.log(`init() - environmentMap: Texture? [${environmentMap.isTexture}] | id: [${environmentMap.id}]`);


  // ^ Lights ------------------------------------------------------------------------------
  const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 1.5 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add( light );
  // console.log(`init() - light: Object3D? [${light.isObject3D}] | Visible? [${light.visible}] | id: [${light.id}]`);

  // ^ Controls ------------------------------------------------------------------------------
  controls = new PointerLockControls( camera, document.body );
  // console.log(`init() - controls: DOM? [${controls.domElement}] | Locked? [${controls.isLocked}] | id: [${scene.id}]`);
  
  // ^ Game Instructions ---------------------------------------------------------------------
  const blocker = document.getElementById( 'blocker' );
  const instructions = document.getElementById( 'content' );
  

  // ~ Event Listeners to allow users to pause & resume game w/ Instructions page as the pause screen
  instructions.addEventListener( 'click', function () {
    
    controls.lock();
    
  } );
  
  controls.addEventListener( 'lock', function () {
    
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    
  } );
  
  controls.addEventListener( 'unlock', function () {
    
    blocker.style.display = 'block';
    instructions.style.display = '';
    
  } );
  console.log(`controls.getObject(): ${Object.values(controls.getObject())}`)
  scene.add( controls.getObject() );
  

  // ^ User WASD Controls --------------------------------------------------------------------
  const onKeyDown = function ( event ) {
    switch ( event.code ) {
      case 'ArrowUp':
        case 'KeyW':
          // console.log(`ArrowUp/KeyW is working with event.code = ${event.code} via onKeyDown()`)
          moveForward = true;
          break;
      case 'ArrowLeft':
        case 'KeyA':
          // console.log(`ArrowLeft/KeyA is working with event.code = ${event.code} via onKeyDown()`)
          moveLeft = true;
          break;    
      case 'ArrowDown':
        case 'KeyS':
          // console.log(`ArrowDown/KeyS is working with event.code = ${event.code} via onKeyDown()`)
          moveBackward = true;
          break;
        
      case 'ArrowRight':
        case 'KeyD':
          // console.log(`ArrowRight/KeyD is working with event.code = ${event.code} via onKeyDown()`)
          moveRight = true;
          break;
          
      case 'Space':
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break; 
      }
  };
  
  const onKeyUp = function ( event ) {    
    switch ( event.code ) {
      case 'ArrowUp':
        case 'KeyW':
          // console.log(`ArrowUp/KeyW is working with event.code = ${event.code} via onKeyUp()`)
          moveForward = false;
          break;
          
      case 'ArrowLeft':
        case 'KeyA':
          // console.log(`ArrowLeft/KeyA is working with event.code = ${event.code} via onKeyUp()`)
          moveLeft = false;
          break;
        
      case 'ArrowDown':
        case 'KeyS':
        // console.log(`ArrowDown/KeyS is working with event.code = ${event.code} via onKeyUp()`)
        moveBackward = false;
        break;
          
      case 'ArrowRight':
        case 'KeyD':
          // console.log(`ArrowRight/KeyD is working with event.code = ${event.code} via onKeyUp()`)
          moveRight = false;
          break;
          
      }            
  };
            
  document.addEventListener( 'keydown', onKeyDown );
  document.addEventListener( 'keyup', onKeyUp );
  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
  

  // ^ Art Objects -----------------------------------------------
  const artTexture1 = textureLoader.load('./art/0/0.png')
  const art1 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial( { map: artTexture1, side: THREE.DoubleSide } )
  );

  const artTexture2 = textureLoader.load('./art/0/1.png')
  const art2 = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 40),
    new THREE.MeshStandardMaterial( { map: artTexture2, side: THREE.DoubleSide } )
  );

  const artTexture3 = textureLoader.load('./art/0/2.png')
  const art3 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial( { map: artTexture3, side: THREE.DoubleSide } )
  );

  const artTexture4 = textureLoader.load('./art/0/3.png')
  const art4 = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 40),
    new THREE.MeshStandardMaterial( { map: artTexture4, side: THREE.DoubleSide } )
  );

  art1.position.set(-55, 25, 0);
  art1.rotateY(-90);
  art2.position.set(55, 25, 50);
  art2.rotateY(130);
  art3.position.set(30, 25, -40);
  art3.rotateY(160);
  art4.position.set(-20, 25, 80);
  art4.rotateY(110);
  scene.add( art1 );
  scene.add( art2 );
  scene.add( art3 );
  scene.add( art4 );
  
  // ^ Models for Fun
  const gltfLoader = new GLTFLoader()
  gltfLoader.load(
    '/models/terrariumBots/scene.gltf',
    (gltf) =>{
        // console.log('success')
        // console.log(gltf)
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.set(-70, 0, 0);
        scene.add(gltf.scene)
    }
  );
  gltfLoader.load(
    '/models/phoenix/scene.gltf',
    (gltf) =>{
        // console.log('success')
        // console.log(gltf)
        gltf.scene.scale.set(0.08, 0.08, 0.08)
        gltf.scene.position.set(0, 150, 0)
        scene.add(gltf.scene)
    }
  );
  gltfLoader.load(
    '/models/skater/scene.gltf',
    (gltf) =>{
        // console.log('success')
        // console.log(gltf)
        gltf.scene.scale.set(5, 5, 5)
        gltf.scene.position.set(20, 0, -100)
        gltf.scene.rotateY(150);
        scene.add(gltf.scene)
    }
  );

  // ^ Floor -----------------------------------------------------
  let floorGeometry = new THREE.CircleGeometry( 100, 64, 0, 2 * Math.PI );
  floorGeometry.rotateX( - Math.PI / 2 );
  
  // const floorBaseTexture = textureLoader.load('./textures/floor/concrete/concreteBaseColor.jpg');
  // const floorNormalTexture = textureLoader.load('./textures/floor/concrete/concreteNormal.jpg');
  // const floorRoughnessTexture = textureLoader.load('./textures/floor/concrete/concreteRoughness.jpg');
  // const floorHeightTexture = textureLoader.load('./textures/floor/concrete/concreteHeight.jpg');
  // const floorAOTexture = textureLoader.load('./textures/floor/concrete/concreteAmbientOcclusion.jpg');
  
  const floorBaseTexture = textureLoader.load('./textures/floor/darkmarble/Marble_Blue_004_basecolor.jpg');
  const floorNormalTexture = textureLoader.load('./textures/floor/darkmarble/Marble_Blue_004_normal');
  const floorRoughnessTexture = textureLoader.load('./textures/floor/darkmarble/Marble_Blue_004_roughness.jpg');
  const floorHeightTexture = textureLoader.load('./textures/floor/darkmarble/Marble_Blue_004_height.png');
  const floorAOTexture = textureLoader.load('./textures/floor/darkmarble/Marble_Blue_004_ambientOcclusion.jpg');


  floorBaseTexture.repeat.set(10.5, 10.5);
  floorBaseTexture.wrapS = THREE.RepeatWrapping;
  floorBaseTexture.wrapT = THREE.RepeatWrapping;

  floorNormalTexture.repeat.set(10.5, 10.5);
  floorNormalTexture.wrapS = THREE.RepeatWrapping;
  floorNormalTexture.wrapT = THREE.RepeatWrapping;

  floorRoughnessTexture.repeat.set(10.5, 10.5);
  floorRoughnessTexture.wrapS = THREE.RepeatWrapping;
  floorRoughnessTexture.wrapT = THREE.RepeatWrapping;

  floorHeightTexture.repeat.set(10.5, 10.5);
  floorHeightTexture.wrapS = THREE.RepeatWrapping;
  floorHeightTexture.wrapT = THREE.RepeatWrapping;

  floorAOTexture.repeat.set(10.5, 10.5);
  floorAOTexture.wrapS = THREE.RepeatWrapping;
  floorAOTexture.wrapT = THREE.RepeatWrapping;

  const floorMaterial = new THREE.MeshStandardMaterial( { 
    map: floorBaseTexture,
    normalMap: floorNormalTexture,
    roughnessMap: floorRoughnessTexture,
    displacementMap: floorHeightTexture,
    aoMap: floorAOTexture
  } );

  const floor = new THREE.Mesh( floorGeometry, floorMaterial );
  scene.add( floor );

  // ! Debugger
  if (window.location.hash === '#debug'){
    const gui = new GUI();
    
    const envMapOptions = {
      'Cyberpunk': './textures/environmentMap/cyberpunk.png',
      'Fantasy Village': './textures/environmentMap/fantasy-village.png',
      'Manga': './textures/environmentMap/manga.png',
      'Medieval': './textures/environmentMap/medieval.png',
      'Snowy NYC': './textures/environmentMap/snowynyc.png'
    };
  
    let currentEnvMap = './textures/environmentMap/cyberpunk.png'; // initial setting
  
    gui.add({ envMap: currentEnvMap }, 'envMap', envMapOptions)
       .name('Environment Map')
       .onChange((newPath) => {
         const newEnvironmentMap = textureLoader.load(newPath);
         newEnvironmentMap.mapping = THREE.EquirectangularReflectionMapping;
         newEnvironmentMap.colorSpace = THREE.SRGBColorSpace;
         scene.environment = newEnvironmentMap;
         scene.background = newEnvironmentMap;
       });
    
    const floorTextureOptions = {
      'Concrete': './textures/floor/concrete/concreteBaseColor.jpg',
      'Dark Marble': './textures/floor/darkmarble/Marble_Blue_004_basecolor.jpg',
      'Shaggy': './textures/floor/shaggy.png'
      // Add more options here
    };
    
    let currentFloorTexture = './textures/floor/darkmarble/Marble_Blue_004_basecolor.jpg'; // initial setting

    gui.add({ floorTexture: currentFloorTexture }, 'floorTexture', floorTextureOptions)
     .name('Floor Texture')
     .onChange((newPath) => {
       const newFloorBaseTexture = textureLoader.load(newPath);
       newFloorBaseTexture.repeat.set(12.5, 12.5);
       newFloorBaseTexture.wrapS = THREE.RepeatWrapping;
       newFloorBaseTexture.wrapT = THREE.RepeatWrapping;

       floorMaterial.map = newFloorBaseTexture;
       floorMaterial.needsUpdate = true; // This is needed to tell Three.js to update the material
     });
  
    // ! Control Lights
    gui.add(light, 'intensity')
    .name('Light Intensity')
    .min(0)
    .max(5)
    .step(0.10)

    scene.backgroundBlurriness = 0.00
    scene.backgroundIntensity = 5
    
    gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
    gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001)
     
  }
  
  // ^ Renderer -----------------------------------------------------
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  document.body.appendChild( renderer.domElement );



}

// ^ Window Resizing Helper -----------------------------------------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize );


// ! met Museum



// ! Main Animation Controller -------------------------------------------------------------------
function animate() {
  requestAnimationFrame( animate );
  const time = performance.now();

  if ( controls.isLocked === true ) {
    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects( objects, false );

    const onObject = intersections.length > 0;

    const delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    // console.log(`Moving in direction.z: ${direction.z}`)
    direction.x = Number( moveRight ) - Number( moveLeft );
    // console.log(`Moving in direction.x: ${direction.x}`)
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    if ( onObject === true ) {

      velocity.y = Math.max( 0, velocity.y );
      canJump = true;

    }

    

    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );

    controls.getObject().position.y += ( velocity.y * delta ); // new behavior

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

  }

  prevTime = time;

  renderer.render( scene, camera );

}