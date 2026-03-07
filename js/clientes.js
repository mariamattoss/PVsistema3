const API = 'http://localhost:3000';

// ─── MÁSCARAS DE INPUT ────────────────────────────────────────────────────────

function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')                    // remove tudo que não é número
    .slice(0, 11)                          // limita a 11 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2')       // 000.
    .replace(/(\d{3})(\d)/, '$1.$2')       // 000.000.
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');// 000.000.000-00
}

function mascaraTelefone(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10) {
    return nums
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');    // (00) 0000-0000
  }
  return nums
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');      // (00) 00000-0000
}

function mascaraCEP(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');      // 00000-000
}

function aplicarMascara(id, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const pos = el.selectionStart;
    el.value = fn(el.value);
  });
}

// ─── FIM DAS MÁSCARAS ─────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  // Aplica máscaras assim que a página carrega
  aplicarMascara('cpf',      mascaraCPF);
  aplicarMascara('telefone', mascaraTelefone);
  aplicarMascara('cep',      mascaraCEP);

  /*  AUTENTICAÇÃO DO VENDEDOR */
  const vendedor = JSON.parse(localStorage.getItem("vendedorLogado"));
  if (!vendedor) {
    window.location.href = "index.html";
    return;
  }

  const vendedorResponsavel = document.getElementById("vendedorResponsavel");
  const nomeVendedor = document.getElementById("nomeVendedor");

  if (vendedorResponsavel) vendedorResponsavel.value = vendedor.nome;
  if (nomeVendedor) nomeVendedor.innerText = vendedor.nome;

  
  /* 2. CONTROLE DAS ABAS*/
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
/* 2. ENDEREÇO (EDITAR)*/
  const enderecos = {
    PA: {
      "Belém": [
        "Umarizal", "Condor", "Cremação", "Marambaia", "Jurunas",
        "Guamá", "Pedreira", "Telegrafo", "Terra Firme", "Marco", "Sacramenta", "Reduto", "Souza", "Nazaré", "Benguí",
        "Fátima", "Batista Campos", "Cidade Velha"
      ],
      "Ananindeua": [
        "Águas Lindas", "Icuí-guajará", "Distrito Industrial",
        "Cidade Nova", "Paar", "Águas Brancas", "Guanabara", "Atalaia", "Aurá", "Coqueiro", "Curuçambá"
      ],
      "Marituba": [
        "Centro", "Boa Vista", "Bairro Novo", "Almir Gabriel",
        "Mario Couto", "Beija Flor", "Uriboca", "Nova Marituba",
        "Decouville", "Mirizal", "Bela Vista", "Nova União"
      ]
    }
  };

  const estado = document.getElementById("estado");
  const cidade = document.getElementById("cidade");
  const bairro = document.getElementById("bairro");

  estado.addEventListener("change", () => {
    cidade.innerHTML = '<option value="">Selecione</option>';
    bairro.innerHTML = '<option value="">Selecione</option>';
    cidade.disabled = true;
    bairro.disabled = true;

    if (!estado.value) return;

    cidade.disabled = false;
    Object.keys(enderecos[estado.value]).forEach(c => {
      cidade.innerHTML += `<option value="${c}">${c}</option>`;
    });
  });

  cidade.addEventListener("change", () => {
    bairro.innerHTML = '<option value="">Selecione</option>';
    bairro.disabled = true;

    if (!cidade.value) return;

    bairro.disabled = false;
    enderecos[estado.value][cidade.value].forEach(b => {
      bairro.innerHTML += `<option value="${b}">${b}</option>`;
    });
  });

});

/* 2. DEPENDENTES*/
let dependentes = [];

function adicionarDependente() {
  const depNome = document.getElementById("depNome");
  const depParentesco = document.getElementById("depParentesco");

  if (!depNome.value.trim() || !depParentesco.value.trim()) {
    alert("Preencha nome e parentesco do dependente.");
    return;
  }

  dependentes.push({
    nome: depNome.value,
    parentesco: depParentesco.value
  });

  depNome.value = "";
  depParentesco.value = "";

  atualizarDependentes();
}

function atualizarDependentes() {
  const lista = document.getElementById("listaDependentes");
  lista.innerHTML = "";

  dependentes.forEach((d, index) => {
    lista.innerHTML += `
      <li>
        ${d.nome} - ${d.parentesco}
        <button type="button" onclick="removerDependente(${index})">X</button>
      </li>
    `;
  });
}

function removerDependente(index) {
  dependentes.splice(index, 1);
  atualizarDependentes();
}

/* 2. SALVAR CLIENTES*/
async function salvarCliente() {
  // Coleta todos os campos do formulário
  const dadosCliente = {
    nome:                 document.getElementById("nomeCompleto").value,
    cpf:                  document.getElementById("cpf").value,
    data_nascimento:      document.getElementById("dataNascimento").value,
    profissao:            document.getElementById("profissao").value,
    sexo:                 document.querySelector('input[name="sexo"]:checked')?.value || "",
    telefone:             document.getElementById("telefone").value,
    rua:                  document.getElementById("rua").value,
    numero:               document.getElementById("numero").value,
    cep:                  document.getElementById("cep").value,
    estado:               document.getElementById("estado").value,
    cidade:               document.getElementById("cidade").value,
    bairro:               document.getElementById("bairro").value,
    vendedor_responsavel: document.getElementById("vendedorResponsavel").value,
    numero_contrato:      document.getElementById("numeroContrato").value,
    tipo_plano:           document.getElementById("tipoPlano").value,
    valor_plano:          document.getElementById("valorPlano").value,
    status_plano:         document.getElementById("statusPlano").value,
    dependentes
  };

  try {
    // Salva no banco de dados via API
    const resposta = await fetch(`${API}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCliente)
    });

    if (!resposta.ok) throw new Error("Erro ao salvar no banco.");

    const resultado = await resposta.json();

    // Também salva no localStorage para exibir na interface
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes.push({
      id:       resultado.id,
      nome:     dadosCliente.nome,
      cpf:      dadosCliente.cpf,
      telefone: dadosCliente.telefone,
      cidade:   dadosCliente.cidade,
      vendedor: dadosCliente.vendedor_responsavel,
      contrato: {
        numero: dadosCliente.numero_contrato,
        plano:  dadosCliente.tipo_plano,
        valor:  dadosCliente.valor_plano,
        status: dadosCliente.status_plano
      },
      dependentes
    });
    localStorage.setItem("clientes", JSON.stringify(clientes));

    alert("Cliente cadastrado com sucesso!");
    window.location.href = "clientes-lista.html";

  } catch (erro) {
    alert("Erro ao salvar cliente. Verifique se o backend está rodando.");
    console.error(erro);
  }
}