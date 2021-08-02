import os
import json

def main():
  arr = []
  
  (_, _, filenames) = next(os.walk("./item-svgs/"))
  for filename in filenames:
    ob = {}
    ob["title"] = filename[:-4].replace("-", " ")
    
    f = open(f"./item-svgs/{filename}", "r", encoding="utf-8")
    src = f.read()
    f.close()
    
    assert(src[:247] == '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!-- Generator: Gravit.io --><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 1000 1000" width="1000pt" height="1000pt">')
    
    ob["img"] = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 1000 1000">' + src[247:]
    
    arr.append(ob)
  
  f = open("items-bundled.json", "w", encoding="utf-8")  
  json.dump(arr, f)
  print(len(arr))

main()
