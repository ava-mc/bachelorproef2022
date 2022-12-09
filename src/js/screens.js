export const socket = io.connect();
import { initScreen1 } from "./screen1.js";
import { initScreen2 } from "./screen2.js";
import { initScreen3 } from "./screen3.js";
import {loadImages} from './browser-functions/image-loading.js';
import {amountOfVersions} from './lib.js';

/////// SCREEN SELECTION LOGIC ////////
let currentScreen;
// let $screensaverSpan;

//get which screen is selected from the querystring
const getScreenSelection = () => {
  let selectedScreen;
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.get("screen")) {
    selectedScreen = parseInt(urlParams.get("screen"));
  }
  return selectedScreen;
}

//get the screen choice from the querystring and send it to the server
  window.onload = (event) => {
    const selectedScreen = getScreenSelection();
    if (selectedScreen) {
      socket.emit("screen choice", selectedScreen);
    }
  };

  //bundled logic for the socket events related to screen selection
  const screenSelectionInit = () => {
    const screenSelector = document.querySelector(`.screen-selector`);

    //catch server response of own chosen screen
    socket.on("screen choice", (chosenScreen) => {
      console.log("this client chose screen ", chosenScreen);
      currentScreen = chosenScreen;
    });

    //remove links when all screens have been chosen
    socket.on("full", () => {
      document.querySelector(".screen-selector").innerHTML =
        "<p>All screens have been selected.</p>";
    });

    //catch server response from other clients' chosen screens
    socket.on("screen chosen", (chosenScreens) => {
      console.log("occupied screens: ", chosenScreens);
      //if all screens are chosen, set each screen to it's right 'content'
      if (chosenScreens.length == 3) {
        console.log("all screens chosen, show screen content");
        screenSelector.classList.add(`hidden`);
        console.log(currentScreen);
        const root = document.documentElement;
        if (currentScreen == 1) {
          console.log("Im screen 1");
          console.log(root);
          root.classList.add("screen1");
          initScreen1();
        } else if (currentScreen == 2) {
          console.log("Im screen 2");
          root.classList.add("screen2");
          initScreen2();
        } else if (currentScreen == 3) {
          console.log("Im screen 3");
          root.classList.add("screen3");
          initScreen3();
        }
      } else {
        //reset classes
        const previousScreens = document.querySelectorAll(".screen-choice");
        previousScreens.forEach((item) => {
          item.classList.remove("screen-chosen");
          item.classList.remove("screen-current");
        });
        //else do a foreach on the picked screens, so the screen shows which ones are still available to select
        chosenScreens.forEach((screen) => {
          const disableScreen = document.querySelector(
            `.screen-choice-${screen}`
          );
          disableScreen.classList.add("screen-chosen");
          if (screen === currentScreen) {
            disableScreen.classList.add("screen-current");
          }
        });
      }
    });

    //catch the emit of a disconnected screen
    socket.on("screen disconnected", (selectedScreens) => {
      console.log("screen disconnected ", selectedScreens);
      //make sure that when disconnected screen is refreshed, and shows the general screen selector, we here see which screen is unselected
      //reset classes
      const previousScreens = document.querySelectorAll(".screen-choice");
      previousScreens.forEach((item) => {
        item.classList.remove("screen-chosen");
        item.classList.remove("screen-current");
      });
      selectedScreens.forEach((screen) => {
        const disableScreen = document.querySelector(
          `.screen-choice-${screen}`
        );
        disableScreen.classList.add("screen-chosen");
      });
    });
  };


////// PNG SEQUENCE LOGIC ////////
// categorised list of all images
// let imagesList = [];
let imagesList = {};
let totalLoadedImages = 0;
let loadedImagesLimit = 0;

// list of info about which png sequence animations should currently be played
let playInfo = [];

let context;

//info for the drawing loop
const fps = 30;
const interval = Math.floor(1000 / fps);
let startTime = performance.now();
let previousTime = startTime;
let currentTime = 0;
let deltaTime = 0;

