'use strict';

// There will be this many cards per team. (The actual number of human players per team could be a different number.)
const TEAM_SIZE = 10;

// The duration of the game will be somewhat random. It will also depend somewhat on the number of human players.
const MIN_DURATION = 35;
const MAX_DURATION = 55;

// Each card in the winning team will have a distinct bingo time, and we support even the extreme case of 1 human player per team
console.assert(MAX_DURATION >= MIN_DURATION + TEAM_SIZE);

const LOW_DENSITY = 17;
const HIGH_DENSITY = 20;

// Milliseconds
const WHEEL_SPIN_TIME = 10000;

// Spinning easing
const BEZIER_CURVE_PARAMETERS = [0, 0.8, 0.2, 1];
const EASING_FUNCTION = bezier(...BEZIER_CURVE_PARAMETERS);

class BingoItem {
  constructor() {
    this.title = null;
    this.imgSrc = null;
  }
}

const BINGO_ITEMS = Array(70).fill(null).map(a => new BingoItem());

class Cell {
  // r, c: row and column indices
  // card: the parent BingoCard instance
  constructor(r, c, card) {
    this.r = r;
    this.c = c;
    this.card = card;
    this.activationTime = null;
    this.item = null;
  }
  
  generateDOM(row) {
    let cellTD = row.insertCell();
    if (this.item == null) {
      let cellDiv = document.createElement("div");
      cellDiv.append("free");
      if (this.card.isTeamFemale) {
        cellDiv.classList.add("free-cell-female");
      } else {
        cellDiv.classList.add("free-cell-male");
      }
      cellTD.append(cellDiv);
    } else {
      cellTD.innerHTML = this.item.imgSrc;
    }
    cellTD.classList.add("bingo-card-cell");
  }
}

