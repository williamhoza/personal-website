from paper3 import Paper
import mainPage2
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
    print(paper.title)
    
    if not paper.isDissertation:
      abbrev = paper.abbrev
      if abbrev in slugCounts:
        slugCounts[abbrev] = slugCounts[abbrev] + 1
        paper.slug = abbrev + str(slugCounts[abbrev])
      else:
        slugCounts[abbrev] = 1
        paper.slug = abbrev
    
    paper.compile()
    
  mainPage2.compile(papers)
  
if __name__ == "__main__":
  main()
