// import { animationList } from "./node-functions/animation-info.js";
import { amountOfVersions } from "../../src/js/lib.js";
import { loadImages } from "../../src/js/browser-functions/image-loading.js";

const $canvas = document.getElementById("canvas");
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
let context = $canvas.getContext("2d");

const animationInfo = {
  "version-1": {
    name: "screen-1",
    animations: [
      { name: "animation-1", long: 6, short: 13 },
      { name: "animation-2", long: 6, short: 13 },
      { name: "animation-3", short: 13, long: 6 },
      { name: "animation-4", long: 6, short: 13 },
    ],
  },
  "version-2": {
    name: "screen-1",
    animations: [
      { name: "animation-1", long: 5, short: 16 },
      { name: "animation-2", long: 5, short: 16 },
    ],
  },
};

// show an image
const showImage = (img, opacity) => {
  context.save();
  context.globalAlpha = opacity;
  context.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
  context.restore();
};

//clear all images
const clearCanvas = () => {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
};

let totalLoadedImages = 0;
let loadedImagesLimit = 0;
const onLoadedImage = () => {
  totalLoadedImages++;
  if (totalLoadedImages === loadedImagesLimit) {
    // console.log("all images loaded");
    // console.log(imagesList);
    document.getElementById("title").textContent = "done loading";
    //start the loop
    window.requestAnimationFrame(loop);
  }
};

let animationIndex = 0;
let pngIndex = 0;
let version = 1;
let duration = "short";

//info for the drawing loop
const fps = 30;
const interval = Math.floor(1000 / fps);
let startTime = performance.now();
let previousTime = startTime;
let currentTime = 0;
let deltaTime = 0;
// loop to draw the right pngs on the canvas
const loop = (timestamp) => {
  currentTime = timestamp;
  deltaTime = currentTime - previousTime;
  if (deltaTime > interval) {
    clearCanvas();
    previousTime = currentTime - (deltaTime % interval);
    const image =
      imagesList?.[`version-${version}`]?.[animationIndex]?.[duration][
        pngIndex
      ];
    if (image) {
      showImage(image, 1);
      pngIndex++;

      if (
        pngIndex >=
        imagesList[`version-${version}`][animationIndex][duration].length
      ) {
        pngIndex = 0;
        if (duration == "short") {
          duration = "long";
        } else {
          duration = "short";
          animationIndex++;
          if (animationIndex >= imagesList[`version-${version}`].length) {
            version++;
            animationIndex = 0;
            if (version > amountOfVersions) {
              version = 1;
            }
          }
        }
      }
    }
  }

  window.requestAnimationFrame(loop);
};

let imagesList = {};
const init = async () => {
  for (let i = 1; i <= amountOfVersions; i++) {
    const version = `version-${i}`;
    //get the right images linked to the info about the animations of this screen
    imagesList[version] = await loadImages(
      animationInfo[version],
      version,
      onLoadedImage
    );
    console.log(imagesList);

    for (let j = 0; j < animationInfo[version].animations.length; j++) {
      loadedImagesLimit += animationInfo[version].animations[j].long;
      loadedImagesLimit += animationInfo[version].animations[j].short;
      console.log(loadedImagesLimit);
    }
  }
  console.log("the animation info:", animationInfo);
  //   requestAnimationFrame(loop);
};

init();
