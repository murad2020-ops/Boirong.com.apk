@echo off
title Boirong Cash Memo - Android .APK Builder
cd /d "%~dp0"
echo ============================================================
echo   Boirong Cash Memo - Android .APK Builder (Capacitor)
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js pawa jayni. https://nodejs.org/ theke Node.js install korun.
    pause
    exit /b 1
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java JDK 17 pawa jayni. Android Studio ba JDK 17 install korun,
    echo othoba GitHub Actions workflow (.github\workflows\build-apk.yml) bebohar kore
    echo kono software install charai Cloud theke .APK download korun!
    pause
    exit /b 1
)

echo [1/4] Installing Capacitor dependencies...
call npm install
if %errorlevel% neq 0 (
    pause
    exit /b 1
)

if not exist "android" (
    echo [2/4] Creating Android native project...
    call npx cap add android
)

echo [3/4] Applying icons and permissions...
call node scripts\configure-android.mjs
call npx cap sync android

echo [4/4] Building Android .APK via Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERROR] Gradle build failed. Check Android Studio SDK setup.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCESS! Your Android APK is ready:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================================
start "" "app\build\outputs\apk\debug"
pause
