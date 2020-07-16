from paper import Paper
# import mainPage
import os
from collections import OrderedDict

def main():
  filenames = [f.name for f in os.scandir("./data")]
  papers = []
  for filename in filenames:
    papers.append(Paper(filename))
    
  # Sort by date
  papers.sort(key=lambda paper:paper.firstPostedDate)
  
  # Slug based on author names
  slugCounts = {}
  for paper in papers:
    print(paper.metadata["title"])
    abbrev = paper.metadata["abbreviation"]
    if abbrev in slugCounts:
      slugCounts[abbrev] = slugCounts[abbrev] + 1
      paper.slug = abbrev + str(slugCounts[abbrev])
    else:
      slugCounts[abbrev] = 1
      paper.slug = abbrev
    
    paper.compile()
    
  # items1 = sorted(unsortedPosts.items(), key=lambda it:it[1].metadata["time-slot"], reverse=True)
  # items2 = sorted(items1, key=lambda it:it[1].dt, reverse=True)
  # posts = OrderedDict(items2)
    
  # mainPage.compile(posts)
  
if __name__ == "__main__":
  main()
