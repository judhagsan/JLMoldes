exports.up = (pgm) => {
  pgm.createTable("Papel", {
    id: { type: "serial", primaryKey: true },
    dec: { type: "text", notNull: true },
    item: { type: "text", notNull: true },
    quantidade: { type: "numeric", notNull: true },
    unidade: { type: "numeric", notNull: true },
    valor: { type: "numeric", notNull: true },
    gastos: { type: "text", notNull: true },
    pago: { type: "timestamptz", notNull: true },
    alerta: { type: "numeric", notNull: true },
    metragem: { type: "numeric", notNull: true },
  });
};

exports.down = false;
