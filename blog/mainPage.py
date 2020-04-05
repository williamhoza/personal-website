# -*- coding: pyxl -*-
from pyxl import html

import page

def compile(posts):
  postLinkList = <frag></frag>
  
  for post in posts.values():
    postLinkList.append(
      <p>
        <a class="title-link" href="/blog/{post.slug}">
          {post.metadata["title"]}
        </a>
        <br />
        <time datetime="{post.dt.isoformat()}">
          {post.humanReadableDate()}
        </time>
      </p>
    )
  
  main = (
    <main class="one-column-container">
      <div class="main-column">
        <div class="main-column-inner">
          <p class="main-page-intro">
            Hi, I'm <a href="/">William Hoza</a>. This is my blog. My blog posts are listed below, and an RSS feed is <a href="/blog/rss.xml">here</a>.
          </p>
          {postLinkList}
        </div>
      </div>
    </main>
  )
  
  indexFile = open("index.html", "w", encoding="utf-8")
  page.compile(False, main, None, indexFile)
  
