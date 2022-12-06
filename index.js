import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";
export const io = new Server(server);
import serialport from "serialport";
const serialPort = serialport.SerialPort;

import * as filepath from "path";
import { fileURLToPath } from "url";

import midi from "midi";
import { getRandomInt } from "./src/js/lib.js";

import fs from 'fs';


const amountOfScreens = 3;
//function that adds the file amount for each animation folder
const addFileAmount = async (dir, list, name, index) => {
  let object = {};
  object.name = `${name}-${index}`;
  const longDir = `${dir}/long`;
  const shortDir = `${dir}/short`;
  fs.readdir(longDir, (err, files) => {
    let amount = files.length;
    object.long = amount;
    console.log(list);
    console.log('full', screenSequences);
  });
  fs.readdir(shortDir, (err, files) => {
    let amount = files.length;
    object.short = amount;
    console.log(list);
    console.log("full", screenSequences);
  });
  list.push(object);
};

//function that gets amount of animation folders per screen
const getAmountOfAnimations = async (dir, list, name, index) => {
  fs.readdir(dir, (err, files) => {
    let amount = files.length;
    let object = {};
    object.name = `${name}-${index}`;
    object.animations = [];
    if (amount>0) {
      for (let i=1;i<=amount;i++) {
        addFileAmount(`${dir}/animation-${i}`, object.animations, 'animation', i);
      }
    }
    list.push(object);
  });
};

//count the amount of png sequences and number of pngs per sequence for each screen
const screenSequences = [];
const getSequences = async () => {
  for (let i = 1; i <= amountOfScreens; i++) {
    const folder = `src/assets/pngseq/screen-${i}/`;
    getAmountOfAnimations(folder, screenSequences, 'screen', i);
  }
}

getSequences();



const animationList = [
  {
    startMessage: "1",
    longMessage: "a",
    endMessage: "b",
    counter: 0,
    timer: null,
    ended: false,
    arduinoEnd: "animation-end",
    animationInfo: {
      screen: 1,
      animation: 1,
      long: false,
      short: false,
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
      screen: 1,
      animation: 2,
      long: false,
      short: false,
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
      screen: 2,
      animation: 1,
      long: false,
      short: false,
    },
  },
];
const currentNotes = [];
const availableAnimationIndices = [];
for (let i = 0; i < animationList.length; i++) {
  console.log(i);
  availableAnimationIndices.push(i);
  console.log(availableAnimationIndices);
}



//Big keyboard at home
// const midiType = [144];
// const endSignal = 0;
//Small keyboard
const midiType = [128, 144];
const endSignal = 127;

const endSignalType = midiType[0];

let playScreenSaver = true;
let screenSaverTimer;
let screenSaverCounter = 0;
const screenSaverMaxWait = 10;
// const screenSaverMaxWait = 2;

const showScreenSaver = () => {
  writeToArduino("s");
};

const startScreensaverTimer = () => {
  //to be safe, we stop the timer before we start it, so only 1 timer can run at the same time.
  stopScreenSaverTimer();

  playScreenSaver = true;

  screenSaverTimer = setInterval(()=>{
    screenSaverCounter++;
    console.log(screenSaverCounter);
    if (screenSaverCounter>screenSaverMaxWait) {
      //let arduino know to start screensaver effect
      if (playScreenSaver) {
        console.log('start screensaver');
        showScreenSaver();
        playScreenSaver = false;
      }

    }
  }, 1000)
}

const stopScreenSaverTimer = () => {
  console.log('stop screensaver');
  //let arduino now to stop
  writeToArduino('t');

  //stop timer
  clearInterval(screenSaverTimer);

  //reset timer
  screenSaverCounter = 0;
  playScreenSaver = false;

}

