# Reusable APK build script (Windows, no admin needed).
# Requires: portable JDK 21 in $env:TEMP\opencode\jdk21 and SDK in %LOCALAPPDATA%\Android\Sdk
# (both installed during initial setup). Run from the repo root: .\build-apk.ps1
$ErrorActionPreference = 'Stop'
$jdk = (Get-ChildItem "$env:TEMP\opencode\jdk21" | Select-Object -First 1).FullName
$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$jdk\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
Set-Location (Join-Path $PSScriptRoot 'app\android')
.\gradlew.bat assembleDebug --no-daemon
$apk = 'app\build\outputs\apk\debug\app-debug.apk'
New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot 'release') | Out-Null
Copy-Item $apk (Join-Path $PSScriptRoot 'release\FlawlessAceTouch-debug.apk') -Force
& "$env:ANDROID_HOME\build-tools\36.0.0\apksigner.bat" verify (Join-Path $PSScriptRoot 'release\FlawlessAceTouch-debug.apk')
(Get-FileHash (Join-Path $PSScriptRoot 'release\FlawlessAceTouch-debug.apk') -Algorithm SHA256).Hash
'Install: copy the APK to your phone, open it, allow "install unknown apps" when asked.'
