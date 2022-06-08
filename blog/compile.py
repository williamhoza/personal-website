from xml.etree import ElementTree
from post import Post
import mainPage
import os
from collections import OrderedDict

def main():
  slugs = [f.name for f in os.scandir(".") if f.is_dir() and f.name != "__pycache__"]
  unsortedPosts = {}
  for slug in slugs:
    newPost = Post(slug)
    newPost.compile()
    if "draft" not in newPost.metadata or not newPost.metadata["draft"]:
      unsortedPosts[slug] = Post(slug)
  
  items1 = sorted(unsortedPosts.items(), key=lambda it:it[1].metadata["time-slot"], reverse=True)
  items2 = sorted(items1, key=lambda it:it[1].dt, reverse=True)
  posts = OrderedDict(items2)
    
  mainPage.compile(posts)
  
  # RSS feed
  rss = ElementTree.Element("rss")
  rss.set("version", "2.0")
  channel = ElementTree.SubElement(rss, "channel")
  channelTitle = ElementTree.SubElement(channel, "title")
  channelTitle.text = "William Hoza's Blog"
  channelLink = ElementTree.SubElement(channel, "link")
  channelLink.text = "https://williamhoza.com/blog/"
  channelLanguage = ElementTree.SubElement(channel, "language")
  channelLanguage.text = "en-us"
  
  for post in list(posts.values())[:10]:
    URL = f"https://williamhoza.com/blog/{post.slug}/"
    
    item = ElementTree.SubElement(channel, "item")
    itemTitle = ElementTree.SubElement(item, "title")
    itemTitle.text = post.metadata["title"]
    itemLink = ElementTree.SubElement(item, "link")
    itemLink.text = URL
    itemPubDate = ElementTree.SubElement(item, "pubDate")
    itemPubDate.text = post.dt.isoformat()
    itemGUID = ElementTree.SubElement(item, "guid")
    itemGUID.text = URL
    itemDescription = ElementTree.SubElement(item, "description")
    itemDescription.text = f"{post.metadata['snippet']} Continue reading: <a href=\"{URL}\">{URL}</a>"
    
  ElementTree.ElementTree(rss).write("rss.xml", encoding="utf-8", xml_declaration=True)
  
if __name__ == "__main__":
  main()
