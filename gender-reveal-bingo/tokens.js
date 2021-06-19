'use strict';

// An instance of this class is a polynomial over GF(2).
class GF2Poly {
  // coeffs is an array of coefficients, starting with the constant term.
  constructor(coeffs) {
    
    // We consider the constant zero polynomial to have degree -1 (rather than -infinity, which is arguably more natural). That way, it makes sense to store degree + 1 many coefficients
    this.degree = -1;
    for (let i = 0; i < coeffs.length; i++) {
      if (coeffs[i] == 1) this.degree = i;
    }
    
    // Remove unnecessary trailing zeroes
    this.coeffs = coeffs.slice(0, this.degree + 1);
  }
  
  static fromInt(n) {
    let coeffs = [];
    for (let i = 0; n >> i != 0; i++) {
      console.assert(i < 1000); // I don't expect to be dealing with big fields, so if n is big it probably means there's a bug
      coeffs[i] = (n >> i) & 1;
    }
    return new GF2Poly(coeffs);
  }
  
  coeff(i) {
    return i < this.coeffs.length ? this.coeffs[i] : 0;
  }
  
  // Returns this + y (a new GF2Poly)
  add(y) {
    let z = [];
    for (let i = 0; i <= Math.max(this.degree, y.degree); i++) {
      z[i] = this.coeff(i) ^ y.coeff(i);
    }
    return new GF2Poly(z);
  }
  
  // Returns this * t^n
  shift(n) {
    return new GF2Poly(Array(n).fill(0).concat(this.coeffs));
  }
  
  // Integer representation of this polynomial
  toInt() {
    let n = 0;
    for (let i = 0; i < this.coeffs.length; i++) {
      n = n + this.coeff(i) * (1 << i);
    }
    return n;
  }
  
  // y should be a GF2Poly
  equals(y) {
    if (this.degree != y.degree) return false;
    for (let i = 0; i < this.coeffs.length; i++) {
      if (this.coeff(i) != y.coeff(i)) return false;
    }
    return true;
  }
}

// An instant of this class is a field GF(2^n)
class GF2Extension {
  // irreducible is an irreducible GF2Poly.
  constructor(irreducible) {
    this.irreducible = irreducible;
    this.degree = this.irreducible.degree;
    this.size = Math.pow(2, this.degree);
  }
  
  // x is a GF2Poly; the return value is the corresponding field element (we reduce mod the irreducible)
  reduce(x) {
    if (x.degree < this.degree) {
      return x;
    } else {
      return this.reduce(x.add(this.irreducible.shift(x.degree - this.degree)));
    }
  }
  
  // x and y are field elements, represented by GF2Polys
  product(x, y) {
    let z = new GF2Poly([]);
    for (let i = 0; i < x.coeffs.length; i++) {
      if (x.coeff(i) == 1) {
        z = z.add(y.shift(i));
      }
    }
    return this.reduce(z);
  }
  
  // x is a nonzero field element, represented by a GF2Poly
  inverse(x) {
    // The inverse of x is given by x^{2^d - 2} where d is the degree of the field extension
    // Note 2^d - 2 = 2^1 + 2^2 + ... + 2^{d - 1}
    console.assert(x.degree >= 0);
    let ret = new GF2Poly([1]);
    let currentPower = x;
    for (let i = 0; i < this.degree - 1; i++) {
      currentPower = this.product(currentPower, currentPower);
      ret = this.product(ret, currentPower);
    }
    return ret;
  }
}

const FIELD = new GF2Extension(new GF2Poly([1, 1, 0, 0, 0, 0, 1])); // t^6 + t + 1 is irreducible over GF(2)
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:_"; // One character represents one field element. We use : and _ because they don't interrupt double-click selection (hopefully)
console.assert(ALPHABET.length == FIELD.size);

const SEED_LENGTH = 128; // Number of random bits included in each token

const RS_MESSAGE_LENGTH = Math.ceil((SEED_LENGTH + 1) / FIELD.degree); // We use Reed-Solomon error correcting codes
const RS_REDUNDANCY = 6;
const RS_CODEWORD_LENGTH = RS_MESSAGE_LENGTH + RS_REDUNDANCY;
console.assert(RS_CODEWORD_LENGTH + 1 <= FIELD.size); // Required for our specific RS code (one output of low-degree poly is deliberately excluded from the codeword)

// "data": an object with data["isFemale"] (a bit) and data["seed"] (an array of bits of length SEED_LENGTH)
// "token": an encoding of the data into a 25-symbol string, where each symbol comes from a 64-symbol alphabet. The encoding is designed so that (a) the gender is obfuscated, and (b) error detection is possible.

function dataToToken(data) {
  console.assert(data["seed"].length == SEED_LENGTH);
  let bits = data["seed"].concat([data["isFemale"]]);
  
  // Encode sequence of bits as sequence of field elements
  let message = [];
  for (let i = 0; i < RS_MESSAGE_LENGTH; i++) {
    message[i] = new GF2Poly(bits.slice(i * FIELD.degree, (i + 1) * FIELD.degree));
  }
  
  // Encode message using a specific Reed-Solomon code
  let codeword = RSEncode(message);
  
  // Encode codeword as string
  let token = "";
  for (let i = 0; i < codeword.length; i++) {
    token += intToChar(codeword[i].toInt());
  }
  
  return token;
}

function intToChar(n) {
  console.assert(n < ALPHABET.length);
  return ALPHABET[n];
}

function charToInt(c) {
  let ret = ALPHABET.indexOf(c);
  console.assert(ret != -1);
  return ret;
}

