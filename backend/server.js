// importar o express
const express = require("express");

// criar aplicação
const app = express();

// definir porta
const PORT = 3000;

let users = [];

app.use(express.json());

// criar rota
app.get("/", (req, res) => {
    res.send("Servidor rodando!");
});

// ligar o servidor
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});

//lista usuários
app.get("/users", (req, res) => {
    // res.send("Lista de usuários")
    res.json(users);
});

//lista um usuário específico
app.get("/users/:id", (req, res) => {
    let id = req.params.id;
    id = parseInt(id);

    let indiceUser = users.findIndex(user => user.id === id);

    if(indiceUser === -1){
        return res.json({ mensagem: "Id do usuário inválido!"});
    }

    res.json(users[indiceUser]);
});

//cria usuários
app.post("/users", (req, res) => {
    const dados = req.body;
    //console.log(dados);
    dados.id = users.length + 1;
    users.push(dados);

    res.send("Usuário recebido");
});

app.put("/users/:id", (req, res) => {
    let id = req.params.id;
    id = parseInt(id);

    const dados = req.body;

    //encontrar índice do usuário
    let indiceUser = users.findIndex(user => user.id === id);

    //se não encontrou
    if(indiceUser === -1){
        return res.send("Id de usuário inválido");
    }

    //manter o id
    dados.id = id;

    //atualizar usuário
    users[indiceUser] = dados;
    
    res.send(`Usário ${id} atualizado`);
});

app.delete("/users/:id", (req, res) => {
    //pegar id da URL
    let id = req.params.id;

    //Converter para número
    id = parseInt(id);

    //encontrar indíce com o findIndex()
    let indiceUser = users.findIndex(user => user.id === id);

    //verificar se existe
    if(indiceUser === -1){
        return res.send("Id de usuário inválido!");
    }

    //remover do array
    users.splice(indiceUser, 1);

    res.send(`Usuário ${id} deletado`);
});