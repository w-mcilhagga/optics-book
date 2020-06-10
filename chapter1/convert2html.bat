cd src
copy /b header.md+body.md all.md
cd ..
multimarkdown src/all.md > body.html