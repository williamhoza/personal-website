'use strict';

// There will be this many cards per team. (The actual number of human players per team could be a different number.)
const TEAM_SIZE = 10;

const NUM_BINGO_ITEMS = 70;

// The duration of the game will be somewhat random. It will also depend somewhat on the number of human players.
const MIN_DURATION = 35;
const MAX_DURATION = 50;

// Each card in the winning team will have a distinct bingo time, and we support even the extreme case of 1 human player per team
eAssert(MAX_DURATION >= MIN_DURATION + TEAM_SIZE);

// We need enough "late" items to force the bingo timing
eAssert(MAX_DURATION + TEAM_SIZE + 10 <= NUM_BINGO_ITEMS);

const LOW_DENSITY = 17;
const HIGH_DENSITY = 20;

// Milliseconds
const WHEEL_SPIN_TIME = 10000;

// Spinning easing
const EASING_FUNCTION = "cubic-bezier(0, 0.8, 0.2, 1)";

// Milliseconds
const INDEFINITE_SPIN_DURATION = NUM_BINGO_ITEMS * 1200;

class BingoItem {
  constructor(game) {
    this.game = game;
    this.title = null;
    this.imgSrc = null;
    
    const a = game.gen.randomFloat();
    const b = Math.pow(a, 3);
    const c = Math.pow(1 - a, 3);
    
    // A random number from 0.03 to 0.97, where the edges are more likely
    this.spinLocation = 0.03 + 0.94 * b / (b + c);
  }
}

