# -*- coding: pyxl -*-
from pyxl import html
    
def compile(papers):
  mathjaxScript = <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  goatScript = <script data-goatcounter="https://williamhoza.goatcounter.com/count" src="//gc.zgo.at/count.js"></script>
  goatScript.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  mathjaxScript.set_attr("async", "")
  
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
        <a href="{paper.dirPath}" style="font-weight:bold;font-style:normal;">{paper.metadata["title"]}</a><br />
        {authorHTML}
        {wherePublished}
      </li>
    )
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <script src="/mathjax-config.js"></script>
        {mathjaxScript}
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
              I'm currently a postdoc in <a href="https://www.avishaytal.org/">Avishay Tal</a>'s group at UC Berkeley through the <a href="https://simons.berkeley.edu/">Simons Institute for the Theory of Computing</a>. I study <em>pseudorandomness and derandomization</em>. More generally, I'm interested in <a href="https://en.wikipedia.org/wiki/Computational_complexity_theory">computational complexity theory</a>, the <a href="https://en.wikipedia.org/wiki/Analysis_of_Boolean_functions">analysis of Boolean functions</a>, and other topics in <a href="https://en.wikipedia.org/wiki/Theoretical_computer_science">theoretical computer science</a>.
            </p>
            <details>
              <summary>
                 A short explanation of what "derandomization" means (for curious outsiders)
              </summary>
              <div class="indent">
                <p>
                  Some algorithms use randomness to solve computational problems. For example, one of the best methods known for finding a large prime number is to pick a large number at random, check if it's prime, and try again if necessary.
                </p>
                <p>
                  You can think of randomness as a scarce computational resource — a type of algorithmic "fuel." Randomized algorithms are okay, but all else being equal, an algorithm that uses <em>fewer</em> random bits is better than an algorithm that uses more random bits, just like a faster algorithm is better than a slower algorithm, or a car that uses less gasoline is better than a car that uses more gasoline. Algorithms that don't use any randomness ("deterministic" algorithms) are best of all. For example, it would be nice to have a fast deterministic algorithm for finding large prime numbers. "Derandomization" is the art of converting randomized algorithms into deterministic algorithms.
                </p>
                <p>
                  One approach for using fewer random bits is to design <em>pseudorandom generators</em>, which use a small number of random bits to generate a long sequence of bits that "look random" and can often be used as a substitute for truly random bits. I'm especially interested in pseudorandom generators that are <em>provably</em> correct.
                </p>
              </div>
            </details>
            <hr />
            <div class="expository">
              <iframe src="https://www.youtube.com/embed/rjQKOBsFE-g" frameborder="0"></iframe>
              <p>
                <a href="https://www.youtube.com/watch?v=rjQKOBsFE-g">Video</a> of a 10-minute overview of my research that I presented for the Simons Institute's "Meet the Fellows Welcome Event" (September 2021). Here are the <a href="simons-meet-the-fellows-slides.pptx">slides</a> from that presentation.
              </p>
            </div>
            <hr />
            <p>
              My research papers are listed below, sorted by the date they were first posted online (newest to oldest). If you have a question or comment, please send me an <a href="mailto:williamhoza@berkeley.edu">email</a>! Like most researchers, I like getting emails about my work.
            </p>
            <hr />
            {paperList}
            <hr />
            <p>
              I'm grateful for all the mentorship I've received over the years, especially from <a href="http://www.cs.utexas.edu/~diz/">David Zuckerman</a> (my graduate advisor) and <a href="http://users.cms.caltech.edu/~schulman/">Leonard Schulman</a> and <a href="http://users.cms.caltech.edu/~umans/">Chris Umans</a> (undergraduate research mentors).
            </p>
          </article>
        </main>
        {goatScript}
      </body>
    </html>
  )
    
  indexFile = open("index.html", "w", encoding="utf-8")
  indexFile.write("<!DOCTYPE html>" + str(doc))
