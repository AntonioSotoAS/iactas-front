const fs = require('fs');
const path = require('path');

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Crear un icono SVG básico como placeholder
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#dc2626"/>
  <path d="M128 128h256v64H128zM128 224h256v64H128zM128 320h256v64H128z" fill="white"/>
  <circle cx="384" cy="160" r="32" fill="white"/>
  <circle cx="384" cy="256" r="32" fill="white"/>
  <circle cx="384" cy="352" r="32" fill="white"/>
</svg>
`;

// Guardar el SVG base
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

console.log('✅ Iconos PWA generados exitosamente!');
console.log('📁 Directorio: public/icons/');
console.log('📝 Nota: Reemplaza icon.svg con tu logo personalizado');
console.log('🔧 Luego ejecuta: npm run build-icons');
