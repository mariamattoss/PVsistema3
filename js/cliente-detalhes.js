const API = 'http://localhost:3000';

const id  = localStorage.getItem("clienteSelecionado");
const div = document.getElementById("detalhesCliente");

function campo(label, valor) {
  return `<p class="mb-2"><strong>${label}:</strong> ${valor || '—'}</p>`;
}

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
  if (!valor) return '—';
  return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

fetch(`${API}/clientes/${id}`)
  .then(resposta => {
    if (!resposta.ok) throw new Error("Cliente não encontrado.");
    return resposta.json();
  })
  .then(c => {
    const dependentesHTML = c.dependentes && c.dependentes.length > 0
      ? c.dependentes.map(d => `
          <div class="d-flex justify-content-between border-bottom py-2">
            <span>${d.nome}</span>
            <span class="text-muted">${d.parentesco}</span>
          </div>`).join("")
      : "<p class='text-muted mb-0'>Nenhum dependente cadastrado.</p>";

    div.innerHTML = `
      <div class="row g-3">

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark fw-bold">Dados Pessoais</div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  ${campo('Nome', c.nome)}
                  ${campo('CPF', c.cpf)}
                  ${campo('Data de Nascimento', formatarData(c.data_nascimento))}
                </div>
                <div class="col-md-6">
                  ${campo('Profissão', c.profissao)}
                  ${campo('Sexo', c.sexo)}
                  ${campo('Vendedor Responsável', c.vendedor_responsavel)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark fw-bold">Contato & Endereço</div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  ${campo('Telefone', c.telefone)}
                  ${campo('Rua', c.rua)}
                  ${campo('Número', c.numero)}
                  ${campo('CEP', c.cep)}
                </div>
                <div class="col-md-6">
                  ${campo('Bairro', c.bairro)}
                  ${campo('Cidade', c.cidade)}
                  ${campo('Estado', c.estado)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark fw-bold">Contrato</div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  ${campo('Nº Contrato', c.numero_contrato)}
                  ${campo('Tipo de Plano', c.tipo_plano)}
                </div>
                <div class="col-md-6">
                  ${campo('Valor do Plano', formatarValor(c.valor_plano))}
                  ${campo('Status', c.status_plano)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark fw-bold">Dependentes</div>
            <div class="card-body">
              ${dependentesHTML}
            </div>
          </div>
        </div>

      </div>
    `;
  })
  .catch(erro => {
    div.innerHTML = `<p class="text-danger">Erro ao carregar dados do cliente. Verifique se o backend está rodando.</p>`;
    console.error(erro);
  });