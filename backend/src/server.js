require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { query } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ROTA RAIZ ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ mensagem: 'Backend rodando com sucesso!' });
});

// ─── ROTA DE TESTE DO BANCO ───────────────────────────────────────────────────
app.get('/teste-db', async (req, res) => {
  try {
    const resultado = await query('SELECT NOW() AS agora');
    res.json({
      status:   'Banco conectado',
      servidor: resultado.rows[0].agora
    });
  } catch (erro) {
    console.error('❌ Falha no teste de banco:', erro.message);
    res.status(500).json({
      status: 'Erro na conexão com o banco',
      detalhe: erro.message
    });
  }
});

// ─── GET /clientes ────────────────────────────────────────────────────────────
// Retorna todos os clientes cadastrados
app.get('/clientes', async (req, res) => {
  try {
    const resultado = await query(
      `SELECT
         c.id,
         c.nome,
         c.cpf,
         c.cidade,
         c.vendedor_responsavel AS vendedor
       FROM clientes c
       ORDER BY c.created_at DESC`
    );
    res.json(resultado.rows);
  } catch (erro) {
    console.error('❌ Erro ao buscar clientes:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// ─── GET /clientes/:id ────────────────────────────────────────────────────────
// Retorna um cliente com seus dependentes
app.get('/clientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const clienteResult = await query(
      `SELECT * FROM clientes WHERE id = $1`,
      [id]
    );

    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const cliente = clienteResult.rows[0];

    const dependentesResult = await query(
      `SELECT nome, parentesco FROM dependentes WHERE cliente_id = $1`,
      [id]
    );

    cliente.dependentes = dependentesResult.rows;
    res.json(cliente);

  } catch (erro) {
    console.error('❌ Erro ao buscar cliente:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar cliente.' });
  }
});

// ─── POST /clientes ───────────────────────────────────────────────────────────
// Cadastra um novo cliente com seus dependentes
app.post('/clientes', async (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    profissao,
    sexo,
    telefone,
    rua,
    numero,
    cep,
    estado,
    cidade,
    bairro,
    vendedor_responsavel,
    numero_contrato,
    tipo_plano,
    valor_plano,
    status_plano,
    dependentes
  } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome || !cpf) {
    return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
  }

  // Converte "76,90" → 76.90 para o PostgreSQL aceitar NUMERIC
  const valorNumerico = valor_plano
    ? parseFloat(String(valor_plano).replace(',', '.')) || null
    : null;

  try {
    const clienteResult = await query(
      `INSERT INTO clientes (
         nome, cpf, data_nascimento, profissao, sexo,
         telefone, rua, numero, cep, estado, cidade, bairro,
         vendedor_responsavel, numero_contrato, tipo_plano,
         valor_plano, status_plano
       ) VALUES (
         $1,  $2,  $3,  $4,  $5,
         $6,  $7,  $8,  $9,  $10, $11, $12,
         $13, $14, $15,
         $16, $17
       ) RETURNING id`,
      [
        nome, cpf, data_nascimento || null, profissao, sexo,
        telefone, rua, numero, cep, estado, cidade, bairro,
        vendedor_responsavel, numero_contrato, tipo_plano,
        valorNumerico, status_plano || 'Ativo'
      ]
    );

    const clienteId = clienteResult.rows[0].id;
    console.log(`✅ Cliente cadastrado com ID: ${clienteId}`);

    // Insere dependentes, se houver
    if (Array.isArray(dependentes) && dependentes.length > 0) {
      for (const dep of dependentes) {
        if (dep.nome && dep.parentesco) {
          await query(
            `INSERT INTO dependentes (cliente_id, nome, parentesco) VALUES ($1, $2, $3)`,
            [clienteId, dep.nome, dep.parentesco]
          );
        }
      }
      console.log(`✅ ${dependentes.length} dependente(s) cadastrado(s).`);
    }

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      id: clienteId
    });

  } catch (erro) {
    console.error('❌ Erro ao cadastrar cliente:', erro.message);

    // CPF duplicado
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado no sistema.' });
    }

    res.status(500).json({ erro: 'Erro ao cadastrar cliente.' });
  }
});

// ─── INICIAR SERVIDOR ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Teste o banco em: http://localhost:${PORT}/teste-db`);
});