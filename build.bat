SET BASEDIR=%CD%
SET PROFILE=%BASEDIR%\profiles\app.profile.js

SET DISTDIR=%BASEDIR%\dist

rmdir /s /q %DISTDIR%
mkdir %DISTDIR%

SET DISTDIR=%DISTDIR:\=/%
SET SRCDIR=%BASEDIR%\src
SET LOADERMID=app\run
SET LOADERCONF=%SRCDIR%\%LOADERMID%.js
SET LOADERCONF=%LOADERCONF:\=/%

cd %BASEDIR%\src\util\buildscripts

start /WAIT build --require %LOADERCONF% --profile %PROFILE% --releaseDir %DISTDIR%

cd %DISTDIR%

del /s /q *.consoleStripped.js

cd %BASEDIR%

type %SRCDIR%\index.html|perl -pe "s/<script data-dojo.*?<\/script>/<script src='dojo\/dojo\.js' data-dojo-config=\"deps:['app\/run']\"><\/script>/;s/<script src=\'app.*?<\/script>//;s/<\!--.*?-->//g;s/\s+/ /g;">"%DISTDIR%/index.html"

pause