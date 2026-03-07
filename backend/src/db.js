require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 5432),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'clientes',
});

// TESTE DE CONEXÃO
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    console.error('   Verifique as variáveis no arquivo .env');
  } else {
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    release();
  }
});

async function query(text, params = []) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('❌ Erro na query SQL:', err.message);
    console.error('   Query:', text);
    throw err;
  }
}

module.exports = { query, pool };