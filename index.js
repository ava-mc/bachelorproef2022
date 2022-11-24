const express = require("express");
const http = require("http");
//make sure you keep this order
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const serialPort = require("serialport").SerialPort;

let path = "";
let arduinoSerialPort = "";
// check at which port the arduino is selected, to set up our serial communication
serialPort.list().then(ports => {
  let done = false
  let count = 0
  let allports = ports.length;
  console.log(allports);
  ports.forEach(function(port) {
    count = count+1;
    pm  = port.manufacturer;


    if (typeof pm !== 'undefined') {
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
          }
        });
      }
      done = true;
    }

    if(count === allports && done === false){
      console.log(`can't find any arduino`)
    }
  })
})


const midi = require("midi");
const { SerialPort } = require("serialport");
const input = new midi.Input();
// Count the available input ports.
//input.getPortCount();
//console.log(input.getPortCount());

//only try to open midi port when there is at least one port available
if (input.getPortCount()>0) {
  // Get the name of a specified input port.
  input.getPortName(0);
  input.on("message", (deltaTime, message) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(`m: ${message} d: ${deltaTime}`);
    if (message[2] != 0) {
      writeToArduino("1");
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

io.on("connection", (socket) => {
  socket.on('start', () => {
    console.log('got message from screen');
    writeToArduino('1');
  })
});

//adding the port variable so that we run on 3000 locally and on heroku given $PORT online
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});


