

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define PIN_NEO_PIXEL  16   // Arduino pin that connects to NeoPixel
#define NUM_PIXELS     30  // The number of LEDs (pixels) on NeoPixel
#define SIZE 5

const byte DATA_MAX_SIZE = 32;
char data[DATA_MAX_SIZE];   // an array to store the received data
char incomingByte = 0; // for incoming serial data
bool startAnimation = false;
char startSign= '1';
bool longPress1 = false;
bool longPress2 = false;
bool longPress3 = false;

Adafruit_NeoPixel NeoPixel(NUM_PIXELS, PIN_NEO_PIXEL, NEO_GRB + NEO_KHZ800);

void setup() {
  NeoPixel.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  Serial.begin(9600); // Starts the serial communication
  NeoPixel.clear();
  NeoPixel.show();
}

void loop() {
   //NeoPixel.clear();
  //  NeoPixel.show();
  // send data only when you receive data:
  if (Serial.available() > 0) {
    // read the incoming byte:
    incomingByte = Serial.read();
    //receiveData();
    //Serial.print(data);

    if (incomingByte == '1') {
      //animate();
      animateReusable(0, 9, "animation-end", 0, 0, 100);
    }

    if (incomingByte == '2') {
      //animate2();
      animateReusable(10, 19, "animation2-end", 255, 0, 0);
    }
    if (incomingByte == '3') {
      //animate3();
      animateReusable(20, 29, "animation3-end", 100, 255, 0);
    }
    if (incomingByte == 'a') {
      longPress1 = true;
    }

    if (incomingByte == 'b') {
      longPress1 = false;
      //NeoPixel.clear();
      clearPixels(0, 9);
      NeoPixel.show();
      //flicker(0, 30);
    }
    if (incomingByte == 'c') {
      longPress2 = true;
    }

    if (incomingByte == 'd') {
      longPress2 = false;
      //NeoPixel.clear();
      clearPixels(10, 19);
      NeoPixel.show();
      //flicker(0, 30);
    }
    if (incomingByte == 'e') {
      longPress3 = true;
    }

    if (incomingByte == 'f') {
      longPress3 = false;
      //NeoPixel.clear();
      clearPixels(20, 29);
      NeoPixel.show();
      //flicker(0, 30);
    }
}

    if (longPress1==true) {
      //Serial.print("I execute");
      flicker(0, 9, 0, 0, 100);
    }
    if (longPress2==true) {
      //erial.print("I execute");
      flicker(10, 19, 255, 0, 0);
    }

    if (longPress3==true) {
      //Serial.print("I execute");
      flicker(20, 29, 100, 255, 0);
    }
    // if (startAnimation == true) {
    //   startAnimation = false;
    //   // set all pixel colors to 'off'. It only takes effect if pixels.show() is called

    //   // turn pixels to green one by one with delay between each pixel
    //   for (int pixel = 0; pixel < NUM_PIXELS + SIZE; pixel++)
    //   { // for each pixel
    //     if (pixel < NUM_PIXELS)
    //     {
    //       NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 255, pixel * 10 + 20)); // it only takes effect if pixels.show() is called
    //       NeoPixel.show();
    //     } // send the updated pixel colors to the NeoPixel hardware.
    //     if (pixel >= SIZE)
    //     {
    //       NeoPixel.setPixelColor(pixel - SIZE, 0, 0, 0);
    //       NeoPixel.show();
    //     }
    //     delay(30); // pause between each pixel
    //     if (pixel == NUM_PIXELS + SIZE - 1)
    //     {
    //       startAnimation = false;
    //       Serial.print("I am done with animation 1");
    //     }
    // }

  // // turn off all pixels for two seconds
  // NeoPixel.clear();
  // NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
  // delay(2000);     // off time
  
    // }

  
}

void clearPixels(int START, int END) {
  for (int pixel = START; pixel <= END; pixel++) {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0)); 
  }
  NeoPixel.show();
}

void animateReusable(int START, int END, String MESSAGE, int R, int G, int B) {
  //NeoPixel.clear(); // set all pixel colors to 'off'. It only takes effect if pixels.show() is called
  clearPixels(START, END);

  // turn pixels to green one by one with delay between each pixel
  for (int pixel = START; pixel < END+SIZE; pixel++) { // for each pixel
    //NeoPixel.clear();
    if (pixel <= END)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20)); // it only takes effect if pixels.show() is called

    } // send the updated pixel colors to the NeoPixel hardware.
    if (pixel>=SIZE) {
      NeoPixel.setPixelColor(pixel-SIZE, 0,0,0);
    
    }
    NeoPixel.show();
    delay(10); // pause between each pixel
    Serial.print(pixel);
    if (pixel == END+SIZE-1) {
      delay(30);
      Serial.print(MESSAGE);
    }
  }

  //NeoPixel.clear();
  clearPixels(START, END);
  NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.

}

