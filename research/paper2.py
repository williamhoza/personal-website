import json
import os
import shutil
from bs4 import BeautifulSoup

from datetime import date

class Paper:
  def __init__(self, filename):
    self.filename = filename
    
    dataFile = open(f"./data/{filename}/data.html", "r", encoding="utf-8")
    self.dataSoup = BeautifulSoup(dataFile.read(), 'html.parser')
    
    self.firstPostedDate = date.fromisoformat(self.dataSoup.find("data", value="FIRST-POSTED").text.strip())
    self.title = self.dataSoup.find("data", value="TITLE").text.strip()
    self.authors = self.dataSoup.find("data", value="AUTHORS").text.strip()
    self.paperLinks = self.dataSoup.find("data", value="PAPER-LINKS").find_all("a")

    self.abstract = self.dataSoup.find("data", value="ABSTRACT")
    self.abstract.name = "div"
    self.abstract["class"] = "indent"
    del self.abstract["value"]

    self.notSoAbstract = self.dataSoup.find("data", value="NOT-SO-ABSTRACT")
    self.notSoAbstract.name = "div"
    self.notSoAbstract["class"] = "indent"
    del self.notSoAbstract["id"]

    self.versionSummary = self.dataSoup.find("data", value="VERSION-SUMMARY").contents

    self.expository = self.dataSoup.find("data", value="EXPOSITORY")
    if (self.expository != None):
      self.expository.name = "div"
      self.expository["class"] = "expository"
      del self.expository["id"]

    self.toc = self.dataSoup.find("data", value="TOC")
    if (self.toc != None):
      self.toc.name = "div"
      self.toc["class"] = "indent toc"
      del self.toc["id"]

    self.abbrev = self.dataSoup.find("data", value="ABBREV").text.strip()

    self.recognition = self.dataSoup.find_all("data", value="RECOGNITION")
    self.copyright = self.dataSoup.find("data", value="COPYRIGHT")
    if self.copyright != None:
      self.copyright = self.copyright.text.strip()

    self.errata = self.dataSoup.find_all("data", value="ERRATUM")

    self.isDissertation = False

    self.venues = [t.text.strip() for t in self.dataSoup.find_all("data", value="VENUE")]

    self.isSurvey = (self.dataSoup.find("data", value="SURVEY") != None)
    self.isDissertation = (self.dataSoup.find("data", value="DISSERTATION") != None)
    
  def compile(self): 
    templateFile = open("paper-page-template.html", "r", encoding="utf-8")
    self.pageSoup = BeautifulSoup(templateFile.read(), 'html.parser')

    for t in self.pageSoup.find_all("data", value="TITLE"):
      t.replace_with(self.title)

    for t in self.pageSoup.find_all("data", value="AUTHORS"):
      if self.isSurvey:
        t.replace_with(f"Survey paper by {self.authors}")
      else:
        t.replace_with(f"By {self.authors}")

    for t in self.pageSoup.find_all("data", value="PAPER-LINKS"):
      first = True
      for l in self.paperLinks:
        if not first:
          t.append(" • ")
        first = False
        t.append(l)
      t.unwrap()

    for t in self.pageSoup.find_all("data", value="ABSTRACT"):
      t.replace_with(self.abstract)
    
    for t in self.pageSoup.find_all("data", value="NOT-SO-ABSTRACT"):
      t.replace_with(self.notSoAbstract)

    for t in self.pageSoup.find_all("data", value="VERSION-SUMMARY"):
      t.extend(self.versionSummary)
      t.unwrap()

    for t in self.pageSoup.find_all("data", value="TOC"):
      if (self.toc == None):
        t.decompose()
      else:
        h = self.pageSoup.new_tag("details")
        s = self.pageSoup.new_tag("summary")
        s.string = "Table of contents"
        h.append(s)
        h.append(self.toc)
        t.append(h)
        t.unwrap()

    for t in self.pageSoup.find_all("data", value="EXPOSITORY"):
      if self.expository == None:
        t.decompose()
      else:
        t.append(self.pageSoup.new_tag("hr"))
        h = self.pageSoup.new_tag("p")
        h.string = "Expository material:"
        t.append(h)
        t.append(self.expository)
        t.unwrap()

    for t in self.pageSoup.find_all("data", value="RECOGNITION"):
      if len(self.recognition) == 0:
        t.decompose()
      else:
        h = self.pageSoup.new_tag("p")
        h.string = "What others think:"
        t.append(h)
        u = self.pageSoup.new_tag("ul")
        for r in self.recognition:
          r.name = "li"
          del r["value"]
          u.append(r)
        t.append(u)

    for t in self.pageSoup.find_all("data", value="COPYRIGHT"):
      if self.copyright == None:
        t.decompose()
      else:
        t.name = "p"
        del t["value"]
        t["style"] = "font-size:12px;"
        t.string = f"Copyright info: {self.copyright}"

    for t in self.pageSoup.find_all("data", value="ERRATA"):
      if len(self.errata) == 0:
        t.decompose()
      else:
        h = self.pageSoup.new_tag("p")
        h.string = "☢️ Errata:"
        t.append(h)
        u = self.pageSoup.new_tag("ul")
        for e in self.errata:
          e.name = "li"
          del e["value"]
          u.append(e)
        t.append(u)

    if self.isDissertation:
      self.dirPath = "dissertation"
    else:
      self.dirPath = f"papers/{self.slug}"

    if os.path.exists(self.dirPath):
      assert os.path.isdir(self.dirPath), "Slug problem"
    else:
      os.makedirs(self.dirPath)

    indexFile = open(f"{self.dirPath}/index.html", "w", encoding="utf-8")
    indexFile.write(str(self.pageSoup))
    
    if os.path.exists(f"data/{self.filename}/assets"):
      for asset in os.listdir(f"data/{self.filename}/assets"):
        if not os.path.exists(f"{self.dirPath}/{asset}"):
          assetPath = os.path.join(f"data/{self.filename}/assets", asset)
          shutil.copy(assetPath, f"{self.dirPath}/")
