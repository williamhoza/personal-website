# -*- coding: pyxl -*-
from pyxl import html
    
def compile(papers):
  gaScript1 = <script src="https://www.googletagmanager.com/gtag/js?id=UA-123337994-1"></script>
  gaScript2 = <script>{html.rawhtml("""window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-123337994-1');""")}</script>
  
  gaScript1.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  
  paperList = <frag></frag>
  for paper in reversed(papers):
    otherAuthors = paper.metadata["authors"].copy()
    print(otherAuthors)
    otherAuthors.remove("William M. Hoza")
    if len(otherAuthors) > 1:
      otherAuthors[-1] = f"and {otherAuthors[-1]}"
    
    delimiter = ", " if len(otherAuthors) > 2 else " "
    authorText = delimiter.join(otherAuthors)
    
    if authorText != "":
      authorText = f"With {authorText}. "
    
    paperList.append(
      <p>
        <a href="/papers/{paper.slug}" style="font-weight:bold;">{paper.metadata["title"]}</a><br />
        {authorText}{paper.metadata["where-published-summary"]}
      </p>
    )
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        {gaScript1}
        {gaScript2}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <title>Papers (co)authored by William M. Hoza</title>
        
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/papers/paper-page.css" />
        
        <meta property="og:title" content="Papers (co)authored by William M. Hoza" />
      </head>
      
      <body>
        <main>
          <article>
            <h1>
              Papers I've (co)authored
            </h1>
            <p>
              In order of appearance online, from newest to oldest.
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
