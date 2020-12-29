import {ConnectionOptions} from '@mikro-orm/core';

export default {
    entities: ['dist/entities/*.js'], // compiled JS files
    entitiesTs: ['src/entities/*.ts'],
    dbName: 'sanvipop_login',
    type: 'mariadb', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
    user: 'example',
    password: 'example',
    port: 3306,
    host: 'arturober.com',
    debug: true
} as ConnectionOptions;