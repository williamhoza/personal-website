from bs4 import BeautifulSoup
    
def compile(papers):
    templateFile = open("main-page-template.html", "r", encoding="utf-8")
    soup = BeautifulSoup(templateFile.read(), 'html.parser')

    paperListOL = soup.new_tag("ol")
    paperListOL["class"] = "paper-list2"

    surveyListOL = soup.new_tag("ol")
    surveyListOL["class"] = "paper-list2"

    dissertationOL = soup.new_tag("ol")
    dissertationOL["class"] = "paper-list2"

    for paper in reversed(papers):
        if paper.isDissertation:
            li = soup.new_tag("li")

            a = soup.new_tag("a")
            a["href"] = "dissertation"
            a["style"] = "font-style:normal;"
            a.string = paper.title
            li.append(a)

            authorp = soup.new_tag("p")
            authorp.append(paper.authors)
            li.append(authorp)

            yearp = soup.new_tag("p")
            yearp.append("2021") # hard-coded for simplicity
            yearp["style"] = "font-style:italic;"
            li.append(yearp)

            dissertationOL.append(li)
        else:
            li = soup.new_tag("li")
            # li["style"] = "font-style:italic;"

            a = soup.new_tag("a")
            a["href"] = f"papers/{paper.slug}"
            a["style"] = "font-style:normal;"
            a.string = paper.title
            li.append(a)

            authorp = soup.new_tag("p")
            authorp.append(paper.authors)
            li.append(authorp)

            venuesp = soup.new_tag("p")
            venuesp.append(" • ".join(paper.venues))
            venuesp["style"] = "font-style:italic;"
            li.append(venuesp)

            # li.append(soup.new_tag("br"))
            # li.append(paper.authors)
            # li.append(soup.new_tag("br"))
            # li.append(" • ".join(paper.venues))

            if paper.isSurvey:
                surveyListOL.append(li)
            else:
                paperListOL.append(li)

    soup.find("data", value="SURVEY-LIST").replace_with(surveyListOL)
    soup.find("data", value="PAPER-LIST").replace_with(paperListOL)
    soup.find("data", value="DISSERTATION").replace_with(dissertationOL)
    
    indexFile = open("index.html", "w", encoding="utf-8")
    indexFile.write(str(soup))
