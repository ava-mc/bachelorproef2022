//Big keyboard
// const midiType = [144];
// const endSignal = 0;

//Small keyboard
const midiType = [128, 144];
const endSignal = 127;

const endSignalType = midiType[0];

const velocityScale = 127;

const versionRelations = [
  {
    portName: "Test 1",
    version: 1,
  },
  {
    portName: "Test 2",
    version: 2,
  },
  {
    portName: "Test 3",
    version: 1,
  },
];

export { midiType, endSignal, endSignalType, velocityScale, versionRelations };