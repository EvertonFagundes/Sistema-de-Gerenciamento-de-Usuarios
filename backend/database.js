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
        nome TEXT,
        idade INTEGER
    )    
`);

module.exports = db;