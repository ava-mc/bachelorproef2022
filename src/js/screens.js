export const socket = io.connect();
import { loadImages } from "./browser-functions/image-loading.js";
import { amountOfScreens, amountOfVersions } from "./lib.js";

/////// SCREEN SELECTION LOGIC ////////
let currentScreen;

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
};

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
      for (let i = 1; i <= amountOfScreens; i++) {
        if (currentScreen == i) {
          console.log(`Im screen ${i}`);
          root.classList.add(`screen${i}`);
        }
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
      const disableScreen = document.querySelector(`.screen-choice-${screen}`);
      disableScreen.classList.add("screen-chosen");
    });
  });

  //redirect when socket gets disconnected
  socket.on("disconnect", () => {
    window.close();
  });

  //catch the emit to reset screen
  socket.on("resetScreen", () => {
    // redirect to new URL
    window.location = "/";
  });
};

////// PNG SEQUENCE LOGIC ////////
// categorised list of all images
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

let animationIndex = 0;
let pngIndex = 0;
let version = 1;
let duration = "short";
let opacity = 0;
let loadingNotification = false;
let loadingCounter = 0;

//go through all pngs for this screen and paint on canvas, to use as loading for slow first-paint
const playAllAnimations = () => {
  const image =
    imagesList?.[`version-${version}`]?.[animationIndex]?.[duration][pngIndex];
  if (image) {
    showImage(image, opacity);
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
            socket.emit("ready", currentScreen);
            if (loadingCounter == 0) {
              document.querySelector(".title").textContent =
                "ready for animations";
              console.log("ready for animations");
            }
            loadingCounter++;
          }
        }
      }
    }
  }
};

//bundling socket events related to png sequences logic
const pngSequenceInit = () => {
  // get the info about the animations related to this screen
  socket.on("animation-info", async (animationInfo) => {
    //show on the screen that loading process has started
    document.querySelector(".title").classList.remove("hidden");

    for (let i = 1; i <= amountOfVersions; i++) {
      const version = `version-${i}`;
      //get the right images linked to the info about the animations of this screen
      imagesList[version] = await loadImages(
        animationInfo[version],
        version,
        onLoadedImage
      );
      //get the total amount of images that should be loaded before we can start
      for (let j = 0; j < animationInfo[version].animations.length; j++) {
        loadedImagesLimit += animationInfo[version].animations[j].long;
        loadedImagesLimit += animationInfo[version].animations[j].short;
        console.log(loadedImagesLimit);
      }
    }
    console.log("the animation info:", animationInfo);
  });

  socket.on("fully-loaded", () => {
    const root = document.documentElement;
    root.classList.add("loaded");
    loadingNotification = true;

    document.querySelector(".title").classList.add("hidden");
  });

  //get the info about which png sequences should be playing currently
  socket.on("pngs", (info) => {
    console.log(info, info.brightness);
    //only handle animation cues when loading is ready
    if (loadingNotification) {
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
        console.log(durationState);
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
          const animationImages = imagesList[`version-${info.version}`].find(
            (item) => item.name === `animation-${info.animation}`
          );
          console.log(animationImages);
          if (animationImages) {
            info.images = animationImages[durationState];
          }
          //add the new animation info to the list of currently playing animaitions
          playInfo.push(info);
          console.log(playInfo);
        }
      }
    }
  });
};

// show an image with certain opacity
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
const onLoadedImage = () => {
  totalLoadedImages++;
  if (totalLoadedImages === loadedImagesLimit) {
    console.log("all images loaded");
    console.log(imagesList);
    //start the loop
    window.requestAnimationFrame(loop);
  }
};

// loop to draw the right pngs on the canvas
const loop = (timestamp) => {
  currentTime = timestamp;
  deltaTime = currentTime - previousTime;
  if (deltaTime >= interval) {
    clearCanvas();
    previousTime = currentTime - (deltaTime % interval);
    playAllAnimations();
    if (loadingNotification) {
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
          }
        }
      }
    }
  }

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
    if (currentScreen) {
      //select element that holds right word to show on screen during screensaver
      //(since screen 1 needs span nr 3, and vice-versa, we calculate with ${4 - number of the current screen})
      const $screensaverSpan = document
        .querySelector(`.screen${currentScreen}`)
        .querySelector(`span:nth-of-type(${4 - currentScreen})`);
      $screensaverSpan.classList.remove("opacity-up");
      $screensaverSpan.classList.remove("opacity-down");
    }
  });

  //show right opacity animation in time with LED animation
  socket.on("opacity-change", (type) => {
    if (currentScreen) {
      //select element that holds right word to show on screen during screensaver
      //(since screen 1 needs span nr 3, and vice-versa, we calculate with ${4 - number of the current screen})
      const $screensaverSpan = document
        .querySelector(`.screen${currentScreen}`)
        .querySelector(`span:nth-of-type(${4 - currentScreen})`);
      if (type == "up") {
        $screensaverSpan.classList.add("opacity-up");
        $screensaverSpan.classList.remove("opacity-down");
      } else {
        $screensaverSpan.classList.remove("opacity-up");
        $screensaverSpan.classList.add("opacity-down");
      }
    }
  });
};

const init = () => {
  screenSelectionInit();
  screenSaverInfoInit();
  pngSequenceInit();

  //setup canvas
  const $canvas = document.getElementById("canvas");
  $canvas.width = window.innerWidth;
  $canvas.height = window.innerHeight;
  context = $canvas.getContext("2d");

  //scale canvas with window size
  window.addEventListener("resize", () => {
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight;
  });

  //add reset functionality for screen choice menu
  const $reset = document.getElementById("reset");
  $reset.addEventListener("click", () => {
    socket.emit("reset");
  });
};

init();
