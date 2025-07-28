const express = require("express")
const handlebars = require("express-handlebars")
const app = express()
const path = require("path")
const session = require("express-session")
// const checarLogin = require("./middlewares/checarLogin")

const { Client } = require("pg")
const { error } = require("console")
const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "",
    database: "cearabus"
})

client.connect().then(() => console.log("connected"))

app.use(session({
    secret: "cearabus",
    resave: true,
    saveUninitialized: true
}))

// json encode
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// handlebars
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))

// Caminho dos arquivos estáticos

app.use(express.static(path.join(__dirname, "..", "public")))

// Rotas

// Rota raiz, se logado vai para o dashboard, se nao, deve logar ou se cadastar
app.get("/", (req, res) => {
    console.log(req.session.logado)
    if (req.session.logado) {
        res.render("aluno/dashboard")
    }
    else
        res.render("unlogged/login")

    console.log(path.join(__dirname, "public"))
})

// POST logar
app.post("/logar/", (req, res) => {
    let cpf = req.body.cpf
    let senha = req.body.senha

    client.query(`SELECT * FROM usuarios WHERE cpf = '${cpf}' AND senha = '${senha}'`, (err, result) => {
        if (!err) {
            if (result.rows[0]) {
                console.log("logado")
                req.session.logado = true;
                res.redirect("/")
            }
        } else {
            console.log(error)
            res.redirect("/")
        }
    })
})

// GET cadastrar usuario
app.get("/cadastro/", (req, res) => {
    res.render("unlogged/cadastro")
})

// POST cadastrar usuario
app.post("/cadastro/", (req, res) => {
    console.log(req.body)

    let query = `INSERT INTO usuarios (nome, email, cpf, matricula, numero_celular, foto, comprovante_faculdade, senha)
VALUES ('${req.body.nome}', '${req.body.email}', '${req.body.cpf}', '${req.body.matricula}', '${req.body.celular}', '${req.body.foto}', '${req.body.comprovante}', '${req.body.senha}')`

    client.query(query, (err, res) => {
        if (!err)
            console.log("deu certo papai")
        else
            console.log("hoje nao")

    })
    res.redirect("/")
})

// recuperar senha
app.get("/recuperar_senha/", (req, res) => {
    res.render("unlogged/recuperar_senha")
})

const PORT = "5173"

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`)
})