# Configuración PWA - IACTAS v2

## 🚀 Configuración Inicial

### 1. Generar Iconos
```bash
npm run pwa:setup
```

### 2. Personalizar Icono
1. Reemplaza `public/icons/icon.svg` con tu logo personalizado
2. El SVG debe ser de 512x512 píxeles
3. Usa colores que contrasten bien (recomendado: fondo rojo #dc2626)

### 3. Generar Iconos PNG (Opcional)
Si tienes ImageMagick instalado:
```bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generar iconos PNG
for size in 72 96 128 144 152 192 384 512; do
  convert public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done
```

## 📱 Funcionalidades PWA

### ✅ Implementadas
- ✅ Service Worker para cache offline
- ✅ Manifest.json para instalación
- ✅ Metadatos PWA en layout
- ✅ Botón de instalación automático
- ✅ Página offline personalizada
- ✅ Iconos en múltiples tamaños

### 🔧 Características
- **Cache Inteligente**: Almacena recursos estáticos
- **Instalación**: Botón flotante cuando está disponible
- **Offline**: Página personalizada sin conexión
- **Responsive**: Iconos adaptados a diferentes dispositivos

## 🎨 Personalización

### Colores del Tema
- **Color Principal**: #dc2626 (Rojo)
- **Color de Fondo**: #ffffff (Blanco)
- **Color de Texto**: #000000 (Negro)

### Configuración en `manifest.json`
```json
{
  "name": "IACTAS v2 - Sistema de Actas Judiciales",
  "short_name": "IACTAS v2",
  "theme_color": "#dc2626",
  "background_color": "#ffffff"
}
```

## 📋 Verificación

### 1. Chrome DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. Verifica:
   - ✅ Manifest cargado correctamente
   - ✅ Service Worker registrado
   - ✅ Iconos disponibles

### 2. Lighthouse
1. Ejecuta Lighthouse en Chrome DevTools
2. Verifica la puntuación PWA
3. Debería ser 90+ puntos

### 3. Instalación
1. En Chrome, busca el icono de instalación en la barra de direcciones
2. O usa el botón flotante "Instalar App"
3. La app debería instalarse correctamente

## 🐛 Solución de Problemas

### Service Worker no se registra
```javascript
// Verificar en consola del navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrados:', registrations);
});
```

### Iconos no aparecen
1. Verifica que los archivos PNG existan en `public/icons/`
2. Asegúrate de que las rutas en `manifest.json` sean correctas
3. Limpia el cache del navegador

### No aparece el botón de instalación
1. La app debe cumplir los criterios de instalabilidad
2. Debe tener HTTPS (excepto en localhost)
3. Debe tener un manifest válido
4. Debe tener un Service Worker registrado

## 📚 Recursos Adicionales

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