// Generates a token for data with a random seed
function generateToken(isFemale) {
  let data = {};
  data["isFemale"] = isFemale;
  data["seed"] = [];
  for (let i = 0; i < SEED_LENGTH; i++) {
    data["seed"][i] = Math.floor(Math.random() * 2);
  }
  return dataToToken(data);
}

// Recover data from token. Throws an exception if the token is invalid
function tokenToData(token) {
  if (token.length != RS_CODEWORD_LENGTH) throw new Error("Invalid token (bad length)");
  let codeword = [];
  for (let i = 0; i < RS_CODEWORD_LENGTH; i++) {
    let n = charToInt(token[i]);
    if (n == -1) throw new Error("Invalid token (unknown character)");
    codeword[i] = GF2Poly.fromInt(n);
  }

  let message = RSDecode(codeword);
  if (message == null) throw new Error("Invalid token (failed RS error detection)");
  
  // Convert to bit array
  let bits = [];
  for (let i = 0; i < message.length; i++) {
    for (let j = 0; j < FIELD.degree; j++) {
      bits[i * FIELD.degree + j] = message[i].coeff(j);
    }
  }
  
  return {
    "seed": bits.slice(0, SEED_LENGTH),
    "isFemale": bits[SEED_LENGTH]
  };
}

// Input: An array of instances of GF2Poly of length RS_MESSAGE_LENGTH
// Output: A longer array of instances of GF2Poly (the codeword). The codeword consists of all but the last symbol in the message, followed by RS_REDUNDANCY + 1 many new symbols. The last symbol of the message (which encodes the gender) is therefore "obfuscated". E.g., recovering the last symbol of the message requires querying message.length many symbols from the codeword.
function RSEncode(message) {
  console.assert(message.length == RS_MESSAGE_LENGTH);
  
  let givenEvalPoints = [];
  let extrapEvalPoints = [];
  for (let i = 0; i < RS_MESSAGE_LENGTH; i++) {
    givenEvalPoints[i] = GF2Poly.fromInt(i);
  }
  for (let i = 0; i < RS_REDUNDANCY + 1; i++) {
    extrapEvalPoints[i] = GF2Poly.fromInt(RS_MESSAGE_LENGTH + i);
  }
  
  let extrapValues = lagrangeInterpolate(givenEvalPoints, message, extrapEvalPoints);
  return message.slice(0, message.length - 1).concat(extrapValues);
}

// Inverts RSEncode. Does NOT perform error correction, only error detection. Returns null given a non-codeword.
function RSDecode(codeword) {
  console.assert(codeword.length == RS_CODEWORD_LENGTH);
  
  let givenEvalPoints = [];
  let extrapEvalPoints = [];
  for (let i = 0; i < RS_MESSAGE_LENGTH - 1; i++) {
    givenEvalPoints[i] = GF2Poly.fromInt(i);
  }
  givenEvalPoints[RS_MESSAGE_LENGTH - 1] = GF2Poly.fromInt(RS_MESSAGE_LENGTH);
  
  extrapEvalPoints[0] = GF2Poly.fromInt(RS_MESSAGE_LENGTH - 1);
  
  for (let i = 0; i < RS_REDUNDANCY; i++) {
    extrapEvalPoints[i + 1] = GF2Poly.fromInt(RS_MESSAGE_LENGTH + i + 1);
  }
  
  let extrapValues = lagrangeInterpolate(givenEvalPoints, codeword.slice(0, RS_MESSAGE_LENGTH), extrapEvalPoints);
  
  // Verify valid codeword
  for (let i = 0; i < RS_REDUNDANCY; i++) {
    if (!extrapValues[i + 1].equals(codeword[RS_MESSAGE_LENGTH + i])) return null;
  }
  
  // Recover last symbol of message
  return codeword.slice(0, RS_MESSAGE_LENGTH - 1).concat([extrapValues[0]]);
}

// givenEvalPoints: an array of field elements, say of length L
// givenValues: an array of field elements, also of length L
// extrapEvalPoints: an array of field elements
// Outputs the array extrapValues such that for all i, extrapValues[i] == p(extrapEvalPoints[i]), where p is some degree-(L - 1) polynomial such that for all i, givenValues[i] == p(givenEvalPoints[i])
function lagrangeInterpolate(givenEvalPoints, givenValues, extrapEvalPoints) {
  console.assert(givenEvalPoints.length == givenValues.length);
  
  // The polynomial p is given by
  // p(x) = sum_i givenValues[i] * prod_{j \neq i} (x - givenEvalPoints[j]) / (givenEvalPoints[i] - givenEvalPoints[j])
  // We therefore define multiplier[i] = givenValues[i] * prod_{j \neq i} 1 / (givenEvalPoints[i] - givenEvalPoints[j])
  let multipliers = [];
  for (let i = 0; i < givenEvalPoints.length; i++) {
    multipliers[i] = givenValues[i];
    for (let j = 0; j < givenEvalPoints.length; j++) {
      if (j != i) {
        multipliers[i] = FIELD.product(multipliers[i], FIELD.inverse(givenEvalPoints[i].add(givenEvalPoints[j])));
      }
    }
  }
  
  // Now we are prepared to evaluate p at each extrapolation point
  let extrapValues = []
  for (let k = 0; k < extrapEvalPoints.length; k++) {
    // We wish to set extrapValues[k] = p(extapEvalPoints[k])
    extrapValues[k] = new GF2Poly([]);
    for (let i = 0; i < givenEvalPoints.length; i++) {
      let summand = multipliers[i];
      for (let j = 0; j < givenEvalPoints.length; j++) {
        if (j != i) {
          summand = FIELD.product(summand, extrapEvalPoints[k].add(givenEvalPoints[j]));
        }
      }
      extrapValues[k] = extrapValues[k].add(summand);
    }
  }
  
  return extrapValues;
}



