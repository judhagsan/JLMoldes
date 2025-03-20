exports.up = (pgm) => {
  pgm.createTable("cadastro", {
    id: { type: "serial", primaryKey: true },
    data: { type: "timestamptz", default: pgm.func("now()"), notNull: true },
    regiao: { type: "text", notNull: true },
    codigo: { type: "text", notNull: true },
    facebook: { type: "text", notNull: true },
    instagram: { type: "text", notNull: true },
    email: { type: "text", notNull: true },
    whatsapp1: { type: "text", notNull: true },
    whatsapp2: { type: "text", notNull: true },
    nome: { type: "text", notNull: true },
    grupo: { type: "text", notNull: true },
    observacao: { type: "text", notNull: true },
  });
};

exports.down = false;
