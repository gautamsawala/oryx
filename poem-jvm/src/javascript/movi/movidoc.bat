@ECHO OFF

REM The location of your yuidoc install
SET yuidoc_home="c:\home\yuidoc\yuidoc"

REM The location of the files to parse.  Parses subdirectories, but will fail if
REM there are duplicate file names in these directories. 
SET parser_in="c:\home\eclipse_workspace/oryx/poem-jvm/src/javascript/movi/src"

REM The location to output the parser data.  This output is a file containing a 
REM json string, and copies of the parsed files.
SET parser_out="c:\home\eclipse_workspace/oryx/poem-jvm/src/javascript/movi/tmp"

REM The directory to put the html file outputted by the generator
SET generator_out="c:\home\eclipse_workspace/oryx/poem-jvm/src/javascript/movi/doc"

REM The location of the template files.  Any subdirectories here will be copied
REM verbatim to the destination directory.
SET template="%yuidoc_home%\template"

REM The project version that will be displayed in the documentation.
SET version="0.3"

REM The version of YUI the project uses.
SET yuiversion="2.7"

%yuidoc_home%\bin\yuidoc.py %parser_in% -p %parser_out% -o %generator_out% -t %template% -v %version% -Y %yuiversion%

