const express = require("express")
const handlebars = require("express-handlebars")
const app = express()
const path = require("path")
const session = require("express-session")

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

app.use(express.static(path.join(__dirname,  "..",  "public")))

// Rotas

// Rota raiz, se logado vai para o dashboard, se nao, deve logar ou se cadastar
app.get("/", (req, res) => {

    let logado = false

    if (logado)
        res.render("aluno/dashboard")
    else
        res.render("unlogged/login")

    console.log(path.join(__dirname, "public"))
})

// cadastrar usuario / carteirinha
app.get("/cadastro/", (req, res) => {
    res.render("unlogged/cadastro")
})

// recuperar senha
app.get("/recuperar_senha/", (req, res) => {
    res.render("unlogged/recuperar_senha")
})


const PORT = "5173"

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`)
})