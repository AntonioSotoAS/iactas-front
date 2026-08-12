# 📊 API Ranking de Usuarios - Documentación Backend

## 🎯 Descripción
Endpoint para obtener el ranking de usuarios que han generado más actas, con filtros por sede y rango de fechas.

## 🔗 Endpoint
```http
GET /api/estadisticas/ranking-usuarios
```

## 📥 Parámetros de Query

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `sedeId` | number | No | ID de la sede para filtrar | `1` |
| `fechaInicio` | string | No | Fecha inicio en formato ISO | `2024-12-01T00:00:00.000Z` |
| `fechaFin` | string | No | Fecha fin en formato ISO | `2024-12-31T23:59:59.999Z` |
| `limit` | number | No | Límite de registros (default: 1000) | `100` |

## 📤 Estructura de Respuesta

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "María",
      "apellidos": "González Pérez",
      "email": "maria.gonzalez@pj.gob.pe",
      "totalActas": 156,
      "avatar": "https://ejemplo.com/avatar1.jpg",
      "posicion": 1
    },
    {
      "id": 2,
      "nombre": "Carlos",
      "apellidos": "Rodríguez Silva",
      "email": "carlos.rodriguez@pj.gob.pe",
      "totalActas": 142,
      "posicion": 2
    }
  ],
  "total": 2,
  "message": "Ranking de usuarios obtenido exitosamente",
  "filtros": {
    "sedeId": null,
    "fechaInicio": "2024-12-01T00:00:00.000Z",
    "fechaFin": "2024-12-31T23:59:59.999Z",
    "limit": 1000
  }
}
```

### Respuesta de Error (400/500)
```json
{
  "success": false,
  "data": [],
  "total": 0,
  "message": "Error interno del servidor",
  "error": "Error de conexión a la base de datos"
}
```

## 🗄️ Query SQL (PostgreSQL/MySQL)

```sql
SELECT 
    u.id,
    u.nombres as nombre,
    CONCAT(u.apellidos_paterno, ' ', u.apellidos_materno) as apellidos,
    u.correo as email,
    u.avatar,
    COUNT(ag.id) as totalActas,
    ROW_NUMBER() OVER (ORDER BY COUNT(ag.id) DESC) as posicion
FROM usuarios u
LEFT JOIN actas_generadas ag ON u.id = ag.creado_por_usuario_id
WHERE u.activo = true
    AND (ag.created_at IS NULL OR ag.created_at >= :fechaInicio)
    AND (ag.created_at IS NULL OR ag.created_at <= :fechaFin)
    AND (:sedeId IS NULL OR u.sede_id = :sedeId)
