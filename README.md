# Bachelor project: The Light Piano

## A quick overview
This project provides the technical functionality of a 'Light Piano' interactive installation. We use a MIDI piano keyboard as input to create animations with LED light strips and show animations on 3 external screens. There is also a button that changes the sound, by changing between different MIDI output ports, and changes the corresponsing visual style on the screens. The set-up looks something like this:

<img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207347048-04a713d9-364e-4b02-8e0a-492c1e7b5aa7.png">
It is a construction that consists of LED strips placed between 3 external monitors. This is all connected to a laptop, runnning a node js server, that has serial communication with a MIDI piano keyboard and with an Arduino, which is connected to the button and the LED strips.

## SETUP GUIDE
### Necessities
- Arduino Micro
- Button
- MIDI piano keyboard with serial connection
- node js
- 3 external screens to connect via HDMI
- Individually addressable LED strips (WS2812B neopixels) (5V)
- External adaptor to power the LED strips. (we use model JYH05010000B, Input: 100-240V ~ 50/60Hz 2.0A, output 5V - 10A).
- Capacitor (1000μF - 25V)
- Ableton software (free trial is enough)
- Apple laptop

### Prelimenary setup
These first 4 steps are meant to be done once to provide all the components needed for the installation.

#### STEP 1: Set up your Arduino
First of all, make sure your Arduino is set up with the right code. The current file can be found in the folder 'arduino/multitasking', with the name 'multitasking.ino'. Make sure to upload this code to your Arduino. Make sure to build the right circuit for your Arduino according to our circuit schematic. 
![arduino-circuit-LED-strip-with-button-01](https://user-images.githubusercontent.com/91590248/207330567-e441b594-3c2d-406e-b266-aac4bd991075.png)

NOTE: It is important to look at the polarity or your power adaptor, to know how you should connect the pins inside your female adaptor plug. This can differ from adaptor to adaptor, so check the backside of your adaptor for a figure that looks something like this:

<img width="209" alt="image" src="https://user-images.githubusercontent.com/91590248/208898702-a76ab780-bc89-40c8-a2a4-031ea3a8e6a3.png">

#### STEP 2: Connect the devices
- Connect the MIDI piano device and the Arduino to your laptop via USB. 
   - If you are using a different MIDI piano device than us, note the following: a MIDI signal is of the following form [a,b,c]. 'a' is your starting signal, that denotes the type of MIDI signal, 'b' is the number that denotes which specific note is handled, and 'c' denotes your velocity, this is a number that denotes how hard you hit the piano key. This message 'formula' differs a bit from piano device to device. For example, we worked with 2 different keyboards, a big one and a small one. For the big one, there was only one option for 'a', namely 144. This denoted that it was a simple piano key signal. The velocity ranged from 0 to 127, where 0 signals a 'note-end' event, which is fired when someone releases a piano key. For the small keyboard this was a bit different. Namely, the 'a' signal could either be 144 of 127 (depending on whether the key was released or not), and the veolcity of a released note was 127 instead of 0. 
   
   I took these differences into account and made sure to keep track of this via variables, so that the same logic could be executed to handle the midi signals. You just need to keep track of which possibilities there are for your type of midi signal (the 'a') and you need to keep track of what the velocity is of a 'note-end' singal (this is your 'c'). So make sure to test this out for your specific device first and adjust the variables 'midiType' (= an array), 'endSignal' (a number, corresponding to the end-note velocity) and 'endSignalType' (= a number corresponding to the end-note type signal, your 'a' of an end-note signal) accordingly in the file 'src/js/node-functions/midi-info.js'. So, make sure to update these variables to the right values for your MIDI piano device!
   
   <img width="495" alt="image" src="https://user-images.githubusercontent.com/91590248/208060241-eba0df41-f84a-41d2-8952-2b2837c170d3.png">

- Connect your LED strips to your Arduino according to the previous schematic. And also connect the external power adaptor to your LED strips.

#### STEP 3: Set up Ableton
We use 3 virtual output ports on our Mac device to connect to different sounds in Ableton. I used the Ableton Live 11 Lite free trial of 90 days.

1. Create virtual MIDI output ports with the right name. 
   - Go to the 'Audio MIDI Setup' app on your computer (this is a built in app on macbook).
   - Go to Window > Show MIDI Studio
   - You should see the following screen:
   
   <img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207342836-ccf61c2c-0629-4895-83be-7c4ee230c435.png">
   
   - Create 3 virtual MIDI ports by pressing the plus button. Give them the names 'Test 1', 'Test 2' and 'Test 3'. And press apply.
  
   <img width="509" alt="image" src="https://user-images.githubusercontent.com/91590248/207344305-d404336c-353d-4751-9d9f-bd31c3f9629a.png">
   
   - You could choose your own naming convention 'Name 1', 'Name 2', 'Name 3', but then you should make sure to change the variable 'generalPortName' in the file 'src/js/node-functions/midi-info.js' to your chosen name.
   
   <img width="521" alt="image" src="https://user-images.githubusercontent.com/91590248/208057023-c71d594d-3c5d-4b5f-8fb3-82fa952d7753.png">

    
2. Connect the virtual output ports to sounds in Ableton
   - In the MIDI input option, you should be able to choose from the virtual MIDI ports we just created.
<img width="759" alt="image" src="https://user-images.githubusercontent.com/91590248/208517297-9f0df984-4f9a-4daa-8cab-9e19e6b89600.png">


   - To link a MIDI track to a sound, just drag a sound from the sound tab to the track. We linked the sounds and outputs in the following way:
      - IAC Driver Test 1 - Grand Piano
      - IAC Driver Test 2 - MPE Sine Press
      - IAC Driver Test 3 - Organ Angry


#### STEP 4: Configuring Firefox
##### Important note
It seems tedious to need to configure your Firefox browser initially to have our installation work as smoothly as possible. And we realize this would not be a good solution if we were working with a public web application. However, our project is meant as a fixed, local installation. So, in our case, we allow for a personal configuration of a specific browser that will be used to execute our installation, as we are in the situation of just needing to have 1 locally working system that is set-up by us beforehand and configured by our preferences. This way, once the specific laptop that is set to run the node server and the necessary devices are all set-up to their needed preliminary configurations, the installation can easily be started and stopped from that point on by the client. All the preliminary configurations can be done once by us, with the goal of making the functionality of the installation hastle-free for others without coding background once the set-up has been correctly handled one time in the beginning. 

##### Full screen viewing mode
I chose to work with Firefox as a browser, as the png sequences animations with requestAnimationFrame run more smoothly here. However, there was some extra setup needed for Firefox itself. Namely, as the browser screens are used in the installation setup, we wanted to make sure that in full screen mode, nothing else is visible except for the content of the page itself. Unfortunately, there is no built-in way to do this via Firefox settings. You could install an add-on for this, but then you could not open the right type of browser screen automatically via your node server. 

So, before you start the installation itself, we will make sure you have the right configurations for your Firefox browser. 

What it comes down to, is that you will make your own 'userChrome.css' style sheet that can overwrite certain built in styling options of Firefox. We provided such a css style sheet in our 'firefox-configuration' folder. The contents of the file should look like this:

<img width="637" alt="image" src="https://user-images.githubusercontent.com/91590248/208071459-afb62fd5-53a3-4b2a-8847-958cb9f145f8.png">

Once you have this file, you should however inform Firefox of where to find it and that it should allow user defined styling.

1. The first thing you should do is go to 'about:config' in your Firefox browser. 
This will probably first show you a warning that you are going to a page that will change the configuration of your Firefox browser and that you should proceed with caution if this is what you want to do. Just click 'Accept the risk and continue' to continue.

<img width="524" alt="image" src="https://user-images.githubusercontent.com/91590248/208072060-1ecc9821-2c80-447e-bff1-5785b1fae24b.png">

2. Once you are on the configuration page, you should look for the setting 'toolkit.legacyUserProfileCustomizations.styleSheets' via the search bar and set this setting to 'true' by double clicking it. 

<img width="920" alt="image" src="https://user-images.githubusercontent.com/91590248/208072433-052b720c-3bb1-4f43-bc5e-89995dc24c1c.png">

This setting will let Firefox know that user defined style sheets are allowed and that it should start looking for it.

3. Now we are going to place our 'userChrome.css' file with our adjusted contents in the right folder, so that Firefox can access it. Namely, we are going to put it in our Profiles folder. To access this folder in our Finder window, we need to go to 'about:support'. Here you should find the section 'Profile folder' and see a button 'Show in Finder' to go to this folder in a finder window and access its contents.

<img width="845" alt="image" src="https://user-images.githubusercontent.com/91590248/208073133-862368be-691b-41a5-a856-a35d466454f4.png">

4. Inside our profile folder, you now just need to make a new folder named 'chrome' and copy-paste our 'userChrome.css' file in this new folder. 

<img width="728" alt="image" src="https://user-images.githubusercontent.com/91590248/208073388-aa645085-742b-47b4-80ff-88138a490c96.png">

5. Once this is done, you should restart Firefox and if you followed these steps, you should now see that if you go to full screen, you only see the contents of the page. But we still made sure that if you hover to the top, the necessary navigations appear if you would need them.

##### Allowing scripts to close browser windows
I wanted to make sure my installation has a nice 'clean up', by closing the browser windows once the node server stops running. However, for safety, a script is only allowed to close a window that it has opened itself. And as we make sure to make the set up process with the external monitors as smooth as possible, we still leave room to pick the right screen for the right external monitor by using links to make your choice of screen in the 3 screen setup. However, by having this click through via a link, we are no longer at the same browser window that was opened by our script and by default, we are not allowed to close this new window via our script. To circumvent this, we can change another setting in our Firefox configuration.

Namely, go to 'about:config' in your firefox browser again and accept the risk to go through. Then look for the setting 'allow_scripts_to_close_windows' and set it to 'true'. Now our script should be able to close the click-through windows as well.

<img width="605" alt="image" src="https://user-images.githubusercontent.com/91590248/208300835-eda2cb82-26f1-429e-bf1a-c30070e4aa73.png">


### Starting the installation itself
Once all the preliminary steps are handled, we can start and stop the installation functionality.

#### STEP 5: Start the node server
We made sure that our installation is controlled via a node server that serves as a central control point. The node server handles the MIDI input, controlls the right output port for the MIDI signals to produce sounds. It communicates to the Arduino via serial communication to execute the right commands. And it provides a webSocket connection to 3 browsers that are used to show additional animations on the screen. It takes care of all the timing of the installation, the communication between all the parts. It also handles the screensaver functionality.

If you do not have node installed yet on your device, make sure to download it from https://nodejs.org/en/download/. The versions of node I worked with were v16.14.0 and v18.12.1. So, if your version of node does not work, these 2 should normally always work. Normally, the package.json contains all the information of the downloaded packages, so these will be downloaded automatically when you download your node-modules in your folder via the 'npm install' command. However, should something go wrong, these are the npm packages that were used in this project:
- [express](https://www.npmjs.com/package/express)
- [http](https://www.npmjs.com/package/http)
- [socket.io](https://www.npmjs.com/package/socket.io)
- [path](https://www.npmjs.com/package/path)
- [url](https://www.npmjs.com/package/url)
- [open](https://www.npmjs.com/package/open)
- [midi](https://www.npmjs.com/package/midi)
- [fs](https://www.npmjs.com/package/fs)

There are 2 options to start the node server:
1. Via the terminal:
      - Make sure to go to the directory where the index.js file of the node server is located
      - Execute the command 'node index.js'
2. Via the provided shell script
      - To make the starting up process easier for our client, we added a shell script that starts the node server file at the right location.
      - IMPORTANT NOTE: I wanted to make sure that the shell script could work from the desktop, independent of where the directory of the node js file was located. So, I made sure that my shell script looks for my directory name throughout the whole computer, but stops once it finds the first match. However, this depends on the fact that this directory has a unique name!! In this case, the unique folder name where my node js file is located is called 'bachelorproef-repo'. You could change this to another name, only if you choose a folder name that is unique on your device! To change this, change this line in the shell script 'start':
      
      <img width="446" alt="image" src="https://user-images.githubusercontent.com/91590248/208057902-2bd165b9-5b69-4cfa-9462-61084a949940.png">


#### STEP 6: Setting up the 3 screens with socket connection
If all goes well, the node server should have opened 3 browser screens at 'localhost:3000', where our client side logic is hosted. At this point, you should see a selection option to choose which screen should be chosen for which browser window. 
To have the right set up, we provided a visual cue to see where each screen should go. So, drag your browser screens to the right external monitor screen and pick the corresponding option.

If you made a mistake, you can either select a different screen that is still available, or you can press the reset button to reset the currently connected websockets.

<img width="876" alt="image" src="https://user-images.githubusercontent.com/91590248/207339353-514bc385-6cbe-42b8-b14e-372233db4382.png">


#### STEP 7: Loading the installation
Once the 3 screens have been chosen, the browsers will start loading in the right assets for the png sequences to show. Once all browsers are done loading, the installation is ready to be used.

NOTE: The folder structure of your assets is very important! So, keep this same structure for your animation assets, as this is used to count the right amount of pngs in each sequence for each screen and version. And we count on this file structure to show the right image of a certain animation.

<img width="395" alt="image" src="https://user-images.githubusercontent.com/91590248/208060932-efde9716-12ce-43c6-aa8d-f0f0a186125f.png">

So, we have the following structure:
 src
   - assets
     - pngseq
       - version-x
         - screen-y
           - animation-z
             - long
                - file names: animation-z-long_000xx.png starting from 000000
             - short
                - file names: animation-z-short_000xx.png starting from 000000
                
 Where x and y go from 1-3, z depends on the amount of animations on a certain screen. In our case screen 1 has 4 animations, screen 2 and 3 have 3 animations. Note that each animation needs both a short and a long version! This will be to show the difference between a note that was pressed quickly or a note that is being pressed down for a longer duration.
 
 We followed the following scheme to number the screens and animations. So, if you want to use your own animations, keep this in mind.
 
 <img width="929" alt="image" src="https://user-images.githubusercontent.com/91590248/208074143-fdd672bc-fddb-4b84-b03a-4a400d10e14f.png">


#### STEP 8: Stopping the installation
Again there are 2 options:
- Close all browser windows and press ctrl + C in the terminal to stop your node server
- Use the 'stop' shell script to stop the node server.
- Thanks to the configuration of Firefox, the 3 browser windows should close automatically, when the websocket connection gets disrupted, when the node server shuts down.

## Structure of our repo
- arduino folder: this contains the files for the Arduino. The final version is found in 'multitasking/multitasking.ino'. The other ones are earlier versions.
- firefox-configuration: this folder contains the userChrome.css file that is used to add custom styling to Firefox.
- tests: this contains test files that were used during our process to, for example, try out reading MIDI signals and try out separating the png sequence logic to make the animations play as smoothly as possible.
- src:
  - assets: contains the assets for this project
     - fonts: fonts used in this project
     - pngseq: contains all the png assets for the animations png sequences, in the previously mentioned structure.
     - styling: the background image used for the screen selection menu.
  - css: the style sheet for this project
  - js: All the javascript files.
     - screens.js: The general file for the client-side logic.
     - lib.js: general library file with some basic functions.
     - browser functions: modules for separated logic that are used on the client side
       - image-loading.js: functions to load the right pngs on the client side.
     - node-functions: modules for separated logic that are used by the node server
        - animation-info.js: global variables with the animation info
        - file-counting.js: functions that count the number of assets of the png sequences in a structured way.
        - midi-info.js: file with global variables with the info to read the MIDI signals of the connected device in the correct way.
        - screensaver.js: contains the logic of the screensaver functionality
- README.md: this file, with the set-up guide and repo context.
- index.html: the html file for the browser.
- index.js: the central node server
- start: the starting shell file (can be placed on your desktop)
- stop: the stopping shell file (can be placed on your desktop)
- package-lock.json and package.json: info about npm packages
  
     
    
