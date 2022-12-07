export const animationList = [
  {
    startMessage: "1",
    longMessage: "a",
    endMessage: "b",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation-end",
    animationInfo: {
      screen: 2,
      animation: 2,
    },
  },
  {
    startMessage: "2",
    longMessage: "c",
    endMessage: "d",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation2-end",
    animationInfo: {
      screen: 3,
      animation: 4,
    },
  },
  {
    startMessage: "3",
    longMessage: "e",
    endMessage: "f",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation3-end",
    animationInfo: {
      screen: 3,
      animation: 3,
    },
  },
];


const brightnessList = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];


export const getBrightnessCode = (number) => {
  const index = Math.floor(number / 4);
  console.log(index);
  if (index >= brightnessList.length) {
    return brightnessList[brightnessList.length - 1];
  } else {
    return brightnessList[Math.floor(number / 4)];
  }
};