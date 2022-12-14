export const animationList = [
  {
    startMessage: "0",
    longMessage: "a",
    endMessage: "b",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation0-end",
    animationInfo: {
      screen: 3,
      animation: 1,
    },
  },
  {
    startMessage: "1",
    longMessage: "c",
    endMessage: "d",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation1-end",
    animationInfo: {
      screen: 1,
      animation: 1,
    },
  },
  {
    startMessage: "2",
    longMessage: "e",
    endMessage: "f",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation2-end",
    animationInfo: {
      screen: 1,
      animation: 2,
    },
  },
  {
    startMessage: "3",
    longMessage: "g",
    endMessage: "h",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation3-end",
    animationInfo: {
      screen: 1,
      animation: 3,
    },
  },
  {
    startMessage: "4",
    longMessage: "i",
    endMessage: "j",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation4-end",
    animationInfo: {
      screen: 2,
      animation: 3,
    },
  },
  {
    startMessage: "5",
    longMessage: "k",
    endMessage: "l",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation5-end",
    animationInfo: {
      screen: 1,
      animation: 4,
    },
  },
  {
    startMessage: "6",
    longMessage: "m",
    endMessage: "n",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation6-end",
    animationInfo: {
      screen: 3,
      animation: 3,
    },
  },
  {
    startMessage: "7",
    longMessage: "o",
    endMessage: "p",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation7-end",
    animationInfo: {
      screen: 3,
      animation: 2,
    },
  },
  {
    startMessage: "8",
    longMessage: "q",
    endMessage: "r",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation8-end",
    animationInfo: {
      screen: 2,
      animation: 1,
    },
  },
  {
    startMessage: "9",
    longMessage: "s",
    endMessage: "t",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation9-end",
    animationInfo: {
      screen: 2,
      animation: 2,
    },
  },
];

export const availableAnimationIndices = [];
for (let i = 0; i < animationList.length; i++) {
  availableAnimationIndices.push(i);
}

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