class Cell {
  // r, c: row and column indices
  // card: the parent BingoCard instance
  constructor(r, c, card) {
    this.r = r;
    this.c = c;
    this.card = card;
    this.activationTime = null;
    this.item = null;
    this.marked = false;
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
  // Times at or above the safetyThreshold with parity isTeamFemale are used for force-late cells
  // game: The parent BingoGame instance of which this card is a part
  constructor(bingoTime, targetTime, targetDensity, isTeamFemale, safetyThreshold, game) {
    
    // bingoTime 3 makes sense, but we don't support it
    eAssert(bingoTime >= 4);
    
    // If there are only 4 blank spaces on the board, then a bingo has happened
    eAssert(bingoTime <= NUM_BINGO_ITEMS - 5);
    
    // targetTime >= bingoTime makes sense, but we don't support it
    eAssert(targetTime < bingoTime);
    
    // Need to have time to put down all those tokens
    eAssert(targetDensity <= targetTime + 2);
    
    // Again, 21 tokens implies a bingo
    eAssert(targetDensity <= 20);
    
    // Need to have time AFTER targetTime to create the bingo
    eAssert(targetDensity + (bingoTime - targetTime) >= 6);
    
    // Need to have enough items to avoid going over targetDensity
    eAssert(25 - targetDensity <= NUM_BINGO_ITEMS - targetTime);
    
    eAssert(safetyThreshold > bingoTime);
    eAssert(Math.floor((NUM_BINGO_ITEMS - safetyThreshold) / 2) >= 4);
    
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
    
    eAssert(this.allLines.length == 12);
    
    this.chooseBingoForcingCells();
    
    // Free space
    this.cells[2][2].activationTime = -1;
    
    // Winning cell
    this.winningCell.activationTime = this.bingoTime;
    
    let earlyTimes = [];
    let middleTimes = [];
    let lateSafeTimes = [];
    let lateDangerousTimes = [];
    
    for (let i = 0; i < NUM_BINGO_ITEMS; i++) {
      if (i <= targetTime) earlyTimes.push(i);
      if (targetTime < i && i < bingoTime) middleTimes.push(i);
      if (bingoTime < i) {
        if (i >= safetyThreshold && i % 2 == this.isTeamFemale) {
          lateSafeTimes.push(i);
        } else {
          lateDangerousTimes.push(i);
        }
      }
    }
    
    this.game.gen.shuffleArray(earlyTimes);
    this.game.gen.shuffleArray(middleTimes);
    this.game.gen.shuffleArray(lateSafeTimes);
    // No need to shuffle late dangerous times because they'll get shuffled later anyway
    
    // We need to make sure we have at least 4 postBingoTimes
    eAssert(lateSafeTimes.length >= 4);
    let postBingoTimes = lateSafeTimes.splice(0, 4);
    
    // We need to make sure that we have targetDensity - 1 many early times among the preBingoTimes (-1 because of the free space)
    eAssert(earlyTimes.length >= this.targetDensity - 1);
    let preBingoTimes = earlyTimes.slice(0, this.targetDensity - 1);
    
    // We will fill in the remaining times randomly from the middle and late times
    let remainingTimes = middleTimes.concat(lateSafeTimes).concat(lateDangerousTimes);
    this.game.gen.shuffleArray(remainingTimes);
    eAssert(preBingoTimes.length + postBingoTimes.length + remainingTimes.length >= 23);
    for (let i = 0; preBingoTimes.length + postBingoTimes.length < 23; i++) {
      eAssert(remainingTimes[i] != bingoTime);
      eAssert(i < remainingTimes.length);
      if (remainingTimes[i] < bingoTime) preBingoTimes.push(remainingTimes[i]);
      if (remainingTimes[i] > bingoTime) postBingoTimes.push(remainingTimes[i]);
    }
    
    this.game.gen.shuffleArray(preBingoTimes);
    postBingoTimes.reverse(); // The safe times are now at the end, available for popping
    eAssert(preBingoTimes.length + postBingoTimes.length == 23);
    
    // Winning line
    for (let i = 0; i < this.winningLine.length; i++) {
      if (this.winningLine[i] != this.winningCell && this.winningLine[i] != this.cells[2][2]) {
        eAssert(preBingoTimes.length > 0);
        this.winningLine[i].activationTime = preBingoTimes.pop();
      }
    }
    
    // Force-late cells
    for (let i = 0; i < this.forceLateCells.length; i++) {
      const t = postBingoTimes.pop();
      this.forceLateCells[i].activationTime = t;
      eAssert(t > bingoTime);
      eAssert(t >= safetyThreshold && t % 2 == this.isTeamFemale);
    }
    
    // All remaining cells
    let mixedTimes = preBingoTimes.concat(postBingoTimes);
    this.game.gen.shuffleArray(mixedTimes);
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.cells[i][j].activationTime == null) this.cells[i][j].activationTime = mixedTimes.pop();
      }
    }
    
    eAssert(mixedTimes.length == 0);
    
    // Double check that everything looks okay
    let timesSet = new Set();
    let d = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let t = this.cells[i][j].activationTime;
        eAssert(t != null);
        eAssert(t >= -1 && t <= NUM_BINGO_ITEMS - 1);
        timesSet.add(t);
        if (t <= this.targetTime) d++;
      }
    }
    eAssert(timesSet.size == 25);
    eAssert(d == this.targetDensity);
    
    let calculatedBingoTime = NUM_BINGO_ITEMS;
    for (let i = 0; i < this.allLines.length; i++) {
      calculatedBingoTime = Math.min(calculatedBingoTime, this.allLines[i].reduce((t, c) => Math.max(t, c.activationTime), -1));
    }
    eAssert(calculatedBingoTime == this.bingoTime);
    
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
  
  // Sets marked = true on any cell with that item
  mark(item) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.cells[i][j].item == item) this.cells[i][j].marked = true;
      }
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
    eAssert(criticalCells.length == 5);
    let criticalCellSet = new Set(criticalCells);
    eAssert(criticalCellSet.size == 5);
    for (let i = 0; i < this.allLines.length; i++) {
      eAssert(this.allLines[i].filter(cell => criticalCellSet.has(cell)).length >= 1);
    }
    for (let i = 0; i < criticalCells.length; i++) {
      eAssert(criticalCells[i] != this.cells[2][2]);
    }
    
    // STEP 2: Select winning cell and winning line
    let winningCellIndex = this.game.gen.randomInt(5);
    this.winningCell = criticalCells.splice(winningCellIndex, 1)[0];
    this.forceLateCells = criticalCells;
    let forceLateCellSet = new Set(this.forceLateCells);
    
    let candidateLines = this.allLines.filter(l => l.filter(cell => cell == this.winningCell).length == 1 && l.filter(cell => forceLateCellSet.has(cell)).length == 0);
    eAssert(candidateLines.length == 2 || candidateLines.length == 3);
    this.winningLine = candidateLines[this.game.gen.randomInt(candidateLines.length)];
  }
  
  // Print to console (for convenience)
  printActivationTimes(t) {
    for (let i = 0; i < 5; i++) {
      console.log(this.cells[i].map(cell => cell.activationTime).join("\t") + "\t\t\t" + this.cells[i].map(cell => cell.activationTime <= t ? "[]" : cell.activationTime).join("\t"));
    }
  }
  
  generateDOM(containerElement) {
    const outerDiv = document.createElement("div");
    outerDiv.classList.add(this.isTeamFemale ? "bingo-card-girl" : "bingo-card-boy");
    containerElement.append(outerDiv);
    
    const tbl = document.createElement("table");
    outerDiv.appendChild(tbl);
    
    const idHeader = tbl.insertRow();
    
    const gameIDHeader = idHeader.insertCell();
    gameIDHeader.append("Game ID: " + this.game.id);
    gameIDHeader.classList.add("bingo-card-game-id-header");
    gameIDHeader.colSpan = "3";
    
    const playerIDHeader = idHeader.insertCell();
    playerIDHeader.append("Player ID: " + this.playerID);
    playerIDHeader.classList.add("bingo-card-player-id-header");
    playerIDHeader.colSpan = "2";
    
    const genderText = this.isTeamFemale ? "Girl" : "Boy";
    
    // Team header
    const teamHeader = tbl.insertRow().insertCell();
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
  constructor(id, winnerFemale, gen) {
    this.id = id;
    this.winnerFemale = winnerFemale;
    this.gen = gen;
    
    // Think of as a standard order
    this.bingoItems = Array(NUM_BINGO_ITEMS).fill(null).map(a => new BingoItem(this));
    
    // Just which card comes first in the print order
    this.firstCardFemale = this.gen.randomInt(2);
    
    // The order that they will be announced (although some won't be announced)
    this.orderedItemList = this.bingoItems.slice();
    this.gen.shuffleArray(this.orderedItemList);
    
    this.firstBingoTime = MIN_DURATION - 1 + this.gen.randomInt(MAX_DURATION - MIN_DURATION - TEAM_SIZE + 1);
    this.announcedItemList = this.orderedItemList.slice(0, this.firstBingoTime + TEAM_SIZE);
    
    this.time = -1;
    
    // The order that they appear on the wheel
    this.wheelItemList = this.bingoItems.slice();
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
      const safetyThreshold = this.firstBingoTime + 2 * TEAM_SIZE;
      
      this.cardsByGender[gender].push(new BingoCard(this.firstBingoTime + i, this.firstBingoTime - 1, targetDensity, gender, safetyThreshold, this));
    }
    
    this.gen.shuffleArray(this.cardsByGender[0]);
    this.gen.shuffleArray(this.cardsByGender[1]);
    
    // Player IDs
    for (let i = 0; i < TEAM_SIZE; i++) {
      this.cardsByGender[this.firstCardFemale][i].playerID = 2 * i + 1;
      this.cardsByGender[1 - this.firstCardFemale][i].playerID = 2 * i + 2;
    }
    
    // Double check that everything looks okay
    
    // Mark announced items
    for (let i = 0; i < this.announcedItemList.length; i++) {
      for (let g = 0; g < 2; g++) {
        for (let j = 0; j < TEAM_SIZE; j++) {
          this.cardsByGender[g][j].mark(this.announcedItemList[i]);
        }
      }
    }
    
    // Mark free cells
    for (let g = 0; g < 2; g++) {
      for (let i = 0; i < TEAM_SIZE; i++) {
        this.cardsByGender[g][i].cells[2][2].marked = true;
      }
    }
    
    // Check that winning team members all have bingos
    for (let i = 0; i < TEAM_SIZE; i++) {
      let card = this.cardsByGender[this.winnerFemale][i];
      if (!card.allLines.some(l => l.every(c => c.marked))) console.log(i);
      eAssert(card.allLines.some(l => l.every(c => c.marked)));
    }
    
    // Check that losing team members do not have bingos
    for (let i = 0; i < TEAM_SIZE; i++) {
      let card = this.cardsByGender[1 - this.winnerFemale][i];
      eAssert(card.allLines.every(l => l.some(c => !c.marked)));
    }
    
    this.ready = false;
  }
  
  printActivationTimes(t) {
    for (let g = 0; g < 2; g++) {
      console.log("------------------------------------------------------------------------------------------------");
      console.log("Gender: ", g);
      console.log("------------------------------------------------------------------------------------------------");
      for (let i = 0; i < TEAM_SIZE; i++) {
        this.cardsByGender[g][i].printActivationTimes(t);
        console.log("---");
      }
    }
  }
  
  async generateDOM(cardContainer, wordListContainer, wheelContainer) {
    // Fetch item images
    const response = await fetch("items.json");
    const itemData = await response.json();
    for (let i = 0; i < this.bingoItems.length; i++) {
      this.bingoItems[i].title = itemData[i]["title"];
      this.bingoItems[i].imgSrc = itemData[i]["img"];
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
    
    // Generate bingo verification selector
    const sel = document.querySelector("#player-id-select");
    for (let i = 0; i < 2 * TEAM_SIZE; i++) {
      const opt = document.createElement("option");
      opt.value = i + 1;
      opt.append(i + 1);
      sel.append(opt);
    }
    
    // Generate bingo confirmation banner
    if (this.winnerFemale) {
      document.querySelector("#bingo-confirmed-banner").style.backgroundColor = "#FF5297";
      document.querySelector("#bingo-confirmed-gender").innerHTML = "GIRL";
    } else {
      document.querySelector("#bingo-confirmed-banner").style.backgroundColor = "#668FFF";
      document.querySelector("#bingo-confirmed-gender").innerHTML = "BOY";
    }
  }
  
  async nextItem() {
    this.ready = false;
    document.querySelector("#next-button").disabled = "disabled";
    document.querySelector("#bingo-verification-button").disabled = "disabled";
    
    if (this.time >= 0) {
      const historyDiv = document.createElement("div");
      historyDiv.innerHTML = this.announcedItemList[this.time].imgSrc;
      const prevItems = document.querySelector("#previous-items");
      prevItems.append(historyDiv);
      
      // Recalculate side length
      let sideLength = 0;
      const numItems = this.time + 1;
      
      // In theory we ought to allow l to be arbitrarily large, but let's cut it off at 6 rows
      for (let l = 1; l < 6; l++) {
        // If we use l lines, what would the side length be?
        // The side length needs to be small enough that numItems/l items can fit in a single row
        // The side length also needs to be small enough that l items can fit in a single column
        const lLineSideLength = Math.min(prevItems.offsetHeight / l, prevItems.offsetWidth / Math.ceil(numItems / l));
        if (lLineSideLength < sideLength) break;
        sideLength = lLineSideLength;
      }
      
      sideLength = Math.min(110, sideLength);
      document.documentElement.style.setProperty("--prev-item-size", sideLength - 10 + "px");
      
      // Remove wedge from wheel
      let wedgeIndex = this.wheel.wedges.findIndex(w => w.item == this.announcedItemList[this.time]);
      this.wheel.wedges[wedgeIndex].icon.style.display = "none";
      this.wheel.wedges[wedgeIndex].wedgeFrame.style.display = "none";
      this.wheel.wedges.splice(this.wheel.wedges.findIndex(w => w.item == this.announcedItemList[this.time]), 1);
      this.wheel.render();
    }
    
    document.querySelector("#current-item").style.opacity = "0";
    this.time++;
    if (this.time < this.announcedItemList.length) {
      this.wheel.wheelContainer.style.opacity = "1";
      await this.wheel.spinToItem(this.announcedItemList[this.time]);
      
      // Sleep for a moment
      await new Promise(resolve => setTimeout(resolve, 300));
      
      document.querySelector("#current-item").innerHTML = this.announcedItemList[this.time].imgSrc;
      document.querySelector("#current-item").style.opacity = "1";
      this.wheel.wheelContainer.style.opacity = "0";
      
      document.querySelector("#next-button").disabled = "";
      document.querySelector("#bingo-verification-button").disabled = "";
      this.ready = true;
    } else {
      document.querySelector("#game-over").style.display = "block";
      document.querySelector("#bingo-verification-button").disabled = "";
    }
  }
  
  verifyBingo() {
    const playerID = parseInt(document.querySelector("#player-id-select").value);
    const g = this.firstCardFemale ^ (1 - (playerID % 2));
    const i = Math.floor((playerID - 1) / 2);
    
    const verified = (g == this.winnerFemale && this.time >= this.cardsByGender[g][i].bingoTime);
    
    const falseBingo = document.querySelector("#false-bingo");
    falseBingo.getAnimations().forEach(a => a.finish());
    
    if (verified) {
      falseBingo.style.opacity = 0;
      this.celebrateBingo();
    } else {
      falseBingo.style.opacity = 1;
      falseBingo.animate([
        { opacity: "1", offset: 0 },
        { opacity: "1", offset: 0.8 },
        { opacity: "0", offset: 1}
      ], {
        duration: 5000,
        fill: "forwards"
      });
    }
  }
  
  celebrateBingo() {
    const banner = document.querySelector("#bingo-confirmed-banner");
    banner.style.display = "flex";
    document.querySelector("#current-item").style.transition = "none";
    document.querySelector("#current-item").style.opacity = "0";
    
    // Confetti. Inspired by https://codepen.io/andyobrien/pen/WYrxMe
    for (let i = 0; i < 100; i++) {
      const piece = document.createElement("div");
      piece.classList.add("confetti-piece");
      piece.style.left = ((i + 1) / 101) * 100 + "%";
      piece.style.transform = "rotate(" + (-80 + Math.random() * 160) + "deg)";
      
      const size = 1 + Math.random();
      piece.style.width = 4 * size + "px";
      piece.style.height = 6 * size + "px";
      piece.style.animationDelay = -Math.random() * 2200 + "ms";
      piece.style.animationDuration = (1500 + Math.random() * 700) + "ms";
      
      if (Math.floor(Math.random() * 2) == 0) {
        piece.style.backgroundColor = "#ffff00";
      } else {
        piece.style.backgroundColor = "#ffffff";
      }
      
      banner.append(piece);
    }
  }
}

