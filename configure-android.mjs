import fs from 'fs';
import path from 'path';

const root = process.cwd();
const androidMain = path.join(root, 'android', 'app', 'src', 'main');
const resDir = path.join(androidMain, 'res');
const srcIconsDir = path.join(root, 'res-icons');

// 1. Copy launcher icons
if (fs.existsSync(srcIconsDir) && fs.existsSync(resDir)) {
  for (const folder of fs.readdirSync(srcIconsDir)) {
    const srcFolder = path.join(srcIconsDir, folder);
    const dstFolder = path.join(resDir, folder);
    fs.mkdirSync(dstFolder, { recursive: true });
    for (const file of fs.readdirSync(srcFolder)) {
      fs.copyFileSync(path.join(srcFolder, file), path.join(dstFolder, file));
    }
  }
  console.log('Copied Android launcher icons.');
}

// 2. Patch AndroidManifest.xml with audio/storage permissions
const manifestPath = path.join(androidMain, 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  const perms = [
    'android.permission.INTERNET',
    'android.permission.RECORD_AUDIO',
    'android.permission.MODIFY_AUDIO_SETTINGS'
  ];
  for (const perm of perms) {
    if (!manifest.includes(perm)) {
      manifest = manifest.replace(
        '<application',
        `    <uses-permission android:name="${perm}" />\n    <application`
      );
    }
  }
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = manifest.replace(
      '<application',
      '<application android:usesCleartextTraffic="true"'
    );
  }
  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('Updated AndroidManifest.xml permissions.');
}

// 3. Patch app/build.gradle versionCode & versionName
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/, 'versionCode 1');
  gradle = gradle.replace(/versionName\s+"[^"]+"/, 'versionName "1.0.0"');
  fs.writeFileSync(gradlePath, gradle, 'utf8');
  console.log('Updated Android versionCode/versionName.');
}

// 4. Enhance MainActivity.java for Microphone & WhatsApp external links
function findMainActivity(dir) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findMainActivity(full);
      if (found) return found;
    } else if (entry.name === 'MainActivity.java') {
      return full;
    }
  }
  return null;
}

const mainActivityPath = findMainActivity(path.join(androidMain, 'java'));
if (mainActivityPath) {
  const packageMatch = fs.readFileSync(mainActivityPath, 'utf8').match(/^package\s+([^;]+);/m);
  const pkgName = packageMatch ? packageMatch[1] : 'com.boirong.cashmemo';
  const customMainActivity = `package ${pkgName};

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, 101);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            final WebChromeClient originalChrome = webView.getWebChromeClient();
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> request.grant(request.getResources()));
                }

                @Override
                public boolean onShowFileChooser(WebView view, android.webkit.ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                    if (originalChrome != null) {
                        return originalChrome.onShowFileChooser(view, filePathCallback, fileChooserParams);
                    }
                    return super.onShowFileChooser(view, filePathCallback, fileChooserParams);
                }
            });
        }
    }
}
`;
  fs.writeFileSync(mainActivityPath, customMainActivity, 'utf8');
  console.log('Configured MainActivity.java for audio & file chooser.');
}
