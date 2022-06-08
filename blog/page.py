# -*- coding: pyxl -*-
from pyxl import html

def compile(controls, main, extraHeadElements, indexFile, title=None, ogImageTags=None):
  
  mathjaxScript = <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
  
  goatScript = <script data-goatcounter="https://williamhoza.goatcounter.com/count" src="//gc.zgo.at/count.js"></script>
  
  mathjaxScript.set_attr("async", "") # async is a Python keyword, so we have to set this attribute manually
  goatScript.set_attr("async", "")
  
  
  texMacros = r"""
    \(\renewcommand{\epsilon}{\varepsilon}\)
    \(\renewcommand{\hat}{\widehat}\)
    \(\DeclareMathOperator*{\E}{\mathbb{E}}\)
    \(\renewcommand{\emptyset}{\varnothing}\)
  """
  
  """
  fbScript = "(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2'; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));"
      
  fbContent = (
    <frag>
      <div id="fb-root"></div>
      <script>
        {html.rawhtml(fbScript)}
      </script>
    </frag>
  )
  """
  
  fbContent = html.rawhtml('<div id="fb-root"></div><script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v14.0&appId=696618438072867&autoLogAppEvents=1" nonce="pvRAb9ux"></script>')
  
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
  
  # <meta property="fb:admins" content="wmhoza"/>
  
  doc = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <script src="/blog/blog-mathjax-config.js"></script>
        {mathjaxScript}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="fb:app_id" content="696618438072867" />
        
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
        {goatScript}
      </body>
    </html>
  )
  indexFile.write("<!DOCTYPE html>" + str(doc))