//bundling socket events related to png sequences logic
const pngSequenceInit = () => {

  // get the info about the animations related to this screen
  socket.on("animation-info", async (animationInfo) => {
    for (let i = 1; i <= amountOfVersions; i++ ) {
      const version = `version-${i}`;
      //get the right images linked to the info about the animations of this screen
      imagesList[version] = await loadImages(animationInfo[version], version);
      //get the total amount of images that should be loaded before we can start
      for (let j = 0; j < animationInfo[version].animations.length; j++) {
        loadedImagesLimit += animationInfo[version].animations[j].long;
        loadedImagesLimit += animationInfo[version].animations[j].short;
        console.log(loadedImagesLimit);
      }
    }
    console.log("the animation info:", animationInfo);
  });

  //get the info about which png sequences should be playing currently
  socket.on("pngs", (info) => {
    console.log(info, info.brightness);
    //check whether the info is relevant for this screen
    if (info.screen == currentScreen) {
      //get the duration state
      let durationState;
      if (info.long) {
        durationState = "long";
      }
      if (info.short) {
        durationState = "short";
      }

      //if no state is true, we remove the animation info from the playing list and hide the images
      if (!durationState) {
        const previous = playInfo.find(
          (item) => item.animation === info.animation
        );
        if (previous) {
          playInfo.splice(playInfo.indexOf(previous), 1);
        }
        clearCanvas();
      } else {
        //reset index
        info.index = 0;
        //get right images
        const animationImages = imagesList.find(
          (item) => item.name === `animation-${info.animation}`
        );
        if (animationImages){
          info.images = animationImages[durationState];
        }
        //add the new animation info to the list of currently playing animaitions
        playInfo.push(info);
      }
    }
  });
}

// show an image
// const scalingOpacityFactor = 1.2;
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

// function to execute each time a single image is loaded, to keep track of whether all images have been loaded
//only then we will start the drawing loop
export const onLoadedImage = () => {
  totalLoadedImages++;
  if (totalLoadedImages === loadedImagesLimit) {
    console.log("all images loaded");
    console.log(imagesList);
    //start the loop
    // window.requestAnimationFrame(loop);
  }
}

// loop to draw the right pngs on the canvas
const loop = (timestamp) => {
  currentTime = timestamp;
  deltaTime = currentTime - previousTime;
  if (deltaTime > interval) {
    clearCanvas();
    previousTime = currentTime - (deltaTime % interval);
    // if (totalLoadedImages === loadedImagesLimit) {
      if (imagesList.length > 0) {
        for (let j = 0; j < playInfo.length; j++) {
          const playItem = playInfo[j];
          const length = playItem.images.length;
          //only show current image
          const image = playItem.images[playItem.index];
          showImage(image, playItem.brightness);
          playItem.index++;

          //when we reached the final png in the sequence
          if (playItem.index >= length) {
            //if it's the long state, we repeat the animation
            if (playItem.long) {
              playItem.index = 0;
            }
            //if it's the short animations, we remove the animation from the playInfo list once it is done
            if (playItem.short) {
              //remove the previous play info for this animation, if there was info about it already
              playInfo.splice(playInfo.indexOf(playItem), 1);
              clearCanvas();
            }
          }
        }
      }
    } 
  // }

  window.requestAnimationFrame(loop);
};


///// SCREENSAVER LOGIC ///////
//bundled logic for screensaver related socket events
const screenSaverInfoInit = () => {
  //get info about timing of screensaver
  socket.on("screensaverTime", (time) => {
    // set css variable for transition time of screensaver text
    document.documentElement.style.setProperty(
      "--transition-length",
      `${time}s`
    );
  });

  //when screensaver stops, text should be gone
  socket.on("screensaverStop", () => {
    if (currentScreen){
    const $screensaverSpan = document
      .querySelector(`.screen${currentScreen}`)
      .querySelector(`span:nth-of-type(${currentScreen})`);
    $screensaverSpan.classList.remove("opacity-up");
    $screensaverSpan.classList.remove("opacity-down");
    }
  });

  //show right opacity animation in time with LED animation
  socket.on("opacity-change", (type) => {
    if (currentScreen){
    const $screensaverSpan = document
      .querySelector(`.screen${currentScreen}`)
      .querySelector(`span:nth-of-type(${currentScreen})`);
    if (type == "up") {
      $screensaverSpan.classList.add("opacity-up");
      $screensaverSpan.classList.remove("opacity-down");
    } else {
      $screensaverSpan.classList.remove("opacity-up");
      $screensaverSpan.classList.add("opacity-down");
    }
  }
  });
}


const init = () => {
  screenSelectionInit();
  screenSaverInfoInit();
  pngSequenceInit();

  const $canvas = document.getElementById("canvas");
  $canvas.width = window.innerWidth;
  $canvas.height = window.innerHeight;
  context = $canvas.getContext("2d");

  window.addEventListener("resize", () => {
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight;
  });
}

init();
