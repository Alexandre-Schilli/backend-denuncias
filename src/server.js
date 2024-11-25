const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors()); // Habilita CORS para permitir solicitações de diferentes origens
app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect(
    "mongodb+srv://AvisaManaus:nmuvrmTwvL5cdrJA@cluster0.sffzj.mongodb.net/Denuncias?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.log("Erro ao conectar ao MongoDB:", err));

// Definir o esquema e modelo para as denúncias
const denunciaUsuarioSchema = new mongoose.Schema({
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
}, { collection: "DenunciaUsuario" });

const DenunciaUsuario = mongoose.model("DenunciaUsuario", denunciaUsuarioSchema);

// Rota para obter marcadores, agora usando as coordenadas das denúncias
app.get("/api/markers", async (req, res) => {
  try {
    // Buscar todas as denúncias na coleção DenunciaUsuario
    const denuncias = await DenunciaUsuario.find();

    // Mapeando as denúncias para o formato de marcadores, incluindo latitude e longitude
    const markers = denuncias.map((denuncia) => ({
      title: denuncia.tipo, // Pode ser o tipo da denúncia ou outro campo relevante
      description: denuncia.descricao, // Descrição da denúncia
      latitude: denuncia.latitude, // Latitude da denúncia
      longitude: denuncia.longitude, // Longitude da denúncia
    }));

    // Retornar os marcadores com as coordenadas no formato necessário para o mapa
    res.json(markers);
  } catch (err) {
    console.error("Erro ao obter marcadores:", err);
    res.status(500).json({ message: "Erro ao obter marcadores", error: err });
  }
});

// Tentar usar a porta 3000 ou escolher uma porta alternativa automaticamente
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
