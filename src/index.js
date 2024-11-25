const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Configuração centralizada
const config = {
  mongoUrl: "mongodb+srv://AvisaManaus:nmuvrmTwvL5cdrJA@cluster0.mongodb.net/Login&Registro?retryWrites=true&w=majority&appName=Cluster0",
  jwtSecret: "lkdsam930200321dl()ldmalsd78391831dnkan91uodal[()]dlas3891kda0120m10d0",
  port: 3006
};

// Conexão com o MongoDB
mongoose.connect(config.mongoUrl)
  .then(() => console.log("Banco de dados conectado"))
  .catch((e) => console.log("Erro de conexão com o banco de dados:", e));

require("./usuarioDetails");
const usuario = mongoose.model("Usuario");

// Rota inicial para teste
app.get("/", (req, res) => {
  res.send({ status: "ta on" });
});

// Rota de cadastro
app.post("/cadastro", async (req, res) => {
  const { nome, cpf, email, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send({ status: "error", data: "As senhas não correspondem." });
  }

  const usuarioAntigo = await usuario.findOne({ email });

  if (usuarioAntigo) {
    return res.send({ data: "Este usuário já existe!" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    delete req.body.confirmarSenha;

    await usuario.create({
      nome,
      cpf,
      email,
      senha: hashedPassword,
    });

    res.send({ status: "ok", data: "Usuário Criado." });
  } catch (error) {
    console.error(error);
    res.send({ status: "error", data: "Erro ao criar o usuário." });
  }
});

// Rota de login
app.post("/login-user", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuarioAntigo = await usuario.findOne({ email });

    if (!usuarioAntigo) {
      return res.status(404).send({ data: "Esse usuário não existe." });
    }

    if (!(await bcrypt.compare(senha, usuarioAntigo.senha))) {
      return res.status(401).send({ data: "Senha incorreta." });
    }

    const token = jwt.sign(
      {
        id: usuarioAntigo._id,
        nome: usuarioAntigo.nome,
        email: usuarioAntigo.email,
      },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    return res.status(200).send({ status: "ok", data: token });
  } catch (error) {
    console.error("Erro no login:", error);
    return res
      .status(500)
      .send({ status: "error", data: "Erro interno no servidor." });
  }
});

// Rota para obter dados do usuário
app.post("/dadosUsuario", async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = jwt.verify(token, config.jwtSecret);
    const emailUsuario = decodedToken.email;

    const usuarioDados = await usuario.findOne({ email: emailUsuario });

    if (!usuarioDados) {
      return res
        .status(404)
        .send({ status: "error", data: "Usuário não encontrado." });
    }

    return res.send({ status: "ok", data: usuarioDados });
  } catch (error) {
    console.error("Erro no /dadosUsuario:", error);
    return res
      .status(500)
      .send({ status: "error", data: "Erro ao recuperar os dados." });
  }
});

// Iniciar o servidor
app.listen(config.port, () => {
  console.log(`Servidor rodando na porta ${config.port}`);
});
