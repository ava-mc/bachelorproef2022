//get random integer (min and max included)
export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//function to find the key of a certain value of an object
export const getObjKey = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

export const amountOfScreens = 3;
export const amountOfVersions = 2;