let path = "";
let arduinoSerialPort = "";
// check at which port the arduino is selected, to set up our serial communication
serialPort.list().then((ports) => {
  let done = false;
  let count = 0;
  let allports = ports.length;
  let pm;
  ports.forEach(function (port) {
    count = count + 1;
    pm = port.manufacturer;
    console.log(pm);

    if (typeof pm !== "undefined") {
      if (pm.toLowerCase().includes("arduino")) path = port.path;
      arduinoSerialPort = new serialport.SerialPort({ path, baudRate: 9600 });
      arduinoSerialPort.on("open", function () {
        console.log(`connected! arduino is now connected at port ${path}`);

        //start the screensaver timer for the first time
        startScreensaverTimer();
      });
      //reading the signal from the arduino
      if (arduinoSerialPort) {
        arduinoSerialPort.on("data", (data) => {
          //decode the messages
          const line = data.toString("utf8");
          console.log("got word from arduino:", data.toString("utf8"));
          // if (line === "animation-end") {
          //   io.emit("ended");
          //   if (animationList[0].counter > 0) {
          //     animationList[0].ended = true;
          //   }
          // }
          // if (line === "animation2-end") {
          //   io.emit("ended2");
          //   if (animationList[1].counter > 0) {
          //     animationList[1].ended = true;
          //   }
          // }
          // if (line === "animation3-end") {
          //   console.log("done");
          //   io.emit("ended3");
          //   if (animationList[2].counter > 0) {
          //     animationList[2].ended = true;
          //   }
          // }

          animationList.forEach((item, index) => {
            if (line === item.arduinoEnd) {
              // io.emit("ended");
              //reset animationInfo
              item.animationInfo.short = false;
              item.animationInfo.long = false;

              if (animationList[index].counter > 0) {
                animationList[index].ended = true;
                item.animationInfo.long = true;

              }
              else {
                item.animationInfo.short = true;
              }
              io.emit('pngs', item.animationInfo);
            }
          })

          if (line === "button") {
            changeOutput();
          }
        });
      }
      done = true;
    }

    if (count === allports && done === false) {
      console.log(`can't find any arduino`);
    }
  });
});


// Set up a new output.
const output = new midi.Output();
const outputOptions = [];
let selectedOutput = 0;
output.openPort(1);

const changeOutput = () => {
  //make sure output message is stopped with current output channel
  currentNotes.forEach(note=> {
    // output.sendMessage([end, note.note, endSignal]);
    output.sendMessage([endSignalType, note.note, endSignal]);
  })

  output.closePort(outputOptions[selectedOutput]);

  selectedOutput++;
  if (selectedOutput === outputOptions.length) {
    selectedOutput = 0;
  }
  output.openPort(outputOptions[selectedOutput]);

  //resend signal when new output port is opened
  currentNotes.forEach((note) => {
    output.sendMessage([note.type, note.note, note.start]);
  });
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

const getBrightnessCode = (number) => {
  const index = Math.floor(number / 4);
  console.log(index);
  if (index>=brightnessList.length) {
    return brightnessList[brightnessList.length-1];
  }
  else {
    return brightnessList[Math.floor(number / 4)];
  }
}


const input = new midi.Input();
const timeLimit = 500;

//only try to open midi port when there is at least one port available
if (input.getPortCount() > 0) {
  console.log(input.getPortCount());
  console.log(output.getPortCount());
  // Get the name of a specified input port.
  // input.getPortName(0);
  for (let i=0;i<input.getPortCount();i++){
    console.log(input.getPortName(i));
  }
  for (let i = 0; i < output.getPortCount(); i++) {
    console.log('output', output.getPortName(i));
    if (output.getPortName(i).includes('Test')) {
      console.log('this works', output.getPortName(i));
      outputOptions.push(i);
    }
  }
  // output.openPort(1);
  input.on("message", (deltaTime, message) => {
    console.log(output)
    output.sendMessage(message);
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(message);
    console.log(`m: ${message} d: ${deltaTime}`);
    //check the type of midi input, we only read note values
    if (midiType.includes(message[0])) {
      //check that the note is started
      if (message[2] != endSignal) {
          //send velocity to the arduino to adjust brightness
          writeToArduino(getBrightnessCode(message[2]));

        // stop screensaver timer
        stopScreenSaverTimer();

        //add the notes to the list of current notes
        currentNotes.push({
          type: message[0],
          note: message[1],
          start: message[2],
        });

        // check if there are still animations available to link to the new note
        if (availableAnimationIndices.length === 0) {
        } else {
          //get random animation
          const animationIndex =
            availableAnimationIndices[
              getRandomInt(0, availableAnimationIndices.length - 1)
            ];

          //remove the chosen animationIndex from the available indices
          availableAnimationIndices.splice(
            availableAnimationIndices.indexOf(animationIndex),
            1
          );

          const chosenAnimation = animationList[animationIndex];
          chosenAnimation.note = message[1];
          writeToArduino(chosenAnimation.startMessage);
          chosenAnimation.timer = setInterval(() => {
            chosenAnimation.counter++;
            if (chosenAnimation.ended === true) {
              writeToArduino(chosenAnimation.longMessage);
              chosenAnimation.ended = false;
            }
          }, 100);
        }
      } else {
        //check if note was in the list
        console.log(currentNotes);
        const selectedNote = currentNotes.find(
          (item) => item.note === message[1]
        );
        console.log(selectedNote);
        if (selectedNote) {
          currentNotes.splice(currentNotes.indexOf(selectedNote), 1);
          console.log(currentNotes);
          const selectedAnimation = animationList.find(
            (item) => item.note === selectedNote.note
          );
          if (selectedAnimation) {
            selectedAnimation.ended = false;
            selectedAnimation.counter = 0;
            clearInterval(selectedAnimation.timer);
            selectedAnimation.counter = 0;
            selectedAnimation.note = null;
            //add animation index back to list of available animationIndices
            const index = animationList.indexOf(selectedAnimation);
            availableAnimationIndices.push(index);
            writeToArduino(selectedAnimation.endMessage);

            //let screen know that long animation should stop
            if (selectedAnimation.animationInfo.long) {
              selectedAnimation.animationInfo.long = false;
              io.emit("pngs", selectedAnimation.animationInfo);
            }

          }
        }

        //start screensaver timer if no notes are currently being played anymore
        if (currentNotes.length === 0) {
          startScreensaverTimer();
        }
      }
    }
  });
  // Open the first available input port.
  input.openPort(0);
}

//function to write a message to arduino
const writeToArduino = (msg) => {
  arduinoSerialPort.write(msg, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log("message written ", msg);
  });
};

