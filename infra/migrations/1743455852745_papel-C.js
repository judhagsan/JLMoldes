exports.up = (pgm) => {
  pgm.createTable("PapelC", {
    id: { type: "serial", primaryKey: true },
    codigo: { type: "text", notNull: true },
    data: { type: "timestamptz", notNull: true },
    nome: { type: "text", notNull: true },
    multi: { type: "numeric", notNull: true },
    papel: { type: "numeric", notNull: true },
    papelpix: { type: "numeric", notNull: true },
    papelreal: { type: "numeric", notNull: true },
    encaixereal: { type: "numeric", notNull: true },
    encaixepix: { type: "numeric", notNull: true },
    desperdicio: { type: "numeric", notNull: true },
    util: { type: "numeric", notNull: true },
    perdida: { type: "numeric", notNull: true },
    comentarios: { type: "text", notNull: true },
  });
};

exports.down = false;