class Wheel {
  constructor(game, wheelContainer) {
    this.game = game;
    this.wheelContainer = wheelContainer;
    
    this.wheelDiv = document.createElement("div");
    this.wheelDiv.classList.add("wheel");
    this.wheelContainer.insertBefore(this.wheelDiv, this.wheelContainer.firstChild);
    
    this.activeWedgeIndicatorSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.activeWedgeIndicatorSVG.classList.add("active-wedge-indicator-svg");
    this.wheelDiv.append(this.activeWedgeIndicatorSVG);
    
    this.backgroundDisc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.backgroundDisc.classList.add("background-disc");
    this.activeWedgeIndicatorSVG.append(this.backgroundDisc);
    
    this.activeWedgeIndicator = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.activeWedgeIndicator.classList.add("active-wedge-indicator");
    this.activeWedgeIndicatorSVG.append(this.activeWedgeIndicator);
    
    this.wheelFrame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.wheelFrame.classList.add("wheel-frame");
    this.wheelDiv.append(this.wheelFrame);
    
    this.wedges = [];
    this.activeWedge = null;
    
    for (let i = 0; i < this.game.wheelItemList.length; i++) {
      this.wedges.push(new WheelWedge(this, this.game.wheelItemList[i]));
    }
    
    this.initialWheelDivRotation = 0;
    this.targetWheelDivRotation = 0;
    
    this.initialAWIRotation = 0;
    this.targetAWIRotation = 0;
    
    this.wheelDivIndefiniteSpinAnimation = null;
    
    this.render();
  }
  
