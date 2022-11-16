const express = require("express");
const http = require("http");
//make sure you keep this order
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
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
};

writeToArduino("anim1");
writeToArduino("");

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