class BingoCard {
  // bingoTime: When this card should get a bingo
  // At the end of targetTime, this card will have density targetDensity (number of cells that have been activated including free space)
  // isTeamFemale: Whether this is a card on Team Girl
  // game: The parent BingoGame instance of which this card is a part
  //
  // At construction time, each cell in the card is filled with an activation time.
  // Later, using an item list, these activation times can be converted to items.
  constructor(bingoTime, targetTime, targetDensity, isTeamFemale, game) {
    
    // bingoTime 3 makes sense, but we don't support it
    console.assert(bingoTime >= 4);
    
    // If there are only 4 blank spaces on the board, then a bingo has happened
    console.assert(bingoTime <= BINGO_ITEMS.length - 5);
    
    // targetTime >= bingoTime makes sense, but we don't support it
    console.assert(targetTime < bingoTime);
    
    // Need to have time to put down all those tokens
    console.assert(targetDensity <= targetTime + 2);
    
    // Again, 21 tokens implies a bingo
    console.assert(targetDensity <= 20);
    
    // Need to have time AFTER targetTime to create the bingo
    console.assert(targetDensity + (bingoTime - targetTime) >= 6);
    
    // Need to have enough items to avoid going over targetDensity
    console.assert(25 - targetDensity <= BINGO_ITEMS.length - targetTime);
    
    this.bingoTime = bingoTime;
    this.targetTime = targetTime;
    this.targetDensity = targetDensity;
    this.isTeamFemale = isTeamFemale
    this.game = game;
    
    this.cells = [];
    for (let i = 0; i < 5; i++) {
      this.cells[i] = [];
      for (let j = 0; j < 5; j++) {
        this.cells[i][j] = new Cell(i, j, this);
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
    
    for (let i = 0; i < BINGO_ITEMS.length; i++) {
      if (i <= targetTime) earlyTimes.push(i);
      if (targetTime < i && i < bingoTime) middleTimes.push(i);
      if (bingoTime < i) lateTimes.push(i);
    }
    
    this.game.gen.shuffleArray(earlyTimes);
    this.game.gen.shuffleArray(middleTimes);
    this.game.gen.shuffleArray(lateTimes);
    
    // We need to make sure we have at least 4 postBingoTimes
    console.assert(lateTimes.length >= 4);
    let postBingoTimes = lateTimes.splice(0, 4);
    
    // We need to make sure that we have targetDensity - 1 many early times among the preBingoTimes (-1 because of the free space)
    console.assert(earlyTimes.length >= this.targetDensity - 1);
    let preBingoTimes = earlyTimes.slice(0, this.targetDensity - 1);
    
    // We will fill in the remaining times randomly from the middle and late times
    let remainingTimes = middleTimes.concat(lateTimes);
    this.game.gen.shuffleArray(remainingTimes);
    console.assert(preBingoTimes.length + postBingoTimes.length + remainingTimes.length >= 23);
    for (let i = 0; preBingoTimes.length + postBingoTimes.length < 23; i++) {
      console.assert(remainingTimes[i] != bingoTime);
      console.assert(i < remainingTimes.length);
      if (remainingTimes[i] < bingoTime) preBingoTimes.push(remainingTimes[i]);
      if (remainingTimes[i] > bingoTime) postBingoTimes.push(remainingTimes[i]);
    }
    
    this.game.gen.shuffleArray(preBingoTimes);
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
    this.game.gen.shuffleArray(mixedTimes);
    
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
        console.assert(t >= -1 && t <= BINGO_ITEMS.length - 1);
        timesSet.add(t);
        if (t <= this.targetTime) d++;
      }
    }
    console.assert(timesSet.size == 25);
    console.assert(d == this.targetDensity);
    
    let calculatedBingoTime = BINGO_ITEMS.length;
    for (let i = 0; i < this.allLines.length; i++) {
      calculatedBingoTime = Math.min(calculatedBingoTime, this.allLines[i].reduce((t, c) => Math.max(t, c.activationTime), -1));
    }
    console.assert(calculatedBingoTime == this.bingoTime);
    
    // Translate activation times into items
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.cells[i][j].activationTime >= 0) {
          this.cells[i][j].item = this.game.orderedItemList[this.cells[i][j].activationTime];
        } else {
          // Free cell
          this.cells[i][j].item = null;
        }
      }
    }
  }
  
  // Print to console (for convenience). TODO: Delme
  printActivationTimes(t) {
    for (let i = 0; i < 5; i++) {
      console.log(this.cells[i].map(cell => cell.activationTime).join("\t") + "\t\t\t" + this.cells[i].map(cell => cell.activationTime <= t ? "[x]" : "[ ]").join("\t"));
    }
  }
  
  // This method randomly chooses all the cells that will force the bingo to occur at the correct time.
  chooseBingoForcingCells() {
    // STEP 1: Choose a set of 5 "critical cells" such that every line intersects a critical cell.
    let criticalCells = [];
    
    // These are the *available* indices
    let rowIndexSet = new Set([0, 1, 2, 3, 4]);
    let colIndexArr = [0, 1, 3, 4];
    
    this.game.gen.shuffleArray(colIndexArr);
    
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
    this.game.gen.shuffleArray(colIndexArr); // size 2 array
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
    let winningCellIndex = this.game.gen.randomInt(5);
    this.winningCell = criticalCells.splice(winningCellIndex, 1)[0];
    this.forceLateCells = criticalCells;
    let forceLateCellSet = new Set(this.forceLateCells);
    
    let candidateLines = this.allLines.filter(l => l.filter(cell => cell == this.winningCell).length == 1 && l.filter(cell => forceLateCellSet.has(cell)).length == 0);
    console.assert(candidateLines.length == 2 || candidateLines.length == 3);
    this.winningLine = candidateLines[this.game.gen.randomInt(candidateLines.length)];
  }
  
  generateDOM(containerElement) {
    let outerDiv = document.createElement("div");
    outerDiv.classList.add(this.isTeamFemale ? "bingo-card-girl" : "bingo-card-boy");
    containerElement.append(outerDiv);
    
    let tbl = document.createElement("table");
    outerDiv.appendChild(tbl);
    
    let genderText = this.isTeamFemale ? "Girl" : "Boy";
    
    // Team header
    let teamHeader = tbl.insertRow().insertCell();
    teamHeader.append("Team " + genderText);
    teamHeader.classList.add("bingo-card-team-header");
    teamHeader.colSpan = "5";
    
    // Cells
    for (let i = 0; i < 5; i++) {
      let row = tbl.insertRow();
      for (let j = 0; j < 5; j++) {
        this.cells[i][j].generateDOM(row);
      }
    }
    
    // Explanation at bottom
    let footer = tbl.insertRow().insertCell();
    
    let footerLineOne = document.createElement("p");
    let footerOpener = document.createElement("strong");
    footerOpener.append("The game is rigged.");
    footerLineOne.append(footerOpener, " The winning team was determined in advance by a computer system.");
    
    let footerLineTwo = document.createElement("p");
    let footerTeamName = document.createElement("strong");
    footerTeamName.append("TEAM ", genderText.toUpperCase());
    footerLineTwo.append("You are on ", footerTeamName, ". If someone from your team wins, it means the baby is a ", genderText.toLowerCase(), ".");
    
    let footerLineThree = document.createElement("p");
    footerLineThree.append("If you win, you are encouraged to shout, \"BINGO! IT'S A ", genderText.toUpperCase(), "!\"");
    
    footer.append(footerLineOne, footerLineTwo, footerLineThree);
    footer.classList.add("bingo-card-footer");
    footer.colSpan = "5";
  }
}

