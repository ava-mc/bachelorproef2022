let midi = null; // global MIDIAccess object
const onMIDISuccess = (midiAccess) => {
  console.log("MIDI ready!");
  midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
}

const onMIDIFailure = (msg) => {
  console.error(`Failed to get MIDI access - ${msg}`);
}

const onMIDIMessage = (event) => {
  let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
  for (const character of event.data) {
    str += `0x${character.toString(16)} `;
  }
  console.log(str);
  console.log('what you get:' + event.data)
}

const startLoggingMIDIInput = (midiAccess) => {
  midiAccess.inputs.forEach((entry) => {
    entry.onmidimessage = onMIDIMessage;
  });
}

const init = async () => {
    midi = await navigator.requestMIDIAccess();
    console.log(midi.inputs);
    if (midi.inputs.size === 1) {
        console.log('there is MIDI input possible');
        startLoggingMIDIInput(midi);
    }
    
}

init();