  render() {
    const WEDGE_ARC_LENGTH = 140;
    const diameter = WEDGE_ARC_LENGTH * this.wedges.length / Math.PI;
    this.radius = diameter / 2;
    const boxSideLength = diameter + 70;
    this.wheelDiv.style.width = boxSideLength + "px";
    this.wheelDiv.style.height = boxSideLength + "px";
    this.wheelDiv.style.left = "calc(50vw - " + boxSideLength/2 + "px)";
    
    this.wheelFrame.setAttribute("viewBox", "0 0 " + boxSideLength + " " + boxSideLength);
    this.activeWedgeIndicatorSVG.setAttribute("viewBox", "0 0 " + boxSideLength + " " + boxSideLength);
    
    this.backgroundDisc.setAttribute("cx", boxSideLength / 2);
    this.backgroundDisc.setAttribute("cy", boxSideLength / 2);
    this.backgroundDisc.setAttribute("r", this.radius);
    
    for (let i = 0; i < this.wedges.length; i++) {
      // In radians
      const iconRotationAngle = (i / this.wedges.length) * 2 * Math.PI;
      this.wedges[i].icon.style.transform = "rotate(" + iconRotationAngle + "rad) translateY(-" + (this.radius - 70) + "px)";
      
      const iconLocationAngle = Math.PI / 2 - iconRotationAngle;
      this.wedges[i].startAngle = iconLocationAngle - Math.PI / this.wedges.length;
      this.wedges[i].endAngle = iconLocationAngle + Math.PI / this.wedges.length;
      
      let x1 = boxSideLength/2 + this.radius * Math.cos(this.wedges[i].startAngle);
      let y1 = boxSideLength/2 - this.radius * Math.sin(this.wedges[i].startAngle);
      let x2 = boxSideLength/2 + this.radius * Math.cos(this.wedges[i].endAngle);
      let y2 = boxSideLength/2 - this.radius * Math.sin(this.wedges[i].endAngle);
      
      const pathDescription = "M " + boxSideLength/2 + " " + boxSideLength/2 + " L " + x1 + " " + y1 + " A " + this.radius + " " + this.radius + " 0 0 0 " + x2 + " " + y2 + " Z"
      this.wedges[i].wedgeFrame.setAttribute("d", pathDescription);
      if (i == 0) this.activeWedgeIndicator.setAttribute("d", pathDescription);
    }
  }
  
