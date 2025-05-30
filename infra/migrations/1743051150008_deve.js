exports.up = (pgm) => {
  // Cria a tabela
  pgm.createTable("Deve", {
    deveid: { type: "text", notNull: true },
    data: { type: "timestamptz", notNull: true },
    codigo: { type: "text", notNull: true },
    r: { type: "numeric", notNull: true },
    nome: { type: "text", notNull: true },
    valorpapel: { type: "numeric", notNull: true },
    valorcomissao: { type: "numeric", notNull: true },
    valor: { type: "numeric", notNull: true },
  });
};

exports.down = false;
