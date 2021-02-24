# -*- coding: pyxl -*-
from pyxl import html
import json
import os
import shutil

from datetime import date

class Paper:
  def __init__(self, filename):
    self.filename = filename
    
    metadataFile = open(f"./data/{filename}/metadata.json", "r", encoding="utf-8")
    self.metadata = json.load(metadataFile)
    
    self.firstPostedDate = date.fromisoformat(self.metadata["first-posted"])
    
    abstractFile = open(f"./data/{filename}/abstract.html", "r", encoding="utf-8")
    self.abstract = html.rawhtml(abstractFile.read())
    
    notSoAbstractFile = open(f"./data/{filename}/not-so-abstract.html", "r", encoding="utf-8")
    self.notSoAbstract = html.rawhtml(notSoAbstractFile.read())
    
    if os.path.exists(f"./data/{filename}/expository.html"):
      expositoryFile = open(f"./data/{filename}/expository.html", "r", encoding="utf-8")
      self.expository = html.rawhtml(expositoryFile.read())
    else:
      self.expository = None
    
  def compile(self):
    gaScript1 = <script src="https://www.googletagmanager.com/gtag/js?id=UA-123337994-1"></script>
    gaScript2 = <script>{html.rawhtml("""window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-123337994-1');""")}</script>
    
    mathjaxScript = <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    
    gaScript1.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
    mathjaxScript.set_attr("async", "")
    
    texMacros = r"""
      \(\renewcommand{\epsilon}{\varepsilon}\)
      \(\renewcommand{\hat}{\widehat}\)
      \(\DeclareMathOperator*{\E}{\mathbb{E}}\)
    """
    
    authorTextAuthors = self.metadata["authors"].copy()
    if len(authorTextAuthors) > 1:
      authorTextAuthors[-1] = f"and {authorTextAuthors[-1]}"
    
    delimiter = ", " if len(authorTextAuthors) > 2 else " "
    authorText = delimiter.join(authorTextAuthors)
    
    links = <frag></frag>
    
    first = True
    for link in self.metadata["version-links"]:
      if not first:
        links.append(<span> • </span>)
      first = False
      links.append(<a href="{link['href']}">{link['text']}</a>)
    
    # links = <ul></ul>
    # for link in self.metadata["version-links"]:
    #   links.append(<li><a href="{link['href']}">{link['text']} version</a></li>)
      
    if "errata" in self.metadata:
      errataUL = <ul></ul>
      for erratum in self.metadata["errata"]:
        errataUL.append(
          <li>
            ({erratum["date"]}) {erratum["text"]}
          </li>
        )
      
      errataSection = (
        <frag>
          <p>☢️ Errata:</p>
          {errataUL}
        </frag>
      )
    else:
      errataSection = None
      
    if "recognition" in self.metadata:
      recognitionUL = <ul></ul>
      for item in self.metadata["recognition"]:
        recognitionUL.append(
          <li>
            {html.rawhtml(item)}
          </li>
        )
      recognitionSection = (
        <frag>
          <p>What others think:</p>
          {recognitionUL}
        </frag>
      )
    else:
      recognitionSection = None
      
    if "copyright" in self.metadata:
      copyrightSection = (
        <p style="font-size:12px;">
          Copyright info: {self.metadata["copyright"]}
        </p>
      )
    else:
      copyrightSection = None
      
    if self.expository == None:
      expositorySection = None
    else:
      expositorySection = (
        <frag>
          <hr />
          <p>Expository material:</p>
          {self.expository}
        </frag>
      )
    
    doc = (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          {gaScript1}
          {gaScript2}
          <script src="/mathjax-config.js"></script>
          {mathjaxScript}
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <title>{self.metadata["title"]}</title>
          
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="/main.css" />
          
          <meta property="og:title" content="{self.metadata['title']}" />
        </head>
        
        <body>
          <span style="display:none;">{texMacros}</span>
          <main>
            <article>
              <p>
                <a href="/tcs/">Back to list of papers</a>
              </p>
              <hr />
              <h1>
                {self.metadata['title']}
              </h1>
              <p>
                By {authorText}
              </p>
              <hr />
              <p>
                Read the paper: {links}
              </p>
              <details>
                <summary>
                  Abstract (for specialists)
                </summary>
                <div class="indent">
                  {self.abstract}
                </div>
              </details>
              <details>
                <summary>
                  Not-so-abstract (for curious outsiders)
                </summary>
                <p>
                  ⚠️ <em>This summary might gloss over some important details.</em>
                </p>
                <div class="indent">
                  {self.notSoAbstract}
                </div>
              </details>
              <p>
                {self.metadata['timeline']} {html.rawhtml(self.metadata["version-notes"]) if "version-notes" in self.metadata else None}
              </p>
              {expositorySection}
              <hr />
              {errataSection}
              {recognitionSection}
              {copyrightSection}
            </article>
          </main>
        </body>
      </html>
    )
    
    if os.path.exists(f"papers/{self.slug}"):
      assert os.path.isdir(f"papers/{self.slug}"), "Slug problem"
    else:
      os.makedirs(f"papers/{self.slug}")
      
    indexFile = open(f"papers/{self.slug}/index.html", "w", encoding="utf-8")
    indexFile.write("<!DOCTYPE html>" + str(doc))
    
    if os.path.exists(f"data/{self.filename}/assets"):
      for asset in os.listdir(f"data/{self.filename}/assets"):
        if not os.path.exists(f"papers/{self.slug}/{asset}"):
          assetPath = os.path.join(f"data/{self.filename}/assets", asset)
          shutil.copy(assetPath, f"papers/{self.slug}/")
