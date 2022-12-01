

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define PIN_NEO_PIXEL  16   // Arduino pin that connects to NeoPixel
#define NUM_PIXELS     30  // The number of LEDs (pixels) on NeoPixel
#define SIZE 5


char incomingByte = 0; // for incoming serial data
bool startAnimation = false;
char startSign= '1';
bool longPress1 = false;
bool longPress2 = false;
bool longPress3 = false;
bool startAnimation1 = false;
bool startAnimation2 = false;
bool startAnimation3 = false;
bool playScreenSaver = false;
unsigned long screensaverStart = 0;
unsigned long screensaverDelay = 8000;
bool screenSaverTimer = false;
unsigned long fadingDelay = 50;
unsigned long fadingStart = 0;
int fadingPoint = 0;
int fadingMax = 100;
int fadingMin = 0;
int fadingWait = 50;
int fadingAmount = 2;
bool fadingSwitch = true;

unsigned long startTime1 = 0;
int pixelNumber1 = 0 -1;
unsigned long startTime2 = 0;
int pixelNumber2 = 10-1;
unsigned long startTime3 = 0;
int pixelNumber3 = 20-1;

unsigned long flickerDelay = 40;
unsigned long startFlicker1 = 0;
unsigned long startFlicker2 = 0;
unsigned long startFlicker3 = 0;
bool flickerTimer1 = false;
bool flickerTimer2 = false;
bool flickerTimer3 = false;


unsigned long currentTime;
const unsigned long period = 20;

//trying out something for multitasking
boolean patternEnabled [] = {false, false, false, false, false};
int LEDList[NUM_PIXELS];

Adafruit_NeoPixel NeoPixel(NUM_PIXELS, PIN_NEO_PIXEL, NEO_GRB + NEO_KHZ800);

void setup() {
  NeoPixel.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  Serial.begin(9600); // Starts the serial communication
  NeoPixel.clear();
  NeoPixel.show();
  for (int i = 0; i < NUM_PIXELS; i++) {
    LEDList[i] = 0;
  }
}

