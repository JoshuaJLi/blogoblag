import os
import sys

directory = ".\\site\\includes"

# code adapted from https://stackoverflow.com/a/2212728
for folder, subs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".html"):
                with open(os.path.join(folder, filename), 'r') as src:
                    jsFile = os.path.join(folder, os.path.basename(filename).split(".")[0] + ".js")
                    with open(jsFile, 'w') as dest:
                        compressedContent = src.read().replace('\n','').replace('\r','')
                        dest.write("document.write('" + compressedContent + "')")