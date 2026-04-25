# Ferromax ERP

Sistema de gestión integral para ferretería argentina.

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java JDK | 17 |
| Apache Maven | 3.9 |
| Node.js | 20 |
| PostgreSQL | 16 |

## Configuración de la base de datos

Antes de levantar el backend, creá la base de datos en PostgreSQL:

```sql
CREATE DATABASE ferromax_db;
```

El usuario por defecto es `postgres` con contraseña `postgres` en `localhost:5432`.
Para usar otras credenciales, editá `src/main/resources/application.properties`.

## Levantar el backend

Desde la raíz del proyecto:

```bash
mvn spring-boot:run
```

El servidor queda disponible en `http://localhost:8080/api`.  
La documentación interactiva de la API se accede en `http://localhost:8080/api/swagger-ui.html`.

## Levantar el frontend

En otra terminal, desde la subcarpeta `ferromax-web`:

```bash
cd ferromax-web
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.  
En desarrollo, las peticiones a `/api` se redirigen automáticamente al backend mediante el proxy de Vite.

## Estructura del proyecto

```
ferromax-erp/
├── src/                   # Backend Java — Spring Boot
│   └── main/
│       ├── java/com/ferromax/erp/
│       └── resources/
│           └── application.properties
├── ferromax-web/          # Frontend React + Vite + Tailwind CSS
│   └── src/
│       ├── api/           # Cliente Axios con interceptor JWT
│       ├── components/    # Componentes reutilizables
│       ├── context/       # AuthContext (login / logout)
│       ├── hooks/
│       ├── pages/         # LoginPage, DashboardPage, …
│       └── utils/
└── pom.xml
```