void loop() {
  currentTime = millis();
  if (Serial.available() > 0)
  {
    incomingByte = Serial.read();

    if (incomingByte == '1') {
      //animateReusable(0, 9, "animation-end", 0, 0, 100);
      startAnimation1 = true;
      startTime1 = currentTime;
    }

    if (incomingByte == '2') {
      // animateReusable(10, 19, "animation2-end", 255, 0, 0);
      startAnimation2 = true;
      startTime2 = currentTime;
    }
    if (incomingByte == '3') {
      // animateReusable(20, 29, "animation3-end", 100, 255, 0);
      startAnimation3 = true;
      startTime3 = currentTime;
    }
    if (incomingByte == 'a') {
      longPress1 = true;
      startFlicker1 = currentTime;
    }

    if (incomingByte == 'b') {
      longPress1 = false;
      clearPixels(0, 9);
      startFlicker1 = 0;
      flickerTimer1 = false;
      //NeoPixel.show();
    }
    if (incomingByte == 'c') {
      longPress2 = true;
      startFlicker2 = currentTime;
    }

    if (incomingByte == 'd') {
      longPress2 = false;
      clearPixels(10, 19);
      startFlicker2 = 0;
      flickerTimer2 = false;
      // NeoPixel.show();
    }
    if (incomingByte == 'e') {
      longPress3 = true;
      startFlicker3 = currentTime;
    }

    if (incomingByte == 'f') {
      longPress3 = false;
      clearPixels(20, 29);
      startFlicker3 = 0;
      //flickerTimer3 = false;
      //NeoPixel.show();
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
  // if (currentTime - screensaverStart >= screensaverDelay){
    // Serial.print(fadingPoint);
        // screensaverStart = currentTime;
        // screenSaverTimer = !screenSaverTimer;
        
        // if (screenSaverTimer== false) {
        //   //clearPixels(0, NUM_PIXELS);
        //   //brighten();
        //   fadingStart = currentTime;
        //   darken();
        if (currentTime-fadingStart>=fadingDelay){
          // for (int i = 0; i <= NUM_PIXELS;i++) {
          //   NeoPixel.setPixelColor(i, 255, 255, 255);
          // }
          Serial.print(fadingPoint);
          fadingStart = currentTime;
          // for (int i = 0; i <= NUM_PIXELS;i++) {
          //   NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
          // }
          if (fadingPoint<=fadingMax&&fadingPoint>=fadingMin){
            // NeoPixel.setBrightness(fadingPoint);
            for (int i = 0; i <= NUM_PIXELS;i++) {
            NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
            NeoPixel.show();
          }
          }
          // else {
          //   if (fadingPoint>fadingMax){
          //     for (int i = 0; i <= NUM_PIXELS;i++) {
          //       NeoPixel.setPixelColor(i, fadingMax, fadingMax, fadingMax);
          //       NeoPixel.show();
          // }
          //   }
          //   if (fadingPoint<fadingMin) {
          //     for (int i = 0; i <= NUM_PIXELS;i++) {
          //       NeoPixel.setPixelColor(i, fadingMin, fadingMin, fadingMin);
          //       NeoPixel.show();
          //   }
          //   }
          // }
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
        //         }
        // else {
        //   if (currentTime-fadingStart>=fadingDelay){
        //   fadingStart = currentTime;
        //   // for (int i = 0; i <= NUM_PIXELS;i++) {
        //   //   NeoPixel.setPixelColor(i, fadingPoint, fadingPoint, fadingPoint);
        //   // }
        //   // NeoPixel.show();
        //   // if (fadingPoint>fadingMin) {
        //   //   fadingPoint--;
        //   // }
        //   NeoPixel.setBrightness(fadingPoint);
        //   NeoPixel.show();
        //   if (fadingPoint>fadingMin) {
        //     Serial.print(fadingPoint);
        //     fadingPoint--;
        //   }
          // }
        //   //turnOn(0, NUM_PIXELS, 255, 255, 255);
        //   //darken();
        //   brighten();
        // }


  // }
}

if (startAnimation1 == true)
{
  if (currentTime - startTime1 >= period)
  {
    startTime1 = currentTime;
    if (pixelNumber1<10){
      NeoPixel.setPixelColor(pixelNumber1, NeoPixel.Color(pixelNumber1 * 30 + 20, 100, 255));
      //LEDList[pixelNumber1] = 1;
    }
    if (pixelNumber1>=SIZE-1) {
      NeoPixel.setPixelColor(pixelNumber1-SIZE, NeoPixel.Color(0,0,0));
      //LEDList[pixelNumber1 - SIZE] = 0;
    }
    if (pixelNumber1==10+SIZE-1) {
      startAnimation1 = false;
      Serial.print("animation-end");
      pixelNumber1 = 0-1;
      startTime1 = 0;
      //clearPixels(0, 9);
    }
    NeoPixel.show();
    pixelNumber1++;
  }
}


if (startAnimation2 == true)
{ 
  if (currentTime - startTime2>=period) {
    startTime2 = currentTime;
    if (pixelNumber2 < 20)
    {
      NeoPixel.setPixelColor(pixelNumber2, NeoPixel.Color(255, pixelNumber2 * 20 + 20, 100));
      //LEDList[pixelNumber2] = 1;
    }
    if (pixelNumber2>=10-1+SIZE) {
      NeoPixel.setPixelColor(pixelNumber2-SIZE, NeoPixel.Color(0,0,0));
      //LEDList[pixelNumber2 - SIZE] = 0;
    }
    if (pixelNumber2==20+SIZE-1) {
      startAnimation2 = false;
      Serial.print("animation2-end");
      pixelNumber2 = 10-1;
      startTime2 = 0;
      //clearPixels(10, 19);
    }
    NeoPixel.show();
    pixelNumber2++;
  }
}

if (startAnimation3 == true)
{ 
  if (currentTime - startTime3>=period) {
    startTime3 = currentTime;
    if (pixelNumber3<30){
      NeoPixel.setPixelColor(pixelNumber3, NeoPixel.Color(100, 255, pixelNumber1 * 10 + 20));
      //LEDList[pixelNumber3] = 1;
    }
    if (pixelNumber3>=20-1+SIZE) {
      NeoPixel.setPixelColor(pixelNumber3-SIZE, NeoPixel.Color(0,0,0));
      //LEDList[pixelNumber3 - SIZE] = 0;
    }
    if (pixelNumber3==30+SIZE-1) {
      startAnimation3 = false;
      Serial.print("animation3-end");
      pixelNumber3 = 20-1;
      startTime3 = 0;
      // clearPixels(20, 29);
    }
    NeoPixel.show();
    pixelNumber3++;
  }
  
}

    if (longPress1==true) {
      if (currentTime - startFlicker1>=flickerDelay) {
        startFlicker1 = currentTime;
        flickerTimer1 = !flickerTimer1;
        if (flickerTimer1==false) {
          clearPixels(0, 9);
        }
         else
        {
          turnOn(0, 9, pixelNumber1 * 30 + 20, 100, 255);
        }
      }
    }

    if (longPress2==true) {
      if (currentTime - startFlicker2>=flickerDelay) {
        startFlicker2 = currentTime;
        flickerTimer2 = !flickerTimer2;
        if (flickerTimer2==false) {
          clearPixels(10, 19);
        }
        else {
          turnOn(10, 19, 255, pixelNumber2 * 20 + 20, 100);
        }
      }
    }

if (longPress3==true) {
      if (currentTime - startFlicker3>=flickerDelay) {
        startFlicker3 = currentTime;
        flickerTimer3 = !flickerTimer3;
        if (flickerTimer3== false) {
          clearPixels(20, 29);
        }
        else {
          turnOn(20, 29, 100, 255, pixelNumber1 * 10 + 20);
        }
      }
    }
    

    // if (longPress2==true) {
    //   flicker(10, 19, 255, 0, 0);
    // }

    // if (longPress3==true) {
    //   flicker(20, 29, 100, 255, 0);
    // }

    //showPixels();
}

// void showPixels() {
//   for (int pixel = 0; pixel < NUM_PIXELS;pixel++) {
//     if (LEDList[pixel]==1) {
//       NeoPixel.setPixelColor(pixel, NeoPixel.Color(255, 50,50));
//     }
//     else {
//       NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
//     }
//   }
//   NeoPixel.show();
// }

void clearPixels(int START, int END) {
  for (int pixel = START; pixel <= END; pixel++) {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
      //LEDList[pixel] = 0;
  }
  NeoPixel.show();
}

// void animateReusable(int START, int END, String MESSAGE, int R, int G, int B) {
//   clearPixels(START, END);

//   // turn pixels to color one by one with delay between each pixel
//   for (int pixel = START; pixel < END + SIZE;)
//   { // for each pixel
//     if (pixel <= END)
//     {
//       //NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20)); // it only takes effect if pixels.show() is called
//       LEDList[pixel] = 1;
      

//     } // send the updated pixel colors to the NeoPixel hardware.
//     if (pixel>=START + SIZE) {
//       //NeoPixel.setPixelColor(pixel-SIZE, 0,0,0);
//       LEDList[pixel - SIZE] = 0;
//     }
//     //NeoPixel.show();
//     delay(10); // pause between each pixel
//     //Serial.print(pixel);

//     //Serial.print(LEDList[pixel]);
//     //showPixels();
//     if (pixel == END+SIZE-1) {
//       delay(30);
//       Serial.print(MESSAGE);
//     }
//   }

//   clearPixels(START, END);
//   //showPixels();
//   // NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
// }

void flicker(int START, int END, int R, int G, int B) {

    clearPixels(START, END);
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20));
      NeoPixel.show();
      // LEDList[pixel] = 1;
    }
    // delay(10);
    //showPixels();
    // for (int pixel = START; pixel <= END; pixel++)
    // {
    //   // NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
    //   // NeoPixel.show();
    //   LEDList[pixel] = 0;
    // }
    // showPixels();
    // delay(10);
}

void turnOn(int START, int END, int R, int G, int B) {
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B 
      //+ pixel * 10 + 20
      ));
    }
    NeoPixel.show();
}

// void brighten() {
//   uint16_t i, j;

//  if (currentTime - fadingStart >= fadingDelay){

//     for (int j = 0; j <= 255) {
//       for (int i = 0; i < NUM_PIXELS; i++) {
//         NeoPixel.setPixelColor(i, j, j, j);
//       }
//       NeoPixel.show();
//     }
//   }
// }

// void darken() {
//   uint16_t i, j;
//   for (j = 255; j >= 0; j--) {
//     for (i = 0; i < NeoPixel.numPixels(); i++) {
//       NeoPixel.setPixelColor(i, j, j, j);
//     }
//     NeoPixel.show();
//   }
// }


