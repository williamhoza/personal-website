'use strict';

// The number of items available to go in the cells of the Bingo cards.
const NUM_BINGO_ITEMS = 70;

// There will be this many cards per team. (The actual number of human players per team could be a different number.)
const TEAM_SIZE = 10;

// The duration of the game will be somewhat random. It will also depend somewhat on the number of human players.
const MIN_DURATION = 35;
const MAX_DURATION = 50;

// Each card in the winning team will have a distinct bingo time, and we support even the extreme case of 1 human player per team
console.assert(MAX_DURATION >= MIN_DURATION + TEAM_SIZE);

class Cell {
  constructor(r, c) {
    this.r = r;
    this.c = c;
    this.activationTime = null;
  }
}

class BingoCard {
  // bingoTime: When this card should get a bingo
  // At the end of targetTime, this card will have density targetDensity (number of cells that have been activated including free space)
  // gen: The PRG used to generate this card
  //
  // At construction time, each cell in the card is filled with an activation time.
  // Later, using an item list, these activation times can be converted to items.
  constructor(bingoTime, targetTime, targetDensity, gen) {
    
    // bingoTime 3 makes sense, but we don't support it
    console.assert(bingoTime >= 4);
    
    // If there are only 4 blank spaces on the board, then a bingo has happened
    console.assert(bingoTime <= NUM_BINGO_ITEMS - 5);
    
    // targetTime >= bingoTime makes sense, but we don't support it
    console.assert(targetTime < bingoTime);
    
    // Need to have time to put down all those tokens
    console.assert(targetDensity <= targetTime + 2);
    
    // Again, 21 tokens implies a bingo
    console.assert(targetDensity <= 20);
    
    // Need to have time AFTER targetTime to create the bingo
    console.assert(targetDensity + (bingoTime - targetTime) >= 6);
    
    // Need to have enough items to avoid going over targetDensity
    console.assert(25 - targetDensity <= NUM_BINGO_ITEMS - targetTime);
    
    this.bingoTime = bingoTime;
    this.targetTime = targetTime;
    this.targetDensity = targetDensity;
    this.gen = gen;
    
    this.cells = [];
    for (let i = 0; i < 5; i++) {
      this.cells[i] = [];
      for (let j = 0; j < 5; j++) {
        this.cells[i][j] = new Cell(i, j);
      }
    }
    
    this.allLines = [];
    
    // Diagonals
    this.allLines.push([0, 1, 2, 3, 4].map(i => this.cells[i][i]));
    this.allLines.push([0, 1, 2, 3, 4].map(i => this.cells[i][4 - i]));
    
    for (let i = 0; i < 5; i++) {
      // Horizontals
      this.allLines.push([0, 1, 2, 3, 4].map(j => this.cells[i][j]));
      
      // Verticals
      this.allLines.push([0, 1, 2, 3, 4].map(j => this.cells[j][i]));
    }
    
    console.assert(this.allLines.length == 12);
    
    this.chooseBingoForcingCells();
    
    // Free space
    this.cells[2][2].activationTime = -1;
    
    // Winning cell
    this.winningCell.activationTime = this.bingoTime;
    
    let earlyTimes = [];
    let middleTimes = [];
    let lateTimes = [];
    
    for (let i = 0; i < NUM_BINGO_ITEMS; i++) {
      if (i <= targetTime) earlyTimes.push(i);
      if (targetTime < i && i < bingoTime) middleTimes.push(i);
      if (bingoTime < i) lateTimes.push(i);
    }
    
    this.gen.shuffleArray(earlyTimes);
    this.gen.shuffleArray(middleTimes);
    this.gen.shuffleArray(lateTimes);
    
    // We need to make sure we have at least 4 postBingoTimes
    console.assert(lateTimes.length >= 4);
    let postBingoTimes = lateTimes.splice(0, 4);
    
    // We need to make sure that we have targetDensity - 1 many early times among the preBingoTimes (-1 because of the free space)
    console.assert(earlyTimes.length >= this.targetDensity - 1);
    let preBingoTimes = earlyTimes.slice(0, this.targetDensity - 1);
    
    // We will fill in the remaining times randomly from the middle and late times
    let remainingTimes = middleTimes.concat(lateTimes);
    this.gen.shuffleArray(remainingTimes);
    console.assert(preBingoTimes.length + postBingoTimes.length + remainingTimes.length >= 23);
    for (let i = 0; preBingoTimes.length + postBingoTimes.length < 23; i++) {
      console.assert(remainingTimes[i] != bingoTime);
      console.assert(i < remainingTimes.length);
      if (remainingTimes[i] < bingoTime) preBingoTimes.push(remainingTimes[i]);
      if (remainingTimes[i] > bingoTime) postBingoTimes.push(remainingTimes[i]);
    }
    
    this.gen.shuffleArray(preBingoTimes);
    console.assert(preBingoTimes.length + postBingoTimes.length == 23);
    
    // Winning line
    for (let i = 0; i < this.winningLine.length; i++) {
      if (this.winningLine[i] != this.winningCell && this.winningLine[i] != this.cells[2][2]) {
        console.assert(preBingoTimes.length > 0);
        this.winningLine[i].activationTime = preBingoTimes.pop();
      }
    }
    
    // Force-late cells
    for (let i = 0; i < this.forceLateCells.length; i++) {
      this.forceLateCells[i].activationTime = postBingoTimes.pop();
    }
    
    // All remaining cells
    let mixedTimes = preBingoTimes.concat(postBingoTimes);
    this.gen.shuffleArray(mixedTimes);
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.cells[i][j].activationTime == null) this.cells[i][j].activationTime = mixedTimes.pop();
      }
    }
    
    console.assert(mixedTimes.length == 0);
    
    // Double check that everything looks okay
    let timesSet = new Set();
    let d = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let t = this.cells[i][j].activationTime;
        console.assert(t != null);
        console.assert(t >= -1 && t <= NUM_BINGO_ITEMS - 1);
        timesSet.add(t);
        if (t <= this.targetTime) d++;
      }
    }
    console.assert(timesSet.size == 25);
    console.assert(d == this.targetDensity);
    
    let calculatedBingoTime = NUM_BINGO_ITEMS;
    for (let i = 0; i < this.allLines.length; i++) {
      calculatedBingoTime = Math.min(calculatedBingoTime, this.allLines[i].reduce((t, c) => Math.max(t, c.activationTime), -1));
    }
    console.assert(calculatedBingoTime == this.bingoTime);
    
    // Print to console (for convenience)
    for (let i = 0; i < 5; i++) {
      console.log(this.cells[i].map(cell => cell.activationTime).join("\t"));
    }
    
    console.log("---");
    
    for (let i = 0; i < 5; i++) {
      console.log(this.cells[i].map(cell => cell.activationTime <= this.targetTime ? "[x]" : "[ ]").join("\t"));
    }
  }
  
  // This method randomly chooses all the cells that will force the bingo to occur at the correct time.
  chooseBingoForcingCells() {
    // STEP 1: Choose a set of 5 "critical cells" such that every line intersects a critical cell.
    let criticalCells = [];
    
    // These are the *available* indices
    let rowIndexSet = new Set([0, 1, 2, 3, 4]);
    let colIndexArr = [0, 1, 3, 4];
    
    this.gen.shuffleArray(colIndexArr);
    
    // First, satisfy the NW diagonal
    let nwColIndex = colIndexArr.pop(); // 4 possibilities
    criticalCells.push(this.cells[nwColIndex][nwColIndex]);
    rowIndexSet.delete(nwColIndex);
    
    // Next, satisfy the NE diagonal
    let neColIndex = colIndexArr.filter(a => a != 4 - nwColIndex).pop(); // 2 possibilities
    criticalCells.push(this.cells[4 - neColIndex][neColIndex]);
    colIndexArr = colIndexArr.filter(a => a != neColIndex);
    rowIndexSet.delete(4 - neColIndex);
    
    // Third, satisfy the middle row
    let r2ColIndex = colIndexArr.pop(); // 2 possibilities
    criticalCells.push(this.cells[2][r2ColIndex]);
    rowIndexSet.delete(2);
    
    // Finally, satisfy the remaining two rows
    colIndexArr.push(2);
    this.gen.shuffleArray(colIndexArr); // size 2 array
    for (const ri of rowIndexSet.values()) {
      criticalCells.push(this.cells[ri][colIndexArr.pop()]);
    }
    
    // Double check that it worked
    console.assert(criticalCells.length == 5);
    let criticalCellSet = new Set(criticalCells);
    console.assert(criticalCellSet.size == 5);
    for (let i = 0; i < this.allLines.length; i++) {
      console.assert(this.allLines[i].filter(cell => criticalCellSet.has(cell)).length >= 1);
    }
    for (let i = 0; i < criticalCells.length; i++) {
      console.assert(criticalCells[i] != this.cells[2][2]);
    }
    
    // STEP 2: Select winning cell and winning line
    let winningCellIndex = this.gen.randomInt(5);
    this.winningCell = criticalCells.splice(winningCellIndex, 1)[0];
    this.forceLateCells = criticalCells;
    let forceLateCellSet = new Set(this.forceLateCells);
    
    let candidateLines = this.allLines.filter(l => l.filter(cell => cell == this.winningCell).length == 1 && l.filter(cell => forceLateCellSet.has(cell)).length == 0);
    console.assert(candidateLines.length == 2 || candidateLines.length == 3);
    this.winningLine = candidateLines[this.gen.randomInt(candidateLines.length)];
  }
}
