from bs4 import BeautifulSoup
    
def compile(papers):
    templateFile = open("main-page-template.html", "r", encoding="utf-8")
    soup = BeautifulSoup(templateFile.read(), 'html.parser')

    paperListOL = soup.new_tag("ol")
    paperListOL["class"] = "paper-list"

    surveyListOL = soup.new_tag("ol")
    surveyListOL["class"] = "paper-list"

    for paper in reversed(papers):
        if paper.isDissertation:
            a = soup.new_tag("a")
            a["href"] = "dissertation"
            a["style"] = "font-style:normal;"
            a.string = paper.title
            soup.find("data", value="DISSERTATION").replace_with(a)
        else:
            li = soup.new_tag("li")
            li["style"] = "font-style:italic;"

            a = soup.new_tag("a")
            a["href"] = f"papers/{paper.slug}"
            a["style"] = "font-style:normal;"
            a.string = paper.title
            li.append(a)
            li.append(soup.new_tag("br"))
            li.append(paper.authors)
            li.append(soup.new_tag("br"))
            li.append(" • ".join(paper.venues))

            if paper.isSurvey:
                surveyListOL.append(li)
            else:
                paperListOL.append(li)

    soup.find("data", value="SURVEY-LIST").replace_with(surveyListOL)
    soup.find("data", value="PAPER-LIST").replace_with(paperListOL)
    
    indexFile = open("index.html", "w", encoding="utf-8")
    indexFile.write(str(soup))
