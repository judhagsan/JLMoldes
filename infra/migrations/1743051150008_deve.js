exports.up = (pgm) => {
  pgm.createTable("Deve", {
    data: { type: "timestamptz", notNull: true },
    codigo: { type: "text", notNull: true },
    nome: { type: "text", notNull: true },
    valor: { type: "numeric", notNull: true },
  });
};

exports.down = false;
