# -*- coding: pyxl -*-
from pyxl import html
    
def compile(papers):
  gaScript1 = <script src="https://www.googletagmanager.com/gtag/js?id=UA-123337994-1"></script>
  gaScript2 = <script>{html.rawhtml("""window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-123337994-1');""")}</script>
  
  gaScript1.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  
  paperList = <ol class="paper-list"></ol>
  for paper in reversed(papers):
    otherAuthors = paper.metadata["authors"].copy()
    print(otherAuthors)
    otherAuthors.remove("William M. Hoza")
    if len(otherAuthors) > 1:
      otherAuthors[-1] = f"and {otherAuthors[-1]}"
    
    delimiter = ", " if len(otherAuthors) > 2 else " "
    authorText = delimiter.join(otherAuthors)
    
    if authorText != "":
      authorHTML = <frag>With {authorText}<br /></frag>
    else:
      authorHTML = None
    
    paperList.append(
      <li>
        <a href="papers/{paper.slug}" style="font-weight:bold;">{paper.metadata["title"]}</a><br />
        {authorHTML}
        {paper.metadata["where-published-summary"]}
      </li>
    )
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        {gaScript1}
        {gaScript2}
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
              I'm currently a fourth-year grad student at UT Austin, where I study theoretical computer science. I have the good fortune to be advised by <a href="http://www.cs.utexas.edu/~diz/">David Zuckerman</a>. Previously, I was an undergrad at Caltech, where I was lucky to receive valuable mentorship from <a href="http://users.cms.caltech.edu/~schulman/">Leonard Schulman</a> and <a href="http://users.cms.caltech.edu/~umans/">Chris Umans</a>.
            </p>
            <p>
              I study "computational complexity theory", which means I use the methods of mathematics to try to understand just how powerful different computational resources are. These "computational resources" include things like time, memory, communication, randomness, quantum mechanics, etc. I'm especially interested in the question of whether randomness is ever necessary for low-memory computation. To work on problems like that, people such as me study "pseudorandomness", which refers to any phenomenon where something looks more random than it actually is.
            </p>
            <p>
              My research papers are listed below, sorted by the date they were first posted online, from newest to oldest. If you have any questions or comments, send me an <a href="mailto:whoza@utexas.edu">email</a>! Like most academic folks, I like getting emails about my research.
            </p>
            <hr />
            {paperList}
          </article>
        </main>
      </body>
    </html>
  )
    
  indexFile = open("index.html", "w", encoding="utf-8")
  indexFile.write("<!DOCTYPE html>" + str(doc))
