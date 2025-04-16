exports.up = (pgm) => {
  pgm.createTable("C", {
    id: { type: "serial", primaryKey: true },
    codigo: { type: "text", notNull: true },
    data: { type: "timestamptz", notNull: true },
    nome: { type: "text", notNull: true },
    sis: { type: "numeric", notNull: true },
    alt: { type: "numeric", notNull: true },
    base: { type: "numeric", notNull: true },
    real: { type: "numeric", notNull: true },
    pix: { type: "numeric", notNull: true },
  });
};

exports.down = false;
