   const { Client } = require('pg');
   require('dotenv').config();

   const client = new Client({
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 5432,
     user: process.env.DB_USERNAME || 'postgres',
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE || 'dectracrm',
   });

   client.connect().then(() => {
     return client.query('ALTER TABLE receipts ADD COLUMN IF NOT EXISTS city VARCHAR(100);');
   }).then(() => {
     console.log('✅ Coluna "city" adicionada com sucesso!');
     client.end();
   }).catch((err) => {
     console.error('❌ Erro:', err.message);
     client.end();
   });