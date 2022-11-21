# Bachelor project

## Development experiments (21/11/22)
Right now the development experiments are on the development branch.

- arduino folder: contains 2 experiments (LED animation, LED animation triggered by serial communication)
- index.js : node js server that receives midi input, sends signals to arduino (serial communication), communication to client (index.html)
- src: 
   - css files
   - js files 
     - lib.js: global file that currently contains socket connection object
     - screens.js: script that handles keydown input and socket connection of client side
     - script.js : file that was used as first exploration of reading MIDI input, combined with midi.html file
 - midi.html : first experiment with MIDI input
 
 Note: node_modules need to be installed locally on your machine.
