const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3002;

// Configurações
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Configuração do MongoDB e JWT
const mongoUrl =
  "mongodb+srv://AvisaManaus:nmuvrmTwvL5cdrJA@cluster0.sffzj.mongodb.net/Denuncias?retryWrites=true&w=majority";
const JWT_SECRET =
  "lkdsam930200321dl()ldmalsd78391831dnkan91uodal[()]dlas3891kda0120m10d0";

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Banco de dados conectado"))
  .catch((error) => console.error("Erro ao conectar ao banco de dados:", error));

// Schema de Denúncias
const denunciaUsuarioSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nomeUsuario: String,
    email: String,
    tipo: String,
    descricao: String,
    anexo: String,
    latitude: Number,
    longitude: Number,
    endereco: String,
    data: { type: Date, default: Date.now },
  },
  { collection: "DenunciaUsuario" }
);

const DenunciaUsuario = mongoose.model("DenunciaUsuario", denunciaUsuarioSchema);

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .send({ status: "error", data: "Token não fornecido" });
  }

  // Suporte para token com ou sem "Bearer"
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Armazena as informações do token no req.usuario
    next();
  } catch (error) {
    console.error("Erro na autenticação do token:", error.message);
    return res.status(403).send({ status: "error", data: "Token inválido ou expirado" });
  }
}

// Endpoint: Registrar denúncia
app.post("/DenunciaUsuario", autenticarToken, upload.single("anexo"), async (req, res) => {
  try {
    const { tipo, descricao, latitude, longitude } = req.body;
    const anexo = req.file ? `/uploads/${req.file.filename}` : null;

    let endereco = "Endereço não encontrado";
    if (latitude && longitude) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        endereco = response.data.display_name || endereco;
      } catch (error) {
        console.error("Erro ao buscar localização:", error.message);
      }
    }

    const novaDenuncia = new DenunciaUsuario({
      usuarioId: req.usuario.id,
      nomeUsuario: req.usuario.nome,
      email: req.usuario.email,
      tipo,
      descricao,
      anexo,
      latitude,
      longitude,
      endereco,
    });

    await novaDenuncia.save();
    res.status(201).send({ status: "ok", message: "Denúncia registrada com sucesso!", endereco });
  } catch (error) {
    console.error("Erro ao registrar denúncia:", error);
    res.status(500).send({ status: "error", message: "Erro ao registrar denúncia" });
  }
});

// Endpoint: Listar denúncias do usuário
app.get("/DenunciaUsuario", autenticarToken, async (req, res) => {
  try {
    const denuncias = await DenunciaUsuario.find({ usuarioId: req.usuario.id });

    if (!denuncias.length) {
      return res.status(404).send({ status: "error", message: "Nenhuma denúncia encontrada para este usuário" });
    }

    res.status(200).send({ status: "ok", denuncias });
  } catch (error) {
    console.error("Erro ao buscar denúncias do usuário:", error);
    res.status(500).send({ status: "error", message: "Erro ao buscar denúncias do usuário" });
  }
});

// Endpoint: Verificar status da API
app.get("/", (req, res) => res.send({ status: "ok", message: "Servidor funcionando" }));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});



/*const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

const upload = multer({ dest: 'uploads/' });

mongoose.connect(
  'mongodb+srv://AvisaManaus:nmuvrmTwvL5cdrJA@cluster0.sffzj.mongodb.net/Denuncias?retryWrites=true&w=majority'
);

const denunciaUsuarioSchema = new mongoose.Schema(
  {
    usuarioId: String, 
    nomeUsuario: String,
    email: String, 
    denuncias: [
      {
        tipo: String,
        descricao: String,
        anexo: String,
        latitude: Number,
        longitude: Number,
        data: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: 'DenunciaUsuario' }
);

const DenunciaUsuario = mongoose.model('DenunciaUsuario', denunciaUsuarioSchema);

app.post('/denunciaUsuario', upload.single('anexo'), async (req, res) => {
  try {
    const { usuarioId, nomeUsuario, email, tipo, descricao, latitude, longitude } = req.body;
    const anexo = req.file ? `/uploads/${req.file.filename}` : null;

    let denunciaUsuario = await DenunciaUsuario.findOne({ usuarioId });

    if (!denunciaUsuario) {
      denunciaUsuario = new DenunciaUsuario({
        usuarioId,
        nomeUsuario,
        email,
        denuncias: [],
      });
    }

    denunciaUsuario.denuncias.push({
      tipo,
      descricao,
      anexo,
      latitude,
      longitude,
    });

    await denunciaUsuario.save();

    res.status(201).send({ message: 'Denúncia registrada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erro ao registrar denúncia' });
  }
});

app.get('/denunciasUsuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const denunciaUsuario = await DenunciaUsuario.findOne({ usuarioId });

    if (!denunciaUsuario) {
      return res.status(404).send({ message: 'Usuário não encontrado' });
    }

    res.status(200).send({ denuncias: denunciaUsuario.denuncias });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erro ao buscar denúncias do usuário' });
  }
});

app.get('/', (req, res) => res.send('Servidor funcionando'));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
*/
