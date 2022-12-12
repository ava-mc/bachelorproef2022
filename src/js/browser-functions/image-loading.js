
//load a single image
export const loadImage = (src, loaded) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => {
      console.log("loaded ", img, typeof img);
      loaded();
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
};

//load all images of a specific animation for a certain duration type (long or short)
const sourceStart = "./src/assets/pngseq";
export const loadTypedImages = async (
  object,
  name,
  length,
  screenName,
  screenIndex,
  version, 
  loadedFunction
) => {
  for (let j = 0; j < length; j++) {
    let numberString = j.toString();
    const numberlength = numberString.length;
    let zeros = "";
    for (let k = 0; k < 5 - numberlength; k++) {
      zeros += "0";
    }
    const image = await loadImage(
      `${sourceStart}/${version}/${screenName}/animation-${
        screenIndex + 1
      }/${name}/animation-${
        screenIndex + 1
      }-${name}_${zeros}${numberString}.png`,
      loadedFunction
    );
    console.log(image);
    object[name].push(image);
  }
};

//Load png sequences in a structured way
export const loadImages = async (animationInfo, version, loadedFunction) => {
  const imagesList = [];
  const animationList = animationInfo.animations;
  const screenName = animationInfo.name;
  for (let i = 0; i < animationList.length; i++) {
    const currentAnimationFolder = animationList[i];
    let imagesObject = {};
    imagesObject.name = currentAnimationFolder.name;
    imagesObject.long = [];
    imagesObject.short = [];
    loadTypedImages(
      imagesObject,
      "long",
      currentAnimationFolder.long,
      screenName,
      i,
      version, 
      loadedFunction
    );
    loadTypedImages(
      imagesObject,
      "short",
      currentAnimationFolder.short,
      screenName,
      i,
      version, loadedFunction
    );
    imagesList.push(imagesObject);
    console.log(imagesList);
  }
  return imagesList;
};
