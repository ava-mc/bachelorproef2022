import fs from "fs";

//function that adds the file amount for each animation folder
export const addFileAmount = async (dir, list, name, index) => {
  let object = {};
  object.name = `${name}-${index}`;
  const longDir = `${dir}/long`;
  const shortDir = `${dir}/short`;
  fs.readdir(longDir, (err, files) => {
    // if (!files) return;
    const newFiles = files.filter((item) => item.includes('animation'));
    let amount = newFiles.length;
    object.long = amount;
    console.log(list);
  });
  fs.readdir(shortDir, (err, files) => {
    // if (!files) return;
    const newFiles = files.filter((item) => item.includes("animation"));
    let amount = newFiles.length;
        object.short = amount;
        console.log(list);
  });
  list.push(object);
};

//function that gets amount of animation folders per screen
export const getAmountOfAnimations = async (dir, list, name, index) => {
  fs.readdir(dir, (err, files) => {
    console.log(files);
    const newFiles = files.filter(item => item!= '.DS_Store');
    console.log(files, newFiles);
    let amount = newFiles.length;
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
