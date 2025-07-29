const express = require("express")
const handlebars = require("express-handlebars")
const app = express()
const path = require("path")
const session = require("express-session")
const multer = require("multer")

const { Client } = require("pg")
const { error } = require("console")
const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "",
    database: "cearabus"
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fullPath = path.join(__dirname, '..', 'public', 'img', 'aluno');
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

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

app.use((req, res, next) => {
    res.locals.admin = req.session.admin || false;
    next();
});

// Rotas

// Rota raiz, se logado vai para o dashboard, se nao, deve logar ou se cadastar
app.get("/", (req, res) => {
    let hideNavbar = true
    if (req.session.logado) {
        res.redirect("/rotas/")
    } else {
        res.render("unlogged/login", { hideNavbar })
    }
})

// POST logar
app.post("/logar/", (req, res) => {
    let cpf = req.body.cpf
    let senha = req.body.senha

    client.query(`SELECT * FROM usuarios WHERE cpf = '${cpf}' AND senha = '${senha}'`, (err, result) => {
        if (!err) {
            if (result.rows[0]) {
                req.session.logado = true;
                req.session.user_id = result.rows[0].id
                res.redirect("/")
            }
        } else {
            console.log(error)
            res.redirect("/")
        }
    })
})

// GET logar administrador

app.get("/logar_adm/", (req, res) => {
    let hideNavbar = true
    let admin = true
    res.render("unlogged/login_adm", { hideNavbar, admin })
})

// POST logar administrador

app.post("/logar_adm/", (req, res) => {
    let email = req.body.email
    let senha = req.body.senha

    client.query(`SELECT * FROM admins WHERE username = '${email}' AND password = '${senha}'`, (err, result) => {
        if (!err) {
            console.log(result.rows)
            if (result.rows[0]) {
                req.session.logado = true
                req.session.admin = true
                res.redirect("/")
            } else {
                res.redirect("/logar_adm/")
            }
        } else {
            console.log(error)
            res.redirect("/logar_adm/")
        }
    })
})

// POST deslogar
app.get("/deslogar/", (req, res) => {
    req.session.logado = false
    req.session.admin = false
    res.redirect("/")
})

// GET cadastrar usuario
app.get("/cadastro/", (req, res) => {
    let hideNavbar = true
    res.render("unlogged/cadastro", { hideNavbar })
})

// POST cadastrar usuario
app.post("/cadastro/", upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'comprovante', maxCount: 1 }
]), (req, res) => {

    const nomeFoto = req.files['foto'] ? req.files['foto'][0].filename : null;
    const nomeComprovante = req.files['comprovante'] ? req.files['comprovante'][0].filename : null;

        let query = `INSERT INTO usuarios (nome, email, cpf, matricula, numero_celular, foto, comprovante_faculdade, senha, curso, instituicao, parada)
    VALUES ('${req.body.nome}', '${req.body.email}', '${req.body.cpf}', '${req.body.matricula}', '${req.body.celular}', '${nomeFoto}', '${nomeComprovante}', '${req.body.senha}', '${req.body.curso}', '${req.body.instituicao}', '${req.body.ponto}')`
        client.query(query, (err, res) => {
            if (!err) {

                console.log("deu certo papai")
            }
            else
                console.log("hoje nao")

        })
    res.redirect("/")
})

// GET recuperar senha
app.get("/recuperar_senha/", (req, res) => {
    let hideNavbar = true
    res.render("unlogged/recuperar_senha", { hideNavbar })
})

// GET rotas
app.get("/rotas/", (req, res) => {
    res.render("aluno/rotas")
})

// GET carteirinha
app.get("/carteira/", (req, res) => {

    id = req.session.user_id 
    // id = 5
    client.query(`SELECT * FROM usuarios WHERE id = '${id}'`, (err, result) => {
        if (!err) {
            if (result.rows[0]) {
                let aluno = result.rows[0]
                res.render("aluno/carteira", { aluno })
            }
        } else
            console.log(error)
    })

})

// GET aprovar carteirinha
app.get("/aprovar_carteira/", (req, res) => {
    client.query(`SELECT * FROM usuarios WHERE aprovado = FALSE ORDER BY id DESC`, (err, result) => {
        if (!err) {
            if (result.rows) {
                let alunos = result.rows
                res.render("admin/aprovar_carteira", { alunos })
            }
        } else
            console.log(error)
    })

})

// POST julgar carteirinha
app.post("/julgar_carteirinha/", (req, res) => {
    let acao = req.body.acao
    let id = req.body.id

    if (acao == "aprovar") {
        client.query(`UPDATE usuarios SET aprovado = true WHERE id = ${id}`, (err, result) => {
            if (!err) {
                if (result.rows)
                    res.redirect("/aprovar_carteira/")
            } else
                console.log(error)
        })
    } else if (acao = "reprovar") {
        client.query(`DELETE FROM usuarios WHERE id = ${id}`, (err, result) => {
            if (!err) {
                if (result.rows) {
                    console.log(result.rows)
                    res.redirect("/aprovar_carteira/")
                }
            } else
                console.log(error)
        })
    }

})

const PORT = "5173"

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`)
})