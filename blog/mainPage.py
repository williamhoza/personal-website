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
            Some people write blog posts simply to fill up their blogs with content. I have the opposite attitude: the only reason I have a blog is so that I have a place to put my blog posts.
          </p>
          <p class="main-page-intro">
            My blog posts are listed below, and an RSS feed is <a href="/blog/rss.xml">here</a>.
          </p>
          {postLinkList}
        </div>
      </div>
    </main>
  """
  
  extraHeadElements = '<meta property="og:url" content="https://williamhoza.com/blog/" />'
  
  indexFile = open("index.html", "w", encoding="utf-8")
  page.compile(False, main, extraHeadElements, indexFile)
  
