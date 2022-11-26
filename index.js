const express = require("express");
const http = require("http");
//make sure you keep this order
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { SerialPort } = require("serialport");
const serialPort = require("serialport").SerialPort;
const midi = require("midi");

//import { getRandomInt } from "./src/js/lib";

const animationList = [
  {
    startMessage: "1",
    longMessage: "a",
    endMessage: "b",
    counter: 0,
    timer: null,
    ended: false,
  },
  {
    startMessage: "2",
    longMessage: "c",
    endMessage: "d",
    counter: 0,
    timer: null,
    ended: false,
  },
  {
    startMessage: "3",
    longMessage: "e",
    endMessage: "f",
    counter: 0,
    timer: null,
    ended: false,
  },
];
const currentNotes = [];
//let animationIndex = 0;
const availableAnimationIndices = [];
for (i = 0; i < animationList.length; i++) {
  availableAnimationIndices.push(i);
}

let path = "";
let arduinoSerialPort = "";
// check at which port the arduino is selected, to set up our serial communication
serialPort.list().then((ports) => {
  let done = false;
  let count = 0;
  let allports = ports.length;
  console.log(allports);
  ports.forEach(function (port) {
    count = count + 1;
    pm = port.manufacturer;

    if (typeof pm !== "undefined") {
      if (pm.toLowerCase().includes("arduino")) path = port.path;
      console.log(typeof path, path);
      arduinoSerialPort = new SerialPort({ path, baudRate: 9600 });
      arduinoSerialPort.on("open", function () {
        console.log(`connected! arduino is now connected at port ${path}`);
      });
      //reading the signal from the arduino
      if (arduinoSerialPort) {
        arduinoSerialPort.on("data", (data) => {
          //decode the messages
          const line = data.toString("utf8");
          console.log("got word from arduino:", data.toString("utf8"));
          if (line === "animation-end") {
            io.emit("ended");
            //animationList[0].ended = true;
          }
          if (line === "animation2-end") {
            io.emit("ended2");
            //animationList[1].ended = true;
          }
          if (line === "animation3-end") {
            console.log("done");
            io.emit("ended3");
            //animationList[2].ended = true;
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


const input = new midi.Input();
const timeLimit = 500;

//only try to open midi port when there is at least one port available
if (input.getPortCount() > 0) {
  // Get the name of a specified input port.
  input.getPortName(0);
  input.on("message", (deltaTime, message) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(message);
    console.log(`m: ${message} d: ${deltaTime}`);
    if (message[2] != 0) {
      //if (currentNotes.length > animationIndex) {
        if(availableAnimationIndices.length>0){
      } else {
        currentNotes.push({ note: message[1], start: message[2] });
        console.log(currentNotes);

        //get random animation
        const animationIndex = availableAnimationIndices[getRandomInt(0, availableAnimationIndices.length - 1)];
        console.log(animationIndex);

        //remove the chosen animationIndex from the available indices
        availableAnimationIndices.splice(availableAnimationIndices.indexOf(animationIndex), 1);

        //check if cuurent animation index is already occupied
        // occupiedIndex = occupiedAnimationIndices.filter(item=>item.index === animationIndex);
        // if (occupiedIndex.length>0) {
        //   animationIndex++;
        // }

        //const chosenAnimation = animationList[animationIndex];
        const chosenAnimation = animationList[animationIndex];
        chosenAnimation.note = message[1];
        writeToArduino(chosenAnimation.startMessage);
        chosenAnimation.timer = setInterval(() => {
          chosenAnimation.counter++;
          if (chosenAnimation.counter === timeLimit) {
            writeToArduino(chosenAnimation.longMessage);
          }
          // if (chosenAnimation.ended===true) {
          //   writeToArduino(chosenAnimation.longMessage);
          //   chosenAnimation.false;
          // }
        }, 1);
        // animationIndex++;
        // if (animationIndex > animationList.length - 1) {
        //   animationIndex = 0;
        // }
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
        clearInterval(selectedAnimation.timer);
        //selectedAnimation.ended = false;
        selectedAnimation.counter = 0;
        selectedAnimation.note = null;

        //add animation index back to list of available animationIndices
        const index = animationList.indexOf(selectedAnimation);
        availableAnimationIndices.push(index);

        writeToArduino(selectedAnimation.endMessage);

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
    console.log("message written");
  });
};

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
  socket.on("start", () => {
    console.log("got message from screen");
    writeToArduino("1");
  });
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
      //let other clients know that a new screen choice was made and which screens ar currently already chosen and thus unavailable
      io.emit("screen chosen", chosenScreens);
      if (chosenScreens.length == 3) {
        startInstallation = true;
      }
    });
  }
});

//adding the port variable so that we run on 3000 locally and on heroku given $PORT online
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