  async spinToItem(item) {
    let i = this.wedges.findIndex(w => w.item == item);
    await this.spinTo(-Math.PI/2 + this.wedges[i].startAngle + this.wedges[i].item.spinLocation * (this.wedges[i].endAngle - this.wedges[i].startAngle));
  }
  
  async spinIndefinitely() {
    console.assert(this.wheelDiv.getAnimations().length == 0);
    this.wheelDivIndefiniteSpinAnimation = this.wheelDiv.animate([
      { transform: "" },
      { transform: "rotate(1turn)" }
    ], {
      duration: INDEFINITE_SPIN_DURATION,
      iterations: Infinity
    });
    
    this.activeWedgeIndicatorSVG.getAnimations().forEach(a => a.finish());
    const wedgeAngularLength = 2 * Math.PI / this.wedges.length;

    let keyframes = [ { transform: "", offset: 0 } ];
    for (let i = 0; i < this.wedges.length; i++) {
      keyframes.push({ transform: "rotate(" + (-i * wedgeAngularLength) + "rad)", offset: (i + 1/2)/this.wedges.length });
      keyframes.push({ transform: "rotate(" + (-(i + 1) * wedgeAngularLength) + "rad)", offset: (i + 1/2)/this.wedges.length });
    }
    keyframes.push({transform: "", offset: 1});
    
    this.AWIIndefiniteSpinAnimation = this.activeWedgeIndicatorSVG.animate(keyframes, {
      duration: INDEFINITE_SPIN_DURATION,
      iterations: Infinity
    });
    
    await this.wheelDivIndefiniteSpinAnimation.ready;
    this.AWIIndefiniteSpinAnimation.startTime = this.wheelDivIndefiniteSpinAnimation.startTime;
    
    document.querySelector("#next-button").disabled = "";
    this.game.ready = true;
  }
  
