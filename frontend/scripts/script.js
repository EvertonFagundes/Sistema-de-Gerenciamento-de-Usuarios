const API_URL = "http://localhost:3000";

//Salva token
function salvarToken(token){
    localStorage.setItem("token", token);
}

//Pega token salvo
function pegarToken(){
    return localStorage.getItem("token");
}

//Remove token
function removerToken(){
    localStorage.removeItem("token");
}

async function login(event){
    event.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try{
        const resposta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if(dados.token){
            salvarToken(dados.token);
            alert("Login realizado com sucesso!");

            //Vai para a págian de usuários
            window.location.href = "usuarios.html";
        }else{
            alert("Erro no login");
        }

    }catch(erro){
        console.log(erro);
        alert("Erro ao conectar com o servidor");
    }
}

async function cadastrarUsuario(event){

    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const data_nascimento = document.getElementById("data_nascimento").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try{
        const resposta = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                data_nascimento,
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if(dados.mensagem){
            alert("Usuário cadastrado com sucesso!");
            window.location.href = "login.html";
        }else{
            alert(dados.erro || "Erro ao cadastrar");
        }
    }catch(erro){
        console.log(erro);
        alert("Erro ao conectar com servidor");
    }



}