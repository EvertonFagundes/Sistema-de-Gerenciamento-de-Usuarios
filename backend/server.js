//importar o banco de dados
const db = require("./database");

// importar o express
const express = require("express");

// criar aplicação
const app = express();

// definir porta
const PORT = 3000;

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
    db.all(
        "SELECT * FROM users",
        [],
        (err, rows) => {
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao buscar usuários"});
            }
            res.json(rows)
        }
    );
});

//lista um usuário específico
app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    db.get(
        "SELECT * FROM users WHERE id = ?",
        [id],
        function (err, row){
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao pegar usuario com o id ", id });
            }
            if(!row){
                return res.json({ 
                    mensagem: "Usuário não encontrado"
                 });
            }
            res.json(row);
        }
    );
});

//cria usuários
app.post("/users", (req, res) => {
    const { nome, idade } = req.body;
    
    db.run(
        "INSERT INTO users (nome, idade) VALUES (?, ?)",
        [nome, idade],
        function(err){
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao criar usuário" });
            }

            res.json({
                mensagem: "Usuário criado com sucesso!",
                usuario: {
                    id: this.lastID,
                    nome: nome,
                    idade: idade
                }
            });
        }
    );

});

//atualiza um usuário específico
app.put("/users/:id", (req, res) => {
    let id = req.params.id;
    id = parseInt(id);

    const { nome, idade } = req.body;

    db.run(
        "UPDATE users SET nome = ?, idade = ? WHERE id = ?",
        [nome, idade, id],
        function(err){
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao atualizar usuário" })
            }
            if(this.changes === 0){
                return res.json({ erro: "Id de usuário inválido" });
            }
            res.json({ mensagem: `Usuário ${id} atualizado com sucesso!` });
        }
    );
});

//Deleta um usuário específico
app.delete("/users/:id", (req, res) => {
    //pegar id da URL
    let id = req.params.id;
    //Converter para número
    id = parseInt(id);
    
    db.run(
        "DELETE FROM users WHERE id = ?",
        [id],
        function(err){
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao deletar o usuário" });
            }
            if(this.changes === 0){
                return res.json({ erro: "Id de usuário inválido" });
            }
            res.json({ mensagem: `Usuário com o id ${id} foi deletado!` });
        }
    );
});