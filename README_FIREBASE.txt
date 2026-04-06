╔════════════════════════════════════════════════════════════════════════════════╗
║                      PLATAFORMA SAAS - FREE FIRE STORE                         ║
║                    Transformación de Tienda a Multi-Tenant                     ║
╚════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ÍNDICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Cambios Principales
2. Configuración Firebase
3. Estructura de Archivos
4. Base de Datos (Firestore)
5. Despliegue
6. Roles y Permisos
7. Guía de Uso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ CAMBIOS PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ FRONTEND ORIGINAL - SIN CAMBIOS EN DISEÑO
   • La tienda de usuarios mantiene 100% del diseño gaming
   • Nuevos campos: UID Jugador
   • Integración automática con Firebase (opcional)
   • Los usuarios pueden usar como app anónima

✅ SISTEMA MODULAR CON FIREBASE
   • Autenticación con email/password
   • Persistencia de pedidos en Firestore
   • Configuración dinámica por usuario
   • Productos dinámicos desde base de datos

✅ PANEL ADMIN (revendedor)
   • admin.html → acceso con login
   • Ver/editar configuración de tienda
   • Gestionar productos y precios
   • Ver y actualizar estado de pedidos
   • Estadísticas de ventas

✅ PANEL MASTER (super admin)
   • master.html → acceso restringido
   • Ver todos los usuarios
   • Ver ventas globales
   • Crear nuevos usuarios
   • Configuración global del sistema

✅ SERVICIOS FIREBASE MODULAR
   • firebase-config.js → Configuración
   • firebase-services.js → Servicios CRUD
   • store-config.js → Carga dinámica de config
   • store-script.js → Lógica de tienda

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ CONFIGURACIÓN FIREBASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1: Crear Proyecto en Firebase Console
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Ir a https://console.firebase.google.com
2. Click en "Crear proyecto"
3. Nombre: "freefire-store" (o el que prefieras)
4. Seleccionar región
5. Crear proyecto

PASO 2: Habilitar Firestore Database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. En el menú lateral, ir a "Firestore Database"
2. Click "Crear base de datos"
3. Seleccionar región
4. Modo de seguridad: "Comenzar en modo prueba"
   (IMPORTANTE: Cambiar a modo producción después)

PASO 3: Habilitar Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Ir a "Authentication" en menú
2. Click en "Comenzar"
3. Habilitar "Email/Contraseña"
4. Habilitar "Google" (opcional pero recomendado)

PASO 4: Obtener Configuración
━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Ir a Configuración del proyecto (⚙️)
2. Seleccionar tu app web
3. Copiar la configuración:

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD...",
  authDomain: "freefire-store-xxx.firebaseapp.com",
  projectId: "freefire-store-xxx",
  storageBucket: "freefire-store-xxx.appspot.com",
  messagingSenderId: "123456789000",
  appId: "1:123456789000:web:abc123"
};

4. Reemplazar en firebase-config.js

PASO 5: Crear Índices en Firestore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No es necesario crear índices manualmente. Firebase los sugiere
automáticamente cuando lo necesite.

PASO 6: Crear Usuario Admin (Importante)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. En Authentication, click "+ Agregar usuario"
2. Email: admin@tutienda.com
3. Contraseña: (segura, mínimo 6 caracteres)
4. Click "Agregar usuario"
5. Este será tu primer admin

6. Abrir la consola de navegador y ejecutar:

firebase.auth().onAuthStateChanged(user => {
  if (user) console.log("UID:", user.uid);
});

