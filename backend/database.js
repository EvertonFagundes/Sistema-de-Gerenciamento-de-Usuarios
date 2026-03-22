const sqlite3 = require("sqlite3").verbose();

//criar ou abrir banco
const db = new sqlite3.Database("./database.db", (err) => {
    if(err){
        console.log("Erro ao conectar ao banco:", err);
    }else{
        console.log("Banco conectado com sucesso!");
    }
});

//criar tabela se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data_nascimento TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )    
`);

module.exports = db;