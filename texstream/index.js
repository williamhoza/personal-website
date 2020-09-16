let lines = [];
let activeLine = null;

function init() {
  newLine();
}

function newLine() {
  lines.push(new Line(lines.length));
}

function Line(index) {
  this.textBox = document.createElement("input");
  this.textBox.type = "text";
  this.textBox.classList.add("edit");
  let parentLine = this;
  this.textBox.addEventListener("keydown", function(evt) {
    if (evt.keyCode == 13) { // ENTER
      parentLine.activateDisplay();
    } else if(evt.keyCode == 38) { // UP ARROW
      if (parentLine.index > 0) {
        lines[parentLine.index - 1].activateEdit();
      }
    } else if (evt.keyCode == 40) { // DOWN ARROW
      if (parentLine.index < lines.length - 1) {
        lines[parentLine.index + 1].activateEdit();
      } else if (parentLine.index == lines.length - 1) {
        parentLine.activateDisplay();
      }
    }
  });
  this.displayBox = document.createElement("div");
  this.displayBox.classList.add("display");
  this.displayBox.addEventListener("click", function() {
    parentLine.activateEdit();
  });
  document.querySelector("#container").appendChild(this.textBox);
  document.querySelector("#container").appendChild(this.displayBox);
  
  this.val = "";
  this.index = index;
  this.activateEdit();
}
Line.prototype.activateDisplay = function(activateEditElsewhere=true) {  
  if (this.textBox.value == "" && this.index < lines.length - 1) {
    this.textBox.value = "-";
  }
    
  
  this.textBox.style.display = "none";
  this.displayBox.style.display = "";
  if (this.textBox.value != this.val) {
    this.val = this.textBox.value;
    this.displayBox.innerHTML = this.val;
    MathJax.typeset();
  }
  
  activeLine = null;
  
  if (activateEditElsewhere) {
    if (this.index == lines.length - 1 && this.textBox.value != "") {
      newLine();
    } else {
      lines[lines.length - 1].activateEdit();
    }
  }
}
Line.prototype.activateEdit = function() {
  if (activeLine != null) activeLine.activateDisplay(false);
  this.displayBox.style.display = "none";
  this.textBox.style.display = "";
  this.textBox.focus();
  activeLine = this;
}

init();