class BingoGame {
  // winnerFemale: a bit indicating whether the winning team should be the female team
  // gen: the PRG used to generate this game
  constructor(winnerFemale, gen) {
    this.winnerFemale = winnerFemale;
    this.gen = gen;
    
    // Just which card comes first in the print order
    this.firstCardFemale = this.gen.randomInt(2);
    
    this.orderedItemList = BINGO_ITEMS.slice();
    this.gen.shuffleArray(this.orderedItemList);
    
    this.firstBingoTime = MIN_DURATION - 1 + this.gen.randomInt(MAX_DURATION - MIN_DURATION - TEAM_SIZE + 1);
    this.announcedItemList = this.orderedItemList.slice(0, this.firstBingoTime + TEAM_SIZE);
    this.wheelItemList = BINGO_ITEMS.slice();
    this.gen.shuffleArray(this.wheelItemList);
    
    this.cardsByGender = [];
    this.cardsByGender[0] = [];
    this.cardsByGender[1] = [];
    
    for (let i = 0; i < 2 * TEAM_SIZE; i++) {
      // The density is partially random, but also it tends to be slightly higher for people who are getting an earlier bingo
      const DENSITY_RANGE = HIGH_DENSITY - LOW_DENSITY;
      const minDensity = LOW_DENSITY + Math.floor(DENSITY_RANGE * (0.5 - (i + 1) / (4 * TEAM_SIZE)));
      const targetDensity = minDensity + this.gen.randomInt(HIGH_DENSITY - minDensity + 1);
      const gender = i < TEAM_SIZE ? this.winnerFemale : 1 - this.winnerFemale;
      
      this.cardsByGender[gender].push(new BingoCard(this.firstBingoTime + i, this.firstBingoTime - 1, targetDensity, gender, this));
    }
    
    this.gen.shuffleArray(this.cardsByGender[0]);
    this.gen.shuffleArray(this.cardsByGender[1]);
    
    for (let g = 0; g < 2; g++) {
      for (let i = 0; i < this.cardsByGender[g].length; i++) {
        console.log("Gender: ", g);
        this.cardsByGender[g][i].printActivationTimes(this.firstBingoTime);
        console.log("----");
      }
    }
  }
  
  async generateDOM(cardContainer, wordListContainer, wheelContainer) {
    // Fetch item images
    const response = await fetch("items.json");
    const itemData = await response.json();
    for (let i = 0; i < BINGO_ITEMS.length; i++) {
      BINGO_ITEMS[i].title = itemData[i]["title"];
      BINGO_ITEMS[i].imgSrc = itemData[i]["img"];
    }
        
    // Generate cards
    for (let i = 0; i < TEAM_SIZE; i++) {
      this.cardsByGender[this.firstCardFemale][i].generateDOM(cardContainer);
      this.cardsByGender[1 - this.firstCardFemale][i].generateDOM(cardContainer);
    }
    
    // Generate word list
    const ol = document.createElement("ol");
    wordListContainer.append(ol);
    for (let i = 0; i < this.announcedItemList.length; i++) {
      let li = document.createElement("li");
      li.append(this.announcedItemList[i].title);
      ol.append(li);
    }
    
    // Generate wheel
    this.wheel = new Wheel(this, wheelContainer);
  }
}

class Wheel {
  constructor(game, wheelContainer) {
    this.game = game;
    this.wheelContainer = wheelContainer;
    
    this.wheelDiv = document.createElement("div");
    this.wheelDiv.classList.add("wheel");
    this.wheelContainer.insertBefore(this.wheelDiv, this.wheelContainer.firstChild);
    
    this.wheelFrame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.wheelFrame.classList.add("wheel-frame");
    this.wheelDiv.append(this.wheelFrame);
    
    this.wedges = [];
    this.activeWedge = null;
    
    this.animation = null;
    this.initialRotation = 0;
    this.targetRotation = 0;
    
    for (let i = 0; i < this.game.wheelItemList.length; i++) {
      this.wedges.push(new WheelWedge(this, this.game.wheelItemList[i]));
    }
    
    this.render();
  }
  
