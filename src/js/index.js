const express = require("express");
const http = require("http");
//make sure you keep this order
const app = express();
const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);
const serialPort = require("serialport").SerialPort;

// set up arduino connection
const arduinoPort = "/dev/tty.usbmodem141201";

const arduinoSerialPort = new serialPort({ path: arduinoPort, baudRate: 9600 });

arduinoSerialPort.on("open", function () {
  console.log("Serial Port " + arduinoPort + " is opened.");
});


//function to write a message to arduino
const writeToArduino = (msg) => {
    arduinoSerialPort.write(`${msg}\n`, (err) => {
      if (err) {
        return console.log("Error on write: ", err.message);
      }
      console.log("message written");
    });
}

writeToArduino("animation1");