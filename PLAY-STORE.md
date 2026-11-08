# Ficha de Google Play · BM Construcción

## Datos propuestos

**Nombre visible (hasta 30 caracteres):** BM Construcción

**Categoría:** Herramientas

**Descripción corta (hasta 80 caracteres):**

Calculá materiales y medidas para tu obra. Guardá estimaciones sin conexión.

**Descripción completa:**

BM Construcción reúne en una sola aplicación las herramientas que necesitás para planificar cantidades de materiales de construcción.

Calculá ladrillos para varias paredes, pallets, mortero de asiento, hormigón, pisos, revestimientos, pintura, revoques, carpetas, excavaciones, techos y peso de hierro. Incluye referencias de densidades y conversión de medidas, superficies, litros y toneladas.

**Todo organizado por obra.** Guardá tus cálculos con el nombre de tu proyecto, asigná precios unitarios en pesos argentinos y consultá un subtotal orientativo. Exportá tus resultados a CSV o a una copia de seguridad JSON.

**Funciona sin internet.** La versión Android contiene las calculadoras en el dispositivo. No necesitás crear una cuenta ni ingresar tus datos personales.

Los rendimientos de materiales son valores orientativos y editables. Siempre verificá medidas, fichas técnicas, normativa local y las recomendaciones de profesionales habilitados.

BM Construcción es una herramienta de BM-Apps.

## Datos técnicos y contacto

- ID Android propuesto: dev.bmapps.construccion
- Política de privacidad: https://fernandomembrilla53-dot.github.io/BM-Construccion/privacidad.html
- Correo de contacto: fernandomembrilla53@gmail.com
- Público: personal de obra, albañiles, técnicos y propietarios; no especialmente dirigida a menores.
- Publicidad: no integrada.
- Recopilación por la propia app: no; valores e historial en almacenamiento local. Validar Seguridad de los datos contra el AAB final.
- Permisos Android: no solicita red, ubicación, cámara ni archivos. Los documentos se guardan usando el selector del sistema.
- Código de versión: 1; versión 3.0.0.

## Recursos visuales

- Icono Play Store: icon-512.png, 512 × 512 px.
- Gráfico de funciones: store-assets/feature-graphic.png, 1024 × 500 px (generado en CI).
- Capturas reales: store-assets/screenshots/ (generadas mediante Playwright).

## Antes de subir a Play

1. Comprobar Android CI y probar APK en un dispositivo Android real.
2. Crear y conservar de manera segura la clave privada de subida, que no se guarda en GitHub.
3. Verificar package name, nombre, versión y ficha; firmar y subir el AAB.
4. Completar clasificación del contenido, publicidad, seguridad de los datos y acceso a la app.
5. Realizar las pruebas cerradas exigibles a esta app, si la cuenta debe cumplir 12 evaluadores durante 14 días seguidos.
6. Revisar resultados, resolver incidentes y solicitar producción cuando corresponda.

**Nota:** una compilación sin errores no equivale a aprobación por Google Play.
