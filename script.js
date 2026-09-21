import * as THREE from "three"; //import the three.js library
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene(); //create a new scene
const canvas = document.getElementById("experience-canvas"); //get the canvas element from the HTML document
const raycaster = new THREE.Raycaster(); //create a new raycaster to detect mouse interactions with 3D objects
const pointer = new THREE.Vector2(); //create a new vector to store the mouse position in normalized device coordinates
const sizes = {
  width: window.innerWidth, //set the width to the window's inner width

  height: window.innerHeight, //set the height to the window's inner height
};

let modalContent = {
  project1: {
    title: "Project 1",
    description: "This is the description for Project 1.",
  },
  project2: {
    title: "Project 2",
    description: "This is the description for Project 2.",
  },
};
let modal = document.querySelector(".model");
let modalTitle = document.querySelector(".model-title-wrapper");
let modalDescription = document.querySelector(".model-content-wrapper");
let modalCloseBtn = document.querySelector(".model-close-button");

function showModal(id) {
  const project = modalContent[id];
  if (project) {
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    modal.classList.toggle("hidden");
  }
}
function hideModal() {
  modal.classList.toggle("hidden");
}
modalCloseBtn.addEventListener("click", hideModal);
let intersectObject = ""; //create a variable to store the name of the intersected object
const intersectedObjects = []; //create an array to store the intersected objects
const intersectedObjectsName = ["project1", "project2"];

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); //create a new WebGL renderer
renderer.setSize(sizes.width, sizes.height); //set the size of the renderer to match the window size
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set the pixel ratio to the device's pixel ratio, but limit it to 2 for performance reasons
renderer.shadowMap.type = THREE.PCFSoftShadowMap; //set the shadow map type to PCFSoftShadowMap
renderer.shadowMap.enabled = true; //enable shadow mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping; //set the tone mapping to ACESFilmicToneMapping
renderer.toneMappingExposure = 1.75; //set the tone mapping exposure to 1.75

const loader = new GLTFLoader();

loader.load(
  "./portfolio.glb",
  function (glb) {
    glb.scene.traverse((child) => {
      if (intersectedObjectsName.includes(child.name)) {
        intersectedObjects.push(child);
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(glb.scene);
    console.log(glb.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  },
);
const sun = new THREE.DirectionalLight(0xffffff);
sun.castShadow = true;
sun.position.set(50, 80, 0);
sun.target.position.set(50, 0, 0);
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.camera.left = -300;
sun.shadow.camera.right = 300;
sun.shadow.camera.top = 300;
sun.shadow.camera.bottom = -300;
sun.shadow.normalBias = 0.1;
scene.add(sun);

const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);
const helper = new THREE.DirectionalLightHelper(sun, 3);
scene.add(helper);

const light = new THREE.AmbientLight(0x404040, 3.5); // soft white light
scene.add(light);

const aspect = sizes.width / sizes.height; //calculate the aspect ratio of the window
const camera = new THREE.OrthographicCamera(
  -aspect * 50,
  aspect * 50,
  50,
  -50,
  1,
  1000,
);

camera.position.x = -120; //setting the camera position
camera.position.y = 103; //setting the camera position
camera.position.z = -239; //setting the camera position

const controls = new OrbitControls(camera, canvas);
controls.update();

function onWindowResize() {
  sizes.width = window.innerWidth; //update the width to the window's inner width
  sizes.height = window.innerHeight; //update the height to the window's inner height
  const aspect = sizes.width / sizes.height; //update the camera's aspect ratio
  camera.left = -aspect * 50; //update the camera's left frustum plane
  camera.right = aspect * 50; //update the camera's right frustum plane
  camera.top = 50; //update the camera's top frustum plane
  camera.bottom = -50; //update the camera's bottom frustum plane
  camera.updateProjectionMatrix(); //update the camera's projection matrix

  renderer.setSize(sizes.width, sizes.height); //update the renderer's size
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //update the renderer's pixel ratio
}
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function intersectObjectClick() {
  console.log(intersectObject);
  if (intersectObject) {
    showModal(intersectObject);
  }
}
window.addEventListener("pointermove", onPointerMove); //add an event listener to the pointer move event
window.addEventListener("resize", onWindowResize); //add an event listener to the window resize event
window.addEventListener("click", intersectObjectClick); //add an event listener to the click event

function animate(time) {
  raycaster.setFromCamera(pointer, camera); //update the raycaster with the current mouse position and camera
  const intersects = raycaster.intersectObjects(intersectedObjects); //get the list of intersected objects
  if (intersects.length > 0) {
    document.body.style.cursor = "pointer"; //change the cursor to a pointer if an object is intersected
  } else {
    document.body.style.cursor = "default"; //change the cursor back to default if no object is intersected
    intersectObject = ""; //reset the intersected object name if no object is intersected
  }
  for (let i = 0; i < intersects.length; i++) {
    intersectObject = intersects[0].object.parent.name; //store the name of the intersected object
  }
  renderer.render(scene, camera);
  console.log(camera.position);
}
renderer.setAnimationLoop(animate); //set the animation loop to call the animate function on each frame
