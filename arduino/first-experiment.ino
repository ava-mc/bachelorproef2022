

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

#define PIN_NEO_PIXEL  16   // Arduino pin that connects to NeoPixel
#define NUM_PIXELS     30  // The number of LEDs (pixels) on NeoPixel
#define SIZE 5

Adafruit_NeoPixel NeoPixel(NUM_PIXELS, PIN_NEO_PIXEL, NEO_GRB + NEO_KHZ800);

void setup() {
  NeoPixel.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
}

void loop() {
  NeoPixel.clear(); // set all pixel colors to 'off'. It only takes effect if pixels.show() is called

  // turn pixels to green one by one with delay between each pixel
  for (int pixel = 0; pixel < NUM_PIXELS+SIZE; pixel++) { // for each pixel
    if (pixel<NUM_PIXELS) {
    NeoPixel.setPixelColor(pixel, NeoPixel.Color(0, 255, pixel*10 + 20)); // it only takes effect if pixels.show() is called
    NeoPixel.show(); 
    }// send the updated pixel colors to the NeoPixel hardware.
    if (pixel>=SIZE) {NeoPixel.setPixelColor(pixel-SIZE, 0,0,0);
    NeoPixel.show();
    }
    delay(30); // pause between each pixel
    
  }

  // turn off all pixels for two seconds
  NeoPixel.clear();
  NeoPixel.show(); // send the updated pixel colors to the NeoPixel hardware.
  delay(2000);     // off time
}
