import {ConnectionOptions, LoadStrategy} from '@mikro-orm/core';

export default {
    entities: ['dist/entities/*.js'], // compiled JS files
    entitiesTs: ['src/entities/*.ts'],
    dbName: process.env.DB_DATABASE || 'sanvipop',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_SERVER_HOST || 'localhost',
    port: parseInt(process.env.DB_SERVER_PORT, 10) || 3306,
    loadStrategy: LoadStrategy.JOINED,
    // debug: true
} as ConnectionOptions;