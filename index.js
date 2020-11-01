const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');
const Pergunta = require('./database/Pergunta');
const Resposta = require('./database/Resposta');

//Conexão c/ DATABASE
connection
    .authenticate()
    .then(() => {
        console.log("[OK] Conexão feita com o banco de dados.")
    })
    .catch((msgErro) => {
        console.log(msgErro)
    })

//Dizer ao Express que a View Engine é o EJS (Interpretador de HTML)
app.set('view engine', 'ejs')

//Dizer ao Express habilitar arquivos estáticos na pasta public
app.use(express.static("public"))

//Body Parser (Habilitar o BODY para utilizar req.body)
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Criação de Rotas
app.get("/", (req, res) => {
        res.render("index", {
        })
})

app.get("/responder", (req, res) => {
    
    //Utilizar o MODEL de Pergunta para listar todas perguntas cadastradas
    Pergunta.findAll({raw: true,
         order: [
        ['id', 'DESC'] // ASC = Crescente || DESC = Decrescente
    ]
}).then(perguntas => {
        res.render("responder", {
            perguntas: perguntas
        })

    })
})

app.get("/perguntar", (req, res) => {
    res.render("perguntar")
})

app.post("/salvarpergunta", (req, res) => { 
    
    //Salvar os dados preenchidos dentro das variáveis
    var titulo = req.body.titulo
    var descricao = req.body.descricao

    //Utilizar o MODEL de Pergunta para colocar os dados preenchidos dentro da tabela    
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        //Após concluir, redirecionar para a página inicial '/'
        res.redirect("/")
    })

})

app.get("/pergunta/:id", (req, res) => {
    //Inserir a req ID do params na variavel ID para ser inserida na busca abaixo
    var id = req.params.id
    
    //Buscar o ID da pergunta do banco de dados
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        //Condicionais em base da consulta pelo ID (Se ele existe ou não)
        if(pergunta != undefined) { //Pergunta foi encontrada
            Resposta.findAll({
                where: {perguntaId: pergunta.id},
                order: [ //Ordenar de forma descrecente à visualização
                    ['id', 'DESC'] //ASC = Crescente || DESC = Decrescente
                 ] 
            }).then(respostas => {
                res.render("pergunta", { //Incluir a variavel de resposta p/ resposta em cada ID
                    pergunta: pergunta,
                    respostas: respostas
                })
            })
            
        } else { //Pergunta não foi encontrada
            res.redirect("/") //Redirecionar para a página inicial
        }
    })
})

app.post("/responder", (req, res)=> {

    //Salvar os dados preenchidos dentro das variáveis
    var corpo = req.body.corpo
    var perguntaId = req.body.pergunta

    //Utilizar o MODEL de Resposta para colocar os dados preenchidos dentro da tabela    
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        //Após concluir, redirecionar para a própria pergunta respondida (ID)
        res.redirect("/pergunta/"+perguntaId)
    })

})

//Start do Server
app.listen(8080, () => {
    console.log("[OK] Servidor Iniciado com Sucesso.")
})