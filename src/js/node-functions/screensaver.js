import { writeToArduino, io, killAllNotes, clearNotes } from "../../../index.js";

let playScreenSaver = true;
let screenSaverTimer;
let screenSaverCounter = 0;
const screenSaverMaxWait = 10;

const showScreenSaver = () => {
  writeToArduino("x");
};

export const startScreensaverTimer = () => {
  //to be safe, we stop the timer before we start it, so only 1 timer can run at the same time.
  stopScreenSaverTimer();

  playScreenSaver = true;

  screenSaverTimer = setInterval(() => {
    screenSaverCounter++;
    console.log(screenSaverCounter);
    if (screenSaverCounter > screenSaverMaxWait) {
      //let arduino know to start screensaver effect
      if (playScreenSaver) {
        console.log("start screensaver");
        showScreenSaver();
        playScreenSaver = false;

        //to be sure, we clear all notes
        killAllNotes();
        clearNotes();
      }
    }
  }, 1000);
};

export const stopScreenSaverTimer = () => {
  console.log("stop screensaver");
  //let arduino now to stop
  writeToArduino("y");

  //stop timer
  clearInterval(screenSaverTimer);

  //reset timer
  screenSaverCounter = 0;
  playScreenSaver = false;

  //let browser know it has stopped
  io.emit("screensaverStop");
};
