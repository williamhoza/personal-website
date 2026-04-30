import page

def compile(posts):
  postLinkList = ""
  
  for post in posts.values():
    postLinkList += f"""
      <p>
        <a class="title-link" href="/blog/{post.slug}">
          {post.metadata["title"]}
        </a>
        <br />
        <time datetime="{post.dt.isoformat()}">
          {post.humanReadableDate()}
        </time>
      </p>
    """
  
  main = f"""
    <main class="one-column-container">
      <div class="main-column">
        <div class="main-column-inner">
          <p>
            Why do I have a blog? Because if I didn't have a blog, I wouldn't have anywhere to put my blog posts!
          </p>
          <p class="main-page-intro">
            <a href="/blog/rss.xml">[RSS]</a>
          </p>
          {postLinkList}
        </div>
      </div>
    </main>
  """
  
  extraHeadElements = '<meta property="og:url" content="https://williamhoza.com/blog/" />'
  
  indexFile = open("index.html", "w", encoding="utf-8")
  page.compile(False, main, extraHeadElements, indexFile)
  
