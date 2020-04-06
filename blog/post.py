# -*- coding: pyxl -*-
from pyxl import html

import json
import page

from datetime import date

class Post:
  def __init__(self, slug):
    self.slug = slug
    
    bodyFile = open(f"{slug}/body.html", "r", encoding="utf-8")
    self.body = html.rawhtml(bodyFile.read())
    
    metadataFile = open(f"{slug}/metadata.json", "r", encoding="utf-8")
    self.metadata = json.load(metadataFile)
    self.dt = date.fromisoformat(self.metadata["date"])
    
  def humanReadableDate(self):
    return f"{self.dt:%B} {self.dt.day}, {self.dt.year}"
    
  def compile(self):
    controls = ("controls" in self.metadata and self.metadata["controls"])
    
    if controls:
      main = (
        <main>
          <div class="column-container">
            <div class="main-column">
              <div class="main-column-inner">
                <h1>
                  {self.metadata["title"]}
                </h1>
                <time datetime="{self.dt.isoformat()}">{self.humanReadableDate()}</time>
              </div>
            </div>
          </div>
          {self.body}
          <div class="column-container">
            <div class="main-column">
              <div class="main-column-inner">
                <div id="footnotes-container">
                </div>
              </div>
            </div>
          </div>
          <section id="comments-section" class="column-container">
            <div class="main-column">
              <div class="main-column-inner">
                <div class="fb-comments" data-href="https://williamhoza.com/blog/{self.slug}" data-width="100%" data-numposts="5"></div>
              </div>
            </div>
          </section>
        </main>
      )
    else:
      main = (
        <main class="one-column-container">
          <div class="main-column">
            <div class="main-column-inner">
              <h1>
                {self.metadata["title"]}
              </h1>
              <time datetime="{self.dt.isoformat()}">{self.humanReadableDate()}</time>
              {self.body}
              <ol id="footnotes-container">
              </ol>
            </div>
          </div>
          <section id="comments-section">
            <div class="main-column">
              <div class="main-column-inner">
                <div class="fb-comments" data-href="https://williamhoza.com/blog/{self.slug}" data-width="100%" data-numposts="5"></div>
              </div>
            </div>
          </section>
        </main>
      )
    
    if ("og-image" in self.metadata):
      ogImageTags = (
        <frag>
          <meta property="og:image" content="https://williamhoza.com/blog/{self.slug}/{self.metadata['og-image']}" />
          <meta property="og:image:width" content="{self.metadata['og-image-width']}" />
          <meta property="og:image:height" content="{self.metadata['og-image-height']}" />
        </frag>
      )
    else:
      ogImageTags = None
    
    extraHeadElements = (
      <frag>
        <meta property="og:url" content="https://williamhoza.com/blog/{self.slug}/" />
        <meta property="og:type" content="article" />
        <meta property="og:description" content="{self.metadata['snippet']}" />
      </frag>
    )
    
    if ("styling" in self.metadata and self.metadata["styling"]):
      extraHeadElements.append(<link rel="stylesheet" href="/blog/{self.slug}/index.css" />)
      
    indexFile = open(f"{self.slug}/index.html", "w", encoding="utf-8")
    page.compile(controls, main, extraHeadElements, indexFile, self.metadata["title"], ogImageTags)
