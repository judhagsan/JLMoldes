exports.up = (pgm) => {
  pgm.createTable("RBSA", {
    id: { type: "numeric", notNull: true },
    dec: { type: "text", notNull: true },
    r: { type: "numeric", notNull: true },
    data: { type: "timestamptz", default: pgm.func("now()"), notNull: true },
    codigo: { type: "text", notNull: true },
    nome: { type: "text", notNull: true },
    sis: { type: "numeric", notNull: true },
    alt: { type: "numeric", notNull: true },
    base: { type: "numeric", notNull: true },
  });
};

exports.down = false;
