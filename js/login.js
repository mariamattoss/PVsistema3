function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email === "vendedor@empresa.com" && senha === "123456") {
    localStorage.setItem("vendedorLogado", JSON.stringify({
      nome: "Vendedor Fictício",
      email
    }));
    location.href = "home.html";
  } else {
    alert("Credenciais inválidas");
  }
}