7. Copiar el UID del usuario
8. Ir a Firestore → Crear documento en colección "users"
   Documento ID: (pegar el UID)
   Agregar datos:
   {
     "id": "uid_del_usuario",
     "nombre": "Admin",
     "email": "admin@tutienda.com",
     "telefono": "5492646706973",
     "plan": "master",
     "nombreTienda": "ARG STORE",
     "colorTema": "#FF6B00",
     "estado": "activo",
     "createdAt": timestamp,
     "updatedAt": timestamp,
     "config": {
       "mostrarSorteos": true,
       "mostrarPromociones": false,
       "preciosPersonalizados": false,
       "comisiones": 0.15
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ ESTRUCTURA DE ARCHIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RAÍZ DEL PROYECTO
│
├── 📄 index.html                  ← Tienda (sin cambios en diseño)
├── 📄 styles.css                  ← Estilos tienda (ORIGINAL)
├── 📄 store-script.js             ← Script tienda mejorado
├── 📄 manifest.json               ← PWA manifest
├── 📄 service-worker.js           ← Service worker PWA
│
├── 🔥 FIREBASE CORE
│   ├── firebase-config.js         ← Credenciales y setup
│   ├── firebase-services.js       ← Servicios CRUD
│   └── store-config.js            ← Carga dinámica de config
│
├── 👤 ADMIN PANEL
│   ├── admin.html                 ← Panel revendedor
│   ├── admin-script.js            ← Lógica admin
│   └── admin-styles.css           ← Estilos admin
│
├── 👑 MASTER PANEL
│   ├── master.html                ← Panel super admin
│   ├── master-script.js           ← Lógica master
│   └── (usa admin-styles.css)
│
├── 🎨 ASSETS
│   └── icons/                     ← Iconos PWA (icon-192.png, icon-512.png)
│
└── 📋 DOCS
    └── README_FIREBASE.txt        ← Este archivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣ ESTRUCTURA FIRESTORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLECCIÓN: users
├─ Documento: {uid_usuario}
│  ├─ id (string): uid del usuario
│  ├─ nombre (string): Nombre
│  ├─ email (string): Email
│  ├─ telefono (string): WhatsApp
│  ├─ plan (string): "free", "pro", "master"
│  ├─ nombreTienda (string): Nombre de tienda
│  ├─ colorTema (string): Color hex #RRGGBB
│  ├─ logoUrl (string): URL del logo
│  ├─ descripcion (string): Descripción
│  ├─ estado (string): "activo", "suspendido"
│  ├─ createdAt (timestamp)
│  ├─ updatedAt (timestamp)
│  └─ config (map)
│     ├─ mostrarSorteos (boolean)
│     ├─ mostrarPromociones (boolean)
│     ├─ preciosPersonalizados (boolean)
│     └─ comisiones (number): 0.15

COLECCIÓN: pedidos
├─ Documento: {order_id}
│  ├─ id (string): ID único del pedido
│  ├─ userId (string): UID del vendedor
│  ├─ nombreCliente (string)
│  ├─ uidJugador (string): UID de Free Fire
│  ├─ edadCliente (number)
│  ├─ metodoPago (string): "Transferencia", "Efectivo"
│  ├─ productos (array)
│  │  └─ [0] (map)
│  │     ├─ id (number)
│  │     ├─ diamantes (number)
│  │     └─ precio (number)
│  ├─ total (number)
│  ├─ estado (string): "pendiente", "pagado", "entregado", "cancelado"
│  ├─ fecha (timestamp)
│  └─ notasAdmin (string)

COLECCIÓN: usuarios_pedidos (por usuario)
├─ Documento: {uid_usuario}
│  └─ Subcollection: todos
│     └─ {order_id}: Copia del pedido (para consultas rápidas)

COLECCIÓN: productos
├─ Documento: {product_id}
│  ├─ id (number)
│  ├─ diamantes (number)
│  ├─ precioBase (number)
│  ├─ badge (string): "STARTER", "POPULAR", etc
│  ├─ descripcion (string)
│  ├─ imagen (string): URL imagen
│  ├─ activo (boolean)
│  └─ valorBar (number): 0-100

COLECCIÓN: configuracion_global
├─ Documento: settings
│  ├─ comisiones (number): 0.15
│  ├─ limites (map)
│  ├─ notificaciones (map)
│  └─ versiones (map)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣ DESPLIEGUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPCIÓN A: Firebase Hosting (RECOMENDADO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Instalar Firebase CLI:
   npm install -g firebase-tools

2. Login:
   firebase login

3. Inicializar proyecto:
   firebase init hosting

4. Seleccionar el proyecto de Firebase Console
5. Public directory: . (o la carpeta raíz)
6. Configure as a single-page app? Y
7. Overwrite index.html? N

8. Deploy:
   firebase deploy

Tu sitio estará en: https://proyecto-xxx.firebaseapp.com

OPCIÓN B: Vercel
━━━━━━━━━━━━━━

1. Push a GitHub
2. Conectar a Vercel
3. Deploy automático

OPCIÓN C: Netlify
━━━━━━━━━━━━━

1. Push a GitHub
2. Conectar a Netlify
3. Deploy automático

OPCIÓN D: Tu propio servidor
━━━━━━━━━━━━━━━━━━━━━━━━━

1. Subir archivos a tu servidor
2. Servir con HTTP/HTTPS
3. Firebase funcionará igual

⚠️ IMPORTANTE - FIRESTORE SECURITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EN PRODUCCIÓN, aplicar estas reglas:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role == 'admin';
    }
    
    // Pedidos
    match /pedidos/{orderId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    
    // Productos todos pueden leer
    match /productos/{document=**} {
      allow read: if request.auth != null;
    }
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6️⃣ ROLES Y PERMISOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USUARIO ANÓNIMO (Sin login)
├─ Ver tienda
├─ Agregar al carrito
├─ Crear pedido local
└─ Enviar a WhatsApp (sin persistencia en DB)

USUARIO AUTENTICADO (Revendedor)
├─ Ver tienda personalizada
├─ Crear pedidos (guardados en Firestore)
├─ Acceder a admin.html
├─ Ver sus propios pedidos
├─ Editar configuración de tienda
├─ Editar precios de productos
└─ Ver estadísticas

SUPER ADMIN (usuario con plan="master")
├─ Acceder a master.html
├─ Ver todos los usuarios
├─ Ver todos los pedidos
├─ Crear nuevos usuarios
├─ Suspender/activar usuarios
├─ Ver estadísticas globales
└─ Editar configuración global

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7️⃣ GUÍA DE USO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARA EL USUARIO FINAL
━━━━━━━━━━━━━━━━━━━

1. Abrir index.html
2. Seleccionar productos
3. Completar nombre, edad, UID
4. Enviar por WhatsApp

Si tiene cuenta registrada:
1. Login (botón en header después de autenticar)
2. Sus pedidos se guardarán automáticamente
3. Puede ver su historial en admin.html

PARA EL REVENDEDOR
━━━━━━━━━━━━━━━

1. Hacer que Firebase cree su usuario (email/password)
2. Ir a admin.html
3. Login con su email/contraseña
4. Configurar tienda (nombre, teléfono, color)
5. Ver pedidos y actualizar estados
6. Editar precios de productos

PARA EL SUPER ADMIN
━━━━━━━━━━━━━━━━━

1. Login con credenciales de admin
2. Ir a master.html
3. Ver dashboard global
4. Crear nuevos usuarios revendedores
5. Monitorear ventas
6. Suspender usuarios si es necesario

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ NOTAS IMPORTANTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. LA TIENDA FUNCIONA SIN FIREBASE
   Si no cargan los scripts de Firebase, la tienda sigue funcionando
   con configuración local. El carrito no se guardará en DB.

2. TEMA DINÁMICO
   Los colores se aplican via CSS variables. Cambiar en admin.html
   actualiza automáticamente la tienda.

3. PRODUCTOS DINÁMICOS
   Agregar productos a Firestore automáticamente los muestra
   en la tienda. No modificar el código de renderizado.

4. SEGURIDAD
   ⚠️ EN PRODUCCIÓN:
   - Cambiar Firestore a modo "Locked" con reglas
   - Usar variables de entorno para credenciales
   - Implementar verificación de super admin
   - Habilitar HTTPS obligatorio
   - Configurar CORS correctamente

5. ESCALABILIDAD
   El sistema está diseñado para:
   - Múltiples vendedores (multi-tenant)
   - Miles de pedidos (índices en Firestore)
   - Crecimiento sin cambios de código

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆘 SOLUCIÓN DE PROBLEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Error: Firebase is not defined"
→ Verificar que los scripts de Firebase se cargan en orden correcto
→ Verificar conexión a internet

"No se guardan los pedidos"
→ Verificar autenticación de usuario
→ Revisar Firestore Rules
→ Abrir consola (F12) y ver errores

"Los precios no son dinámicos"
→ Agregar productos a colección "productos" en Firestore
→ Cambiar preciosPersonalizados a true en config de usuario

"No funciona el login"
→ Verificar que Authentication está habilitado en Firebase
→ Crear usuario en Firebase Console
→ Verificar email/contraseña correctos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 SOPORTE RÁPIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Abrir consola de navegador: F12 → Console
2. Ver errores específicos
3. Revisar Network tab para request fallidas
4. Verificar Firebase Console para datos

NEXT STEPS PARA MEJORAR:

✅ Implementado:
- Multi-tenant architecture
- Admin panel con pedidos y configuración
- Master panel para super admin
- Firebase Firestore integration
- Autenticación
- Temas dinámicos
- Modales para sorteos y promos (desactivados)

❌ Próximas características (implementar):
- Email notifications
- Integración SMS
- Reportes PDF
- Backup automático
- Sistema de comisiones avanzado
- Referrals
- Estadísticas gráficas
- Cashout para vendedores

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Versión: 1.0 - Multi-Tenant SaaS
Creado: 2026
Actualizado: Abril 2026

¡Listo para producción! 🚀
