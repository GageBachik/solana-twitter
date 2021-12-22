import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as bs58 from "bs58";
import * as assert from "assert";

// Begin custom tests

it("can send a new tweet", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  const tweet = anchor.web3.Keypair.generate();
  await program.rpc.sendTweet(
    "solana",
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
  console.log("tweetAccount", tweetAccount);
  assert.equal(
    tweetAccount.author.toBase58(),
    program.provider.wallet.publicKey.toBase58()
  );
  assert.equal(tweetAccount.topic, "solana");
  assert.equal(
    tweetAccount.content,
    "Hello, world! This is the first tweet on my local solana cluster."
  );
  assert.ok(tweetAccount.timestamp);
});

it("cannot provide a topic with more than 50 characters", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  const tweet = anchor.web3.Keypair.generate();
  try {
    const tweet = anchor.web3.Keypair.generate();
    const topicWith51Chars = "x".repeat(51);
    await program.rpc.sendTweet(topicWith51Chars, "Hummus, am I right?", {
      accounts: {
        tweet: tweet.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweet],
    });
  } catch (error) {
    assert.equal(
      error.msg,
      "The provided topic should be 16 characters long maximum."
    );
    return;
  }

  assert.fail("The instruction should have failed with a 51-character topic.");
});

it("can fetch all tweets", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  const tweetAccounts = await program.account.tweet.all();
  console.log("tweetAccounts", tweetAccounts);
  assert.equal(tweetAccounts.length, 1);
});

it("can filter tweets by topics", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  const tweetAccounts = await program.account.tweet.all([
    {
      memcmp: {
        offset:
          8 + // Discriminator.
          32 + // Author public key.
          4, // topic prefix
        bytes: bs58.encode(Buffer.from("solana")),
      },
    },
  ]);

  console.log("tweetAccounts", tweetAccounts);

  assert.equal(tweetAccounts.length, 1);
  assert.ok(
    tweetAccounts.every((tweetAccount) => {
      return tweetAccount.account.topic === "solana";
    })
  );
});
