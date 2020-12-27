<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

- [Servicios web applicación SanviPop](#servicios-web-applicación-sanvipop)
  - [Instalación de los servicios](#instalación-de-los-servicios)
  - [Configurando notificaciones Push](#configurando-notificaciones-push)
  - [Probando los servicios](#probando-los-servicios)
- [Servicios web - Colecciones](#servicios-web---colecciones)
  - [Colección /auth](#colección-auth)
    - [**POST /auth/login**](#post-authlogin)

# Servicios web applicación SanviPop

Servicios web para los proyectos de la asignatura de entorno cliente.

## Instalación de los servicios

Para lanzar los servicios en local, primero importar la base de datos (directorio SQL). A continuación configuramos el acceso a la base de datos en el archivo **src/micro-orm.config.ts**:

```typescript
import {ConnectionOptions} from '@mikro-orm/core';

export default {
    entities: ['dist/entities/*.js'], // compiled JS files
    entitiesTs: ['src/entities/*.ts'],
    dbName: 'sanvipop',
    type: 'mariadb', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
    user: 'example',
    password: 'example',
    port: 3306,
    host: 'localhost',
    debug: true
} as ConnectionOptions;
```

Después instalamos las dependencias del proyecto:

```bash
$ npm install
```

Edita el archivo **src/google-id.ts** para poner ahí tu id de Google (la que uses en el cliente) o no funcionará el login con dicho proveedor.

## Configurando notificaciones Push

<p style="color: red">Este apartado todavía no es funcional (para el proyecto de Ionic lo será)<p> 

Descarga el archivo de cuenta de servicio (Configuración de proyecto -> cuentas de servicio) dentro de la carpeta **firebase** y renombralo a **serviceAccountKey.json**. Tiene que ser el mismo proyecto que uses en la aplicación cliente donde habrás descargado el archivo **google-services.json**. Los servicios están configurados para mandar una notificación push cuando alguien compre un producto del usuario o le valore en una transacción.

## Probando los servicios

Lanzamos los servicios (modo testing) con el siguiente comando:

```bash
$ npm run start
```

También los podéis desplegar en un servidor utilizando por ejemplo Apache + [Passenger](https://www.phusionpassenger.com/library/deploy/apache/deploy/nodejs/)

# Servicios web - Colecciones

Normalmente, todos los servicios (que devuelven datos) devuelven un resultado en formato JSON. Cuando no se pueda realizar una operación, devolverán un código de error HTTP junto a un objeto JSON con la descripción del mismo.

Todas las colecciones, excepto **/auth** (*/auth/validate* sí lo requiere), requieren un token de autenticación para poder utilizar los servicios web, devolviendo un código 401 (Not Authorized) en caso de no incluirlo. Este debe enviarse en la cabecera Authorization con el prefijo Bearer:

```
Authorization: Bearer auth_token
```

## Colección /auth

El servicio comprueba si un usuario y contraseña son correctos, devolviendo un token de autenticación (JWT) si todo va bien. Opcionalmente se puede enviar la posición del usuario para que la actualice.

Ejemplo de petición:

```json
{
    "email": "prueba@email.es",
    "password": "1234",
    "lat": 35.4534,
    "lng": -0.54673
}
```

Si el login es correcto, la respuesta será algo como esto:

```json
{
    "expiresIn": 31536000,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTc4MTYyNDA2LCJleHAiOjE2MDk2OTg0MDZ9.HQZ-PO-usLc9WT-0cUpuDPnVRFl_u71njNoQNj_TIx8"
}
```

En caso de error en el login (usuario y contraseña no válidos), se devolverá el código de error 401:

```json
{
    "status": 401,
    "error": "Email or password incorrect"
}
```

### **POST /auth/login**



