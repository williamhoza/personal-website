moveFootnotes();

function moveFootnotes() {
  let footnotes = document.querySelectorAll(".footnote");
  let footnoteNumber = 1;
  
  footnotes.forEach(function(footnote) {
    let inlineLink = document.createElement("a");
    inlineLink.href = "#footnote" + footnoteNumber;
    inlineLink.id = "footnoteref" + footnoteNumber;
    inlineLink.appendChild(document.createTextNode(footnoteNumber));
    let inlineSup = document.createElement("sup");
    inlineSup.appendChild(inlineLink);
    footnote.parentNode.insertBefore(inlineSup, footnote);
    
    let refLink = document.createElement("a");
    refLink.href = "#footnoteref" + footnoteNumber;
    refLink.id = "footnote" + footnoteNumber;
    refLink.appendChild(document.createTextNode(footnoteNumber));
    let refSup = document.createElement("sup");
    refSup.appendChild(refLink);
    let footnoteLI = document.createElement("li");
    footnoteLI.appendChild(refSup);
    footnoteLI.appendChild(footnote);
    document.querySelector("#footnotes-container").appendChild(footnoteLI);
    
    footnote.style.display = "initial";
    
    footnoteNumber++;
  });
}
