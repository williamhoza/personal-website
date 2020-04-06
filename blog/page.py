# -*- coding: pyxl -*-
from pyxl import html

def compile(controls, main, extraHeadElements, indexFile, title=None, ogImageTags=None):
  gaScript1 = <script src="https://www.googletagmanager.com/gtag/js?id=UA-123337994-1"></script>
  gaScript2 = <script>{html.rawhtml("""window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-123337994-1');""")}</script>
  
  mathjaxScript = <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  
  gaScript1.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  mathjaxScript.set_attr("async", "")
  
  fbScript = "(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2'; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));"
  
  texMacros = r"""
    \(\renewcommand{\epsilon}{\varepsilon}\)
    \(\renewcommand{\hat}{\widehat}\)
  """
      
  fbContent = (
    <frag>
      <div id="fb-root"></div>
      <script>
        {html.rawhtml(fbScript)}
      </script>
    </frag>
  )
  
  header = (
    <header>
      <div class="main-column">
        <div class="main-column-inner">
          <a href="/blog">William Hoza's Blog</a>
        </div>
      </div>
    </header>
  )
  
  if (controls):
    header.set_attr("class", "column-container")
  else:
    header.set_attr("class", "one-column-container")
  
  if title != None:
    titleElement = (
      <title>
        {title} | William Hoza's blog
      </title>
    )
  else:
    titleElement = (
      <title>
        William Hoza's blog
      </title>
    )
    
  if ogImageTags == None:
    ogImageTags = (
      <frag>
        <meta property="og:image" content="https://williamhoza.com/blog/og.png" />
        <meta property="og:image:width" content="2000" />
        <meta property="og:image:height" content="1050" />
      </frag>
    )
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        {gaScript1}
        {gaScript2}
        <script src="/blog/blog-mathjax-config.js"></script>
        {mathjaxScript}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="fb:admins" content="grumpybuffalo"/>
        
        {titleElement}
        
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/blog/blog.css" />
        {extraHeadElements}
        
        <meta property="og:title" content="{title or 'William Hoza\'s blog'}" />
        {ogImageTags}
      </head>
      
      <body>
        {fbContent}
        <span style="display:none;">{texMacros}</span>
        {header}
        {main}
        <script src="/blog/blog.js"></script>
      </body>
    </html>
  )
  indexFile.write("<!DOCTYPE html>" + str(doc))
