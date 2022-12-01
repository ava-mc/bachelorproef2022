

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define PIN_NEO_PIXEL  16   // Arduino pin that connects to NeoPixel
#define NUM_PIXELS     30  // The number of LEDs (pixels) on NeoPixel
#define SIZE 5


char incomingByte = 0; // for incoming serial data
const int numberOfLedStrips = 3;

bool longPress[numberOfLedStrips] = {false, false, false};
bool startAnimation[numberOfLedStrips] = {false, false, false};
unsigned long startTime[numberOfLedStrips] = {0, 0, 0};
int pixelNumberStart[numberOfLedStrips] = {0, 10, 20};
int pixelNumberEnd[numberOfLedStrips] = {9, 19, 29};
int pixelNumber[numberOfLedStrips];
unsigned long startFlicker[numberOfLedStrips] = {0, 0, 0};
bool flickerTimer[numberOfLedStrips] = {false, false, false};
String animationEndMessage[numberOfLedStrips] = {"animation-end", "animation2-end", "animation3-end"};
char startAnimationSign[numberOfLedStrips] = {'1', '2', '3'};
char startLongPressSign[numberOfLedStrips] = {'a', 'c', 'e'};
char endLongPressSign[numberOfLedStrips] = {'b', 'd', 'f'};
int R[numberOfLedStrips] = {100, 0, 100};
int G[numberOfLedStrips] = {100, 100, 0};
int B[numberOfLedStrips] = {0, 100, 100};


int flickerDelay = 40;
unsigned long currentTime;
const unsigned long period = 20;

bool playScreenSaver = false;
unsigned long screensaverStart = 0;
unsigned long screensaverDelay = 8000;
bool screenSaverTimer = false;
int fadingDelay = 50;
unsigned long fadingStart = 0;
int fadingPoint = 0;
int fadingMax = 100;
int fadingMin = 0;
int fadingWait = 50;
int fadingAmount = 2;
bool fadingSwitch = true;

Adafruit_NeoPixel NeoPixel(NUM_PIXELS, PIN_NEO_PIXEL, NEO_GRB + NEO_KHZ800);

void setup() {
  NeoPixel.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  Serial.begin(9600); // Starts the serial communication
  NeoPixel.clear();
  NeoPixel.show();
  for (int i = 0; i < numberOfLedStrips;i++) {
    pixelNumber[i] = pixelNumberStart[i]-1;
  }
}

void loop() {
  currentTime = millis();
  if (Serial.available() > 0)
  {
    incomingByte = Serial.read();

    for (int i = 0; i < numberOfLedStrips; i++) {
      if (incomingByte == startAnimationSign[i]){
        startAnimation[i] = true;
        startTime[i] = currentTime;
        pixelNumber[i] = pixelNumberStart[i] - 1;
      }

      if (incomingByte == startLongPressSign[i]) {
        longPress[i] = true;
        startFlicker[i] = currentTime;
        // flickerTimer[i] == true;
      }

      if (incomingByte == endLongPressSign[i]) {
        longPress[i] = false;
        clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
        // startFlicker[i] = 0;
        flickerTimer[i] = false;
      }
    }

     if (incomingByte =='s') {
      playScreenSaver = true;
      screensaverStart = currentTime;
      fadingStart = currentTime;
      fadingPoint = 0;
      fadingSwitch = true;
     }

    if (incomingByte=='t') {
      playScreenSaver = false;
      clearPixels(0, NUM_PIXELS);
    }
  }

if (playScreenSaver == true) {
        if (currentTime-fadingStart>=fadingDelay){
          Serial.print(fadingPoint);
          fadingStart = currentTime;
          if (fadingPoint<=fadingMax&&fadingPoint>=fadingMin){
            for (int i = 0; i <= NUM_PIXELS;i++) {
            NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
            NeoPixel.show();
          }
          }
        if (fadingPoint<20&&fadingPoint>0) {
          fadingAmount = 1;
        }
        else {
          fadingAmount = 3;
        }
          if (fadingSwitch==true){
            if (fadingPoint<fadingMax) {
              fadingPoint+= fadingAmount;
            }
            if (fadingPoint>= fadingMax) {
              fadingSwitch = false;
            }
          }
          else {
            if (fadingPoint>fadingMin - fadingWait) {
              fadingPoint-= fadingAmount;
            }
            if (fadingPoint<= fadingMin - fadingWait) {
              fadingSwitch = true;
            }
          }
        }
}

for (int i = 0; i < numberOfLedStrips;i++) {
  if (startAnimation[i] == true){
    if (currentTime - startTime[i] >= period)
    {
      startTime[i] = currentTime;
      if (pixelNumber[i] <= pixelNumberEnd[i])
      {
        NeoPixel.setPixelColor(pixelNumber[i], NeoPixel.Color(R[i], G[i], B[i]));
      }
      if (pixelNumber[i] >= pixelNumberStart[i] + SIZE - 1)
      {
        NeoPixel.setPixelColor(pixelNumber[i] - SIZE, NeoPixel.Color(0, 0, 0));
      }
      if (pixelNumber[i] == pixelNumberEnd[i] + SIZE)
      {
        startAnimation[i] = false;
        Serial.print(animationEndMessage[i]);
        pixelNumber[i] = pixelNumberStart[i] - 1;
        startTime[i] = 0;
      }
      NeoPixel.show();
      pixelNumber[i]++;
    }
  }

    if (longPress[i]==true) {
      if (currentTime - startFlicker[i]>=flickerDelay) {
        Serial.print(startFlicker[i]);
        startFlicker[i] = currentTime;
        flickerTimer[i] = !flickerTimer[i];
        if (flickerTimer[i]==false) {
          clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
        }
         else
        {
          turnOn(pixelNumberStart[i], pixelNumberEnd[i], R[i], G[i], B[i]);
        }
      }
    }
  }
}

void clearPixels(int START, int END) {
  for (int pixel = START; pixel <= END; pixel++) {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
  }
  NeoPixel.show();
}

void flicker(int START, int END, int R, int G, int B) {

    clearPixels(START, END);
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20));
      NeoPixel.show();
    }
}

void turnOn(int START, int END, int R, int G, int B) {
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B ));
    }
    NeoPixel.show();
}