void flicker(int START, int END, int R, int G, int B) {
  //NeoPixel.clear();
  clearPixels(START, END);
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(R, G, B + pixel * 10 + 20));
      NeoPixel.show();
    }
    delay(10);
    for (int pixel = START; pixel <= END; pixel++)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 0,0));
      NeoPixel.show();
    }
    delay(10);
}

void animate() {
  NeoPixel.clear(); // set all pixel colors to 'off'. It only takes effect if pixels.show() is called

  // turn pixels to green one by one with delay between each pixel
  for (int pixel = 0; pixel < NUM_PIXELS+SIZE; pixel++) { // for each pixel
    //NeoPixel.clear();
    if (pixel < NUM_PIXELS)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 255, pixel * 10 + 20)); // it only takes effect if pixels.show() is called

    } // send the updated pixel colors to the NeoPixel hardware.
    if (pixel>=SIZE) {
      NeoPixel.setPixelColor(pixel-SIZE, 0,0,0);
    
    }
    NeoPixel.show();
    delay(10); // pause between each pixel
    Serial.print(pixel);
    if (pixel == NUM_PIXELS+SIZE-1) {
      //Serial.print("I am done with animation 1");
      delay(30);
      Serial.print("animation-end");
    }
  }

  // turn off all pixels for two seconds
  NeoPixel.clear();
  NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
  // delay(2000);     // off time
}

void animate2() {
  NeoPixel.clear(); // set all pixel colors to 'off'. It only takes effect if pixels.show() is called

  // turn pixels to green one by one with delay between each pixel
  for (int pixel = NUM_PIXELS-1; pixel > -SIZE; pixel--) { // for each pixel
    //NeoPixel.clear();
    if (pixel > -1)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 255, pixel * 10 + 20)); // it only takes effect if pixels.show() is called

    } // send the updated pixel colors to the NeoPixel hardware.
    if (pixel<NUM_PIXELS-SIZE) {
      NeoPixel.setPixelColor(pixel+SIZE, 0,0,0);
    
    }
    NeoPixel.show();
    delay(30); // pause between each pixel
    Serial.print(pixel);
    if (pixel == -SIZE +1) {
      //Serial.print("I am done with animation 1");
      delay(30);
      Serial.print("animation2-end");
    }
  }

  // turn off all pixels for two seconds
  NeoPixel.clear();
  NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
  // delay(2000);     // off time
}

void animate3() {
  NeoPixel.clear(); // set all pixel colors to 'off'. It only takes effect if pixels.show() is called

  // turn pixels to green one by one with delay between each pixel
  for (int pixel = 0; pixel < NUM_PIXELS+SIZE; pixel++) { // for each pixel
    //NeoPixel.clear();
    if (pixel < NUM_PIXELS)
    {
      NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 255, pixel * 10 + 20)); // it only takes effect if pixels.show() is called

    } // send the updated pixel colors to the NeoPixel hardware.
    if (pixel>=SIZE) {
      NeoPixel.setPixelColor(pixel-SIZE, 0,0,0);
    
    }
    NeoPixel.show();
    delay(10); // pause between each pixel
    Serial.print(pixel);
    if (pixel == NUM_PIXELS+SIZE-1) {
      //Serial.print("I am done with animation 1");
      delay(30);
      Serial.print("animation3-end");
    }
  }

  // turn off all pixels for two seconds
  NeoPixel.clear();
  NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
  // delay(2000);     // off time
}

// void receiveData() {
//   static char endMarker = '\n'; // message separator
//   char receivedChar;     // read char from serial port
//   int ndx = 0;          // current index of data buffer
//   // clean data buffer
//   memset(data, 32, sizeof(data));
//   // read while we have data available and we are
//   // still receiving the same message.
//   while(Serial.available() > 0) {
//     receivedChar = Serial.read();
//     if (receivedChar == endMarker) {
//       data[ndx] = '\0'; // end current message
//       return;
//     }
//     // looks like a valid message char, so append it and
//     // increment our index
//     data[ndx] = receivedChar;
//     ndx++;
//     // if the message is larger than our max size then
//     // stop receiving and clear the data buffer. this will
//     // most likely cause the next part of the message
//     // to be truncated as well, but hopefully when you
//     // parse the message, you'll be able to tell that it's
//     // not a valid message.
//     if (ndx >= DATA_MAX_SIZE) {
//       break;
//     }
//   }
//   // no more available bytes to read from serial and we
//   // did not receive the separato. it's an incomplete message!
//   Serial.println("error: incomplete message");
//   Serial.println(data);
//   memset(data, 32, sizeof(data));
// }
