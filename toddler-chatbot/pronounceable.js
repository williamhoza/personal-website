// Adapted from https://github.com/lukem512/pronounceable by Luke Mitchell

/*
* The MIT License (MIT) Copyright (c) 2016 Luke Mitchell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var threshold = 0.001;
var tuples;
var triples;

async function pronounceable_init() {
    // Load probabilities from JSON files.
    res = await fetch("tuples.json");
    tuples = await res.json();
    res = await fetch("triples.json");
    triples = await res.json();
}

pronounceable_init();

// Remove any non-alphabet characters
// and convert to lower case.
function clean(word) {
  return word.replace(/[^a-zA-Z]/g, "").toLowerCase();
}

// Make a percentage.
function percent(score, count) {
  return score / count * 100;
}

// Check for undefined probabilities.
function undef(w, i, depth, probs) {
  if (depth <= 1) return typeof probs[w[i]] === "undefined";
  if (typeof probs[w[i]] === "undefined") return true;
  return undef(w, i + 1, depth - 1, probs[w[i]]);
}

// Extract probabilities of word t 	uple.
function trainTuples(words) {
  var probs = {};
  var count = 0;

  words.forEach(function(w) {
    w = clean(w);

    for (var i = 0; i < w.length - 1; i++) {
      if (!probs[w[i]]) probs[w[i]] = {};
      if (!probs[w[i]][w[i + 1]]) probs[w[i]][w[i + 1]] = 1;
      else probs[w[i]][w[i + 1]]++;
      count++;
    }
  });

  Object.keys(probs).forEach(function(first) {
    Object.keys(probs[first]).forEach(function(second) {
      probs[first][second] = percent(probs[first][second], count);
    });
  });

  return probs;
}

// Extract probabilities of word triples.
function trainTriples(words) {
  var probs = {};
  var count = 0;

  words.forEach(function(w) {
    w = clean(w);

    for (var i = 0; i < w.length - 2; i++) {
      if (!probs[w[i]]) probs[w[i]] = {};
      if (!probs[w[i]][w[i + 1]]) probs[w[i]][w[i + 1]] = {};
      if (!probs[w[i]][w[i + 1]][w[i + 2]]) probs[w[i]][w[i + 1]][w[i + 2]] = 1;
      else probs[w[i]][w[i + 1]][w[i + 2]]++;
      count++;
    }
  });

  Object.keys(probs).forEach(function(first) {
    Object.keys(probs[first]).forEach(function(second) {
      Object.keys(probs[first][second]).forEach(function(third) {
        probs[first][second][third] = percent(
          probs[first][second][third],
          count
        );
      });
    });
  });

  return probs;
}

// Extract probabilities of word tuples and triples
// from a large list of words.
function train(filename, callback) {
  fs.readFile(filename, "utf8", function read(err, data) {
    if (err) throw err;

    var words = data.trim().split(/\s+/);
    var tuples = trainTuples(words);
    var triples = trainTriples(words);

    callback(tuples, triples);
  });
};

// Check whether a word is pronounceable using
// the word tuple probabilities.
function test(word) {
  var w = clean(word);

  switch (w.length) {
    case 1:
      break;

    case 2:
      for (var i = 0; i < w.length - 1; i++) {
        if (undef(w, i, 2, tuples)) return false;
        if (tuples[w[i]][w[i + 1]] < threshold) return false;
      }

    default:
      for (var i = 0; i < w.length - 2; i++) {
        if (undef(w, i, 3, triples)) return false;
        if (triples[w[i]][w[i + 1]][w[i + 2]] < threshold) return false;
      }
  }

  return true;
};

// Compute a normalised score for
// the pronounceability of the word.
function score(word) {
  var w = clean(word);
  var score = 0;

  switch (w.length) {
    case 1:
      return 1;

    case 2:
      for (var i = 0; i < w.length - 1; i++) {
        if (undef(w, i, 2, tuples)) {
          score = score + 0;
        } else {
          score = score + tuples[w[i]][w[i + 1]];
        }
      }

    default:
      for (var i = 0; i < w.length - 2; i++) {
        if (undef(w, i, 3, triples)) {
          score = score + 0;
        } else {
          score = score + triples[w[i]][w[i + 1]][w[i + 2]];
        }
      }
  }

  return score / w.length;
};