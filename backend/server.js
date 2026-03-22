//importar o banco de dados
const db = require("./database");

// importar o express
const express = require("express");

//importar o bcrypt para criptografar a senha do usuário
const bcrypt = require("bcrypt");

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
            //remover senha da response
            const usuarioSemSenha = rows.map(user => {
                return{
                    id: user.id,
                    nome: user.nome,
                    data_nascimento: user.data_nascimento,
                    email: user.email
                };
            });
            res.json(usuarioSemSenha)
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

            //remover senha da response
            const usuarioSemSenha = {
                id: row.id,
                nome: row.nome,
                data_nascimento: row.data_nascimento,
                email: row.email
            }
            res.json(usuarioSemSenha);
        }
    );
});

//cria usuários
app.post("/users", async (req, res) => {

    const { nome, data_nascimento, email, senha } = req.body;
    
    try{
        //criptografar a senha
        const senhaCriptografada = await bcrypt.hash(senha, 12);

        db.run(
        "INSERT INTO users (nome, data_nascimento, email, senha) VALUES (?, ?, ?, ?)",
        [nome, data_nascimento, email, senhaCriptografada],
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
                    data_nascimento: data_nascimento,
                    email: email
                }
            });
        }
    );
    }catch(erro){
        console.log(erro);
        res.json({ 
            erro: "Erro ao salvar usuário"
         })

    }

    

});

//atualiza um usuário específico
app.put("/users/:id", async (req, res) => {
    let id = req.params.id;
    id = parseInt(id);

    const { nome, data_nascimento, email, senha } = req.body;

    try{
        let senhaCriptografada = null;

        //Se enviou senha => criptografa
        if(senha){
            senhaCriptografada = await bcrypt.hash(senha, 12);
        }

        db.run(
            "UPDATE users SET nome = ?, data_nascimento = ?, email = ?, senha = COALESCE(?,senha) WHERE id = ?",
            [nome, data_nascimento, email, senhaCriptografada, id],
            function(err){
                if(err){
                    console.log(err);
                    return res.json({ erro: "Erro ao atualizar usuário" })
                }
                if(this.changes === 0){
                    return res.json({ erro: "Id de usuário inválido" });
                }
                res.json({ 
                    mensagem: `Usuário ${id} atualizado com sucesso!`,
                    usuario: {
                        id: id,
                        nome: nome,
                        data_nascimento: data_nascimento,
                        email: email
                    }
                });
            }
        );
    }catch(erro){

    }

    
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