GROUP BY u.id, u.nombres, u.apellidos_paterno, u.apellidos_materno, u.correo, u.avatar
HAVING COUNT(ag.id) > 0  -- Solo usuarios que han generado al menos 1 acta
ORDER BY totalActas DESC
LIMIT :limit;
```

## 💻 Implementación Node.js/Express

```javascript
// GET /api/estadisticas/ranking-usuarios
app.get('/api/estadisticas/ranking-usuarios', async (req, res) => {
  try {
    const { sedeId, fechaInicio, fechaFin, limit = 1000 } = req.query;
    
    // Validar fechas si se proporcionan
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : null;
    
    // Construir query SQL
    let query = `
      SELECT 
        u.id,
        u.nombres as nombre,
        CONCAT(u.apellidos_paterno, ' ', u.apellidos_materno) as apellidos,
        u.correo as email,
        u.avatar,
        COUNT(ag.id) as totalActas,
        ROW_NUMBER() OVER (ORDER BY COUNT(ag.id) DESC) as posicion
      FROM usuarios u
      LEFT JOIN actas_generadas ag ON u.id = ag.creado_por_usuario_id
      WHERE u.activo = true
    `;
    
    const params = [];
    
    // Agregar filtros
    if (fechaInicioDate) {
      query += ` AND (ag.created_at IS NULL OR ag.created_at >= ?)`;
      params.push(fechaInicioDate);
    }
    
    if (fechaFinDate) {
      query += ` AND (ag.created_at IS NULL OR ag.created_at <= ?)`;
      params.push(fechaFinDate);
    }
    
    if (sedeId) {
      query += ` AND u.sede_id = ?`;
      params.push(sedeId);
    }
    
    query += `
      GROUP BY u.id, u.nombres, u.apellidos_paterno, u.apellidos_materno, u.correo, u.avatar
      HAVING COUNT(ag.id) > 0
      ORDER BY totalActas DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));
    
    // Ejecutar query
    const results = await db.query(query, params);
    
    // Formatear respuesta
    const response = {
      success: true,
      data: results,
      total: results.length,
      message: "Ranking de usuarios obtenido exitosamente",
      filtros: {
        sedeId: sedeId ? parseInt(sedeId) : null,
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
        limit: parseInt(limit)
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error al obtener ranking de usuarios:', error);
    res.status(500).json({
      success: false,
      data: [],
      total: 0,
      message: "Error interno del servidor",
      error: error.message
    });
  }
});
```

## 🔍 Validaciones

### ✅ Parámetros de Entrada
- **fechaInicio**: Formato ISO válido (YYYY-MM-DDTHH:mm:ss.sssZ)
- **fechaFin**: Formato ISO válido (YYYY-MM-DDTHH:mm:ss.sssZ)
- **limit**: Número entero entre 1 y 1000
- **sedeId**: Número entero válido que existe en la tabla sedes

### ✅ Lógica de Negocio
- Solo usuarios activos (`u.activo = true`)
- Solo usuarios que han generado al menos 1 acta
- Ordenamiento por total de actas (descendente)
- Posición calculada con ROW_NUMBER()

## 🚨 Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 400 | Parámetros inválidos | Fecha mal formateada |
| 404 | Sede no encontrada | sedeId inexistente |
| 500 | Error interno | Error de base de datos |

## 📋 Ejemplos de Uso

### 1. Obtener ranking completo
```http
GET /api/estadisticas/ranking-usuarios
```

### 2. Filtrar por sede
```http
GET /api/estadisticas/ranking-usuarios?sedeId=1
```

### 3. Filtrar por rango de fechas
```http
GET /api/estadisticas/ranking-usuarios?fechaInicio=2024-12-01T00:00:00.000Z&fechaFin=2024-12-31T23:59:59.999Z
```

### 4. Limitar resultados
```http
GET /api/estadisticas/ranking-usuarios?limit=50
```

### 5. Filtros combinados
```http
GET /api/estadisticas/ranking-usuarios?sedeId=1&fechaInicio=2024-12-01T00:00:00.000Z&fechaFin=2024-12-31T23:59:59.999Z&limit=100
```

## 🔧 Headers de Respuesta

```http
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📊 Estructura de Base de Datos

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos_paterno VARCHAR(100) NOT NULL,
    apellidos_materno VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(500),
    sede_id INTEGER REFERENCES sedes(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: actas_generadas
```sql
CREATE TABLE actas_generadas (
    id SERIAL PRIMARY KEY,
    creado_por_usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- otros campos...
);
```

## 🎯 Notas de Implementación

1. **Performance**: Considera agregar índices en `usuarios.sede_id` y `actas_generadas.creado_por_usuario_id`
2. **Caching**: Implementa cache Redis para consultas frecuentes
3. **Paginación**: Para grandes volúmenes, considera implementar paginación
4. **Logs**: Registra todas las consultas para monitoreo
5. **Seguridad**: Valida permisos de usuario antes de devolver datos

## 🔄 Versionado

- **v1.0.0**: Implementación inicial
- **v1.1.0**: Agregado filtro por sede
- **v1.2.0**: Agregado filtro por rango de fechas
