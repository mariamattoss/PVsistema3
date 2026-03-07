const API = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("listaClientes");

  try {
    // Busca os clientes do banco de dados via API
    const resposta = await fetch(`${API}/clientes`);
    if (!resposta.ok) throw new Error("Erro ao buscar clientes.");

    const clientes = await resposta.json();

    // Atualiza o localStorage com os dados mais recentes do banco
    localStorage.setItem("clientes", JSON.stringify(clientes));

    lista.innerHTML = "";

    if (clientes.length === 0) {
      lista.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum cliente cadastrado.</td></tr>`;
      return;
    }

    clientes.forEach((cliente) => {
      lista.innerHTML += `
        <tr>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.cidade}</td>
          <td>${cliente.vendedor}</td>
          <td>
            <button class="btn-ver" onclick="verCliente(${cliente.id})">Ver</button>
            <button class="btn-excluir" onclick="excluirCliente(${cliente.id})">Excluir</button>
          </td>
        </tr>
      `;
    });

  } catch (erro) {
    lista.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar clientes. Verifique se o backend está rodando.</td></tr>`;
    console.error(erro);
  }
});

function verCliente(id) {
  // Salva o ID do banco (não mais o índice do array)
  localStorage.setItem("clienteSelecionado", id);
  location.href = "cliente-detalhes.html";
}

async function excluirCliente(id) {
  if (!confirm("Deseja excluir este cliente?")) return;

  try {
    const resposta = await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
    if (!resposta.ok) throw new Error("Erro ao excluir.");

    // Remove do localStorage também
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const atualizados = clientes.filter(c => c.id !== id);
    localStorage.setItem("clientes", JSON.stringify(atualizados));

    location.reload();
  } catch (erro) {
    alert("Erro ao excluir cliente.");
    console.error(erro);
  }
}