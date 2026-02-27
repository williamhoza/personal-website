def compile(controls, main, extraHeadElements, indexFile, title=None, ogImageTags=""):
  
  mathjaxScript = '<script async id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>'
  
  
  texMacros = r"""
    \(\renewcommand{\epsilon}{\varepsilon}\)
    \(\renewcommand{\hat}{\widehat}\)
    \(\DeclareMathOperator*{\E}{\mathbb{E}}\)
    \(\renewcommand{\emptyset}{\varnothing}\)
  """
  
  header = f"""
    <header class="{'column-container' if controls else 'one-column-container'}">
      <div class="main-column">
        <div class="main-column-inner">
          <a href="/blog">William Hoza's Blog</a>
        </div>
      </div>
    </header>
  """
  
  if title != None:
    titleElement = f"""
      <title>
        {title} | William Hoza's blog
      </title>
    """
  else:
    titleElement = """
      <title>
        William Hoza's blog
      </title>
    """
  
  doc = f"""
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <script src="/blog/blog-mathjax-config.js"></script>
        {mathjaxScript}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {titleElement}
        
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/blog/blog.css" />
        {extraHeadElements}
        
        <meta property="og:title" content="{title or 'William Hoza\'s blog'}" />
        {ogImageTags}
      </head>
      
      <body>
        <span style="display:none;">{texMacros}</span>
        {header}
        {main}
        <script src="/blog/blog.js"></script>
      </body>
    </html>
  """
  indexFile.write(doc)
