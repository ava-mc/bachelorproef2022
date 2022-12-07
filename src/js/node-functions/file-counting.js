import fs from "fs";

//function that adds the file amount for each animation folder
export const addFileAmount = async (dir, list, name, index) => {
  let object = {};
  object.name = `${name}-${index}`;
  const longDir = `${dir}/long`;
  const shortDir = `${dir}/short`;
  fs.readdir(longDir, (err, files) => {
    let amount = files.length;
    object.long = amount;
    console.log(list);
    // console.log("full", screenSequences);
  });
  fs.readdir(shortDir, (err, files) => {
    let amount = files.length;
    object.short = amount;
    console.log(list);
    // console.log("full", screenSequences);
  });
  list.push(object);
};

//function that gets amount of animation folders per screen
export const getAmountOfAnimations = async (dir, list, name, index) => {
  fs.readdir(dir, (err, files) => {
    let amount = files.length;
    let object = {};
    object.name = `${name}-${index}`;
    object.animations = [];
    if (amount > 0) {
      for (let i = 1; i <= amount; i++) {
        addFileAmount(
          `${dir}/animation-${i}`,
          object.animations,
          "animation",
          i
        );
      }
    }
    list.push(object);
  });
};
