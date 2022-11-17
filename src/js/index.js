const express = require("express");
const http = require("http");
//make sure you keep this order
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const serialPort = require("serialport").SerialPort;

// set up arduino connection
const arduinoPort = "/dev/tty.usbmodem142201";

const arduinoSerialPort = new serialPort({ path: arduinoPort, baudRate: 9600 });

const midi = require("midi");
const input = new midi.Input();
// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
input.getPortName(0);
input.on("message", (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  console.log(`m: ${message} d: ${deltaTime}`);
  if (message[2]!=0){
    writeToArduino("1");
  }
  
});
// Open the first available input port.
input.openPort(0);


arduinoSerialPort.on("open", function () {
  console.log("Serial Port " + arduinoPort + " is opened.");
});

//function to write a message to arduino
const writeToArduino = (msg) => {
  arduinoSerialPort.write(msg, (err) => {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log("message written");
  });
};

writeToArduino("1");

//reading the signal from the arduino
arduinoSerialPort.on("data", (data) => {
  //decode the messages
  const line = data.toString("utf8");
  console.log("got word from arduino:", data.toString("utf8"));
});

app.use("/", express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {});

// //adding the port variable so that we run on 3000 locally and on heroku given $PORT online
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Our app is running on port ${PORT}`);
// });