  async spinTo(r) {
    if (this.wheelDivIndefiniteSpinAnimation != null) {
      this.initialWheelDivRotation = this.wheelDivIndefiniteSpinAnimation.currentTime / INDEFINITE_SPIN_DURATION * 2 * Math.PI;
      this.wheelDivIndefiniteSpinAnimation.cancel();
      this.AWIIndefiniteSpinAnimation.cancel();
      this.wheelDivIndefiniteSpinAnimation = null;
    } else {
      this.wheelDiv.getAnimations().forEach(a => a.finish());
      this.initialWheelDivRotation = this.targetWheelDivRotation;
    }
    
    // At least one full spin
    this.targetWheelDivRotation = r + 2 * Math.PI * Math.ceil((this.initialWheelDivRotation + 2 * Math.PI - r) / (2 * Math.PI));
    
    const wheelDivAnim = this.wheelDiv.animate([
      { transform: "rotate(" + this.initialWheelDivRotation + "rad)" },
      { transform: "rotate(" + this.targetWheelDivRotation + "rad)" }
    ], {
      duration: WHEEL_SPIN_TIME,
      easing: EASING_FUNCTION,
      fill: "forwards"
    });
    
    this.activeWedgeIndicatorSVG.getAnimations().forEach(a => a.finish());
    this.initialAWIRotation = this.targetAWIRotation;
    
    const wedgeAngularLength = 2 * Math.PI / this.wedges.length;
    let previousAngle = this.initialAWIRotation;
    let keyframes = [ { transform: "rotate(" + previousAngle + "rad)", offset: 0 } ];
    // Whenever the rotation is of the form wedgeAngularLength * (t + 1/2) for some integer t, we should rotate the AWI by wedgeAngularLength
    const firstT = Math.ceil(this.initialWheelDivRotation / wedgeAngularLength - 1/2);
    const lastT = Math.floor(this.targetWheelDivRotation / wedgeAngularLength - 1/2);
    for (let t = firstT; t <= lastT; t++) {
      const newAngle = -wedgeAngularLength * (t + 1);
      const newOffset = (wedgeAngularLength * (t + 1/2) - this.initialWheelDivRotation) / (this.targetWheelDivRotation - this.initialWheelDivRotation);
      keyframes.push({ transform: "rotate(" + previousAngle + "rad)", offset: newOffset });
      keyframes.push({ transform: "rotate(" + newAngle + "rad)", offset: newOffset });
      previousAngle = newAngle;
    }
    keyframes.push({ transform: "rotate(" + previousAngle + "rad)", offset: 1});
    
    const activeWedgeAnim = this.activeWedgeIndicatorSVG.animate(keyframes, {
      duration: WHEEL_SPIN_TIME,
      easing: EASING_FUNCTION,
      fill: "forwards"
    });
    
    await wheelDivAnim.ready;
    activeWedgeAnim.startTime = wheelDivAnim.startTime;
    await wheelDivAnim.finished;
    await activeWedgeAnim.finished;
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
