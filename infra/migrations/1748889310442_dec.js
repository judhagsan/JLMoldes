exports.up = (pgm) => {
  pgm.createTable("Dec", {
    id: { type: "serial", primaryKey: true },
    on: { type: "boolean", notNull: true },
    dec: { type: "text", notNull: true },
    sis: { type: "numeric", notNull: true, default: 0 },
    base: { type: "numeric", notNull: true, default: 0 },
    alt: { type: "numeric", notNull: true, default: 0 },
    r: { type: "numeric", notNull: true, default: 0 },
  });

  pgm.addConstraint("Dec", "dec_r_unique", {
    unique: ["dec", "r"],
  });

  const letters = [];
  // Generate letters from 'A' to 'L'
  for (let i = 0; i < 12; i++) {
    letters.push(String.fromCharCode("A".charCodeAt(0) + i));
  }

  const rValues = [1, 2, 3];
  const insertRows = [];

  for (const letter of letters) {
    for (const rVal of rValues) {
      insertRows.push(`('${letter}', true, ${rVal})`);
    }
  }
  const insertQueryValues = insertRows.join(",\n  ");

  pgm.sql(`
    INSERT INTO "Dec" (dec, "on", r) VALUES
    ${insertQueryValues};
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("Dec");
};
