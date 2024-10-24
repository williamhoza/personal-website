/*
 * (MIT License)
 * 
 * Copyright 2021 William Hoza
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
 */

// This is an implementation of a version of the xorshift128+ pseudorandom generator
// It's not necessarily a very efficient implementation
// Hopefully I didn't make any mistakes

'use strict';

class PRG {
  // The seed should be an array consisting of 128 bits
  constructor(seed) {
    // The internal state of the generator consists of two BigInts, which we think of as unsigned 64-bit integers
    this.a = BigInt(0);
    this.b = BigInt(0);
    
    eAssert(seed.length == 128);
    for (let i = 0; i < 128; i++) {
      eAssert(seed[i] == 0 || seed[i] == 1);
      if (i < 64) {
        this.a += BigInt(seed[i]) * (1n << BigInt(i));
      } else {
        this.b += BigInt(seed[i]) * (1n << BigInt(i - 64));
      }
    }
  }
  
  // Returns a random element of {0, 1, ..., possibilities - 1}
  randomInt(possibilities) {
    let oldA = this.a;
    let oldB = this.b;
    
    // Update state
    this.a = oldB;
    let shiftedOldA = (oldA << 23n) % (1n << 64n);
    this.b = shiftedOldA ^ oldB ^ (shiftedOldA >> 18n) ^ (oldB >> 5n);
    
    // Calculate return value
    let ret = (oldA + oldB) % (1n << 64n);
    return Number(ret * BigInt(possibilities) / (1n << 64n));
  }
  
  // Fisher-Yates
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Returns a random float in the interval [0, 1), like Math.random()
  randomFloat() {
    return this.randomInt(Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER;
  }
}
