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

'use strict';

const NUM_CARDS = 20;
const NUM_BINGO_ITEMS = 84;

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
    
    this.selected = false;
    this.historyDiv = null;
  }
  
  toggleSelected() {
    if (this.selected) {
      this.selected = false;
      this.historyDiv.classList.remove("selected");
    } else {
      this.selected = true;
      this.historyDiv.classList.add("selected");
    }
    this.game.checkForBingo();
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
      cellTD.append(cellDiv);
      cellTD.classList.add("free-cell");
    } else {
      cellTD.innerHTML = this.item.imgSrc;
    }
    cellTD.classList.add("bingo-card-cell");
  }
}

class BingoCard {
  constructor(game) {
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
    
    // Free space
    this.cells[2][2].activationTime = -1;
    
    let times = [];
    for (let i = 0; i < NUM_BINGO_ITEMS; i++) {
      times[i] = i;
    }
    
    this.game.gen.shuffleArray(times);
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (this.cells[i][j].activationTime == null) this.cells[i][j].activationTime = times.pop();
      }
    }
    
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
  
  // Print to console (for convenience)
  printActivationTimes(t) {
    for (let i = 0; i < 5; i++) {
      console.log(this.cells[i].map(cell => cell.activationTime).join("\t") + "\t\t\t" + this.cells[i].map(cell => cell.activationTime <= t ? "[]" : cell.activationTime).join("\t"));
    }
  }
  
  generateDOM(containerElement) {
    const outerDiv = document.createElement("div");
    outerDiv.classList.add("bingo-card");
    containerElement.append(outerDiv);
    
    const mainHeader = document.createElement("div");
    mainHeader.classList.add("bingo-card-main-header");
    outerDiv.append(mainHeader);
    
    const storkImage1 = document.createElement("img");
    storkImage1.src = "stork1.png";
    mainHeader.append(storkImage1);
    
    const storkImage2 = document.createElement("img");
    storkImage2.src = "stork2.png";
    mainHeader.append(storkImage2);
    
    const itemTable = document.createElement("table");
    itemTable.classList.add("bingo-item-table");
    outerDiv.appendChild(itemTable);
    
    // Cells
    for (let i = 0; i < 5; i++) {
      let row = itemTable.insertRow();
      for (let j = 0; j < 5; j++) {
        this.cells[i][j].generateDOM(row);
      }
    }
  }
}

class BingoGame {
  constructor(id, gen) {
    this.id = id;
    this.gen = gen;
    
    // Think of as a standard order
    this.bingoItems = Array(NUM_BINGO_ITEMS).fill(null).map(a => new BingoItem(this));
    
    // The order that they will be announced
    this.orderedItemList = this.bingoItems.slice();
    this.gen.shuffleArray(this.orderedItemList);
    
    this.announcedItemList = this.orderedItemList;
    
    this.time = -1;
    this.celebrating = false;
    this.freeCellSelected = false;
    
    // The order that they appear on the wheel
    this.wheelItemList = this.bingoItems.slice();
    this.gen.shuffleArray(this.wheelItemList);
    
    this.cards = [];
    
    for (let i = 0; i < NUM_CARDS; i++) {
      this.cards.push(new BingoCard(this));
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
  
  // TODO: Refactor by making a special "free" item
  toggleFreeCellSelected() {
    if (this.freeCellSelected) {
      this.freeCellSelected = false;
      document.querySelector("#free-cell-selector").classList.remove("selected");
    } else {
      this.freeCellSelected = true;
      document.querySelector("#free-cell-selector").classList.add("selected");
    }
    this.checkForBingo();
  }
  
  async generateDOM(cardContainer, wheelContainer) {
    // Fetch item images
    const response = await fetch("items.json");
    const itemData = await response.json();
    console.assert(itemData.length == NUM_BINGO_ITEMS);
    for (let i = 0; i < this.bingoItems.length; i++) {
      this.bingoItems[i].title = itemData[i]["title"];
      this.bingoItems[i].imgSrc = itemData[i]["img"];
    }
        
    // Generate cards
    for (let i = 0; i < NUM_CARDS; i++) {
      this.cards[i].generateDOM(cardContainer);
    }
    
    // Generate wheel
    this.wheel = new Wheel(this, wheelContainer);
    
    document.querySelector("#bingo-confirmed-banner").style.backgroundColor = "#FF5297";
  }
  
  async nextItem() {
    this.ready = false;
    document.querySelector("#next-button").disabled = "disabled";
    
    if (this.time >= 0) {      
      // Remove previous wedge from wheel
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
      
      // Add item to displayed list
      const item = this.announcedItemList[this.time];
      item.historyDiv = document.createElement("div");
      item.historyDiv.innerHTML = item.imgSrc;
      item.historyDiv.addEventListener("click", function() { item.toggleSelected(); });
      
      const prevItems = document.querySelector("#previous-items");
      
      // Recalculate side length
      let sideLength = 0;
      const numItems = this.time + 2; // Time is zero-indexed, and there's the free cell
      
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
      setTimeout(function() {
        document.documentElement.style.setProperty("--prev-item-size", sideLength - 10 + "px");
        prevItems.append(item.historyDiv);
      }, 1000);
      
      
      document.querySelector("#next-button").disabled = "";
      this.ready = true;
      
    } else {
      document.querySelector("#game-over").style.display = "block";
    }
  }
  
  checkForBingo() {
    if (!this.celebrating) {
      let numSelected = this.bingoItems.filter(it => it.selected).length;
      if (this.freeCellSelected) numSelected++;

      if (numSelected >= 5) {
        document.querySelector("#confirmation-instructions").style.display = "none";
        for (let i = 0; i < NUM_CARDS; i++) {
          const card = this.cards[i];
          for (let j = 0; j < card.allLines.length; j++) {
            if (card.allLines[j].every(c => ((c.item == null && c.card.game.freeCellSelected) || c.item.selected))) {
              this.celebrateBingo();
              break;
            }
          }
          if (this.celebrating) break;
        }
        
        if (!this.celebrating) document.querySelector("#false-bingo").style.visibility = "visible";
      } else {
        document.querySelector("#false-bingo").style.visibility = "hidden";
      }
    }
  }
  
  celebrateBingo() {
    this.celebrating = true;
    document.querySelector("#false-bingo").style.visibility = "hidden";
    
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
