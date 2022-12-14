//Big keyboard
// const midiType = [144];
// const endSignal = 0;

//Small keyboard
const midiType = [128, 144];
const endSignal = 127;

const endSignalType = midiType[0];

const velocityScale = 127;

const generalPortName = "Test"

const versionRelations = [
  {
    portName: `${generalPortName} 1`,
    version: 1,
  },
  {
    portName: `${generalPortName} 2`,
    version: 2,
  },
  {
    portName: `${generalPortName} 3`,
    version: 3,
  },
];

export { midiType, endSignal, endSignalType, velocityScale, versionRelations, generalPortName };