  render() {
    const WEDGE_ARC_LENGTH = 150;
    const diameter = WEDGE_ARC_LENGTH * this.wedges.length / Math.PI;
    this.radius = diameter / 2;
    const boxSideLength = diameter + 70;
    this.wheelDiv.style.width = boxSideLength + "px";
    this.wheelDiv.style.height = boxSideLength + "px";
    this.wheelDiv.style.left = "calc(50vw - " + boxSideLength/2 + "px)";
    
    this.wheelFrame.setAttribute("viewBox", "0 0 " + boxSideLength + " " + boxSideLength);
    
    for (let i = 0; i < this.wedges.length; i++) {
      // In radians
      const iconRotationAngle = (i / this.wedges.length) * 2 * Math.PI;
      this.wedges[i].icon.style.transform = "rotate(" + iconRotationAngle + "rad) translateY(-" + (this.radius - 70) + "px)";
      
      const iconLocationAngle = Math.PI / 2 - iconRotationAngle;
      const wedgeStartAngle = iconLocationAngle - Math.PI / this.wedges.length;
      const wedgeEndAngle = iconLocationAngle + Math.PI / this.wedges.length;
      
      let x1 = boxSideLength/2 + this.radius * Math.cos(wedgeStartAngle);
      let y1 = boxSideLength/2 - this.radius * Math.sin(wedgeStartAngle);
      let x2 = boxSideLength/2 + this.radius * Math.cos(wedgeEndAngle);
      let y2 = boxSideLength/2 - this.radius * Math.sin(wedgeEndAngle);
      this.wedges[i].wedgeFrame.setAttribute("d", "M " + boxSideLength/2 + " " + boxSideLength/2 + " L " + x1 + " " + y1 + " A " + this.radius + " " + this.radius + " 0 0 0 " + x2 + " " + y2 + " Z");
    }
  }
  
  getCurrentRotation() {
    if (this.animation == null) return this.targetRotation;
    return this.initialRotation + (this.targetRotation - this.initialRotation) * EASING_FUNCTION(this.animation.currentTime / WHEEL_SPIN_TIME);
  }
  
  spinTo(r) {
    this.initialRotation = this.getCurrentRotation();
    
    // At least one full spin
    this.targetRotation = r + 2 * Math.PI * Math.ceil((this.initialRotation + 2 * Math.PI - r) / (2 * Math.PI));
    
    if (this.animation != null) {
      this.animation.cancel();
      window.cancelAnimationFrame(this.animationRequest);
    }
    
    this.animation = this.wheelDiv.animate([
      { transform: "rotate(" + this.initialRotation + "rad)" },
      { transform: "rotate(" + this.targetRotation + "rad)" }
    ], {
      duration: WHEEL_SPIN_TIME,
      easing: "cubic-bezier(" + BEZIER_CURVE_PARAMETERS.join() + ")",
      fill: "forwards"
    });
    
    this.animationRequest = window.requestAnimationFrame(this.updateActiveWedge.bind(this));
  }
  
  updateActiveWedge(timestamp) {
    const r = this.getCurrentRotation();
    
    let i = nonNegativeMod(Math.round(-r * this.wedges.length / (2 * Math.PI)), this.wedges.length);
    if (this.activeWedge != this.wedges[i]) {
      if (this.activeWedge != null) this.activeWedge.wedgeFrame.classList.remove("active");
      this.activeWedge = this.wedges[i];
      this.activeWedge.wedgeFrame.classList.add("active");
    }
    
    if (this.animation.currentTime < WHEEL_SPIN_TIME) window.requestAnimationFrame(this.updateActiveWedge.bind(this));
  }
}

class WheelWedge {
  constructor(wheel, item) {
    this.wheel = wheel;
    this.item = item;
    
    this.icon = document.createElement("div");
    this.icon.classList.add("wheel-icon");
    this.icon.innerHTML = item.imgSrc;
    this.wheel.wheelDiv.append(this.icon);
    
    this.wedgeFrame = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.wedgeFrame.classList.add("wedge-frame");
    this.wheel.wheelFrame.append(this.wedgeFrame);
  }
}

function nonNegativeMod(a, b) {
  return ((a % b) + b) % b;
}
