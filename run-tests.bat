@echo off
set JAVA_HOME=D:\Program Files\Microsoft\jdk-21.0.7.6-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

echo Running Maven tests...
echo JAVA_HOME: %JAVA_HOME%
echo Java version:
java -version

echo.
echo Running tests with Maven...
mvnw.cmd test

echo.
echo Test execution completed.
pause
