const express = require('express');
const server = express();
const nunjucks = require('nunjucks');
const db = require('./database/db');

server.use(express.static('public'));

//habilitar o uso do req.body na nossa aplicação.
server.use(express.urlencoded({ extended: true }));

nunjucks.configure('src/views', {
  express: server,
  noCache: true,
  autoescape: false
})

server.get("/", (req, res) => {
  return res.render("index.html");
})

server.get("/create-point", (req, res) => {
  //console.log(req.query);

  return res.render("create-point.html");
})

server.post("/savepoint", (req, res) => {

  //req.body: o corpo do nosso formulário
  //console.log(req.body)

  //inserir dados no banco de dados

    //2 inserir dados na tabela
  const query = `
    INSERT INTO places (
      image,
      name,
      address,
      address2,
      state,
      city,
      items
    ) VALUES (?,?,?,?,?,?,?);
  `

  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ];

  function afterInsertData(err) {
    if(err) {
      console.log(err);
      return res.send("Erro no cadastro");
    }

    console.log('Cadastrado com sucesso!');
    console.log(this);

    return res.render("create-point.html", { saved: true });
  }

  db.run(query, values, afterInsertData);

  
})

server.get("/search", (req, res) => {

  const search = req.query.search;

  if(search == '') {
    //pesquisa vazia
    return res.render("search-results.html", { total : 0});

  }



  //pegar os dados do banco de dados
  db.all(`select * from places where city like '%${search}%'`, function(err, rows) {
    if(err) {
      return console.log(err);
    }
    //console.log(rows);

    const total = rows.length;
    
    //mostrar a página html com os dados do banco de dados
    return res.render("search-results.html", {places: rows, total: total});
  });

  
})

server.listen(3000);