const __filename = fileURLToPath(import.meta.url);

const __dirname = filepath.dirname(__filename);

app.use("/", express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//keep track of which screens are chosen
let chosenScreens = [];
const screens = { 1: null, 2: null, 3: null };

//function to find the correct screen by its key
const getObjKey = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

io.on("connection", (socket) => {
  // io.emit('animation-info',screenSequences);

  socket.on("start", () => {
    console.log("got message from screen");
    writeToArduino("1");
  });

  socket.on('short-ended', info => {
    console.log(info);
    const animation = animationList.find(item => item.animationInfo.screen === info.screen && item.animationInfo.animation === info.animation);
    console.log(animation);
    //reset the info
    animation.animationInfo.short = false;
  })
  // socket.on("start2", () => {
  //   console.log("got message from screen");
  //   writeToArduino("2");
  // });

  // socket.on("start3", () => {
  //   console.log("got message from screen");
  //   writeToArduino("3");
  // });

  //automatically disconnect if there are officially 3 screens selected, and new screen tries to connect
  if (chosenScreens.length == 3) {
    socket.emit("full");
    socket.disconnect();
  }
  //if there are not yet 3 screens selected
  else {
    //if a screen disconnects
    socket.on("disconnect", () => {
      //check if this screen was selected
      const disconnectedScreen = getObjKey(screens, socket.id);
      if (disconnectedScreen) {
        //remove the disconnected socket from the screens object
        screens[disconnectedScreen] = null;
      }
      //remove the disconnected screen from the chosen screens array
      chosenScreens = chosenScreens.filter(
        (screen) => screen !== parseInt(disconnectedScreen)
      );
      //pass all screens to the client, so that we can open up that choice again for selecting screens on the disconnected screen
      io.emit("screen disconnected", chosenScreens);
    });

    //when a screen wants to connect
    socket.on("screen choice", (chosenScreen) => {
      chosenScreens.push(chosenScreen);

      //check if the socket that sends the screen choice has already chosen another screen
      const previousScreen = getObjKey(screens, socket.id);
      if (previousScreen) {
        screens[chosenScreen] = socket.id;
        screens[previousScreen] = null;
        chosenScreens = chosenScreens.filter(
          (screen) => screen !== parseInt(previousScreen)
        );
      } else {
        screens[chosenScreen] = socket.id;
      }

      //emit their chosen screen to the sender
      socket.emit("screen choice", chosenScreen);

      //send the right animation info based on the screen choice
      socket.emit(
        "animation-info",
        screenSequences.find(
          (item) => item.name.charAt(item.name.length - 1) == chosenScreen
        )
      );

      //let other clients know that a new screen choice was made and which screens ar currently already chosen and thus unavailable
      io.emit("screen chosen", chosenScreens);
      if (chosenScreens.length == 3) {
        // startInstallation = true;
      }
    });
  }
});

//adding the port variable so that we run on 3000 locally and on heroku given $PORT online
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
