

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define PIN_NEO_PIXEL  16   // Arduino pin that connects to NeoPixel
#define NUM_PIXELS     107  // The number of LEDs (pixels) on NeoPixel
#define SIZE 4


char incomingByte = 0; // for incoming serial data
const int numberOfLedStrips = 10;

bool longPress[numberOfLedStrips] = {false, false, false, false, false, false, false, false, false, false};
bool startAnimation[numberOfLedStrips] = {false, false, false, false, false, false, false, false, false, false};
unsigned long startTime[numberOfLedStrips] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int pixelNumberStart[numberOfLedStrips] = {0, 19, 26, 38, 51, 65, 69, 78, 91, 96};
int pixelNumberEnd[numberOfLedStrips] = {18, 25, 37, 50, 64, 68, 77, 90, 95, 107};
int pixelNumber[numberOfLedStrips];
unsigned long startFlicker[numberOfLedStrips] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
bool flickerTimer[numberOfLedStrips] = {false, false, false, false, false, false, false, false, false, false};
String animationEndMessage[numberOfLedStrips] = {"animation0-end", "animation1-end", "animation2-end", "animation3-end", "animation4-end", "animation5-end", "animation6-end", "animation7-end", "animation8-end", "animation9-end"};
char startAnimationSign[numberOfLedStrips] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};
char startLongPressSign[numberOfLedStrips] = {'a', 'c', 'e', 'g', 'i', 'k', 'm', 'o', 'q', 's'};
char endLongPressSign[numberOfLedStrips] = {'b', 'd', 'f', 'h','j', 'l', 'n', 'p', 'r','t'};
// int R[numberOfLedStrips] = {1, 0, 1};
// int G[numberOfLedStrips] = {1, 1, 0};
// int B[numberOfLedStrips] = {0, 1, 1};
float R[numberOfLedStrips] = {.5, .5, 1, 1, 1, 1, 1, 0, .5, 0};
float G[numberOfLedStrips] = {1, 1, 0, .5, 0, 0, 0, 1, 0, 1};
float B[numberOfLedStrips] = {0, 0, 1, 0, 1, 1, 0, 1, 1, 1};

int brightness[numberOfLedStrips] = {100, 100, 100, 100, 100, 100, 100, 100, 100, 100};
int maxBrightness = 127;
int currentBrightness = 100;


int flickerDelay = 40;
unsigned long currentTime;
const unsigned long period = 20;

bool playScreenSaver = false;
// unsigned long screensaverStart = 0;
// unsigned long screensaverDelay = 8000;
bool screenSaverTimer = false;
int fadingDelay = 40;
unsigned long fadingStart = 0;
int fadingPoint = 0;
int fadingMax = 100;
int fadingMin = 0;
int fadingWait = 50;
int fadingAmount = 2;
bool fadingSwitch = true;

const char startOfNumberDelimiter = '<';
const char endOfNumberDelimiter   = '>';

Adafruit_NeoPixel NeoPixel(NUM_PIXELS, PIN_NEO_PIXEL, NEO_GRB + NEO_KHZ800);

char BrightnessCodes[26] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};

//BUTTON FOR OUTPUT CHANGE
const int buttonPin = 6; 
int buttonState=0; 
int lastButtonState = LOW;   
unsigned long lastDebounceTime = 0;  
unsigned long debounceDelay = 50;

char test[1];

int screensaverLength = fadingDelay * (fadingMax - fadingMin);

void setup() {
  NeoPixel.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  Serial.begin(9600); // Starts the serial communication
  NeoPixel.clear();
  NeoPixel.show();
  for (int i = 0; i < numberOfLedStrips;i++) {
    pixelNumber[i] = pixelNumberStart[i];
  }

  //BUTTON
  pinMode(buttonPin, INPUT);
  

}

