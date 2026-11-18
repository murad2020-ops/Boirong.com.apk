Boirong Cash Memo — Android (.APK) App Builder Kit
=========================================================

Ei folder diye apni 2 vabe Android .APK file toiri korte parben:

UPAY 1: Cloud Theke Free .APK Compile (Computer-e Android Studio Lagbe Na)
--------------------------------------------------------------------------
1. GitHub.com-e ekta free repository khulun ebong ei ZIP-er shob file upload korun
   (ba git push korun).
2. Repository-r "Actions" tab-e jan -> "Build Android APK" workflow auto run hobe.
3. 2-3 minute por build sesh hole "Artifacts" theke "boirong-cash-memo-android-apk"
   download korun — etar bhetore real Android .APK file paben!
4. Oi .APK file Android phone-e niye Install korun.

UPAY 2: Nijer Computer-e Android Studio / SDK Diye .APK Build
-------------------------------------------------------------
1. Computer-e Node.js, Java JDK 17 ebong Android Studio SDK install thakle:
2. "BUILD_APK.bat" file-e double-click korun.
3. Build sesh hole "android\app\build\outputs\apk\debug\app-debug.apk" paben.
4. Play Store-er jonno signed release APK/AAB banate "npx cap open android"
   diye Android Studio-te open kore Build -> Generate Signed Bundle / APK korun.

Package ID: com.boirong.cashmemo
Version: 1.0.0 (code 1)
