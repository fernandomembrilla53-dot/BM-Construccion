package dev.bmapps.construccion;

import android.app.Activity;
import android.app.PrintManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Contenido HTML local de BM Construcción, sin permisos de red ni acceso a archivos. */
public final class MainActivity extends Activity {
    private static final int SAVE_REQUEST = 175;
    private static final String ORIGIN = "appassets.androidplatform.net";
    private WebView web;
    private byte[] pendingContent;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(android.graphics.Color.rgb(16, 23, 34));
        getWindow().setNavigationBarColor(android.graphics.Color.rgb(16, 23, 34));
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web = new WebView(this);
        web.setBackgroundColor(android.graphics.Color.rgb(16, 23, 34));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new NativeFiles(), "BMAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (ORIGIN.equals(uri.getHost()) && "https".equals(uri.getScheme())) return false;
                String scheme = uri.getScheme();
                if ("https".equals(scheme) || "mailto".equals(scheme) || "tel".equals(scheme)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (Exception ex) { Toast.makeText(MainActivity.this, "No se pudo abrir el enlace.", Toast.LENGTH_SHORT).show(); }
                }
                return true;
            }
        });
        setContentView(web);
        web.loadUrl("https://" + ORIGIN + "/assets/index.html");
    }

    /** Puente expuesto solo al HTML local. Se limita a imprimir y exportar archivos. */
    public final class NativeFiles {
        @JavascriptInterface public void printDocument() {
            runOnUiThread(() -> {
                PrintManager manager = (PrintManager)getSystemService(Context.PRINT_SERVICE);
                if (manager != null)
                    manager.print("BM Construcción", web.createPrintDocumentAdapter("Mi obra"),
                            new android.print.PrintAttributes.Builder().build());
            });
        }
        @JavascriptInterface public void saveFile(String fileName, String contents, String mime) {
            if (fileName == null || contents == null || mime == null || contents.length() > 5000000) return;
            final String cleanName = fileName.replaceAll("[^A-Za-z0-9._-]", "_");
            final String type = "application/json".equals(mime) ? "application/json" : "text/csv";
            final byte[] data = contents.getBytes(StandardCharsets.UTF_8);
            runOnUiThread(() -> {
                pendingContent = data;
                Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                save.addCategory(Intent.CATEGORY_OPENABLE);
                save.setType(type);
                save.putExtra(Intent.EXTRA_TITLE, cleanName.substring(0,Math.min(85,cleanName.length())));
                try { startActivityForResult(save, SAVE_REQUEST); }
                catch (Exception ex) { pendingContent=null; Toast.makeText(MainActivity.this, "No se pudo abrir el selector de archivos.",Toast.LENGTH_LONG).show(); }
            });
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if (requestCode == SAVE_REQUEST) {
            if(resultCode == RESULT_OK && data != null && data.getData() != null && pendingContent != null) {
                try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                    if (output == null) throw new java.io.IOException("Sin destino");
                    output.write(pendingContent);
                    Toast.makeText(this,"Archivo guardado.",Toast.LENGTH_SHORT).show();
                } catch(Exception ex) { Toast.makeText(this,"No se pudo guardar el archivo.",Toast.LENGTH_LONG).show(); }
            }
            pendingContent=null;
        }
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if(web != null) { web.removeJavascriptInterface("BMAndroid");web.destroy(); web=null; }
        super.onDestroy();
    }
}
