exports.up = (pgm) => {
  pgm.createTable("Pagamentos", {
    id: { type: "serial", primaryKey: true },
    data: { type: "timestamptz", notNull: true },
    nome: { type: "text", notNull: true },
    real: { type: "numeric", notNull: true },
    pix: { type: "numeric", notNull: true },
    r: { type: "numeric", notNull: true },
  });
};

exports.down = false;
