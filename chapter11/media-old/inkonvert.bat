forfiles /m *.svg /c "cmd /c inkscape @file --export-eps=@fname.eps"
pause