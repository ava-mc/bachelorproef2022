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
import { getRandomInt, getObjKey } from "./src/js/lib.js";
import { getAmountOfAnimations } from "./src/js/node-functions/file-counting.js";
import {startScreensaverTimer, stopScreenSaverTimer} from './src/js/node-functions/screensaver.js';
import {endSignal, endSignalType, midiType} from './src/js/node-functions/midi-info.js';
import {animationList, getBrightnessCode} from './src/js/node-functions/animation-info.js';

let screensaverTime;

//count the amount of png sequences and number of pngs per sequence for each screen
const amountOfScreens = 3;
const screenSequences = [];
const initPngSequences = async () => {
  for (let i = 1; i <= amountOfScreens; i++) {
    const folder = `src/assets/pngseq/screen-${i}/`;
    getAmountOfAnimations(folder, screenSequences, 'screen', i);
  }
}
initPngSequences();


const currentNotes = [];
const availableAnimationIndices = [];
for (let i = 0; i < animationList.length; i++) {
  availableAnimationIndices.push(i);
}

// let path = "";
// let arduinoSerialPort = "";
// // check at which port the arduino is selected, to set up our serial communication
// serialPort.list().then((ports) => {
//   let done = false;
//   let count = 0;
//   let allports = ports.length;
//   let pm;
//   ports.forEach(function (port) {
//     count = count + 1;
//     pm = port.manufacturer;
//     console.log(pm);

//     if (typeof pm !== "undefined") {
//       if (pm.toLowerCase().includes("arduino")) path = port.path;
//       arduinoSerialPort = new serialport.SerialPort({ path, baudRate: 9600 });
//       arduinoSerialPort.on("open", function () {
//         console.log(`connected! arduino is now connected at port ${path}`);

//         //let arduino know, we can receive messages now
//         writeToArduino('z');
//       });
//       //reading the signal from the arduino
//       if (arduinoSerialPort) {
//         arduinoSerialPort.on("data", (data) => {
//           //decode the messages
//           const line = data.toString("utf8");
//           console.log("got word from arduino:", data.toString("utf8"));

//           const messageString = "screensavertime";
//           if (line.includes(messageString)) {
//             console.log('timer', line, line.substring(messageString.length) );
//             screensaverTime = parseInt(
//               line.substring(messageString.length)
//             )/1000;
//           }

//           if (line == 'opacity-up') {
//             io.emit('opacity-change', 'up');
//           }
//           if (line == "opacity-down") {
//             io.emit("opacity-change", "down");
//           }

//           animationList.forEach((item, index) => {
//             if (line === item.arduinoEnd) {
//               if (animationList[index].counter > 0) {
//                 animationList[index].ended = true;
//                 io.emit("pngs", {...item.animationInfo, long:true});

//               }
//               else {
//                 io.emit("pngs", {
//                   ...item.animationInfo,
//                   short: true,
//                 });
//               }
//             }
//           })

//           if (line === "button") {
//             changeOutput();
//           }
//         });
//       }
//       done = true;
//     }

//     if (count === allports && done === false) {
//       console.log(`can't find any arduino`);
//     }
//   });
// });


// Set up a new output.
const output = new midi.Output();
const outputOptions = [];
let selectedOutput = 0;
// output.openPort(0);

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

const input = new midi.Input();
let inputPort = 0;

//only try to open midi port when there is at least one port available
if (input.getPortCount() > 0) {
  // Get the name of a specified input port.
  for (let i=0;i<input.getPortCount();i++){
    if (!input.getPortName(i).includes('Test')) {
      inputPort = i;
    }
  }
  for (let i = 0; i < output.getPortCount(); i++) {
    if (output.getPortName(i).includes('Test')) {
      outputOptions.push(i);
    }
  }
  if (outputOptions.length>0){
    console.log('output opened', output.getPortName(outputOptions[selectedOutput]));
    output.openPort(outputOptions[selectedOutput]);
  }
  input.on("message", (deltaTime, message) => {
    console.log(output);
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
            // if (selectedAnimation.animationInfo.long) {
              // selectedAnimation.animationInfo.long = false;
              console.log(selectedAnimation);
              console.log('stop long animation', selectedAnimation.animationInfo);
              // io.emit("pngs", selectedAnimation.animationInfo);
              io.emit('pngs', {...selectedAnimation.animationInfo, long:false});
            // }

          }
        }

        //start screensaver timer if no notes are currently being played anymore
        if (currentNotes.length === 0) {
          startScreensaverTimer();
        }
      }
    }
  });
  // Open the input port of the piano
  input.openPort(inputPort);
}

//function to write a message to arduino
export const writeToArduino = (msg) => {
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

io.on("connection", (socket) => {

  socket.on("start", () => {
    console.log("got message from screen");
    writeToArduino("1");
  });

  socket.on('short-ended', info => {
    console.log(info);
    const animation = animationList.find(item => item.animationInfo.screen === info.screen && item.animationInfo.animation === info.animation);
    console.log(animation);
  })

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

        //let browser know about the screensaverTime once all screens are selected
        io.emit("screensaverTime", screensaverTime);

        //start the screensaver timer for the first time
        startScreensaverTimer();
      }
    });
  }
});

//adding the port variable so that we run on 3000 locally and on heroku given $PORT online
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});


//ARDUINO LOGIC
let arduinoSerialPort = "";
const setUpArduino = () => {
  let path = "";
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
        arduinoSerialPort.on("open", () => {
          console.log(`connected! arduino is now connected at port ${path}`);
          //let arduino know, we can receive messages now
          writeToArduino("z");
          arduinoReadingInit();
        });
        done = true;
      }

      if (count === allports && done === false) {
        console.log(`can't find any arduino`);
      }
    });
  });
}

const arduinoReadingInit = () => {
  //reading the signal from the arduino
  if (arduinoSerialPort) {
    arduinoSerialPort.on("data", (data) => {
      //decode the messages
      const line = data.toString("utf8");
      console.log("got word from arduino:", data.toString("utf8"));

      //Get info from Arduino about the timing of the screensaver animation
      const messageString = "screensavertime";
      if (line.includes(messageString)) {
        console.log("timer", line, line.substring(messageString.length));
        screensaverTime = parseInt(line.substring(messageString.length)) / 1000;
      }

      //let browser know about opacity animation for screensaver
      if (line == "opacity-up") {
        io.emit("opacity-change", "up");
      }
      if (line == "opacity-down") {
        io.emit("opacity-change", "down");
      }

      //Which animations should be started on the screen
      animationList.forEach((item, index) => {
        if (line === item.arduinoEnd) {
          if (animationList[index].counter > 0) {
            animationList[index].ended = true;
            io.emit("pngs", { ...item.animationInfo, long: true });
          } else {
            io.emit("pngs", {
              ...item.animationInfo,
              short: true,
            });
          }
        }
      });

      //change the ouput sound on button press
      if (line === "button") {
        changeOutput();
      }
    });
  }
}

const init = () => {
  setUpArduino();
};

init();