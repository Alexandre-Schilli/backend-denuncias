const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3006;
const jwt = require("jsonwebtoken");
const mongoUrl =
  "mongodb+srv://AvisaManaus:nmuvrmTwvL5cdrJA@cluster0.sffzj.mongodb.net/Login&Registro?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET =
  "lkdsam930200321dl()ldmalsd78391831dnkan91uodal[()]dlas3891kda0120m10d0";

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Banco de dados conectado");
  })
  .catch((e) => {
    console.log("Erro de conexão com o banco de dados:", e);
  });

require("./usuarioDetails");
const usuario = mongoose.model("Usuario");

app.get("/", (req, res) => {
  res.send({ status: "ta on" });
});

app.post("/cadastro", async (req, res) => {
  const { nome, cpf, email, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send({ status: "error", data: "As senhas não correspondem." });
  }

  const usuarioAntigo = await usuario.findOne({ email: email });

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
    console.error(error); // Logar o erro detalhado
    res.send({ status: "error", data: "Erro ao criar o usuário." });
  }
});

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
      JWT_SECRET,
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

app.post("/dadosUsuario", async (req, res) => {
  const { token } = req.body;
  try {
    const decodedtoken = jwt.verify(token, JWT_SECRET);
    const emailUsuario = decodedtoken.email;

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

app.listen(port, () => {
  console.log("Server on");
});