void loop() {
  

  currentTime = millis();
  if (Serial.available() > 0)
  {

    incomingByte = Serial.read();
    if (incomingByte=='z') {
      Serial.print("screensavertime" + String(screensaverLength));
    }

     for (int i = 0; i < sizeof(BrightnessCodes);i++){
      if (incomingByte==BrightnessCodes[i]){
        currentBrightness = (i+1)*8;
        Serial.print(currentBrightness);
      }
    }

      for (int i = 0; i < numberOfLedStrips; i++)
      {
        if (incomingByte == startAnimationSign[i])
        {
          startAnimation[i] = true;
          startTime[i] = currentTime;
          pixelNumber[i] = pixelNumberStart[i];
          brightness[i] = currentBrightness;
          Serial.print(currentBrightness);
        }

        if (incomingByte == startLongPressSign[i])
        {
          longPress[i] = true;
          startFlicker[i] = currentTime;
        }

        if (incomingByte == endLongPressSign[i])
        {
          longPress[i] = false;
          clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
          flickerTimer[i] = false;
        }
      }

     if (incomingByte =='x') {
      playScreenSaver = true;
      fadingStart = currentTime;
      fadingPoint = 0;
      fadingSwitch = true;
     }

    if (incomingByte=='y') {
      playScreenSaver = false;
      clearPixels(0, NUM_PIXELS);
    }
  }

if (playScreenSaver == true) {
        if (currentTime-fadingStart>=fadingDelay){
          fadingStart = currentTime;
          if (fadingPoint<=fadingMax&&fadingPoint>=fadingMin){
           // for (int i = 0; i <= NUM_PIXELS;i++) {
          //  NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
          //  NeoPixel.show();
          //}
          turnOn(0, NUM_PIXELS, fadingPoint, fadingPoint, fadingPoint, 2);
          }

          //let server know when to switch the transition on the screen
          if (fadingPoint == fadingMin&&fadingSwitch==true) {
            Serial.print("opacity-up");
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
              //let server know when to switch the transition on the screen
              Serial.print("opacity-down");
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
        NeoPixel.setPixelColor(pixelNumber[i], NeoPixel.Color(round(float(brightness[i])*R[i]), round(float(brightness[i])*G[i]), round(float(brightness[i])*B[i])));
      }
      if (pixelNumber[i] >= pixelNumberStart[i] + SIZE)
      {
        NeoPixel.setPixelColor(pixelNumber[i] - SIZE, NeoPixel.Color(0, 0, 0));
      }
      if (pixelNumber[i] == pixelNumberEnd[i] + SIZE)
      {
        startAnimation[i] = false;
        Serial.print(animationEndMessage[i]);
        pixelNumber[i] = pixelNumberStart[i];
        startTime[i] = 0;
      }
      NeoPixel.show();
      pixelNumber[i]++;
    }
  }

    if (longPress[i]==true) {
      if (currentTime - startFlicker[i]>=flickerDelay) {
        startFlicker[i] = currentTime;
        flickerTimer[i] = !flickerTimer[i];
        if (flickerTimer[i]==false) {
          clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
        }
         else
        {
          turnOn(pixelNumberStart[i], pixelNumberEnd[i], round(float(brightness[i])*R[i]), round(float(brightness[i])*G[i]), round(float(brightness[i])*B[i]), 1);
          
        }
      }
    }
  }


  //BUTTON
  int reading = digitalRead(buttonPin);
  // If the switch changed, due to noise or pressing:
  if (reading != lastButtonState) {
    // reset the debouncing timer
    lastDebounceTime = currentTime;
  }

  if ((currentTime - lastDebounceTime) > debounceDelay) {
    // whatever the reading is at, it's been there for longer than the debounce
    // delay, so take it as the actual current state:

    // if the button state has changed:
    if (reading != buttonState) {
      buttonState = reading;
      // let node server know button is pressed
      if (buttonState == HIGH) {
        Serial.print("button");
      }
    }
  }

  // save the reading. Next time through the loop, it'll be the lastButtonState:
  lastButtonState = reading;
}

void clearPixels(int START, int END) {
  for (int pixel = START; pixel <= END; pixel++) {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
  }
  NeoPixel.show();
}


void turnOn(int START, int END, int R, int G, int B, int step) {
  // Serial.print(R);
  for (int pixel = START; pixel <= END; pixel+=step)
  {
    NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B));
    }
    NeoPixel.show();
}

