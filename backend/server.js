//importar dotenv
require("dotenv").config();

//importar o banco de dados
const db = require("./database");

// importar o express
const express = require("express");

//importar o bcrypt para criptografar a senha do usuário
const bcrypt = require("bcrypt");

//importar o jsonwebtoken
const jwt = require("jsonwebtoken");

//pegar SECRET do .env
const SECRET = process.env.JWT_SECRET;

// criar aplicação
const app = express();

// definir porta
const PORT = 3000;

const cors = require("cors");

app.use(express.json());
app.use(cors());

function verificarToken(req, res, next){
    const authHeader = req.headers["authorization"];

    if(!authHeader){
        return res.status(401).json({
            erro: "Token não fornecido"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, decoded) => {
        if(err){
            return res.status(403).json({
                erro: "Token inválido"
            });
        }

        req.userId = decoded.id;

        next();
    });

}

// criar rota
app.get("/", (req, res) => {
    res.send("Servidor rodando!");
});

// ligar o servidor
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});

//lista usuários
app.get("/users", verificarToken, (req, res) => {
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
app.get("/users/:id", verificarToken, (req, res) => {
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

            if(err.code === "SQLITE_CONSTRAINT"){
                return res.json({
                    erro: "Email já cadastrado"
                });
            }
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
app.put("/users/:id", verificarToken, async (req, res) => {
    const id = parseInt(req.params.id);

    //Bloqueia se tentar editar outro usuário
    if(req.userId != id){
        return res.status(403).json({
            erro: "Você não tem permissão para editar este usuário"
        });
    }

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
app.delete("/users/:id", verificarToken, (req, res) => {
    //pegar id da URL
    const id = parseInt(req.params.id);

    //comparar id do usuário com o forncecido pela URL
    if(req.userId != id){
        return res.status(403).json({
            erro: "Você não tem permissão para deletar este usuário"
        });
    }
    
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

app.post("/login", async (req, res) => {
    const { email, senha} = req.body;

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async(err, row) => {
            if(err){
                console.log(err);
                return res.json({ erro: "Erro ao buscar usuário" });
            }
            if(!row){
                return res.json({ erro: "Email ou senha inválidos" });
            }

            try{
                //comparar senha digitada com hash
                const senhaValida = await bcrypt.compare(
                    senha,
                    row.senha
                );

                if(!senhaValida){
                    return res.json({ erro: "Email ou senha inválidos" });
                }

                const token = jwt.sign(
                    {id: row.id}, //payload
                    SECRET, //SECRET KEY
                    {expiresIn: "1h"} //Opções
                );

                res.json({
                    mensagem: "Login realizado com sucesso!",
                    token: token
                });


            }catch(erro){
                console.log(erro);

                res.json({
                    erro: "Erro ao validar senha"
                });
            }
        }
    );

});