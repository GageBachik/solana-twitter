import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";

import * as assert from "assert";

// Begin custom tests

it("can send a new tweet", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  const tweet = anchor.web3.Keypair.generate();
  await program.rpc.sendTweet(
    "SolanaTwitter",
    "Hello, world! This is the first tweet on my local solana cluster.",
    {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    }
  );
  const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);
  assert.equal(
    tweetAccount.author.toBase58(),
    program.provider.wallet.publicKey.toBase58()
  );
  assert.equal(tweetAccount.topic, "SolanaTwitter");
  assert.equal(
    tweetAccount.content,
    "Hello, world! This is the first tweet on my local solana cluster."
  );
  assert.ok(tweetAccount.timestamp);
});
