# -*- coding: pyxl -*-
from pyxl import html
    
def compile(papers):
  goatScript = <script data-goatcounter="https://williamhoza.goatcounter.com/count" src="//gc.zgo.at/count.js"></script>
  goatScript.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  
  paperList = <ol class="paper-list"></ol>
  for paper in reversed(papers):
    authorList = paper.metadata["authors"].copy()
    if len(authorList) > 1:
      authorList[-1] = f"and {authorList[-1]}"
    
    delimiter = ", " if len(authorList) > 2 else " "
    
    authorHTML = <frag>{delimiter.join(authorList)}<br /></frag>
    
    wherePublished = <frag></frag>
    first = True
    for item in paper.metadata["where-published-summary"]:
      if not first:
        wherePublished.append(<span> • </span>)
        
      first = False
      wherePublished.append(<frag>{item}</frag>)
    
    paperList.append(
      <li style="font-style:italic;">
        <a href="papers/{paper.slug}" style="font-weight:bold;font-style:normal;">{paper.metadata["title"]}</a><br />
        {authorHTML}
        {wherePublished}
      </li>
    )
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <title>William Hoza's TCS Stuff</title>
        
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/main.css" />
        
        <meta property="og:title" content="William Hoza's TCS Stuff" />
      </head>
      
      <body>
        <main>
          <article>
            <p>
              <a href="/">Back to my homepage</a>
            </p>
            <hr />
            <h1>
              Theoretical computer science stuff
            </h1>
            <p>
              I'm currently a fifth-year grad student in the CS department at UT Austin. I have the good fortune to be advised by <a href="http://www.cs.utexas.edu/~diz/">David Zuckerman</a>. Previously, I was an undergrad at Caltech, where I was lucky to receive valuable mentorship from <a href="http://users.cms.caltech.edu/~schulman/">Leonard Schulman</a> and <a href="http://users.cms.caltech.edu/~umans/">Chris Umans</a>.
            </p>
            <p>
              I study <em>pseudorandomness and derandomization</em>. You can think of randomness as a scarce computational resource — a type of algorithmic "fuel." Randomized algorithms are great, but all else being equal, an algorithm that uses fewer random bits is better than an algorithm that uses more random bits. (Analogously, a faster algorithm is better than a slower algorithm; a car that uses less gasoline is better than a car that uses more gasoline.) Deterministic algorithms are best of all. One approach for using fewer random bits is to design <em>pseudorandom generators</em>, which use a small number of random bits to generate a long sequence of bits that "look random" and can often be used as a substitute for truly random bits. I'm especially interested in pseudorandom generators that are <em>provably</em> correct.
            </p>
            <p>
              More generally, I'm interested in <a href="https://en.wikipedia.org/wiki/Computational_complexity_theory">computational complexity theory</a> and the <a href="https://en.wikipedia.org/wiki/Analysis_of_Boolean_functions">analysis of Boolean functions</a>.
            </p>
            <p>
              My research papers are listed below, sorted by the date they were first posted online (newest to oldest). If you have a question or comment, send me an <a href="mailto:whoza@utexas.edu">email</a>! I like getting emails about my work (as do most researchers).
            </p>
            <hr />
            {paperList}
          </article>
        </main>
        {goatScript}
      </body>
    </html>
  )
    
  indexFile = open("index.html", "w", encoding="utf-8")
  indexFile.write("<!DOCTYPE html>" + str(doc))
