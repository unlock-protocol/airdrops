import { onchainTable, index } from "ponder";

export const daoProposal = onchainTable("daoProposal", (t) => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
}));

export const daoVote = onchainTable("daoVote", (t) => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  proposal: t.text().notNull(),
  voter: t.text().notNull(),
}));

export const daoDelegate = onchainTable(
  "daoDelegate",
  (t) => ({
    chainId: t.bigint().notNull(),
    id: t.text().notNull().primaryKey(),
    from: t.text().notNull(),
    to: t.text().notNull(),
  }),
  (table) => ({
    nameIdx: index().on(table.to),
  })
);

export const points = onchainTable("points", (t) => ({
  wallet: t.text().notNull().primaryKey(),
  points: t.integer().default(0),
}));
