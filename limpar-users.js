const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'dectra',
  password: 'dectra123',
  database: 'dectra_crm',
});

async function limpar() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados.');
    
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('✅ Tabela "users" removida com sucesso.');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
    console.log('🔒 Conexão encerrada.');
  }
}

limpar();