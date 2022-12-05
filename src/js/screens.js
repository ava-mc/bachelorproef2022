export const socket = io.connect();
import { initScreen1 } from "./screen1.js";
import { initScreen2 } from "./screen2.js";
import { initScreen3 } from "./screen3.js";

// window.addEventListener("keydown", () => {
//   socket.emit("start");
//   socket.emit('change');
// });

// const $example = document.querySelector(".example");
// socket.on("ended", () => {
//   $example.classList.add("animate");
//   setTimeout(() => {
//     $example.classList.remove("animate");
//   }, 1000);
// });

let selectedScreen;
let totalLoadedImages = 0;
let loadedImagesLimit = 0;
//get which screen is selected from the querystring
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("screen")) {
  selectedScreen = parseInt(urlParams.get("screen"));
}

let currentScreen;
const screenSelector = document.querySelector(`.screen-selector`);

//get the screen choice from the querystring
window.onload = (event) => {
  if (selectedScreen) {
    socket.emit("screen choice", selectedScreen);
  }
};

let animationInfo;
socket.on("animation-info", (info) => {
  animationInfo = info;
  console.log("the animation info:", animationInfo);
  loadImages(animationInfo);
  for (let i = 0; i <animationInfo.animations.length; i++){
    loadedImagesLimit +=animationInfo.animations[i].long;
    loadedImagesLimit += animationInfo.animations[i].short;
    console.log(loadedImagesLimit);
}
});

let imagesList = [];

const $canvas = document.getElementById("canvas");
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
const context = $canvas.getContext("2d");

const showImage = (img) => {
  context.drawImage(img, window.innerWidth, window.innerHeight, 0, 0);
  img.style.display = "block";
};

const hideImage = (img) => {
  img.style.display = "none";
};

const sourceStart = "./src/assets/pngseq/";
//Load png sequences
const loadImages = async (animationInfo) => {
  const animationList = animationInfo.animations;
  const screenName = animationInfo.name;
  for (let i = 0; i < animationList.length; i++) {
    const currentAnimationFolder = animationList[i];
    let imagesObject = {};
    imagesObject.name = currentAnimationFolder.name;
    imagesObject.long = [];
    imagesObject.short = [];
    // for (let j = 0;j<currentAnimationFolder.long;j++){
    //     let numberString = j.toString();
    //     const numberlength = numberString.length;
    //     let zeros = '';
    //     for (let k = 0;k<5-numberlength;k++){
    //         zeros += '0';
    //     }
    //     const image = await loadImage(
    //       `${sourceStart}${screenName}/animation-${i + 1}/long/animation-${i + 1}-long_${zeros}${numberString}.png`
    //     );
    //     imagesObject.long.push(image);
    //     console.log(imagesObject);
    // }
    loadTypedImages(
      imagesObject,
      "long",
      currentAnimationFolder.long,
      screenName,
      i
    );
    loadTypedImages(
      imagesObject,
      "short",
      currentAnimationFolder.short,
      screenName,
      i
    );
    imagesList.push(imagesObject);
    console.log(imagesList);
  }
};

// function preload() {
//   loadImages();
// }

// function draw() {
//     image(imagesList[0].long[0]);
// }

const loadTypedImages = async (
  object,
  name,
  length,
  screenName,
  screenIndex
) => {
  for (let j = 0; j < length; j++) {
    let numberString = j.toString();
    // console.log(numberString);
    const numberlength = numberString.length;
    let zeros = "";
    for (let k = 0; k < 5 - numberlength; k++) {
      zeros += "0";
    }
    const image = await loadImage(
      `${sourceStart}${screenName}/animation-${
        screenIndex + 1
      }/${name}/animation-${
        screenIndex + 1
      }-${name}_${zeros}${numberString}.png`,
      `animation-${screenIndex + 1}-${name}_${zeros}${numberString}`
    );
    console.log(image);
    // if (image.loaded) {
    //     console.log(image);
    //     console.log('image loaded');
    //     showImage(image);
    // }
    object[name].push(image);
    // console.log(object);
  }
};

const $images = document.getElementById("images");
//load an image
const loadImage = (src, id) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => {
      resolve(img);
      console.log("loaded ", img, typeof img);
      // showImage(img);
      $images.appendChild(img);
      totalLoadedImages++;
      if (totalLoadedImages===loadedImagesLimit){
        console.log("all images loaded");
      }
    };
    img.onerror = reject;
    img.src = src;
    img.id = id;
    img.style.display = "none";
  });
};

let imageIndex = 0;
let previousIndex = 0;
const $loading = document.getElementById('loading');
const loop = () => {
 if (totalLoadedImages===loadedImagesLimit){
    $loading.textContent = "done loading";
     if (imagesList.length > 0) {
       if (imagesList[0].long.length > 0) {
         console.log(imagesList[0].long.length);
         showImage(imagesList[0].long[imageIndex]);
         previousIndex = imageIndex - 1;
         if (previousIndex < 0) {
           previousIndex = imagesList[0].long.length - 1;
         }
         hideImage(imagesList[0].long[previousIndex]);

         console.log(imagesList[0].long[imageIndex], imageIndex);
       }
       imageIndex++;
       if (imageIndex >= imagesList[0].long.length - 1) {
         imageIndex = 0;
       }
     }
 }
 else {
    $loading.textContent = 'loading';
 }
  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);
// setInterval(loop, 1000);

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
      const disableScreen = document.querySelector(`.screen-choice-${screen}`);
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
