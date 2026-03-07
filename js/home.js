const vendedor = JSON.parse(localStorage.getItem("vendedorLogado"));
if (!vendedor) location.href = "index.html";

document.getElementById("nomeVendedor").innerText = vendedor.nome;

function logout() {
  localStorage.removeItem("vendedorLogado");
  location.href = "index.html";
}