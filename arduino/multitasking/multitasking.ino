

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
int R[numberOfLedStrips] = {1, 0, 1};
int G[numberOfLedStrips] = {1, 1, 0};
int B[numberOfLedStrips] = {0, 1, 1};


int brightness[numberOfLedStrips] = {100, 100, 100};
int maxBrightness = 127;
int currentBrightness = 100;

int flickerDelay = 40;
unsigned long currentTime;
const unsigned long period = 20;

bool playScreenSaver = false;
// unsigned long screensaverStart = 0;
// unsigned long screensaverDelay = 8000;
bool screenSaverTimer = false;
int fadingDelay = 50;
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

// char asciiList[127] = {
//     'ÿ', 'þ', 'ý', 'ü', 'û', 'ú', 'ù', 'ø', '÷',
//     'ö', 'õ', 'ô', 'ó', 'ò', 'ñ', 'ð', 'ï', 'î',
//     'í', 'ì', 'ë', 'ê', 'é', 'è', 'ç', 'æ', 'å',
//     'ä', 'ã', 'â', 'á', 'à', 'ß', 'Þ', 'Ý', 'Ü',
//     'Û', 'Ú', 'Ù', 'Ø', '×', 'Ö', 'Õ', 'Ô', 'Ó',
//     'Ò', 'Ñ', 'Ð', 'Ï', 'Î', 'Í', 'Ì', 'Ë', 'Ê',
//     'É', 'È', 'Ç', 'Æ', 'Å', 'Ä', 'Ã', 'Â', 'Á',
//     'À', '¿', '¾', '½', '¼', '»', 'º', '¹', '¸',
//     '·', '¶', 'µ', '´', '³', '²', '±', '°', '¯',
//     '®', '­', '¬', '«', 'ª', '©', '¨', '§', '¦',
//     '¥', '¤', '£', '¢', '¡', ' ', '\x9F', '\x9E', '\x9D',
//     '\x9C', '\x9B', '\x9A', '\x99', '\x98', '\x97', '\x96',
//   '\x95', '\x94', '\x93', '\x92', '\x91', '\x90', '\x8F',
//   '\x8E', '\x8D', '\x8C', '\x8B', '\x8A', '\x89', '\x88',
//   '\x87', '\x86', '\x85', '\x84', '\x83', '\x82', '\x81'};

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
    pixelNumber[i] = pixelNumberStart[i]-1;
  }

  //BUTTON
  pinMode(buttonPin, INPUT);
  

}

void loop() {
  

  currentTime = millis();
  if (Serial.available() > 0)
  {
    // processInput();

    incomingByte = Serial.read();
    // Serial.print(atoi(incomingByte));
    // Serial.print(Serial.readString());
    // Serial.print(Serial.readString().toInt());
    //char test[1] = {incomingByte};
    // test[0] = incomingByte;
    // if (atoi(test)<127&&atoi(test)>0) {
    //   Serial.print(atoi(test));
    // }
    // for (int i = 0; i < sizeof(asciiList);i++){
    //   if (incomingByte==asciiList[i]){
    //     currentBrightness = i;
    //   }
    // }

    if (incomingByte=='z') {
      // Serial.print("screensavertime" +(fadingDelay*(fadingMax-fadingMin)));
      // Serial.print((fadingDelay*(fadingMax-fadingMin)));
      Serial.print("screensavertime" + String(screensaverLength));
    }

     for (int i = 0; i < sizeof(BrightnessCodes);i++){
      if (incomingByte==BrightnessCodes[i]){
        currentBrightness = (i+1)*8;
      }
    }

      for (int i = 0; i < numberOfLedStrips; i++)
      {
        if (incomingByte == startAnimationSign[i])
        {
          startAnimation[i] = true;
          startTime[i] = currentTime;
          pixelNumber[i] = pixelNumberStart[i] - 1;
          brightness[i] = currentBrightness;
          Serial.print(currentBrightness);
        }

        if (incomingByte == startLongPressSign[i])
        {
          longPress[i] = true;
          startFlicker[i] = currentTime;
          // brightness[i] = currentBrightness;
          // flickerTimer[i] == true;
        }

        if (incomingByte == endLongPressSign[i])
        {
          longPress[i] = false;
          clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
          // startFlicker[i] = 0;
          flickerTimer[i] = false;
        }
      }

     if (incomingByte =='s') {
      playScreenSaver = true;
      // screensaverStart = currentTime;
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
          // Serial.print(fadingPoint);
          fadingStart = currentTime;
          if (fadingPoint<=fadingMax&&fadingPoint>=fadingMin){
            for (int i = 0; i <= NUM_PIXELS;i++) {
            NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
            NeoPixel.show();
          }
          }

          //let server know when to switch the transition on the screen
          // if (fadingPoint == fadingMax) {
          //   Serial.print("opacity-up");
          // }
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
        NeoPixel.setPixelColor(pixelNumber[i], NeoPixel.Color(brightness[i]*R[i], brightness[i]*G[i], brightness[i]*B[i]));
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
        // Serial.print(startFlicker[i]);
        startFlicker[i] = currentTime;
        flickerTimer[i] = !flickerTimer[i];
        if (flickerTimer[i]==false) {
          clearPixels(pixelNumberStart[i], pixelNumberEnd[i]);
        }
         else
        {
          turnOn(pixelNumberStart[i], pixelNumberEnd[i], brightness[i]*R[i], brightness[i]*G[i], brightness[i]*B[i]);
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

// void flicker(int START, int END, int R, int G, int B) {

//     clearPixels(START, END);
//     for (int pixel = START; pixel <= END; pixel++)
//     {
//       NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20));
//       NeoPixel.show();
//     }
// }

void turnOn(int START, int END, int R, int G, int B) {
  // Serial.print(R);
  for (int pixel = START; pixel <= END; pixel++)
  {
    NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B));
    }
    NeoPixel.show();
}


void processInput ()
  {
  //static long receivedNumber = 0;
  static boolean negative = false;
  static int readingNumber = 0;

    byte c = Serial.read();
    // Serial.print(c);

    switch (c)
    {
      
    case endOfNumberDelimiter:  
      if (negative) {
        // processNumber(- currentBrightness);
        currentBrightness = -readingNumber;
      }
        
      else {
        // processNumber(currentBrightness);
        currentBrightness = readingNumber;
        }

    // fall through to start a new number
    case startOfNumberDelimiter: 
      readingNumber = 0; 
      negative = false;
      break;
      
    case '0' ... '9': 
      readingNumber *= 10;
      readingNumber += c - '0';
      break;
      
    case '-':
      negative = true;
      break;
      
    } // end of switch  
  }  // end of processInput

  void processNumber(const long n)
  {
  Serial.print(n);
  }  // end of processNumber
  