# CafeChino - Proyecto Final (versión simple)

## Descripción
Proyecto con login y roles (admin/cliente), CRUD de productos (admin) y visualización (cliente).
Base de datos SQLite: `cafechino.db` se crea automáticamente al iniciar el servidor si no existe.

## Usuarios de prueba
- admin / admin123  (rol: admin)
- cliente / cliente123 (rol: cliente)

## Ejecutar localmente
1. Instalar dependencias:
   ```
   npm install
   ```
2. Iniciar servidor:
   ```
   npm start
   ```
3. Abrir en el navegador:
   ```
   http://localhost:3000/login.html
   ```

## Estructura
- server.js : servidor y rutas
- cafechino.db : base de datos SQLite (se crea automáticamente)
- public/ : archivos estáticos (HTML, CSS, JS)

