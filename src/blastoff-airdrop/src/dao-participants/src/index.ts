import { eq } from "ponder";
import { ponder } from "ponder:registry";
import { daoDelegate, daoProposal, daoVote, points } from "ponder:schema";

["UP", "UDT"].forEach((token) => {
  ponder.on(`${token}:DelegateChanged`, async ({ event, context }) => {
    await context.db
      .insert(daoDelegate)
      .values({
        id: event.args.delegator,
        from: event.args.delegator,
        to: event.args.toDelegate,
        chainId: context.network.chainId,
      })
      .onConflictDoUpdate({ to: event.args.toDelegate });
  });
  ponder.on(`${token}Governor:ProposalCreated`, async ({ event, context }) => {
    const { proposalId } = event.args;
    const contract = context.contracts[`${token}Governor`];
    const state = await context.client.readContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "state",
      args: [proposalId],
      blockNumber: contract.endBlock,
    });
    // only the successful (executed) proposals are stored
    if (state === 7) {
      await context.db.insert(daoProposal).values({
        id: proposalId.toString(),
        chainId: context.network.chainId,
      });
    }
  });
  ponder.on(`${token}Governor:VoteCast`, async ({ event, context }) => {
    const { proposalId, voter } = event.args;
    await context.db.insert(daoVote).values({
      id: [proposalId.toString(), voter].join("-"),
      proposal: proposalId.toString(),
      voter: voter,
      chainId: context.network.chainId,
    });
    const addPoints = async (wallet: string, morePoints: number) => {
      const p = await context.db.find(points, { wallet });
      if (!p) {
        await context.db.insert(points).values({
          wallet,
          points: morePoints,
        });
      } else {
        await context.db
          .update(points, {
            wallet,
          })
          .set({
            points: p.points + morePoints,
          });
      }
    };
    // Update points for the voter
    await addPoints(voter, 10);
    // Update points for each of the voter's delegates
    const delegates = await context.db.sql
      .select()
      .from(daoDelegate)
      .where(eq(daoDelegate.to, voter));
    for (const delegate of delegates) {
      await addPoints(delegate.from, 1);
    }
  });
});
