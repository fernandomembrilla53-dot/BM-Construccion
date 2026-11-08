# BM Construcción 3.0

**BM Construcción** es una app de estimaciones de obra para Argentina, con diseño adaptable y cálculos locales. Su versión web es instalable como PWA y la versión Android empaqueta las herramientas para uso sin internet.

## Herramientas

1. Muros y ladrillos: varias paredes, aberturas, pallets, mortero y peso de piezas.
2. Hormigón: volumen neto, reserva, litros y peso por densidad.
3. Pisos y revestimientos: cajas, piezas, adhesivo y cortes.
4. Pintura: superficie neta, manos, litros y envases.
5. Revoques: área, espesor y volumen de mezcla fresca.
6. Carpetas y contrapisos: volumen y masa orientativa.
7. Excavación: volumen en banco, esponjamiento y viajes por volumen.
8. Techos: superficie inclinada y chapas útiles.
9. Hierro: peso por metro y masa total de barras redondas.
10. Pesos y volúmenes: densidades editables.
11. Conversión de unidades: longitud, superficie, volumen y masa.

Permite sumar precios unitarios manuales, guardar cálculos por obra en el dispositivo, exportar CSV/JSON e imprimir. No utiliza registro, servidores, anuncios ni seguimiento en esta versión.

## Web

**Sitio público:** https://fernandomembrilla53-dot.github.io/BM-Construccion/

Proyecto HTML, CSS y JavaScript sin dependencias en ejecución. PWA con service worker para caché offline. Motor de cálculo independiente en calculations.js con pruebas automáticas.

## Android

Código fuente en la carpeta android/. Los archivos de la web se empaquetan en los assets del APK/AAB, con WebViewAssetLoader y una URL local segura. No requiere TWA ni asociar digital asset links. La exportación de documentos usa el selector de archivos de Android; la impresión usa Print Framework. No solicita permisos especiales ni de internet.

- JDK 17, Android SDK 36, Gradle 8.13, Android Gradle Plugin 8.13.2.
- ID propuesto: dev.bmapps.construccion
- minSdk 24, targetSdk 36, versionCode 1, versionName 3.0.0.
- GitHub Actions android.yml genera APK debug y AAB release **sin firma de publicación**.

El AAB para Play Store debe firmarse con una clave de subida privada que se mantenga fuera de GitHub. La prueba cerrada que corresponda se debe completar para BM Construcción por separado.

## Pruebas automáticas

- Node: node --test tests/calculations.test.js
- Sintaxis: node --check calculations.js y node --check app.js
- Navegador: tests/ui-smoke.cjs ejecuta Playwright en CI.
- Flujo de Android: .github/workflows/android.yml

## Limitaciones importantes

Ver fuentes.html, privacidad.html y terminos.html. Ajustar rendimientos a fichas reales y condiciones de obra. La app **no realiza cálculo estructural**, no dimensiona armaduras, no determina resistencia ni comprueba seguridad de zanjas o transporte.

© 2026 BM-Apps.
