// helpers/modelo.ts
export function extraerEncabezadosModelo(textoModelo: string): string[] {
  const lineas = textoModelo.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  
  const encabezados: string[] = [];
  
  for (const linea of lineas) {
    // Detectar títulos en mayúsculas (más de 3 caracteres, sin minúsculas)
    if (/^[A-ZÁÉÍÓÚÑ0-9\s\-\.:;()]+$/.test(linea) && linea.length >= 3 && linea.length <= 140) {
      // Verificar que no sea solo números o caracteres especiales
      if (!/^[\d\s\-\.:;()]+$/.test(linea)) {
        encabezados.push(linea);
        continue;
      }
    }
    
    // Detectar numeración (1., 1.1., etc.)
    if (/^(\d+(\.\d+)*)\s+/.test(linea)) {
      encabezados.push(linea);
      continue;
    }
    
    // Detectar palabras clave de títulos
    if (/^(CAP[IÍ]TULO|SECCI[ÓO]N|T[ÍI]TULO|ART[ÍI]CULO|P[ÁA]RRAFO|INCISO|LITERAL)\b/i.test(linea)) {
      encabezados.push(linea);
      continue;
    }
    
    // Detectar títulos con formato específico (ej: "I. TÍTULO", "A) SUBSECCIÓN")
    if (/^[IVX]+\.\s+[A-ZÁÉÍÓÚÑ]/.test(linea) || /^[A-Z]\)\s+[A-ZÁÉÍÓÚÑ]/.test(linea)) {
      encabezados.push(linea);
      continue;
    }
  }
  
  // Filtrar duplicados y mantener orden
  const encabezadosUnicos: string[] = [];
  for (const encabezado of encabezados) {
    if (!encabezadosUnicos.includes(encabezado)) {
      encabezadosUnicos.push(encabezado);
    }
  }
  
  return encabezadosUnicos;
}

export function formatearEstructura(encabezados: string[]): string {
  if (encabezados.length === 0) {
    return "ESTRUCTURA: Usar encabezados estándar de acta judicial";
  }
  
  return [
    "🚨 ESTRUCTURA OBLIGATORIA - USA SOLO ESTOS ENCABEZADOS, EN ESTE ORDEN EXACTO:",
    "⚠️ PROHIBIDO agregar, eliminar o modificar estos títulos",
    "",
    ...encabezados.map((t, i) => `${i + 1}. ${t}`),
    "",
    "📋 INSTRUCCIONES:",
    "- Copia EXACTAMENTE estos títulos en el mismo orden",
    "- NO agregues títulos nuevos",
    "- NO elimines títulos existentes", 
    "- NO cambies el texto de los títulos"
  ].join("\n");
}
