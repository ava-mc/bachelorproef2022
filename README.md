# Bachelor project: The Light Piano

## A quick overview
This project provides the technical functionality of a 'Light Piano' interactive installation. We use a MIDI piano keyboard as input to create animations with LED light strips and show animations on 3 external screens. There is also a button that changes the sound by changing between different MIDI output ports The set-up looks something like this:

<img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207347048-04a713d9-364e-4b02-8e0a-492c1e7b5aa7.png">
It is a construction that consists of LED strips placed between 3 external monitors. This is all connected to a laptop that communicates with an Arduino, connected to the button and the LED strips, and with a MIDI piano keyboard.

## SETUP GUIDE
### Necessities
- Arduino
- Button
- MIDI piano keyboard with serial connection
- node js
- 3 external screens to connect via HDMI
- Individually addressable LED strips (WS2812B neopixels)
- External adaptor to power the LED strips.
- Ableton software

### Prelimenary setup
These steps are meant to be done once to provide all the components needed for the installation

#### STEP 1: Set up your Arduino
First of all, make sure your Arduino is set up with the right code. The current file can be found in the folder 'arduino/multitasking', with the name 'multitasking.ino'. Make sure to upload this code to your Arduino. Make sure to build the right circuit for your Arduino according to our circuit schematic. 
![arduino-circuit-LED-strip-with-button-01](https://user-images.githubusercontent.com/91590248/207330567-e441b594-3c2d-406e-b266-aac4bd991075.png)

#### STEP 2: Connect the devices
- Connect the MIDI piano device and the Arduino to your laptop via USB. 
- Connect your LED strips to your Arduino according to the previous schematic. And also connect the external power adaptor to your LED strips.

#### STEP 3: Set up Ableton
We use 3 virtual output ports on our Mac device to connect to different sounds in Ableton.

1. Create virtual output ports with the right name
   - Go to the 'Audio MIDI Setup' app on your computer
   - Go to Window > Show MIDI Studio
   - You should see the following screen:
   <img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207342836-ccf61c2c-0629-4895-83be-7c4ee230c435.png">
   - Create 3 virtual MIDI ports by pressing the plus button. Give them the names 'Test 1', 'Test 2' and 'Test 3'. And press apply.
   <img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207344305-d404336c-353d-4751-9d9f-bd31c3f9629a.png">

    
2. Connect the virtual output ports to sounds in Ableton
   - In the MIDI input option, you should be able to choose from the virtual MIDI ports we just created.
<img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207344785-0f14478c-d633-43ca-9e46-7a9462b49c9b.png">

### Starting the installation itself
Once all the preliminary steps are handled, we can start and stop the installation functionality.

#### STEP 4: Start the node server
We made sure that our installation is controlled via a node server that serves as a central control point. The node server handles the MIDI input, controlls the right output port for the MIDI signals to produce sounds. It communicates to the Arduino via serial communication to execute the right commands. And it provides a webSocket connection to 3 browsers that are used to show additional animations on the screen. It takes care of all the timing of the installation, the communication between all the parts. It also handles the screensaver functionality

There are 2 options to start the node server:
1. Via the terminal:
      - Make sure to go to the directory where the index.js file of the node server is located
      - Execute the command 'node index.js'
2. Via the provided shell script
      - To make the starting up process easier for our client, we added a shell script that starts the node server file at the right location.
      

#### STEP 5: Setting up the 3 screens with socket connection
If all goes well, the node server should have opened 3 browser screens at 'localhost:3000', where our client side logic is hosted. At this point, you should see a selection option to choose which screen should be chosen for which browser. 
To have the right set up, we provided a visual cue to see where each screen should go. So, drag your browser screens to the right external monitor screen and pick the corresponding option.

If you made a mistake, you can either select a different screen that is still available, or you can press the reset button to reset the currently connected websockets.

<img width="876" alt="image" src="https://user-images.githubusercontent.com/91590248/207339353-514bc385-6cbe-42b8-b14e-372233db4382.png">


#### STEP 6: Loading the installation
Once the 3 screens have been chosen, the browsers will start loading in the right assets for the png sequences to show. Once all browsers are done loading, the installation is ready to be used.

#### STEP 7: Stopping the installation
Again there are 2 options:
- Close all browser windows and press ctrl + C in the terminal to stop your node server
- Use the 'stop' shell script to stop the node server.
