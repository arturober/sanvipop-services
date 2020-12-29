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
    - [**POST /auth/google**](#post-authgoogle)
    - [**POST /auth/facebook**](#post-authfacebook)
    - [**POST /auth/register**](#post-authregister)
    - [**GET /auth/validate**](#get-authvalidate)
  - [Colección /categories](#colección-categories)
    - [**GET /categories**](#get-categories)
  - [Colección /products](#colección-products)
    - [**GET /products**](#get-products)
    - [**GET /products/mine**](#get-productsmine)
    - [**GET /products/bookmarks**](#get-productsbookmarks)
    - [**GET /products/mine/sold**](#get-productsminesold)
    - [**GET /products/mine/bought**](#get-productsminebought)
    - [**GET /products/user/:id**](#get-productsuserid)
    - [**GET /products/user/:id/sold**](#get-productsuseridsold)
    - [**GET /products/user/:id/bought**](#get-productsuseridbought)
    - [**GET /products/:id**](#get-productsid)

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

### **POST /auth/login**

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

### **POST /auth/google**

Este servicio recibe el campo **id_token** que devuelve la identificación mediante Google en el cliente. Lo valida y comprueba el correo en la base de datos. Si el correo existe funciona como un login normal, y si no existe registra al usuario (a partir de los datos obtenidos de Google) en la base de datos. Devuelve un token de autenticación válido para el servidor (como el login).

Ejemplo de envío (lat y lng son opcionales):

```json
{
    "token": "id_token de Google",
    "lat": 35.4534,
    "lng": -0.54673
}
```

La respuesta es la misma que la del servicio /auth/login

### **POST /auth/facebook**

Este servicio recibe el campo **accessToken** que devuelve la identificación mediante Facebook en el cliente. Lo valida y comprueba el correo en la base de datos. Si el correo existe funciona como un login normal, y si no existe registra al usuario (a partir de los datos obtenidos de Facebook) en la base de datos. Devuelve un token de autenticación válido para el servidor (como el login).

Ejemplo de envío (lat y lng son opcionales):

```json
{
    "token": "accessToken de Facebook",
    "lat": 35.4534,
    "lng": -0.54673
}
```

La respuesta es la misma que la del servicio /auth/login

### **POST /auth/register**

Este servicio recibe los datos de un usuario y lo registra en la base de datos. Los datos que recibirá son nombre, email, password, foto de perfil y opcionalmente, las coordenadas de geolocalización. Ejemplo de petición:

```json
{
    "name": "Prueba",
    "email": "prueba@correo.es",
    "password": "1234",
    "photo": "Imagen codificada en base64",
    "lat": 35.4534,
    "lng": -0.54673
}
```

Si la petición es correcta, el servidor devolverá una respuesta **201** (Created) con el correo del usuario creado:

```json
{
    "email": "prueba@correo.es"
}
```

Mientras que si hay algún error en los datos enviados, devolverá un código **400** (Bad Request) con información de los errores:

```json
{
    "statusCode": 400,
    "message": [
        "Email test3@test3.com is already present in the database"
    ],
    "error": "Bad Request"
}
```

### **GET /auth/validate**

Este servicio simplemente comprueba que el token de autenticación que se envía en la cabecera **Authorization** es correcto (y se ha enviado), devolviendo una respuesta vacía **204** si hay token y es válido o un error **401** (Not Authorized) si no lo es.

## Colección /categories

Todos los servicios de esta colección requieren del token de autenticación.

### **GET /categories**

Este servicio te devuelve las categorías para productos de la base de datos en el siguiente formato:

```json
{
    "categories": [
        {
            "id": 1,
            "name": "Electronics"
        },
        {
            "id": 2,
            "name": "Motor and vehicles"
        },
        ...
    ]
}
```

## Colección /products

Todos los servicios de esta colección requieren del token de autenticación.

### **GET /products**

Devuelve todos los productos a la venta ordenados por distancia hasta el usuario autenticado. Los productos devueltos no tendrán toda la información completa, hay campos que estarán a null y que se obtendrán llamando al servicio que te devuelve los datos de un solo producto. Ejemplo de respuesta con un producto:

```json
{
    "products": [
        {
            "id": 438,
            "datePublished": "2020-12-20T11:54:59.000Z",
            "title": "Test product new",
            "description": "Product with\n2 lines",
            "status": 1,
            "price": 23.35,
            "owner": {
                "id": 15,
                "registrationDate": "2020-11-01T10:13:04.000Z",
                "name": "Test User",
                "email": "test@test.com",
                "lat": 38,
                "lng": -0.5,
                "photo": "http://SERVER/img/users/1606587397679.jpg"
            },
            "numVisits": 5,
            "category": {
                "id": 1,
                "name": "Electronics"
            },
            "mainPhoto": "http://SERVER/img/products/1608465299244.jpg",
            "soldTo": null,
            "rating": null,
            "photos": null,
            "bookmarked": false,
            "distance": 34.36346,
            "mine": true
        },
        ...
    ]
}
```

### **GET /products/mine**

Igual que el servicio **/products** pero devuelve solo los productos que vende el usuario actual.

### **GET /products/bookmarks**

Igual que el servicio **/products** pero devuelve los productos marcados como favoritos por el usuario actual.

### **GET /products/mine/sold**

En este caso devuelve los productos que el usuario actual ya ha vendido a otro usuario (status = 3).

### **GET /products/mine/bought**

Lista de productos que el usuario actual ha comprado a otros usuarios.

### **GET /products/user/:id**

Devuelve los productos que el usuario cuya id recibe en la url está vendiendo actualmente.

### **GET /products/user/:id/sold**

Devuelve los productos que el usuario cuya id recibe en la url ha vendido a otros usuarios.

### **GET /products/user/:id/bought**

Devuelve los productos que el usuario cuya id recibe en la url ha comprado a otros usuarios.

### **GET /products/:id**

Devuelve los datos del producto cuya id se recibe en la url. Este producto tendrá datos adicionales como la lista de fotos, las valoraciones del comprador y vendedor (si ha sido comprado y valorado), o el usuario que lo ha comprado el producto (si lo hay).

Ejemplo de respuesta:

```json
{
    "product": {
        "id": 392,
        "datePublished": "2020-11-19T21:28:38.000Z",
        "title": "Have a hand",
        "description": "A second hand for usefull usses",
        "status": 3,
        "price": 25,
        "owner": {
            "id": 98,
            "registrationDate": "2020-11-19T21:27:23.000Z",
            "name": "Irene-Prueba",
            "email": "irene-prueba@mail.com",
            "lat": 38.4018273,
            "lng": -0.5241973,
            "photo": "http://SERVER/img/users/1605821243453.jpg"
        },
        "numVisits": 5,
        "category": {
            "id": 9,
            "name": "Home appliances"
        },
        "mainPhoto": "http://SERVER/img/products/1605821318532.jpg",
        "soldTo": {
            "id": 15,
            "registrationDate": "2020-11-01T10:13:04.000Z",
            "name": "Test User",
            "email": "test@test.com",
            "lat": 38,
            "lng": -0.5,
            "photo": "img/users/1606587397679.jpg"
        },
        "rating": {
            "sellerRating": null,
            "buyerRating": 5,
            "sellerComment": null,
            "buyerComment": "Good buyer",
            "dateTransaction": "2020-12-20T10:49:44.000Z"
        },
        "photos": [],
        "bookmarked": true,
        "distance": 44.6710090637207,
        "mine": false
    }
}
```
