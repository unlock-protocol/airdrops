import { ponder } from "ponder:registry";
import { points } from "ponder:schema";

ponder.get("/", async (c) => {
  // To get points, let's iterate over the votes,
  // Voters get 10 point per vote
  // votes.forEach((vote) => {
  //   points[vote.voter] = (points[vote.voter] || 0) + 10;
  //   // Also, for each vote, let's get the delegate for this voter and give them 1 point
  // });

  return c.json(await c.db.select().from(points));
});
