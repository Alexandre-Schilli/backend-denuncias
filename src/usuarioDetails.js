const mongoose = require("mongoose");

const usuarioDetailsSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v && v.trim().length > 1;
      },
      message: "O nome deve conter mais de uma letra."
    }
  },
  cpf: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);
      },
      message: "CPF deve conter exatamente 11 dígitos numéricos."
    }
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.com$/.test(v);
      },
      message: "Email inválido. Deve conter '@' seguido de '.com'."
    }
  },
  senha: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (v) {
        return /[0-9!@#$%^&*(),.?":{}|<>]/.test(v);
      },
      message: "A senha deve conter pelo menos um número ou símbolo."
    }
  },
},{
  collection: "Usuario"
});
mongoose.model("Usuario", usuarioDetailsSchema);

